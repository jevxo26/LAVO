import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

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
  console.log(`📱 Sending to ${contacts}...`);
  const res = await axios.get(API_URL, {
    params: { api_key: API_KEY, type: 'text', contacts, senderid: SENDER_ID, msg }
  });
  console.log(`✅ Response:`, res.data);
}

async function main() {
  // Resend OTPs for both active IN_PROGRESS pickup deliveries for Rifat
  const deliveries = [
    { orderNumber: 'ORD-1785000066770', otp: '909355', phone: '01329602999', name: 'Md. Mahmudul Hoque Rifat', agentPhone: '+8801800282942' },
    { orderNumber: 'ORD-1784999659445', otp: '694592', phone: '01329602999', name: 'Md. Mahmudul Hoque Rifat', agentPhone: '+8801800282942' },
  ];

  for (const d of deliveries) {
    const message = `Hello ${d.name}, your LAUNDRIX pickup agent is on the way. Your Pickup Verification OTP is: ${d.otp}. Agent Contact: ${d.agentPhone}. Share this OTP with the agent upon arrival. Order #${d.orderNumber}`;
    console.log(`\n📦 Order: ${d.orderNumber}`);
    console.log(`   OTP: ${d.otp}`);
    await sendSMS(d.phone, message);
  }
}

main().catch(console.error);
