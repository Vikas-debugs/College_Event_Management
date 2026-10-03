const nodemailer = require('nodemailer');

const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const port = parseInt(process.env.SMTP_PORT || '587', 10);
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';
const isRealSmtp = user && user !== 'YOUR_BREVO_LOGIN' && user !== 'test_brevo_user';

let transporter;

if (isRealSmtp) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: false, // Port 587 uses STARTTLS
    auth: { user, pass },
    pool: true,
  });

  transporter.verify((error, success) => {
    if (error) {
      console.warn(`[TIHS-CEMS Mailer] Brevo SMTP Verification Warning: ${error.message}`);
      console.log('[TIHS-CEMS Mailer] Emails will be logged to console in development mode.');
    } else {
      console.log('[TIHS-CEMS Mailer] Brevo SMTP Server is ready to deliver messages.');
    }
  });
} else {
  console.log('[TIHS-CEMS Mailer] Brevo SMTP credentials not configured. Running in Mock/Console mailer mode.');
  transporter = {
    sendMail: async (options) => {
      console.log('====================================================');
      console.log(`📧 [TIHS-CEMS MOCK EMAIL SENT]`);
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`From: ${options.from || process.env.MAIL_FROM || 'TIHS Events <no-reply@tihs.edu.in>'}`);
      if (options.text) console.log(`Text: ${options.text.substring(0, 150)}...`);
      console.log('====================================================');
      return { messageId: `mock-${Date.now()}@tihs.edu.in`, response: 'Mock 250 OK' };
    },
    verify: (callback) => {
      console.log('[TIHS-CEMS Mailer] Mock Transporter Verified successfully.');
      if (callback) callback(null, true);
    }
  };
}

module.exports = transporter;
