import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Components
import TopBar from './components/TopBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Campus from './pages/Campus';
import Faculty from './pages/Faculty';
import Placements from './pages/Placements';
import Happenings from './pages/Happenings';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Certificate from './pages/Certificate';
import QRScanner from './pages/QRScanner';
import TicketVerify from './pages/TicketVerify';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-text-dark font-sans selection:bg-bright-orange selection:text-white">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#3a0944',
            color: '#faf8f5',
            fontSize: '12px',
            borderRadius: '12px',
            border: '1px solid #9966ac',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* Header Structure */}
      <TopBar />
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/campus" element={<Campus />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/placements" element={<Placements />} />
          <Route path="/happenings" element={<Happenings />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/certificates/:id" element={<Certificate />} />
          <Route path="/verify-ticket" element={<TicketVerify />} />

          {/* Protected Pages */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'admin', 'volunteer']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scanner"
            element={
              <ProtectedRoute allowedRoles={['volunteer', 'faculty', 'admin']}>
                <QRScanner />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
