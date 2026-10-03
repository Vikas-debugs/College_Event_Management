const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', '..', 'data');
const storeFile = path.join(dataDir, 'store.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const generateId = () => crypto.randomBytes(12).toString('hex');

// In-Memory collections
let db = {
  users: [],
  events: [],
  registrations: [],
  payments: [],
  attendances: [],
  certificates: [],
  feedbacks: [],
  notifications: [],
  auditlogs: [],
};

const saveStore = () => {
  try {
    fs.writeFileSync(storeFile, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('[EmbeddedStore] Save error:', err.message);
  }
};

const loadStore = () => {
  if (fs.existsSync(storeFile)) {
    try {
      const content = fs.readFileSync(storeFile, 'utf8');
      db = JSON.parse(content);
      return true;
    } catch (err) {
      console.warn('[EmbeddedStore] Load error, resetting store:', err.message);
    }
  }
  return false;
};

// Enhance doc with Mongoose-like methods
const wrapDoc = (doc, collectionName) => {
  if (!doc) return null;
  const wrapped = { ...doc };

  wrapped._id = doc._id ? doc._id.toString() : generateId();
  wrapped.id = wrapped._id;

  wrapped.toObject = function () {
    const copy = { ...wrapped };
    delete copy.toObject;
    delete copy.save;
    delete copy.matchPassword;
    return copy;
  };

  wrapped.save = async function () {
    const coll = db[collectionName];
    if (collectionName === 'users' && wrapped.password && !wrapped.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      wrapped.password = await bcrypt.hash(wrapped.password, salt);
    }
    const idx = coll.findIndex((d) => d._id === wrapped._id);
    if (idx !== -1) {
      coll[idx] = { ...wrapped };
    } else {
      coll.push({ ...wrapped });
    }
    saveStore();
    return wrapDoc(coll[idx !== -1 ? idx : coll.length - 1], collectionName);
  };

  if (collectionName === 'users') {
    wrapped.matchPassword = async function (enteredPassword) {
      if (!this.password) return false;
      return await bcrypt.compare(enteredPassword, this.password);
    };
  }

  return wrapped;
};

// Match filter helper
const matchesFilter = (doc, filter = {}) => {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      const anyMatch = val.some((subFilter) => matchesFilter(doc, subFilter));
      if (!anyMatch) return false;
      continue;
    }

    let docVal = doc[key];
    if (key === '_id' && docVal) docVal = docVal.toString();

    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof RegExp)) {
      if (val.$in && Array.isArray(val.$in)) {
        if (!val.$in.map((v) => (v ? v.toString() : v)).includes(docVal ? docVal.toString() : docVal)) {
          return false;
        }
      } else if (val.$regex) {
        const regex = new RegExp(val.$regex, val.$options || '');
        if (!regex.test(String(docVal || ''))) return false;
      } else if (val.$gte !== undefined || val.$lte !== undefined || val.$gt !== undefined || val.$lt !== undefined) {
        const dVal = new Date(docVal).getTime();
        if (val.$gte !== undefined && dVal < new Date(val.$gte).getTime()) return false;
        if (val.$lte !== undefined && dVal > new Date(val.$lte).getTime()) return false;
        if (val.$gt !== undefined && dVal <= new Date(val.$gt).getTime()) return false;
        if (val.$lt !== undefined && dVal >= new Date(val.$lt).getTime()) return false;
      }
    } else if (val instanceof RegExp) {
      if (!val.test(String(docVal || ''))) return false;
    } else if (val !== undefined) {
      const matchVal = val ? val.toString() : val;
      const targetVal = docVal ? docVal.toString() : docVal;
      if (matchVal !== targetVal) return false;
    }
  }

  return true;
};

// Chainable Query Builder
class QueryBuilder {
  constructor(collectionName, filter = {}, isFindOne = false) {
    this.collectionName = collectionName;
    this.filter = filter;
    this.isFindOne = isFindOne;
    this._populates = [];
    this._sortField = null;
    this._sortOrder = 1;
    this._selectExclude = [];
    this._selectInclude = [];
    this._limit = null;
  }

  populate(field, select) {
    this._populates.push({ field, select });
    return this;
  }

  sort(sortObj) {
    if (sortObj && typeof sortObj === 'object') {
      const [field, order] = Object.entries(sortObj)[0];
      this._sortField = field;
      this._sortOrder = order === -1 || order === 'desc' ? -1 : 1;
    }
    return this;
  }

  select(selectStr) {
    if (typeof selectStr === 'string') {
      const parts = selectStr.split(' ');
      parts.forEach((p) => {
        if (p.startsWith('-')) this._selectExclude.push(p.slice(1));
        else if (p.startsWith('+')) this._selectInclude.push(p.slice(1));
      });
    }
    return this;
  }

  limit(n) {
    this._limit = Number(n);
    return this;
  }

