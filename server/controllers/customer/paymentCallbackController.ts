import { Request, Response } from "express";
import prisma from "../../config/prisma";

const STORE_ID       = process.env.SSLCOMMERZ_STORE_ID       || '';
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD || '';
const IS_LIVE        = process.env.SSLCOMMERZ_IS_LIVE        === 'true';

const SSL_VALIDATE_URL = IS_LIVE
  ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
  : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';

function getFrontendUrl(req: Request): string {
  return process.env.FRONTEND_URL || "http://localhost:3000";
}

async function verifySSLCommerz(val_id: string): Promise<boolean> {
  if (!STORE_ID || !STORE_PASSWORD) {
    console.error("❌ [SSLCommerz] Missing store credentials in .env");
    return false;
  }
  if (!val_id) {
    console.warn("⚠️ [SSLCommerz] No val_id provided for verification");
    return false;
  }

  try {
    const url = `${SSL_VALIDATE_URL}?val_id=${val_id}&store_id=${STORE_ID}&store_passwd=${STORE_PASSWORD}&v=1&format=json`;
    const res  = await fetch(url);
    const data: any = await res.json();
    console.log("💳 [SSLCommerz] Callback verification:", JSON.stringify(data, null, 2));
    return data?.status === "VALID" || data?.status === "VALIDATED";
  } catch (err) {
    console.error("❌ [SSLCommerz] Verification network error:", err);
    return false;
  }
}

export class PaymentCallbackController {
  // ─── Success ──────────────────────────────────────────────────────────────

  static handleSuccess = async (req: Request, res: Response): Promise<void> => {
    const frontendUrl = getFrontendUrl(req);
    try {
      const body    = req.body || {};
      const query   = req.query || {};
      const tran_id = (body.tran_id || query.tran_id || "").toString();
      const val_id  = (body.val_id  || query.val_id  || "").toString();

      console.log("💳 [SSLCommerz] Success callback received:", { tran_id, val_id });

      const isVerified = await verifySSLCommerz(val_id);
      if (!isVerified) {
        console.warn("⚠️ [SSLCommerz] Verification failed for val_id:", val_id);
        res.redirect(`${frontendUrl}/dashboard/my-orders?status=fail&msg=Payment%20verification%20failed`);
        return;
      }

      // Reconstruct orderId from tran_id: TXN-{timestamp}-{orderId}
      let orderId: string | undefined;
      if (tran_id.startsWith("TXN-")) {
        const parts = tran_id.split("-");
        if (parts.length >= 3) {
          orderId = parts.slice(2).join("-");
        }
      }

      // Find payment record
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            ...(tran_id  ? [{ transactionId: tran_id }]  : []),
            ...(orderId  ? [{ orderId }]                  : []),
          ],
        },
      }).catch((err) => {
        console.error("❌ Error fetching payment record:", err);
        return null;
      });

      const resolvedOrderId = orderId || payment?.orderId;

      // Find the order
      let order = resolvedOrderId
        ? await prisma.order.findUnique({ where: { id: resolvedOrderId } }).catch((err) => {
            console.error("❌ Error fetching order record:", err);
            return null;
          })
        : null;

      if (!order) {
        console.error("❌ [SSLCommerz] Could not resolve order for tran_id:", tran_id);
        res.redirect(`${frontendUrl}/dashboard/my-orders?status=fail&msg=Order%20not%20found`);
        return;
      }

      // Update payment + order in a transaction
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order!.id },
          data:  { paymentStatus: "PAID", orderStatus: "CONFIRMED" },
        });

        if (payment) {
          await tx.payment.update({
            where: { id: payment.id },
            data:  { paymentStatus: "PAID", paidAt: new Date() },
          });
        }

        await tx.orderTimeline.create({
          data: {
            orderId:     order!.id,
            status:      "CONFIRMED",
            description: `Paid ৳${order!.grandTotal} via SSLCommerz.`,
          },
        }).catch((err) => console.error("⚠️ Failed to create order timeline entry:", err));

        if (order!.customerId) {
          const points = Math.floor(order!.grandTotal / 100);
          if (points > 0) {
            await tx.customer.update({
              where: { id: order!.customerId },
              data:  { loyaltyPoints: { increment: points } },
            }).catch((err) => console.error("⚠️ Failed to update customer loyalty points:", err));

            await tx.customerLoyaltyPoint.upsert({
              where:  { customerId: order!.customerId },
              create: { customerId: order!.customerId, earnedPoints: points, availablePoints: points },
              update: { earnedPoints: { increment: points }, availablePoints: { increment: points } },
            }).catch((err) => console.error("⚠️ Failed to upsert customer loyalty record:", err));
          }
        }
      });

      console.log("✅ [SSLCommerz] Order confirmed:", order.id);
      res.redirect(`${frontendUrl}/dashboard/my-orders?status=success`);
    } catch (err) {
      console.error("❌ [SSLCommerz] handleSuccess error:", err);
      res.redirect(`${frontendUrl}/dashboard/my-orders?status=fail`);
    }
  };

  // ─── Fail ─────────────────────────────────────────────────────────────────

  static handleFail = async (req: Request, res: Response): Promise<void> => {
    const frontendUrl = getFrontendUrl(req);
    const tran_id = (req.body?.tran_id || req.query?.tran_id || "").toString();
    console.log("❌ [SSLCommerz] Payment failed:", tran_id);

    if (tran_id) {
      await prisma.payment.updateMany({
        where: { transactionId: tran_id },
        data:  { paymentStatus: "FAILED" },
      }).catch((err) => console.error("❌ Failed to update payment status to FAILED:", err));
    }

    res.redirect(`${frontendUrl}/dashboard/my-orders?status=fail`);
  };

  // ─── Cancel ───────────────────────────────────────────────────────────────

  static handleCancel = async (req: Request, res: Response): Promise<void> => {
    const frontendUrl = getFrontendUrl(req);
    const tran_id = (req.body?.tran_id || req.query?.tran_id || "").toString();
    console.log("⚠️ [SSLCommerz] Payment cancelled:", tran_id);

    if (tran_id) {
      await prisma.payment.updateMany({
        where: { transactionId: tran_id },
        data:  { paymentStatus: "CANCELLED" },
      }).catch((err) => console.error("❌ Failed to update payment status to CANCELLED:", err));
    }

    res.redirect(`${frontendUrl}/dashboard/my-orders?status=cancel`);
  };
}
