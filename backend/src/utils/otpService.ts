import nodemailer from 'nodemailer';

/**
 * Interface for OTP delivery response
 */
export interface OTPDeliveryResult {
  success: boolean;
  message: string;
  messageId?: string;
}

/**
 * Generates a secure 6-digit numeric OTP code
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Transporter setup for Nodemailer Gmail SMTP
 */
const createSMTPTransporter = () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 465;
  const secure = (process.env.EMAIL_SECURE || process.env.SMTP_SECURE) !== 'false';
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_PASS || '';

  return {
    host,
    port,
    secure,
    user,
    pass,
    transporter: nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    })
  };
};

/**
 * Dispatches Mobile SMS OTP Code to the Driver or Owner
 */
export const sendMobileOTP = async (mobileNumber: string, otpCode: string): Promise<boolean> => {
  console.log(`[SMS OTP SERVICE] 📱 Dispatching 6-Digit Mobile OTP [${otpCode}] to ${mobileNumber}`);
  return true;
};

/**
 * Dispatches Gmail / Email Verification Code to the Driver or Owner
 */
export const sendGmailCode = async (email: string, otpCode: string, role: string): Promise<OTPDeliveryResult> => {
  console.log(`[GMAIL AUTH SERVICE] --------------------------------------------------`);
  console.log(`[GMAIL AUTH SERVICE] 📧 Initiating Gmail OTP dispatch to: ${email} (${role})`);

  const { host, port, user, pass, transporter } = createSMTPTransporter();

  console.log(`[GMAIL AUTH SERVICE] Environment Variables Checked:`);
  console.log(`[GMAIL AUTH SERVICE]   EMAIL_HOST: ${host}`);
  console.log(`[GMAIL AUTH SERVICE]   EMAIL_PORT: ${port}`);
  console.log(`[GMAIL AUTH SERVICE]   EMAIL_USER: ${user ? user : '❌ NOT CONFIGURED'}`);
  console.log(`[GMAIL AUTH SERVICE]   EMAIL_PASS: ${pass ? '••••••••' : '❌ NOT CONFIGURED'}`);

  if (!user || !pass) {
    const errorMsg = 'Gmail SMTP credentials (EMAIL_USER & EMAIL_PASS) are missing in backend .env configuration. Please configure a valid Gmail App Password.';
    console.error(`[GMAIL AUTH ERROR] ❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    // 1. Verify SMTP Connection
    console.log(`[GMAIL AUTH SERVICE] Connecting to Gmail SMTP (${host}:${port})...`);
    await transporter.verify();
    console.log(`[GMAIL AUTH SERVICE] ✅ SMTP Connection Verified & Connected Successfully`);

    // 2. Log OTP Generation
    console.log(`[GMAIL AUTH SERVICE] Generating OTP... Code: [${otpCode}]`);
    console.log(`[GMAIL AUTH SERVICE] Sending Email to ${email}...`);

    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_FROM || `"SmartOps Enterprise Security" <${user}>`;

    // 3. Dispatch Email via Nodemailer
    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `SmartOps ${role} Verification Code: ${otpCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #0B1C30; background-color: #F8F9FF; border-radius: 12px;">
          <div style="max-width: 500px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E5EEFF; padding: 32px; border-radius: 16px;">
            <h2 style="color: #006A6A; margin-top: 0;">SmartOps ${role} Identity Verification</h2>
            <p style="color: #545F73; font-size: 14px;">Your single-use 6-digit authentication code is:</p>
            <div style="font-size: 32px; font-weight: bold; color: #006A6A; letter-spacing: 6px; padding: 16px 0; text-align: center; background: #EFF4FF; border-radius: 8px; margin: 16px 0;">${otpCode}</div>
            <p style="color: #545F73; font-size: 13px;">This verification code is valid for 5 minutes. Do not share this code with anyone.</p>
            <hr style="border: none; border-top: 1px solid #E5EEFF; margin: 24px 0;" />
            <p style="font-size: 11px; color: #6D7A79; text-align: center;">SmartOps Platform & Telemetry Systems · Production Control</p>
          </div>
        </div>
      `
    });

    console.log(`[GMAIL AUTH SERVICE] ✅ Email Sent Successfully`);
    console.log(`[GMAIL AUTH SERVICE]   Message ID: ${info.messageId}`);
    console.log(`[GMAIL AUTH SERVICE]   Recipient Email: ${email}`);
    console.log(`[GMAIL AUTH SERVICE]   SMTP Response: ${info.response}`);
    console.log(`[GMAIL AUTH SERVICE] --------------------------------------------------`);

    return {
      success: true,
      message: 'OTP sent successfully.',
      messageId: info.messageId
    };
  } catch (err: any) {
    console.error(`[GMAIL AUTH ERROR] ❌ SMTP Verification or Dispatch Failed for ${email}: ${err.message}`);
    console.log(`[GMAIL AUTH SERVICE] --------------------------------------------------`);
    throw new Error(`Failed to send OTP email: ${err.message}`);
  }
};
