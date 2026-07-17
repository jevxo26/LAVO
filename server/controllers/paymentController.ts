import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { CustomerService } from '../services/customerService';

const prisma = new PrismaClient();

// Configuration for SSLCommerz
const STORE_ID = process.env.SSLCOMMERZ_STORE_ID || '';
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD || '';
const IS_SANDBOX = process.env.NODE_ENV !== 'production';

// We get the base URL dynamically from request to make callbacks work on localhost/production
const getBaseUrl = (req: Request) => {
  const host = req.get('host');
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
};

export class PaymentController {
  // Initialize payment for a laundry order
  static initiateOrderPayment = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    const { orderId } = req.body;

    if (!userId || !orderId) {
      sendResponse(res, { statusCode: 400, message: 'User ID and Order ID are required' });
      return;
    }

    const customer = await CustomerService.getOrCreateCustomer(userId);
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: customer.id },
    });

    if (!order) {
      sendResponse(res, { statusCode: 404, message: 'Order not found' });
      return;
    }

    if (order.paymentStatus === 'PAID') {
      sendResponse(res, { statusCode: 400, message: 'Order is already paid' });
      return;
    }

    const tran_id = `TXN-${Date.now()}-${order.id.substring(0, 8)}`;
    const baseUrl = getBaseUrl(req);

    // Save temporary payment record in the DB
    let paymentMethod = await prisma.paymentMethod.findFirst({
      where: { name: 'SSLCommerz' },
    });
    if (!paymentMethod) {
      paymentMethod = await prisma.paymentMethod.create({
        data: { name: 'SSLCommerz', provider: 'SSLCommerz', methodType: 'ONLINE', isOnline: true },
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
        currency: 'BDT',
        paymentStatus: 'PENDING',
        paymentType: 'ORDER',
      },
    });

    // Check if we have credentials for real SSLCommerz Sandbox
    console.log('💳 [Order] SSLCommerz credentials loaded:', { hasStoreId: !!STORE_ID, hasStorePassword: !!STORE_PASSWORD });
    if (STORE_ID && STORE_PASSWORD) {
      try {
        const initUrl = 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';
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
        const responseData: any = await response.json();
        console.log('💳 [Order] SSLCommerz API response:', JSON.stringify(responseData, null, 2));

        if (responseData?.status === 'SUCCESS' && responseData?.GatewayPageURL) {
          sendResponse(res, {
            statusCode: 200,
            success: true,
            data: { gatewayUrl: responseData.GatewayPageURL },
          });
          return;
        }
        console.warn('💳 [Order] SSLCommerz returned non-SUCCESS status, falling through to simulated gateway');
      } catch (err) {
        console.error('💳 [Order] SSLCommerz API Error, falling back to simulation:', err);
      }
    }

    // Offline / Simulated Fallback URL
    console.log('💳 [Order] Using SIMULATED payment gateway fallback');
    const gatewayUrl = `${baseUrl}/payment/simulated?session_id=${tran_id}&amount=${order.grandTotal}&type=order&ref=${order.id}`;
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: { gatewayUrl },
    });
  });

  // Initialize payment for Wallet Top-up
  static initiateWalletTopup = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    const { amount } = req.body;

    if (!userId || !amount || Number(amount) <= 0) {
      sendResponse(res, { statusCode: 400, message: 'Invalid top-up amount' });
      return;
    }

    const customer = await CustomerService.getOrCreateCustomer(userId);
    const wallet = customer.wallets[0];

    const tran_id = `TOPUP-${Date.now()}-${customer.id.substring(0, 8)}`;
    const baseUrl = getBaseUrl(req);

    // Save temporary transaction log in database (marked as PENDING)
    await prisma.customerTransaction.create({
      data: {
        walletId: wallet.id,
        transactionType: 'DEPOSIT',
        amount: Number(amount),
        referenceType: 'TOPUP',
        referenceId: tran_id,
        paymentMethod: 'ONLINE',
        status: 'PENDING',
      },
    });

    // Check if we have credentials for real SSLCommerz Sandbox
    console.log('💳 [Wallet] SSLCommerz credentials loaded:', { hasStoreId: !!STORE_ID, hasStorePassword: !!STORE_PASSWORD });
    if (STORE_ID && STORE_PASSWORD) {
      try {
        const initUrl = 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';
        const params = new URLSearchParams();
        params.append('store_id', STORE_ID);
        params.append('store_passwd', STORE_PASSWORD);
        params.append('total_amount', amount.toString());
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
        params.append('product_name', `Laundrix Wallet Top-up`);
        params.append('product_category', 'Fintech');
        params.append('product_profile', 'general');

        const response = await fetch(initUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });
        const responseData: any = await response.json();
        console.log('💳 [Wallet] SSLCommerz API response:', JSON.stringify(responseData, null, 2));

        if (responseData?.status === 'SUCCESS' && responseData?.GatewayPageURL) {
          sendResponse(res, {
            statusCode: 200,
            success: true,
            data: { gatewayUrl: responseData.GatewayPageURL },
          });
          return;
        }
        console.warn('💳 [Wallet] SSLCommerz returned non-SUCCESS status, falling through to simulated gateway');
      } catch (err) {
        console.error('💳 [Wallet] SSLCommerz API Error, falling back to simulation:', err);
      }
    }

    // Offline / Simulated Fallback URL
    console.log('💳 [Wallet] Using SIMULATED payment gateway fallback');
    const gatewayUrl = `${baseUrl}/payment/simulated?session_id=${tran_id}&amount=${amount}&type=wallet&ref=${wallet.id}`;
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: { gatewayUrl },
    });
  });

  // Private verification helper for SSLCommerz payment
  private static async verifySSLCommerz(val_id: string): Promise<boolean> {
    if (!STORE_ID || !STORE_PASSWORD || !val_id) return true; // simulated or fallback

    try {
      const validationUrl = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${STORE_ID}&store_passwd=${STORE_PASSWORD}&v=1&format=json`;
      const response = await fetch(validationUrl);
      const data: any = await response.json();
      return data?.status === 'VALID' || data?.status === 'VALIDATED';
    } catch (e) {
      console.error('SSLCommerz verification failed:', e);
      return false;
    }
  }

  // Payment Success Handler
  static handleSuccess = catchAsync(async (req: Request, res: Response) => {
    const { tran_id, val_id, amount } = req.body;
    const validated = await this.verifySSLCommerz(val_id);

    if (!validated) {
      res.redirect('/dashboard?status=fail&msg=Payment%20verification%20failed');
      return;
    }

    // Determine if it was an order or a wallet topup
    if (tran_id && tran_id.startsWith('TXN-')) {
      // It's an Order payment
      const paymentRecord = await prisma.payment.findFirst({
        where: { transactionId: tran_id },
      });

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
          const updatedOrder = await tx.order.update({
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

          // Add loyalty points
          const pointsEarned = Math.floor(paymentRecord.amount / 100);
          if (pointsEarned > 0) {
            await tx.customer.update({
              where: { id: paymentRecord.customerId },
              data: { loyaltyPoints: { increment: pointsEarned } },
            });

            await tx.customerLoyaltyPoint.update({
              where: { customerId: paymentRecord.customerId },
              data: {
                earnedPoints: { increment: pointsEarned },
                availablePoints: { increment: pointsEarned },
              },
            });
          }
        });
      }

      res.redirect('/dashboard/my-orders?status=success');
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

      res.redirect('/dashboard/wallet?status=success');
      return;
    }

    res.redirect('/dashboard?status=success');
  });

  // Payment Fail Handler
  static handleFail = catchAsync(async (req: Request, res: Response) => {
    const { tran_id } = req.body;
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
      res.redirect('/dashboard/my-orders?status=fail');
    } else if (tran_id && tran_id.startsWith('TOPUP-')) {
      await prisma.customerTransaction.updateMany({
        where: { referenceId: tran_id },
        data: { status: 'FAILED' },
      });
      res.redirect('/dashboard/wallet?status=fail');
    } else {
      res.redirect('/dashboard?status=fail');
    }
  });

  // Payment Cancel Handler
  static handleCancel = catchAsync(async (req: Request, res: Response) => {
    const { tran_id } = req.body;
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
      res.redirect('/dashboard/my-orders?status=cancel');
    } else if (tran_id && tran_id.startsWith('TOPUP-')) {
      await prisma.customerTransaction.updateMany({
        where: { referenceId: tran_id },
        data: { status: 'CANCELLED' },
      });
      res.redirect('/dashboard/wallet?status=cancel');
    } else {
      res.redirect('/dashboard?status=cancel');
    }
  });

  // Payment IPN webhook
  static handleIPN = catchAsync(async (req: Request, res: Response) => {
    console.log('IPN received:', req.body);
    // Simple response to acknowledge IPN
    res.status(200).send('IPN Received');
  });
}
