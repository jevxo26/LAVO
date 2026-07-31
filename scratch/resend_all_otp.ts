import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const API_KEY = process.env.SMS_API_KEY!;
const SENDER_ID = process.env.SMS_SENDER_ID!;
const API_URL = process.env.SMS_API_URL || 'https://sms.mram.com.bd/smsapi';

function formatPhone(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('880')) return cleaned;
  if (cleaned.startsWith('0')) return `88${cleaned}`;
  if (cleaned.length === 10) return `880${cleaned}`;
  return cleaned;
}

async function sendSMS(to: string, msg: string) {
  const contacts = formatPhone(to);
  const res = await axios.get(API_URL, { params: { api_key: API_KEY, type: 'text', contacts, senderid: SENDER_ID, msg } });
  return { contacts, response: res.data };
}

async function main() {
  // Get ALL active IN_PROGRESS pickup deliveries where OTP exists but SMS may not have been sent
  const deliveries = await (prisma.delivery as any).findMany({
    where: { deliveryType: 'PICKUP', deliveryStatus: 'IN_PROGRESS' },
    include: {
      order: { select: { orderNumber: true, pickupAddressId: true } },
      customer: {
        include: {
          user: { select: { fullName: true, phone: true } },
          addresses: { select: { id: true, receiverName: true, receiverPhone: true } }
        }
      },
    },
    orderBy: { createdAt: 'desc' },
  }) as any[];

  console.log(`Found ${deliveries.length} IN_PROGRESS pickup deliveries\n`);

  for (const d of deliveries) {
    const otp = await (prisma.deliveryOTP as any).findFirst({
      where: { deliveryId: d.id, isUsed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });

    const agent = d.assignedAgentId ? await (prisma.deliveryAgent as any).findUnique({
      where: { id: d.assignedAgentId },
      include: { user: { select: { phone: true } } }
    }) : null;

    const pickupAddrId = d.order?.pickupAddressId;
    const addr = d.customer?.addresses?.find((a: any) => a.id === pickupAddrId)
      || d.customer?.addresses?.[0];
    const phone = addr?.receiverPhone || d.customer?.user?.phone;
    const name = addr?.receiverName || d.customer?.user?.fullName;
    const agentPhone = agent?.user?.phone || agent?.phone || '';
    const orderNum = d.order?.orderNumber || d.orderId;

    console.log(`📦 ${orderNum} | Phone: ${phone || '❌ MISSING'} | OTP: ${otp?.otpCode || '❌ NO OTP'}`);

    if (!phone) { console.log(`   ⚠️ Skipped — no phone number\n`); continue; }
    if (!otp)   { console.log(`   ⚠️ Skipped — no valid OTP\n`); continue; }

    const msg = `Hello ${name}, your LAUNDRIX pickup agent is on the way. Your Pickup Verification OTP is: ${otp.otpCode}. Agent Contact: ${agentPhone}. Share this OTP with the agent upon arrival. Order #${orderNum}`;
    const result = await sendSMS(phone, msg);
    console.log(`   ✅ SMS sent to ${result.contacts} → ${result.response}\n`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
