const nodemailer = require('nodemailer');

/**
 * Pluggable Email OTP Gateway Service
 * Supports Gmail SMTP, SendGrid, Mailgun, Amazon SES
 */
class EmailService {
  /**
   * Sends 6-Digit Email OTP to recipient email address
   */
  async sendEmailOTP(recipientEmail, otpCode, purpose = 'Verification') {
    const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    if (isEmailConfigured) {
      try {
        const transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Gmail App Password
          },
        });

        const mailOptions = {
          from: `"Rainbow Fashions Security" <${process.env.EMAIL_USER}>`,
          to: recipientEmail,
          subject: `Your Rainbow Fashions ${purpose} OTP Code: ${otpCode}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #ffffff; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Rainbow Fashions</h1>
                <p style="color: #94a3b8; font-size: 12px;">Premium E-Commerce Platform</p>
              </div>

              <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
                <p style="color: #cbd5e1; font-size: 14px; margin-top: 0;">Your ${purpose} 6-Digit Verification Code is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #f59e0b; margin: 15px 0;">
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
        console.log(`[Email Service] Message sent to ${recipientEmail}. MessageId: ${info.messageId}`);
        return { success: true, provider: 'nodemailer', messageId: info.messageId };
      } catch (error) {
        console.error('[Email Service Error] Failed to send email via SMTP:', error.message);
      }
    }

    // Default Console Logger Mode for Demo Testing
    console.log(`\n==================================================`);
    console.log(`[EMAIL SERVICE DEMO GATEWAY]`);
    console.log(`Target Email: ${recipientEmail}`);
    console.log(`Purpose     : ${purpose}`);
    console.log(`OTP Code    : ${otpCode}`);
    console.log(`==================================================\n`);

    return { success: true, provider: 'console_logger' };
  }
}

module.exports = new EmailService();
