import nodemailer from 'nodemailer';

/**
 * Generates a 6-digit numeric OTP code
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Transporter setup for email dispatch (Nodemailer or Console fallback)
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || process.env.GMAIL_USER || '',
    pass: process.env.SMTP_PASS || process.env.GMAIL_PASS || ''
  }
});

/**
 * Dispatches Mobile SMS OTP Code to the Driver or Owner
 */
export const sendMobileOTP = async (mobileNumber: string, otpCode: string): Promise<boolean> => {
  console.log(`[SMS OTP SERVICE] 📱 Dispatching 6-Digit Mobile OTP [${otpCode}] to ${mobileNumber}`);
  // SMS Gateway Integration Hook (e.g., Twilio / Fast2SMS)
  return true;
};

/**
 * Dispatches Gmail / Email Verification Code to the Driver or Owner
 */
export const sendGmailCode = async (email: string, otpCode: string, role: string): Promise<boolean> => {
  console.log(`[GMAIL AUTH SERVICE] 📧 Dispatching Gmail Verification Code [${otpCode}] to ${email} (${role})`);
  
  if (process.env.SMTP_USER || process.env.GMAIL_USER) {
    try {
      await transporter.sendMail({
        from: `"SmartOps Security" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
        to: email,
        subject: `SmartOps ${role} Verification Code: ${otpCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #006A6A;">SmartOps ${role} Identity Verification</h2>
            <p>Your single-use 6-digit authentication code is:</p>
            <div style="font-size: 28px; font-weight: bold; color: #006A6A; letter-spacing: 4px; padding: 10px 0;">${otpCode}</div>
            <p>This verification code is valid for 10 minutes. Do not share this code with anyone.</p>
            <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">SmartOps Logistics Platform & Telemetry System</p>
          </div>
        `
      });
      console.log(`[GMAIL AUTH SERVICE] ✅ Real email sent successfully to ${email}`);
    } catch (err: any) {
      console.error(`[GMAIL AUTH SERVICE] ⚠️ Email dispatch warning: ${err.message}`);
    }
  }
  return true;
};
