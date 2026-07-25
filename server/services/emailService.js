const nodemailer = require('nodemailer');

/**
 * High-Performance Gmail & SMTP Email OTP Service Engine
 */
class EmailService {
  /**
   * Sends 6-Digit Email OTP to recipient email address
   */
  async sendEmailOTP(recipientEmail, otpCode, purpose = 'Verification') {
    const rawUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
    const rawPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

    const isEmailConfigured = rawUser && rawPass;

    if (!isEmailConfigured) {
      console.error('[EmailService Error] EMAIL_USER or EMAIL_PASS missing in server/.env');
      return {
        success: false,
        error: 'Email service is not configured on the server. Please set EMAIL_USER and EMAIL_PASS in server/.env.',
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: rawUser,
          pass: rawPass, // 16-character Gmail App Password
        },
        connectionTimeout: 10000,
        socketTimeout: 10000,
      });

      const mailOptions = {
        from: `"Rainbow Fashions Security" <${rawUser}>`,
        to: recipientEmail,
        subject: `Your Rainbow Fashions ${purpose} OTP Code: ${otpCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #ffffff; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #f59e0b; margin: 0; font-size: 24px;">Rainbow Fashions</h1>
              <p style="color: #94a3b8; font-size: 12px;">Security Verification Code</p>
            </div>

            <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px; border: 1px solid #334155;">
              <p style="color: #cbd5e1; font-size: 14px; margin-top: 0;">Your ${purpose} 6-Digit Verification Code is:</p>
              <div style="font-size: 34px; font-weight: bold; letter-spacing: 6px; color: #f59e0b; margin: 15px 0;">
                ${otpCode}
              </div>
              <p style="color: #64748b; font-size: 11px; margin: 0;">This code is valid for 5 minutes. Do not share it with anyone.</p>
            </div>

            <p style="color: #64748b; font-size: 11px; text-align: center;">
              If you did not request this verification code, please ignore this email.
            </p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Gmail SMTP Success] Email OTP delivered to ${recipientEmail}. ID: ${info.messageId}`);
      return { success: true, provider: 'gmail_smtp', messageId: info.messageId };
    } catch (error) {
      console.error('[Gmail SMTP Error] Delivery failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
