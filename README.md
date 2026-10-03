# College Event Management System (CEMS)
## Techno Institute of Higher Studies (TIHS), Lucknow

> **"Shaping Future Skilled Professionals"**  
> *NAAC Accredited | NCTE Approved | ISO 9001:2015 | Affiliated to University of Lucknow*  
> *Ranked 3rd Best B-School in Lucknow (Times of India)*

---

## 📌 1. Project Overview
A production-grade web portal that digitizes the entire event lifecycle at **Techno Institute of Higher Studies (TIHS)**:
**Event Creation → Approval Workflow → Registration & Custom Forms → Razorpay Payments → Digital QR Ticket → Volunteer QR Attendance → Automated PDF Certificates → Star Feedback → Recharts Analytics**.

---

## 🎨 2. Brand Identity & Colors
| Color Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Deep Purple** | `#4c0c56` | Primary Theme / Headings |
| **Dark Purple** | `#3a0944` | Dark Hero Backgrounds / Footer |
| **Mid Purple** | `#6b2d7b` | Gradients / Card Accents |
| **Light Purple** | `#9966ac` | Borders / Subtle Accents |
| **Pale Purple** | `#f3eaf6` | Light Card Backgrounds |
| **Bright Orange** | `#e29826` | CTA Buttons / Action Badges |
| **Gold** | `#d4a229` | Highlights / Stars / Badges |
| **Cream** | `#faf8f5` | Page Body Background |
| **Text Dark** | `#2d1535` | High-contrast Typography |
| **Text Muted** | `#6b5a72` | Subtitles & Captions |

- **Headings Font**: Playfair Display (Google Fonts)
- **Body Font**: Inter (Google Fonts)
- **Departments Supported**: BBA, BCA, B.Com, BFA, BAJMC, B.Ed, B.Sc

---

## 👥 3. The 4 User Roles & Capabilities
1. **`admin`**: Approve/reject event proposals, user directory management, audit logs, Recharts analytics, bulk CSV import.
2. **`faculty`**: Propose/create events with banner uploads, monitor registrations, submit proposals for admin approval.
3. **`student`**: Browse event catalog, register (individual & teams), get QR passes, download PDF certificates, rate and give feedback.
4. **`volunteer`**: Real-time QR attendance scanner via mobile camera (`html5-qrcode`), anti-duplicate entry validation, gate check-ins.

---

## ⚡ 4. The 5 Event Categories
1. **`Cultural`** (TechnoUtsav, dance, music, drama, fashion)
2. **`Technical`** (Hackathons, AI coding, robotics)
3. **`Sports`** (Ranbhoomi cricket, badminton, table tennis, chess, track)
4. **`Workshop`** (Fintech, digital marketing, guest lectures, seminars)
5. **`Fine Arts`** (Kala-Kriti painting, photography, visual design)

---

## 📁 5. Project Directory Structure
```
tihs-cems/
├── backend/
│   ├── src/
│   │   ├── config/       # db.js, mailer.js, razorpay.js
│   │   ├── models/       # User, Event, Registration, Payment, Attendance, Certificate, Feedback, AuditLog, Notification
│   │   ├── controllers/  # auth, event, registration, payment, attendance, certificate, feedback, admin, analytics
│   │   ├── routes/       # *.routes.js
│   │   ├── services/     # emailService.js, qrService.js, pdfService.js, paymentService.js, cronService.js
│   │   ├── middleware/   # auth.js (JWT), role.js (RBAC), errorHandler.js, upload.js (Multer)
│   │   ├── templates/    # HTML email templates (welcome, registration, reminder, certificate, eventApproved, eventRejected)
│   │   └── utils/        # seed.js (Demo users & seed events)
│   ├── uploads/          # Event banners & generated PDF certificates
│   ├── server.js         # Production Express server + Security + Cron jobs
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/       # SVG generated branding assets (logo, campus hero, facilities, faculty, etc.)
│   │   ├── components/   # TopBar, Navbar, Footer, EventCard, ProtectedRoute, Loader, StatCard
│   │   ├── context/      # AuthContext.jsx (JWT session sync)
│   │   ├── pages/        # 15 Complete Pages: Home, About, Events, EventDetail, Campus, Faculty, Placements, Happenings, Contact, Login, Signup, StudentDashboard, AdminDashboard, Certificate, QRScanner, NotFound
│   │   ├── services/     # api.js (Axios with token refresh interceptors)
│   │   ├── App.jsx
│   │   ├── index.css     # Custom gradients & brand colors
│   │   └── main.jsx
│   ├── public/
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── postman_collection.json # Ready-to-import Postman REST test collection
└── README.md
```

---

## 🚀 6. Setup & Installation

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (Local `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### Step 1: Clone or Navigate to Project
```bash
cd C:\Users\techd\.gemini\antigravity\scratch\tihs-cems
```

### Step 2: Backend Setup
```bash
cd backend
npm install
# Seed the 4 demo users and sample events across all 5 categories:
npm run seed
# Start backend server
npm start
```
*Backend runs on `http://localhost:5000`*

### Step 3: Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
# Start Vite development server
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔑 7. Seed Demo Accounts (For Instant Testing)

| Role | Email | Password | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@tihs.edu.in` | `Admin@123` | Approvals, Analytics, User Roles, Logs |
| **Faculty** | `faculty@tihs.edu.in` | `Faculty@123` | Event Creation, Propose to Admin |
| **Student** | `student@tihs.edu.in` | `Student@123` | Book Passes, View QR Ticket, Certificates |
| **Volunteer** | `volunteer@tihs.edu.in` | `Volunteer@123` | Scan QR Passes at Entrance Gate |

*(The login page also provides 1-click demo button fillers for testing convenience).*

---

## 📧 8. Brevo SMTP Email Configuration
In `backend/.env`:
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=YOUR_BREVO_LOGIN
SMTP_PASS=YOUR_BREVO_SMTP_KEY
MAIL_FROM="TIHS Events <no-reply@tihs.edu.in>"
```
*When testing without live Brevo credentials, the system automatically uses a development console mock transporter that logs full delivery details without crashing.*

---

## 💳 9. Razorpay Payment Gateway (Test Mode)
In `backend/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_tihsDemoKey123
RAZORPAY_KEY_SECRET=rzp_secret_tihsDemoSecret456
```
Paid events invoke the Razorpay checkout script on the frontend and verify HMAC SHA256 signatures on the backend.

---

## 📊 10. Automated Cron Jobs (node-cron)
- **Event Reminders**: Runs every 10 minutes checking for published events starting in 24 hours or 2 hours, automatically notifying registered students via email.
- **Event Completion & Certification**: Runs every 5 minutes checking for expired events, transitioning status to `completed`, generating verified PDF certificates via `pdfkit`, and emailing verified links.

---

## 🛡️ 11. Security & Production Practices
- `helmet` security headers configured
- `express-rate-limit` DDoS and brute-force mitigation
- `bcryptjs` 10-round salted password hashing
- Role-Based Access Control (RBAC) middleware for both REST endpoints and React Router routes
- NoSQL Injection protection and sanitization
- Anti-duplicate QR scanner protection with gate audit logging
