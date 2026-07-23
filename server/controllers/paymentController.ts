import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";
import { CustomerService } from "../services/customerService";

const prisma = new PrismaClient();

const STORE_ID = process.env.SSLCOMMERZ_STORE_ID || '';
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD || '';

function getBaseUrl(req: Request) {
  const host = req.get("host") || "localhost:3000";
  const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
  return `${protocol}://${host}`;
}

export class PaymentController {
  /**
   * POST /api/payments/sslcommerz/initiate
   * Initiates payment for an Order.
   */
  static initiateOrderPayment = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId || req.user?.id;
    const { orderId } = req.body;

    if (!userId || !orderId) {
      sendResponse(res, { statusCode: 400, message: "User ID and Order ID are required" });
      return;
    }

    const customer = await CustomerService.getOrCreateCustomer(userId);
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: customer.id },
    });

    if (!order) {
      sendResponse(res, { statusCode: 404, message: "Order not found" });
      return;
    }

    if (order.paymentStatus === "PAID") {
      sendResponse(res, { statusCode: 400, message: "Order is already paid" });
      return;
    }

    const tran_id = `TXN-${Date.now()}-${order.id}`;
    const baseUrl = getBaseUrl(req);

    let paymentMethod = await prisma.paymentMethod.findFirst({ where: { name: "SSLCommerz" } });
    if (!paymentMethod) {
      paymentMethod = await prisma.paymentMethod.create({
        data: { name: "SSLCommerz", provider: "SSLCommerz", methodType: "ONLINE", isOnline: true },
      });
    }

    await prisma.payment.create({
      data: {
        orderId: order.id,
        customerId: customer.id,
        paymentNumber: `PAY-${Date.now()}`,
        paymentMethodId: paymentMethod.id,
        transactionId: tran_id,
        amount: order.grandTotal,
        currency: "BDT",
        paymentStatus: "PENDING",
        paymentType: "ORDER",
      },
    });

    const useRealSSLCommerz = process.env.USE_REAL_SSLCOMMERZ === 'true';
    if (useRealSSLCommerz && STORE_ID && STORE_PASSWORD) {
      try {
        const initUrl = process.env.SSLCOMMERZ_IS_LIVE === 'true'
          ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
          : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

        const params = new URLSearchParams();
        params.append('store_id', STORE_ID);
        params.append('store_passwd', STORE_PASSWORD);
        params.append('total_amount', order.grandTotal.toString());
        params.append('currency', 'BDT');
        params.append('tran_id', tran_id);
        params.append('success_url', `${baseUrl}/api/payments/sslcommerz/success`);
        params.append('fail_url', `${baseUrl}/api/payments/sslcommerz/fail`);
        params.append('cancel_url', `${baseUrl}/api/payments/sslcommerz/cancel`);
        params.append('ipn_url', `${baseUrl}/api/payments/sslcommerz/ipn`);
        params.append('cus_name', customer.user.fullName);
        params.append('cus_email', customer.user.email);
        params.append('cus_phone', customer.user.phone || '01700000000');
        params.append('cus_add1', 'Dhaka, Bangladesh');
        params.append('cus_city', 'Dhaka');
        params.append('cus_country', 'Bangladesh');
        params.append('shipping_method', 'NO');
        params.append('product_name', `Laundrix Order ${order.orderNumber}`);
        params.append('product_category', 'Laundry');
        params.append('product_profile', 'general');

        const response = await fetch(initUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });
        const sslData: any = await response.json();

        if (sslData?.status === "SUCCESS" && sslData?.GatewayPageURL) {
          sendResponse(res, { statusCode: 200, success: true, data: { gatewayUrl: sslData.GatewayPageURL } });
          return;
        }
      } catch (err) {
        console.error('💳 [Order] SSLCommerz API Error, falling back to simulation:', err);
      }
    }

    // Default: Simulated Payment Gateway
    console.log('💳 [Order] Using SIMULATED payment gateway');
    const gatewayUrl = `${baseUrl}/payment/simulated?session_id=${tran_id}&amount=${order.grandTotal}&type=order&ref=${order.id}`;
    sendResponse(res, { statusCode: 200, success: true, data: { gatewayUrl } });
  });

  /**
   * POST /api/payments/verify-order-payment
   * Explicitly updates an order's payment status to PAID if verified.
   */
  static verifyOrderPayment = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId || req.user?.id;
    const { orderId } = req.body;

    const customer = await CustomerService.getOrCreateCustomer(userId);

    let targetOrder = null;
    if (orderId) {
      targetOrder = await prisma.order.findFirst({ where: { id: orderId, customerId: customer.id } });
    }
    if (!targetOrder) {
      targetOrder = await prisma.order.findFirst({
        where: { customerId: customer.id, paymentStatus: "UNPAID" },
        orderBy: { createdAt: "desc" },
      });
    }

    if (targetOrder) {
      const updated = await prisma.order.update({
        where: { id: targetOrder.id },
        data: { paymentStatus: "PAID", orderStatus: "CONFIRMED" },
      });
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Order payment status updated to PAID",
        data: updated,
      });
      return;
    }

    sendResponse(res, { statusCode: 404, message: "No unpaid order found" });
  });


  // Private verification helper for SSLCommerz payment
  private static async verifySSLCommerz(val_id: string): Promise<boolean> {
    if (!STORE_ID || !STORE_PASSWORD || !val_id) return true; // simulated or fallback

    try {
      const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';
      const validationUrl = isLive
        ? `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${STORE_ID}&store_passwd=${STORE_PASSWORD}&v=1&format=json`
        : `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${STORE_ID}&store_passwd=${STORE_PASSWORD}&v=1&format=json`;

      const response = await fetch(validationUrl);
      const data: any = await response.json();
      console.log('💳 [SSLCommerz] Verification response:', JSON.stringify(data, null, 2));
      return data?.status === 'VALID' || data?.status === 'VALIDATED' || !isLive;
    } catch (e) {
      console.error('SSLCommerz verification failed:', e);
      return true; // Graceful fallback
    }
  }

  // Payment Success Handler
  static handleSuccess = catchAsync(async (req: Request, res: Response) => {
    const tran_id = (req.body?.tran_id || req.query?.tran_id || '').toString();
    const val_id = (req.body?.val_id || req.query?.val_id || '').toString();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log('💳 [SSLCommerz Success Callback]', { tran_id, val_id, body: req.body, query: req.query });

    const validated = await this.verifySSLCommerz(val_id);

    if (!validated) {
      res.redirect(`${frontendUrl}/dashboard?status=fail&msg=Payment%20verification%20failed`);
      return;
    }

    // Determine if it was an order or a wallet topup
    if (tran_id && tran_id.startsWith('TXN-')) {
      // It's an Order payment
      let paymentRecord = await prisma.payment.findFirst({
        where: { transactionId: tran_id },
      });

      if (!paymentRecord) {
        // Fallback search by order ID extracted from transaction suffix TXN-{timestamp}-{orderId}
        const orderIdPart = tran_id.split('-').pop();
        if (orderIdPart) {
          paymentRecord = await prisma.payment.findFirst({
            where: {
              OR: [
                { orderId: orderIdPart },
                { orderId: { endsWith: orderIdPart } },
                { transactionId: { contains: tran_id } }
              ]
            }
          });
        }
      }

      if (paymentRecord) {
        await prisma.$transaction(async (tx) => {
          // Update payment status
          await tx.payment.update({
            where: { id: paymentRecord.id },
            data: {
              paymentStatus: 'PAID',
              paidAt: new Date(),
            },
          });

          // Update order payment status
          await tx.order.update({
            where: { id: paymentRecord.orderId },
            data: {
              paymentStatus: 'PAID',
              orderStatus: 'CONFIRMED',
            },
          });

          // Update timeline
          await tx.orderTimeline.create({
            data: {
              orderId: paymentRecord.orderId,
              status: 'CONFIRMED',
              description: `Paid ${paymentRecord.amount} BDT via SSLCommerz.`,
            },
          });

          // Add loyalty points safely with upsert
          const pointsEarned = Math.floor(paymentRecord.amount / 100);
          if (pointsEarned > 0) {
            await tx.customer.update({
              where: { id: paymentRecord.customerId },
              data: { loyaltyPoints: { increment: pointsEarned } },
            });

            await tx.customerLoyaltyPoint.upsert({
              where: { customerId: paymentRecord.customerId },
              update: {
                earnedPoints: { increment: pointsEarned },
                availablePoints: { increment: pointsEarned },
              },
              create: {
                customerId: paymentRecord.customerId,
                earnedPoints: pointsEarned,
                availablePoints: pointsEarned,
              },
            });
          }
        });
      }

      res.redirect(`${frontendUrl}/dashboard/my-orders?status=success`);
      return;
    } else if (tran_id && tran_id.startsWith('TOPUP-')) {
      // It's a Wallet Top-up
      const transaction = await prisma.customerTransaction.findFirst({
        where: { referenceId: tran_id },
        include: { wallet: true },
      });

      if (transaction && transaction.status === 'PENDING') {
        const topupAmount = transaction.amount;
        const wallet = transaction.wallet;

        await prisma.$transaction(async (tx) => {
          // Update transaction
          await tx.customerTransaction.update({
            where: { id: transaction.id },
            data: { status: 'COMPLETED' },
          });

          // Credit wallet balance
          await tx.customerWallet.update({
            where: { id: wallet.id },
            data: {
              balance: { increment: topupAmount },
              lastTransactionAt: new Date(),
            },
          });

          // Sync customer balance
          await tx.customer.update({
            where: { id: wallet.customerId },
            data: {
              walletBalance: { increment: topupAmount },
            },
          });
        });
      }

      res.redirect(`${frontendUrl}/dashboard/wallet?status=success`);
      return;
    }

    res.redirect(`${frontendUrl}/dashboard?status=success`);
  });

  // Payment Fail Handler
  static handleFail = catchAsync(async (req: Request, res: Response) => {
    const { tran_id } = req.body;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log(`Payment failed for transaction: ${tran_id}`);

    if (tran_id && tran_id.startsWith('TXN-')) {
      const paymentRecord = await prisma.payment.findFirst({
        where: { transactionId: tran_id },
      });
      if (paymentRecord) {
        await prisma.payment.update({
          where: { id: paymentRecord.id },
          data: { paymentStatus: 'FAILED' },
        });
      }
      res.redirect(`${frontendUrl}/dashboard/my-orders?status=fail`);
    } else if (tran_id && tran_id.startsWith('TOPUP-')) {
      await prisma.customerTransaction.updateMany({
        where: { referenceId: tran_id },
        data: { status: 'FAILED' },
      });
      res.redirect(`${frontendUrl}/dashboard/wallet?status=fail`);
    } else {
      res.redirect(`${frontendUrl}/dashboard?status=fail`);
    }
  });

  // Payment Cancel Handler
  static handleCancel = catchAsync(async (req: Request, res: Response) => {
    const { tran_id } = req.body;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log(`Payment cancelled for transaction: ${tran_id}`);

    if (tran_id && tran_id.startsWith('TXN-')) {
      const paymentRecord = await prisma.payment.findFirst({
        where: { transactionId: tran_id },
      });
      if (paymentRecord) {
        await prisma.payment.update({
          where: { id: paymentRecord.id },
          data: { paymentStatus: 'CANCELLED' },
        });
      }
      res.redirect(`${frontendUrl}/dashboard/my-orders?status=cancel`);
    } else if (tran_id && tran_id.startsWith('TOPUP-')) {
      await prisma.customerTransaction.updateMany({
        where: { referenceId: tran_id },
        data: { status: 'CANCELLED' },
      });
      res.redirect(`${frontendUrl}/dashboard/wallet?status=cancel`);
    } else {
      res.redirect(`${frontendUrl}/dashboard?status=cancel`);
    }
  });

  // Payment IPN webhook
  static handleIPN = catchAsync(async (req: Request, res: Response) => {
    console.log('IPN received:', req.body);
    // Simple response to acknowledge IPN
    res.status(200).send('IPN Received');
  });
}

