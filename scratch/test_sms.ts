import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const phone = '01329602999';
const apiKey = process.env.SMS_API_KEY;
const senderId = process.env.SMS_SENDER_ID;
const apiUrl = process.env.SMS_API_URL || 'https://sms.mram.com.bd/smsapi';

// Format phone
let cleaned = phone.replace(/[^\d]/g, '');
if (cleaned.startsWith('0')) cleaned = `88${cleaned}`;
const contacts = cleaned;

const msg = `LAUNDRIX Test: OTP is 909355 for Order ORD-1785000066770. This is a test SMS.`;

async function main() {
  console.log(`SMS_API_KEY: ${apiKey ? apiKey.slice(0, 8) + '...' : '❌ MISSING'}`);
  console.log(`SMS_SENDER_ID: ${senderId || '❌ MISSING'}`);
  console.log(`SMS_API_URL: ${apiUrl}`);
  console.log(`Sending to: ${contacts}`);

  try {
    const response = await axios.get(apiUrl, {
      params: {
        api_key: apiKey,
        type: 'text',
        contacts,
        senderid: senderId,
        msg,
      },
    });
    console.log('✅ Gateway Response:', response.data);
  } catch (err: any) {
    console.error('❌ SMS Error:', err?.response?.data || err?.message);
  }
}

main();
