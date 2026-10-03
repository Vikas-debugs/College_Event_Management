const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');
const Feedback = require('../models/Feedback');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { generateQRCode } = require('../services/qrService');
const { generateCertificatePDF } = require('../services/pdfService');

const connectDB = require('../config/db');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Database connected/prepared for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await Attendance.deleteMany({});
    await Certificate.deleteMany({});
    await Feedback.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Seed] Cleared existing collections.');

    // 1. Create 4 Seed Users
    const adminUser = await User.create({
      name: 'Dr. S. K. Singh (Admin)',
      email: 'admin@tihs.edu.in',
      password: 'Admin@123',
      role: 'admin',
      department: 'Administration',
      phone: '+91-7897123111',
      isVerified: true,
    });

    const facultyUser = await User.create({
      name: 'Prof. Ananya Verma',
      email: 'faculty@tihs.edu.in',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'BCA',
      phone: '+91-9876543210',
      isVerified: true,
    });

    const studentUser = await User.create({
      name: 'Aarav Sharma',
      email: 'student@tihs.edu.in',
      password: 'Student@123',
      role: 'student',
      department: 'BCA',
      year: 3,
      phone: '+91-9123456780',
      isVerified: true,
    });

    const volunteerUser = await User.create({
      name: 'Priya Srivastava',
      email: 'volunteer@tihs.edu.in',
      password: 'Volunteer@123',
      role: 'volunteer',
      department: 'BBA',
      year: 2,
      phone: '+91-9988776655',
      isVerified: true,
    });

    console.log('[Seed] Created 4 Mandatory Demo Users:');
    console.log(' - Admin:     admin@tihs.edu.in / Admin@123');
    console.log(' - Faculty:   faculty@tihs.edu.in / Faculty@123');
    console.log(' - Student:   student@tihs.edu.in / Student@123');
    console.log(' - Volunteer: volunteer@tihs.edu.in / Volunteer@123');

    // 2. Create Events across all 5 categories
    const now = new Date();
    const event0 = await Event.create({
      title: "TASHAN 2026: Fresher's Party | Garba Eve",
      slug: 'tashan-2026-freshers-party-garba-eve',
      description:
        "TECHNO - WE DREAM, WE ACHIEVE PRESENTS: WHERE NEW BEGINNINGS MEET TIMELESS TRADITIONS!\n\nDress Fresh Up, Dandiya On!\nTASHAN 2026: New People Same Bigger Stories | Same Culture New Vibe | Tradition Meets The Next Generation.\n\nFeaturing:\n• Dance | Singing | Acting | Ramp Walk | Kingsland | Good Vibes New Stories Same You\n\nDate: 16 October 2026 | Time: 04:30 PM Onwards\nVenue: TGI Ground, TIHS Lucknow\nRegistration: FREE for all students & freshers\n\nContact Persons for Details:\n• Nirupama Chauhan: +91 8081591074\n• Nirupma Srivastava: +91 92609 37734\n• Himanshu Tiwari: +91 7380395557",
      category: 'Cultural',
      department: 'All',
      startDate: new Date('2026-10-16T16:30:00.000Z'),
      endDate: new Date('2026-10-16T22:30:00.000Z'),
      venue: 'TGI Ground, Techno Institute of Higher Studies, Lucknow',
      capacity: 600,
      fee: 0,
      banner: '/assets/images/tashan-2026.jpg',
      tags: ['Cultural', 'FresherParty', 'GarbaEve', 'Dance', 'Singing', 'Acting', 'RampWalk', 'Tashan2026'],
      rules: 'College ID mandatory. Traditional Indian ethnic or festive attire recommended. Free digital QR entry pass mandatory at gate.',
      prizes: 'Mr. & Ms. Fresher 2026 Trophy & Sash, Best Garba Dandiya Performance Award, Best Ethnic Attire + Exclusive Gift Hampers.',
      status: 'published',
      isFeatured: true,
      createdBy: facultyUser._id,
      approvedBy: adminUser._id,
    });

    const event1 = await Event.create({
      title: 'TechnoUtsav 2026: Annual Cultural Fest',
      slug: 'technoutsav-2026-annual-cultural-fest',
      description:
        'The grand annual flagship cultural extravaganza of Techno Institute of Higher Studies featuring classical and western group dance, live music battle of the bands, theatrical drama, and celebrity star night.',
      category: 'Cultural',
      department: 'All',
      startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      venue: 'TIHS Main Open Air Auditorium & Amphitheatre, Lucknow',
      capacity: 350,
      fee: 0,
      banner: '/assets/images/campus-hero.webp',
      tags: ['Cultural', 'Music', 'Dance', 'Drama', 'Fest2026'],
      rules: 'College ID mandatory. Registration required. Outside visitors allowed with pass.',
      prizes: 'Trophies, certificates, and cash prizes worth ₹50,000 for top performing college troupes.',
      status: 'published',
      isFeatured: true,
      createdBy: facultyUser._id,
      approvedBy: adminUser._id,
    });

    const event2 = await Event.create({
      title: 'Hack-Techno 2026: 24-Hour AI & FullStack Hackathon',
      slug: 'hack-techno-2026-24-hour-ai-hackathon',
      description:
        'A high-octane 24-hour national level hackathon organized by the BCA & Computer Science Department. Build breakthrough solutions in Generative AI, EdTech, Healthcare, and Smart City automation.',
      category: 'Technical',
      department: 'BCA',
      startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
      venue: 'Advanced Computing Lab & Innovation Hub (Block B, 3rd Floor)',
      capacity: 120,
      fee: 0,
      banner: '/assets/images/facilities.webp',
      tags: ['Hackathon', 'AI', 'Coding', 'WebDev', 'Robotics'],
      rules: 'Teams of 2 to 4 members. Laptops and chargers required. High-speed Wi-Fi provided.',
      prizes: '1st Prize: ₹25,000 + Internship Offer | 2nd Prize: ₹15,000 | 3rd Prize: ₹10,000.',
      status: 'published',
      isFeatured: true,
      createdBy: facultyUser._id,
      approvedBy: adminUser._id,
    });

    const event3 = await Event.create({
      title: 'TIHS Inter-Departmental Sports Meet: Ranbhoomi',
      slug: 'tihs-inter-dept-sports-meet-ranbhoomi',
      description:
        'Annual inter-department sports tournament spanning Box Cricket, Badminton Singles & Doubles, Chess Championships, Table Tennis, and 100m/200m Track Athletics.',
      category: 'Sports',
      department: 'All',
      startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
      venue: 'TIHS Sports Ground & Indoor Badminton Court',
      capacity: 200,
      fee: 0,
      banner: '/assets/images/campus-life.webp',
      tags: ['Cricket', 'Badminton', 'Chess', 'Athletics', 'Fitness'],
      rules: 'Proper sports attire and non-marking shoes mandatory for indoor courts.',
      prizes: 'Gold, Silver & Bronze Medals + Rolling Championship Trophy for Best Department.',
      status: 'published',
      isFeatured: false,
      createdBy: facultyUser._id,
      approvedBy: adminUser._id,
    });

    const event4 = await Event.create({
      title: 'National Seminar on Digital Marketing & Fintech Trends',
      slug: 'national-seminar-digital-marketing-fintech',
      description:
        'Distinguished industry leaders and corporate speakers from top MNCs share practical insights on modern growth marketing, algorithmic finance, blockchain, and startup venture building.',
      category: 'Workshop',
      department: 'BBA',
      startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 3600 * 1000),
      venue: 'Seminar Hall 1 (Management Block, TIHS)',
      capacity: 150,
      fee: 0,
      banner: '/assets/images/student-zone.webp',
      tags: ['Seminar', 'Fintech', 'Marketing', 'BBA', 'Career'],
      rules: 'Formal college dress code mandatory. Q&A session at the end of each keynote.',
      prizes: 'Participation Certificate + Exclusive Case Study Booklet.',
      status: 'published',
      isFeatured: true,
      createdBy: facultyUser._id,
      approvedBy: adminUser._id,
    });

    const event5 = await Event.create({
      title: 'Kala-Kriti: Fine Arts, Canvas Painting & Photography Exhibition',
      slug: 'kala-kriti-fine-arts-photography-exhibition',
      description:
        'An artistic showcase celebrating visual creativity. Includes live oil and acrylic canvas painting, clay sculpting, digital graphic design, and street photography contest.',
      category: 'Fine Arts',
      department: 'BFA',
      startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      venue: 'TIHS Central Art Gallery & Exhibition Hall',
      capacity: 100,
      fee: 0,
      banner: '/assets/images/faculty.webp',
      tags: ['FineArts', 'Painting', 'Photography', 'Design', 'BFA'],
      rules: 'Art supplies to be brought by participants or standard kit provided at venue.',
      prizes: 'Best Art Exhibit Trophy + Framed Gallery Feature + Cash Awards.',
      status: 'completed',
      isFeatured: false,
      createdBy: facultyUser._id,
      approvedBy: adminUser._id,
    });

    console.log('[Seed] Created 5 Sample Events matching all categories.');

    // 3. Create Sample Registration & QR Ticket for Student
    const ticketCode1 = `TIHS-CUL-${Date.now().toString().slice(-6)}-101`;
    const qrPayload1 = JSON.stringify({
      ticketCode: ticketCode1,
      userId: studentUser._id,
      eventId: event1._id,
      userName: studentUser.name,
      eventTitle: event1.title,
    });
    const qr1 = await generateQRCode(qrPayload1);

    const reg1 = await Registration.create({
      user: studentUser._id,
      event: event1._id,
      ticketCode: ticketCode1,
      paymentStatus: 'free',
      qrCode: qr1,
      status: 'registered',
    });

    // Completed event registration for certificate and feedback demo
    const ticketCode2 = `TIHS-FIN-${Date.now().toString().slice(-6)}-102`;
    const qrPayload2 = JSON.stringify({
      ticketCode: ticketCode2,
      userId: studentUser._id,
      eventId: event5._id,
      userName: studentUser.name,
      eventTitle: event5.title,
    });
    const qr2 = await generateQRCode(qrPayload2);

    const reg2 = await Registration.create({
      user: studentUser._id,
      event: event5._id,
      ticketCode: ticketCode2,
      paymentStatus: 'free',
      qrCode: qr2,
      status: 'attended',
    });

    // 4. Attendance for Completed Event
    await Attendance.create({
      registration: reg2._id,
      user: studentUser._id,
      event: event5._id,
      scannedBy: volunteerUser._id,
      method: 'qr_scan',
      notes: 'Entry scanned at Art Gallery gate',
    });

    // 5. Certificate for Completed Event
    const certId = `TIHS-FIN-${Date.now().toString().slice(-6)}-9012`;
    const hash = crypto.createHash('sha256').update(`${studentUser._id}-${event5._id}-${certId}`).digest('hex');

    const certResult = await generateCertificatePDF({
      certificateId: certId,
      studentName: studentUser.name,
      eventTitle: event5.title,
      category: event5.category,
      eventDate: event5.startDate,
      department: studentUser.department,
    });

    await Certificate.create({
      user: studentUser._id,
      event: event5._id,
      certificateId: certId,
      certUrl: certResult.relativeUrl,
      hash: hash,
    });

    // 6. Feedback for Completed Event
    await Feedback.create({
      user: studentUser._id,
      event: event5._id,
      rating: 5,
      comment: 'Exceptional organization by TIHS! The lighting and gallery spaces were world-class.',
    });

    // 7. Audit Log
    await AuditLog.create({
      user: adminUser._id,
      userEmail: adminUser.email,
      userRole: adminUser.role,
      action: 'SYSTEM_INITIALIZED',
      details: 'TIHS CEMS Production database seeded with demo data',
      ip: '127.0.0.1',
    });

    console.log('[Seed] Database successfully populated with initial data!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
