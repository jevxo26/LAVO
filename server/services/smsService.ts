import axios from 'axios';

/**
 * Format Bangladesh phone numbers into proper international / local format expected by mram gateway.
 * e.g., '01712345678' -> '8801712345678', '+8801712345678' -> '8801712345678'
 */
const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('880')) {
    return cleaned;
  }
  if (cleaned.startsWith('0')) {
    return `88${cleaned}`;
  }
  if (cleaned.length === 10) {
    return `880${cleaned}`;
  }
  return cleaned;
};

export class SMSService {
  private static get apiKey(): string {
    return process.env.SMS_API_KEY || 'C30009696a2fb72e7cc260.50730368';
  }

  private static get senderId(): string {
    return process.env.SMS_SENDER_ID || 'MIXBITE';
  }

  private static get apiUrl(): string {
    return process.env.SMS_API_URL || 'https://sms.mram.com.bd/smsapi';
  }

  /**
   * Send SMS via mram SMS Gateway API
   */
  static async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      if (!to) {
        console.warn('[SMS Service] Target phone number is empty. Skipping SMS.');
        return false;
      }

      const contacts = formatPhoneNumber(to);
      console.log(`[SMS Service] Sending SMS to ${contacts}...`);

      const response = await axios.get(this.apiUrl, {
        params: {
          api_key: this.apiKey,
          type: 'text',
          contacts,
          senderid: this.senderId,
          msg: message,
        },
      });

      console.log(`[SMS Service] Gateway Response for ${contacts}:`, response.data);
      return true;
    } catch (error: any) {
      console.error('[SMS Service] Error sending SMS:', error?.response?.data || error?.message || error);
      return false;
    }
  }

  /**
   * Send Pickup OTP SMS to Customer when agent claims pickup task
   */
  static async sendPickupOTP(phone: string, otpCode: string, orderNumber: string, customerName?: string): Promise<boolean> {
    const namePart = customerName ? `${customerName}, ` : '';
    const message = `Hello ${namePart}your LAUNDRIX pickup agent is on the way. Your Pickup Verification OTP is: ${otpCode}. Share this OTP with the agent upon arrival. Order #${orderNumber}`;
    return this.sendSMS(phone, message);
  }

  /**
   * Send Delivery OTP SMS to Customer when agent claims dropoff task
   */
  static async sendDeliveryOTP(phone: string, otpCode: string, orderNumber: string, customerName?: string): Promise<boolean> {
    const namePart = customerName ? `${customerName}, ` : '';
    const message = `Hello ${namePart}your clean clothes are out for delivery! Your Delivery Verification OTP is: ${otpCode}. Share this OTP with the delivery agent upon receipt. Order #${orderNumber}`;
    return this.sendSMS(phone, message);
  }
}
