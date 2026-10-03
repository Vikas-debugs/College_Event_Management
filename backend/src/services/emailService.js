const fs = require('fs');
const path = require('path');
const transporter = require('../config/mailer');

const loadTemplate = (templateName, data) => {
  try {
    const filePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    let html = fs.readFileSync(filePath, 'utf8');
    for (const key in data) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key] !== undefined ? data[key] : '');
    }
    return html;
  } catch (error) {
    console.error(`[emailService] Template render error (${templateName}):`, error.message);
    return `<p>${JSON.stringify(data)}</p>`;
  }
};

const sendMail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM || 'TIHS Events <no-reply@tihs.edu.in>',
      to,
      subject,
      html,
      text: text || 'TIHS College Event Management System Notification',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[TIHS-CEMS Mailer] Email sent to ${to}: ${subject} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[TIHS-CEMS Mailer] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

const emailService = {
  sendWelcome: async (user, otp = '') => {
    const html = loadTemplate('welcome', {
      name: user.name,
      role: user.role.toUpperCase(),
      department: user.department || 'TIHS',
      otp: otp || '123456',
    });
    return sendMail({
      to: user.email,
      subject: 'Welcome to TIHS CEMS - Verify Your Email',
      html,
      text: `Welcome to TIHS CEMS, ${user.name}! Your verification OTP is: ${otp}`,
    });
  },

  sendRegistrationConfirmation: async (user, event, qrUrl, ticketCode, paymentStatus = 'Confirmed') => {
    const html = loadTemplate('registration', {
      userName: user.name,
      eventTitle: event.title,
      category: event.category,
      eventDate: new Date(event.startDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
      venue: event.venue,
      fee: event.fee,
      paymentStatus: paymentStatus,
      ticketCode: ticketCode,
      qrUrl: qrUrl,
    });
    return sendMail({
      to: user.email,
      subject: `Registration Confirmed: ${event.title} [Ticket: ${ticketCode}]`,
      html,
      text: `Your registration for ${event.title} at TIHS is confirmed! Ticket Code: ${ticketCode}`,
    });
  },

  sendEventReminder: async (user, event) => {
    const html = loadTemplate('reminder', {
      userName: user.name,
      eventTitle: event.title,
      venue: event.venue,
      startDate: new Date(event.startDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
    });
    return sendMail({
      to: user.email,
      subject: `Reminder: Upcoming Event - ${event.title}`,
      html,
      text: `Reminder: ${event.title} is starting at ${event.venue} on ${new Date(event.startDate).toLocaleString()}`,
    });
  },

  sendCertificateEmail: async (user, event, certUrl, certificateId) => {
    const html = loadTemplate('certificate', {
      userName: user.name,
      eventTitle: event.title,
      certificateId: certificateId,
      certUrl: certUrl,
    });
    return sendMail({
      to: user.email,
      subject: `Certificate of Participation: ${event.title}`,
      html,
      text: `Congratulations ${user.name}! Your certificate for ${event.title} is ready at ${certUrl}`,
    });
  },

  sendEventApproved: async (faculty, event) => {
    const html = loadTemplate('eventApproved', {
      facultyName: faculty.name,
      eventTitle: event.title,
      venue: event.venue,
      startDate: new Date(event.startDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
    });
    return sendMail({
      to: faculty.email,
      subject: `Event Approved: ${event.title}`,
      html,
      text: `Your event proposal ${event.title} has been approved and published!`,
    });
  },

  sendEventRejected: async (faculty, event, reason) => {
    const html = loadTemplate('eventRejected', {
      facultyName: faculty.name,
      eventTitle: event.title,
      reason: reason || 'Does not meet current scheduling criteria.',
    });
    return sendMail({
      to: faculty.email,
      subject: `Event Proposal Update: ${event.title}`,
      html,
      text: `Your event proposal ${event.title} was not approved. Reason: ${reason}`,
    });
  },
};

module.exports = emailService;