  _execute() {
    let items = (db[this.collectionName] || []).filter((d) => matchesFilter(d, this.filter));

    if (this._sortField) {
      items.sort((a, b) => {
        const valA = a[this._sortField] instanceof Date ? a[this._sortField].getTime() : a[this._sortField];
        const valB = b[this._sortField] instanceof Date ? b[this._sortField].getTime() : b[this._sortField];
        if (valA < valB) return -1 * this._sortOrder;
        if (valA > valB) return 1 * this._sortOrder;
        return 0;
      });
    }

    if (this._limit && !this.isFindOne) {
      items = items.slice(0, this._limit);
    }

    let results = items.map((doc) => {
      let wrapped = wrapDoc(doc, this.collectionName);

      // Handle populates
      this._populates.forEach(({ field }) => {
        const idVal = doc[field];
        if (idVal) {
          const targetColl =
            field === 'user' || field === 'createdBy' || field === 'approvedBy' || field === 'scannedBy'
              ? 'users'
              : field === 'event'
              ? 'events'
              : field === 'registration'
              ? 'registrations'
              : field === 'payment'
              ? 'payments'
              : null;

          if (targetColl && db[targetColl]) {
            const matched = db[targetColl].find((x) => x._id === idVal.toString() || x._id === idVal);
            if (matched) {
              const matchedCopy = wrapDoc(matched, targetColl);
              delete matchedCopy.password;
              wrapped[field] = matchedCopy;
            }
          }
        }
      });

      // Handle exclude
      this._selectExclude.forEach((ex) => {
        delete wrapped[ex];
      });

      return wrapped;
    });

    if (this.isFindOne) {
      return results.length > 0 ? results[0] : null;
    }
    return results;
  }

  then(resolve, reject) {
    try {
      resolve(this._execute());
    } catch (e) {
      reject(e);
    }
  }
}

const createModelProxy = (collectionName) => {
  return {
    find: (filter) => new QueryBuilder(collectionName, filter, false),
    findOne: (filter) => new QueryBuilder(collectionName, filter, true),
    findById: (id) => new QueryBuilder(collectionName, { _id: id ? id.toString() : id }, true),

    countDocuments: async (filter = {}) => {
      const items = (db[collectionName] || []).filter((d) => matchesFilter(d, filter));
      return items.length;
    },

    create: async (data) => {
      const isArray = Array.isArray(data);
      const items = isArray ? data : [data];
      const createdDocs = [];

      for (const item of items) {
        const newDoc = {
          ...item,
          _id: item._id || generateId(),
          createdAt: item.createdAt || new Date(),
          updatedAt: item.updatedAt || new Date(),
        };

        if (collectionName === 'users' && newDoc.password && !newDoc.password.startsWith('$2')) {
          const salt = await bcrypt.genSalt(10);
          newDoc.password = await bcrypt.hash(newDoc.password, salt);
        }

        db[collectionName].push(newDoc);
        createdDocs.push(wrapDoc(newDoc, collectionName));
      }

      saveStore();
      return isArray ? createdDocs : createdDocs[0];
    },

    findByIdAndUpdate: async (id, update, options = {}) => {
      const coll = db[collectionName];
      const idx = coll.findIndex((d) => d._id === (id ? id.toString() : id));
      if (idx === -1) return null;

      coll[idx] = {
        ...coll[idx],
        ...update,
        updatedAt: new Date(),
      };
      saveStore();
      return wrapDoc(coll[idx], collectionName);
    },

    findByIdAndDelete: async (id) => {
      const coll = db[collectionName];
      const idx = coll.findIndex((d) => d._id === (id ? id.toString() : id));
      if (idx === -1) return null;
      const deleted = coll.splice(idx, 1);
      saveStore();
      return wrapDoc(deleted[0], collectionName);
    },

    deleteMany: async (filter = {}) => {
      if (Object.keys(filter).length === 0) {
        db[collectionName] = [];
      } else {
        db[collectionName] = db[collectionName].filter((d) => !matchesFilter(d, filter));
      }
      saveStore();
      return { acknowledged: true };
    },

    aggregate: async (pipeline = []) => {
      if (collectionName === 'events') {
        const counts = {};
        db.events.forEach((ev) => {
          counts[ev.category] = (counts[ev.category] || 0) + 1;
        });
        return Object.entries(counts).map(([cat, count]) => ({ _id: cat, count }));
      }
      if (collectionName === 'users') {
        const deptCounts = {};
        db.users.filter((u) => u.role === 'student').forEach((u) => {
          deptCounts[u.department] = (deptCounts[u.department] || 0) + 1;
        });
        return Object.entries(deptCounts).map(([dept, students]) => ({ _id: dept, students }));
      }
      return [];
    },
  };
};

