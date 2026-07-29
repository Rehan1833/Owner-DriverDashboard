import { sendGmailCode, generateOTP } from '../utils/otpService';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('OTP & Gmail Service Backend Unit Tests', () => {
  let mockSendMail: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMail = jest.fn().mockResolvedValue({
      messageId: '<test-message-id-123@gmail.com>',
      response: '250 2.0.0 OK'
    });

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail
    });
  });

  it('should generate a 6-digit numeric OTP string', () => {
    const otp = generateOTP();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('should return dev bypass mode when EMAIL_USER is missing', async () => {
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;

    const result = await sendGmailCode('user@gmail.com', '123456', 'Driver');
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('dev-bypass-no-credentials');
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('should send Gmail email when EMAIL_USER and EMAIL_PASS are configured', async () => {
    process.env.EMAIL_USER = 'test@gmail.com';
    process.env.EMAIL_PASS = 'abcd efgh ijkl mnop'; // Test stripping spaces from Gmail App Password

    const result = await sendGmailCode('recipient@gmail.com', '654321', 'Owner');

    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'recipient@gmail.com',
        subject: expect.stringContaining('654321')
      })
    );
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('<test-message-id-123@gmail.com>');
  });

  it('should handle SMTP send error gracefully and return fallback result in dev', async () => {
    process.env.EMAIL_USER = 'test@gmail.com';
    process.env.EMAIL_PASS = 'validpassword';
    mockSendMail.mockRejectedValueOnce(new Error('Invalid login credentials'));

    const result = await sendGmailCode('recipient@gmail.com', '999888', 'Driver');

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('dev-fallback-error');
    expect(result.message).toContain('Invalid login credentials');
  });
});
