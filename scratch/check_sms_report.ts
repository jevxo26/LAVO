import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.SMS_API_KEY!;
const API_URL = process.env.SMS_API_URL || 'https://sms.mram.com.bd/smsapi';

// Check SMS delivery report / account balance using mram API
async function main() {
  // 1. Check balance
  try {
    const balRes = await axios.get(`https://sms.mram.com.bd/smsapi`, {
      params: { api_key: API_KEY, type: 'balance' },
      timeout: 10000
    });
    console.log(`💰 Account Balance: ${JSON.stringify(balRes.data)}`);
  } catch (err: any) {
    console.log(`💰 Balance check: ${err?.response?.data || err?.message}`);
  }

  // 2. Check SMS report for the previously submitted IDs
  const ids = [
    'bw-rdC30009696a64fcc8c1597', // 01743282144
    'bw-rdC30009696a64fcc8d3f4c', // 01329602999
    'bw-rdC30009696a64fcc89a0ce', // 01872549981 (works)
    'bw-rdC30009696a64fcc8af5c8', // 01626796716 (works)
  ];

  for (const id of ids) {
    try {
      const res = await axios.get(`https://sms.mram.com.bd/smsapi`, {
        params: { api_key: API_KEY, type: 'report', id },
        timeout: 10000
      });
      console.log(`\n📊 Report [${id}]: ${JSON.stringify(res.data)}`);
    } catch (err: any) {
      console.log(`📊 Report [${id}]: ${err?.response?.data || err?.message}`);
    }
  }
}

main().catch(console.error);
