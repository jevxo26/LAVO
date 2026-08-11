"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const catchServiceAsync_1 = require("../../utils/catchServiceAsync");
const smsService_1 = require("../shared/smsService");
const prisma = new client_1.PrismaClient();
const OTP_TTL_SECONDS = 60; // 1 minute validity
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
class RegisterService {
}
exports.RegisterService = RegisterService;
_a = RegisterService;
/**
 * Step 1 — Validate form data, create user (isVerified=false),
 * generate a 6-digit SMS OTP and store it with a 60-second TTL.
 */
RegisterService.registerUser = (0, catchServiceAsync_1.catchServiceAsync)(async (data) => {
    const { fullName, name, email, password, phoneNumber } = data;
    const resolvedName = fullName || name;
    if (!resolvedName)
        throw new Error("Full name is required");
    if (!email || !password)
        throw new Error("Email and password are required");
    if (!phoneNumber)
        throw new Error("Phone number is required");
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail)
        throw new Error("User already exists with this email");
    const existingPhone = await prisma.user.findFirst({ where: { phone: phoneNumber } });
    if (existingPhone)
        throw new Error("This phone number is already registered to another account");
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    // Create user with isVerified=false — they cannot log in until phone is verified
    const user = await prisma.user.create({
        data: {
            fullName: resolvedName,
            email,
            phone: phoneNumber,
            password: hashedPassword,
            userType: "CUSTOMER",
            isVerified: false,
            status: "PENDING",
        },
    });
    // Generate OTP and store with 60-second expiry
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);
    // Invalidate any previous pending OTPs for this user
    await prisma.userOTP.updateMany({
        where: { userId: user.id, purpose: "REGISTRATION", status: "PENDING" },
        data: { status: "EXPIRED" },
    });
    await prisma.userOTP.create({
        data: {
            userId: user.id,
            phone: phoneNumber,
            otpCode,
            purpose: "REGISTRATION",
            expiresAt,
            status: "PENDING",
        },
    });
    // Send OTP via SMS
    const message = `Your LAUNDRIX registration code is: ${otpCode}. Valid for 1 minute. Do not share it with anyone.`;
    smsService_1.SMSService.sendSMS(phoneNumber, message).catch((err) => console.error("[RegisterService] SMS send failed:", err));
    console.log(`[RegisterService] OTP ${otpCode} sent to ${phoneNumber} (userId: ${user.id})`);
    const { password: _ } = user, safeUser = __rest(user, ["password"]);
    return Object.assign({ userId: user.id }, safeUser);
});
/**
 * Step 2 — Verify the OTP submitted by the user.
 * Activates account if code is correct and not expired.
 */
RegisterService.verifyRegistrationOtp = (0, catchServiceAsync_1.catchServiceAsync)(async (data) => {
    const { phone, otp } = data;
    if (!phone || !otp)
        throw new Error("Phone number and OTP are required");
    // Find the user by phone
    const user = await prisma.user.findFirst({ where: { phone } });
    if (!user)
        throw new Error("No pending registration found for this phone number");
    if (user.isVerified)
        throw new Error("This account is already verified. Please sign in.");
    // Find latest pending OTP
    const otpRecord = await prisma.userOTP.findFirst({
        where: {
            userId: user.id,
            purpose: "REGISTRATION",
            status: "PENDING",
        },
        orderBy: { createdAt: "desc" },
    });
    if (!otpRecord)
        throw new Error("No verification code found. Please request a new one.");
    if (new Date() > otpRecord.expiresAt) {
        await prisma.userOTP.update({
            where: { id: otpRecord.id },
            data: { status: "EXPIRED" },
        });
        throw new Error("Verification code has expired. Please request a new one.");
    }
    if (otpRecord.otpCode !== otp.trim()) {
        throw new Error("Invalid verification code. Please try again.");
    }
    // Mark OTP as verified
    await prisma.userOTP.update({
        where: { id: otpRecord.id },
        data: { status: "VERIFIED", verifiedAt: new Date() },
    });
    // Activate user account
    const verifiedUser = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, status: "ACTIVE" },
    });
    const { password: _ } = verifiedUser, safeUser = __rest(verifiedUser, ["password"]);
    return safeUser;
});
/**
 * Step 3 (optional) — Resend OTP for a pending registration.
 * Invalidates old OTPs and sends a fresh code.
 */
RegisterService.resendRegistrationOtp = (0, catchServiceAsync_1.catchServiceAsync)(async (data) => {
    const { phone } = data;
    if (!phone)
        throw new Error("Phone number is required");
    const user = await prisma.user.findFirst({ where: { phone } });
    if (!user)
        throw new Error("No pending registration found for this phone number");
    if (user.isVerified)
        throw new Error("This account is already verified. Please sign in.");
    // Invalidate previous OTPs
    await prisma.userOTP.updateMany({
        where: { userId: user.id, purpose: "REGISTRATION", status: "PENDING" },
        data: { status: "EXPIRED" },
    });
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);
    await prisma.userOTP.create({
        data: {
            userId: user.id,
            phone,
            otpCode,
            purpose: "REGISTRATION",
            expiresAt,
            status: "PENDING",
        },
    });
    const message = `Your new LAUNDRIX registration code is: ${otpCode}. Valid for 1 minute. Do not share it with anyone.`;
    smsService_1.SMSService.sendSMS(phone, message).catch((err) => console.error("[RegisterService] Resend SMS failed:", err));
    console.log(`[RegisterService] Resent OTP ${otpCode} to ${phone}`);
    return { phone };
});
RegisterService.getMe = (0, catchServiceAsync_1.catchServiceAsync)(async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            userType: true,
            status: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user;
});
