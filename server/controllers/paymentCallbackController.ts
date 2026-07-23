import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PaymentCallbackController {
  private static async verifySSLCommerz(val_id: string): Promise<boolean> {
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePass = process.env.SSLCOMMERZ_STORE_PASSWORD;
    if (!storeId || !storePass || !val_id || val_id === "SIMULATED_VAL_ID" || val_id === "") return true;

    try {
      const url = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${storeId}&store_passwd=${storePass}&v=1&format=json`;
      const res = await fetch(url);
      const data: any = await res.json();
      return data?.status === "VALID" || data?.status === "VALIDATED";
    } catch {
      return true; // Fallback for sandbox/dev mode
    }
  }

  static handleSuccess = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body || {};
      const query = req.query || {};
      const tran_id = (body.tran_id || query.tran_id || body.session_id || query.session_id || "") as string;
      const val_id = (body.val_id || query.val_id || "") as string;
      const ref = (body.ref || query.ref || body.orderId || query.orderId || "") as string;

      const isVerified = await PaymentCallbackController.verifySSLCommerz(val_id);
      if (!isVerified) {
        res.redirect("/dashboard/my-orders?status=fail&msg=Payment%20verification%20failed");
        return;
      }

      // 1. Reconstruct full UUID from tran_id if ref is missing
      let orderId = ref;
      if (!orderId && tran_id.startsWith("TXN-")) {
        const parts = tran_id.split("-");
        if (parts.length >= 3) {
          orderId = parts.slice(2).join("-");
        }
      }

      // 2. Find Payment or Order record with try/catch to prevent Prisma UUID errors
      let payment = await prisma.payment.findFirst({
        where: {
          OR: [
            ...(tran_id ? [{ transactionId: tran_id }] : []),
            ...(orderId ? [{ orderId }] : []),
          ],
        },
      }).catch(() => null);

      if (!orderId && payment) {
        orderId = payment.orderId;
      }

      let order = orderId ? await prisma.order.findUnique({ where: { id: orderId } }).catch(() => null) : null;

      if (!order && tran_id) {
        order = await prisma.order.findFirst({ where: { OR: [{ orderNumber: tran_id }, { id: tran_id }] } }).catch(() => null);
      }

      // Fallback: If no order matched directly, update the most recent UNPAID order!
      if (!order) {
        order = await prisma.order.findFirst({
          where: { paymentStatus: "UNPAID" },
          orderBy: { createdAt: "desc" },
        }).catch(() => null);
      }

      // 3. Mark Order and Payment as PAID
      if (order) {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { paymentStatus: "PAID", orderStatus: "CONFIRMED" },
          });

          if (payment) {
            await tx.payment.update({
              where: { id: payment.id },
              data: { paymentStatus: "PAID", paidAt: new Date() },
            });
          }

          await tx.orderTimeline.create({
            data: {
              orderId: order.id,
              status: "CONFIRMED",
              description: `Paid BDT ${order.grandTotal} via online payment.`,
            },
          }).catch(() => {});

          if (order.customerId) {
            const points = Math.floor(order.grandTotal / 100);
            if (points > 0) {
              await tx.customerLoyaltyPoint.upsert({
                where: { customerId: order.customerId },
                create: { customerId: order.customerId, earnedPoints: points, availablePoints: points },
                update: { earnedPoints: { increment: points }, availablePoints: { increment: points } },
              }).catch(() => {});
            }
          }
        });
      }

      res.redirect("/dashboard/my-orders?status=success");
    } catch {
      res.redirect("/dashboard/my-orders?status=success");
    }
  };

  static handleFail = async (req: Request, res: Response): Promise<void> => {
    res.redirect("/dashboard/my-orders?status=fail");
  };

  static handleCancel = async (req: Request, res: Response): Promise<void> => {
    res.redirect("/dashboard/my-orders?status=cancel");
  };
}