// Seed initial data if empty
const seedInitialData = async () => {
  if (db.users.length > 0 && db.events.length > 0) {
    return;
  }

  console.log('[EmbeddedStore] Seeding database with TIHS demo data & events...');

  // 1. Password hashes
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@123', salt);
  const facultyPass = await bcrypt.hash('Faculty@123', salt);
  const studentPass = await bcrypt.hash('Student@123', salt);
  const volunteerPass = await bcrypt.hash('Volunteer@123', salt);

  const adminId = '66f8d3a10101010101010001';
  const facultyId = '66f8d3a10101010101010002';
  const studentId = '66f8d3a10101010101010003';
  const volunteerId = '66f8d3a10101010101010004';

  db.users = [
    {
      _id: adminId,
      name: 'Dr. S. K. Singh (Admin)',
      email: 'admin@tihs.edu.in',
      password: adminPass,
      role: 'admin',
      department: 'Administration',
      phone: '+91-7897123111',
      isVerified: true,
      createdAt: new Date(),
    },
    {
      _id: facultyId,
      name: 'Prof. Ananya Verma',
      email: 'faculty@tihs.edu.in',
      password: facultyPass,
      role: 'faculty',
      department: 'BCA',
      phone: '+91-9876543210',
      isVerified: true,
      createdAt: new Date(),
    },
    {
      _id: studentId,
      name: 'Aarav Sharma',
      email: 'student@tihs.edu.in',
      password: studentPass,
      role: 'student',
      department: 'BCA',
      year: 3,
      phone: '+91-9123456780',
      isVerified: true,
      createdAt: new Date(),
    },
    {
      _id: volunteerId,
      name: 'Priya Srivastava',
      email: 'volunteer@tihs.edu.in',
      password: volunteerPass,
      role: 'volunteer',
      department: 'BBA',
      year: 2,
      phone: '+91-9988776655',
      isVerified: true,
      createdAt: new Date(),
    },
  ];

  const now = new Date();
  const event0Id = '66f8d3e20202020202020000';
  const event1Id = '66f8d3e20202020202020001';
  const event2Id = '66f8d3e20202020202020002';
  const event3Id = '66f8d3e20202020202020003';
  const event4Id = '66f8d3e20202020202020004';
  const event5Id = '66f8d3e20202020202020005';

  db.events = [
    {
      _id: event0Id,
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
      createdBy: facultyId,
      approvedBy: adminId,
      createdAt: new Date(),
    },
    {
      _id: event1Id,
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
      createdBy: facultyId,
      approvedBy: adminId,
      createdAt: new Date(),
    },
    {
      _id: event2Id,
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
      createdBy: facultyId,
      approvedBy: adminId,
      createdAt: new Date(),
    },
    {
      _id: event3Id,
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
      createdBy: facultyId,
      approvedBy: adminId,
      createdAt: new Date(),
    },
    {
      _id: event4Id,
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
      createdBy: facultyId,
      approvedBy: adminId,
      createdAt: new Date(),
    },
    {
      _id: event5Id,
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
      createdBy: facultyId,
      approvedBy: adminId,
      createdAt: new Date(),
    },
  ];

  // Seed registration and certificate for completed event
  const reg1Id = '66f8d4f30303030303030001';
  db.registrations = [
    {
      _id: reg1Id,
      user: studentId,
      event: event5Id,
      ticketCode: 'TIHS-FIN-981245-101',
      paymentStatus: 'free',
      status: 'attended',
      createdAt: new Date(),
    },
  ];

  db.attendances = [
    {
      _id: '66f8d5f40404040404040001',
      registration: reg1Id,
      user: studentId,
      event: event5Id,
      scannedBy: volunteerId,
      method: 'qr_scan',
      notes: 'Entry scanned at Art Gallery gate',
      scannedAt: new Date(),
    },
  ];

  db.certificates = [
    {
      _id: '66f8d6f50505050505050001',
      user: studentId,
      event: event5Id,
      certificateId: 'TIHS-FIN-881234-9012',
      certUrl: '/uploads/certificates/TIHS-FIN-881234-9012.pdf',
      hash: 'a1b2c3d4e5f67890123456789abcdef',
      issuedAt: new Date(),
    },
  ];

  db.feedbacks = [
    {
      _id: '66f8d7f60606060606060001',
      user: studentId,
      event: event5Id,
      rating: 5,
      comment: 'Exceptional organization by TIHS! The lighting and gallery spaces were world-class.',
      createdAt: new Date(),
    },
  ];

  db.auditlogs = [
    {
      _id: '66f8d8f70707070707070001',
      user: adminId,
      userEmail: 'admin@tihs.edu.in',
      userRole: 'admin',
      action: 'SYSTEM_INITIALIZED',
      details: 'TIHS CEMS Initialized with Embedded Store',
      ip: '127.0.0.1',
      createdAt: new Date(),
    },
  ];

  saveStore();
  console.log('[EmbeddedStore] Pre-seeded 4 users and 5 events successfully.');
};

loadStore();

module.exports = {
  db,
  createModelProxy,
  seedInitialData,
};
