"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSService = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Format Bangladesh phone numbers into proper international / local format expected by mram gateway.
 * e.g., '01712345678' -> '8801712345678', '+8801712345678' -> '8801712345678'
 */
const formatPhoneNumber = (phone) => {
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
class SMSService {
    static get apiKey() {
        return process.env.SMS_API_KEY || '';
    }
    static get senderId() {
        return process.env.SMS_SENDER_ID || '';
    }
    static get apiUrl() {
        return process.env.SMS_API_URL || 'https://sms.mram.com.bd/smsapi';
    }
    /**
     * Send SMS via mram SMS Gateway API
     */
    static async sendSMS(to, message) {
        var _a;
        try {
            if (!this.apiKey || !this.senderId) {
                console.warn('[SMS Service] SMS_API_KEY or SMS_SENDER_ID is missing in environment variables. Skipping SMS.');
                return false;
            }
            if (!to) {
                console.warn('[SMS Service] Target phone number is empty. Skipping SMS.');
                return false;
            }
            const contacts = formatPhoneNumber(to);
            console.log(`[SMS Service] Sending SMS to ${contacts}...`);
            const response = await axios_1.default.get(this.apiUrl, {
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
        }
        catch (error) {
            console.error('[SMS Service] Error sending SMS:', ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || (error === null || error === void 0 ? void 0 : error.message) || error);
            return false;
        }
    }
    /**
     * Send Pickup OTP SMS to Customer when agent claims pickup task
     */
    static async sendPickupOTP(phone, otpCode, orderNumber, customerName) {
        const namePart = customerName ? `${customerName}, ` : '';
        const message = `Hello ${namePart}your LAUNDRIX pickup agent is on the way. Your Pickup Verification OTP is: ${otpCode}. Share this OTP with the agent upon arrival. Order #${orderNumber}`;
        return this.sendSMS(phone, message);
    }
    /**
     * Send Delivery OTP SMS to Customer when agent claims dropoff task
     */
    static async sendDeliveryOTP(phone, otpCode, orderNumber, customerName) {
        const namePart = customerName ? `${customerName}, ` : '';
        const message = `Hello ${namePart}your clean clothes are out for delivery! Your Delivery Verification OTP is: ${otpCode}. Share this OTP with the delivery agent upon receipt. Order #${orderNumber}`;
        return this.sendSMS(phone, message);
    }
}
exports.SMSService = SMSService;
