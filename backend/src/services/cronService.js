const cron = require('node-cron');
const crypto = require('crypto');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const emailService = require('./emailService');
const { generateCertificatePDF } = require('./pdfService');

const initCronJobs = () => {
  console.log('[TIHS-CEMS Cron] Initializing scheduled automation jobs...');

  // 1. Run every 10 minutes: Check for T-24h and T-2h event reminders
  cron.schedule('*/10 * * * *', async () => {
    try {
      const now = new Date();
      const nowMs = now.getTime();
      const in24h = nowMs + 24 * 60 * 60 * 1000;
      const in24hWindow = nowMs + 24.5 * 60 * 60 * 1000;
      const in2h = nowMs + 2 * 60 * 60 * 1000;
      const in2hWindow = nowMs + 2.5 * 60 * 60 * 1000;

      // Fetch all published events and filter in JS for reliability
      const allPublished = await Event.find({ status: 'published' });
      const upcomingEvents = allPublished.filter((ev) => {
        if (!ev.startDate) return false;
        const startMs = new Date(ev.startDate).getTime();
        return (startMs >= in24h && startMs <= in24hWindow) ||
               (startMs >= in2h && startMs <= in2hWindow);
      });

      for (const event of upcomingEvents) {
        const registrations = await Registration.find({
          event: event._id,
          status: 'registered',
        }).populate('user', 'name email');

        for (const reg of registrations) {
          if (reg.user && reg.user.email) {
            await emailService.sendEventReminder(reg.user, event);
            await Notification.create({
              user: reg.user._id,
              title: `Upcoming Event: ${event.title}`,
              message: `Your registered event "${event.title}" is starting soon at ${event.venue}.`,
              type: 'reminder',
              link: `/events/${event.slug || event._id}`,
            });
          }
        }
      }
    } catch (err) {
      console.error('[TIHS-CEMS Cron] Reminder job error:', err.message);
    }
  });

  // 2. Run every 5 minutes: Auto-complete finished events (with 24h grace period) and auto-generate certificates
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      // Grace period: only auto-complete events that ended MORE than 24 hours ago
      const gracePeriodMs = 24 * 60 * 60 * 1000;
      const graceCutoff = new Date(now.getTime() - gracePeriodMs);

      // Fetch all published events and filter in JS as double-safety
      const allPublished = await Event.find({ status: 'published' });
      const expiredEvents = allPublished.filter((ev) => {
        if (!ev.endDate) return false;
        const endMs = new Date(ev.endDate).getTime();
        return endMs < graceCutoff.getTime();
      });

      for (const event of expiredEvents) {
        event.status = 'completed';
        await event.save();
        console.log(`[TIHS-CEMS Cron] Event "${event.title}" automatically marked as completed.`);

        // Find all attendees who have attended this event
        const attendances = await Attendance.find({ event: event._id })
          .populate('user', 'name email department')
          .populate('registration');

        for (const record of attendances) {
          if (!record.user) continue;

          // Check if certificate already exists
          const existingCert = await Certificate.findOne({
            user: record.user._id,
            event: event._id,
          });

          if (!existingCert) {
            const certId = `TIHS-${event.category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
            const hash = crypto.createHash('sha256').update(`${record.user._id}-${event._id}-${certId}`).digest('hex');

            const certResult = await generateCertificatePDF({
              certificateId: certId,
              studentName: record.user.name,
              eventTitle: event.title,
              category: event.category,
              eventDate: event.startDate,
              department: record.user.department,
            });

            const newCert = await Certificate.create({
              user: record.user._id,
              event: event._id,
              certificateId: certId,
              certUrl: certResult.relativeUrl,
              hash: hash,
            });

            // Email certificate
            await emailService.sendCertificateEmail(record.user, event, `https://tihs.edu.in${certResult.relativeUrl}`, certId);

            // In-app notification
            await Notification.create({
              user: record.user._id,
              title: `Certificate Ready: ${event.title}`,
              message: `Your Certificate of Participation for "${event.title}" has been issued.`,
              type: 'certificate',
              link: `/certificates/${newCert._id}`,
            });

            console.log(`[TIHS-CEMS Cron] Auto-generated certificate ${certId} for ${record.user.name}`);
          }
        }
      }
    } catch (err) {
      console.error('[TIHS-CEMS Cron] Auto-complete & certificate job error:', err.message);
    }
  });
};

module.exports = {
  initCronJobs,
};
