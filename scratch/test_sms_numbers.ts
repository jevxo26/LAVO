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

async function testSMS(rawPhone: string, label: string) {
  const contacts = formatPhone(rawPhone);
  const msg = `LAUNDRIX Test OTP: 123456. Order #TEST-001`;
  console.log(`\n📱 [${label}] Raw: ${rawPhone} → Formatted: ${contacts}`);
  try {
    const res = await axios.get(API_URL, {
      params: { api_key: API_KEY, type: 'text', contacts, senderid: SENDER_ID, msg },
      timeout: 10000
    });
    console.log(`   Gateway Response: ${JSON.stringify(res.data)}`);
  } catch (err: any) {
    console.error(`   ❌ Error: ${err?.response?.data || err?.message}`);
  }
}

async function main() {
  // Numbers that WORK
  await testSMS('01872549981', 'WORKS ✅');
  await testSMS('01626796716', 'WORKS ✅');

  // Numbers that DON'T work
  await testSMS('01743282144', 'NOT WORKING ❓');
  await testSMS('01329602999', 'NOT WORKING ❓');
}

main().catch(console.error);
