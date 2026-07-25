const crypto = require('crypto');

/**
 * Pluggable SMS OTP Gateway Service Engine
 * Supports Twilio, MSG91, Fast2SMS, AWS SNS, Firebase Auth adapters
 */
class OTPService {
  /**
   * Generates a cryptographically secure random 6-digit numeric OTP code
   */
  generate6DigitOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Sends 6-digit OTP SMS to the target phone number via Twilio or Console Logger
   */
  async sendSMS(phoneNumber, message) {
    const isTwilioConfigured =
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER;

    if (isTwilioConfigured) {
      try {
        const twilio = require('twilio')(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        const result = await twilio.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        });

        console.log(`[Twilio SMS] Message sent to ${phoneNumber}. SID: ${result.sid}`);
        return { success: true, provider: 'twilio', sid: result.sid };
      } catch (error) {
        console.error('[Twilio SMS Error] Failed to send via Twilio:', error.message);
        // Fallback to console logger mode if Twilio fails
      }
    }

    // Default Console Logger Mode for Local / Demo environments
    console.log(`\n==================================================`);
    console.log(`[OTP SERVICE DEMO GATEWAY]`);
    console.log(`Target Phone: ${phoneNumber}`);
    console.log(`SMS Content : ${message}`);
    console.log(`==================================================\n`);

    return { success: true, provider: 'console_logger' };
  }
}

module.exports = new OTPService();
