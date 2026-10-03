import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificateApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { Award, Download, ArrowLeft, CheckCircle2, ShieldCheck, Camera, Upload, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Certificate = () => {
  const { id } = useParams();
  const { user: authUser, updateProfilePhoto } = useAuth();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await certificateApi.getById(id);
        if (res.data.success) {
          setCert(res.data.data);
        }
      } catch (err) {
        toast.error('Certificate not found or invalid');
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [id]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      setUploadingPhoto(true);
      try {
        if (updateProfilePhoto) {
          await updateProfilePhoto(base64Data);
        }
        setCert((prev) => ({
          ...prev,
          user: {
            ...prev?.user,
            profilePhoto: base64Data,
          },
        }));
        toast.success('Participant photo attached to verified certificate!');
      } catch (err) {
        toast.error('Could not save photo');
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader text="Retrieving verified certificate..." size="lg" />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-pale-purple text-center shadow-md">
        <Award className="w-12 h-12 text-deep-purple/40 mx-auto mb-3" />
        <h2 className="font-heading text-xl font-bold text-text-dark">Certificate Not Found</h2>
        <p className="text-xs text-text-muted mt-2">The certificate ID entered is invalid or has not been issued yet.</p>
        <Link to="/" className="mt-4 inline-block px-5 py-2.5 bg-deep-purple text-white text-xs font-bold rounded-xl">
          Back to Home
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(cert.event?.startDate || cert.issuedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const participantPhoto = cert.user?.profilePhoto || (authUser?.id === cert.user?._id || authUser?._id === cert.user?._id ? authUser?.profilePhoto : null);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-deep-purple hover:text-bright-orange transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2.5">
          {/* Optional Photo Upload Button */}
          <label className="cursor-pointer px-4 py-2.5 bg-pale-purple hover:bg-light-purple/40 text-deep-purple font-bold text-xs rounded-xl shadow-sm border border-light-purple/40 transition-all flex items-center gap-2">
            <Camera className="w-4 h-4 text-deep-purple" />
            <span>{uploadingPhoto ? 'Attaching Photo...' : participantPhoto ? 'Change Photo' : 'Add Photo to Certificate'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
            />
          </label>

          <a
            href={`/api/certificates/${cert.certificateId || cert._id}/download`}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-bright-orange hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Verified PDF</span>
          </a>
        </div>
      </div>

      {/* Certificate Frame Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-8 border-deep-purple shadow-2xl relative overflow-hidden text-center space-y-6">
        {/* Inner Gold Border */}
        <div className="border-2 border-gold p-6 sm:p-10 rounded-2xl space-y-6 relative">
          {/* Official Participant Photo Badge (Top Right) */}
          <div className="sm:absolute sm:top-6 sm:right-6 mx-auto sm:mx-0 w-24 flex flex-col items-center">
            <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl border-2 border-gold bg-cream/70 shadow-md overflow-hidden flex items-center justify-center relative group">
              {participantPhoto ? (
                <img
                  src={participantPhoto}
                  alt={cert.user?.name || 'Participant'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-text-muted">
                  <User className="w-8 h-8 mx-auto text-deep-purple/30 mb-1" />
                  <span className="text-[9px] font-bold block uppercase tracking-wider text-text-muted">TIHS</span>
                  <label className="cursor-pointer text-[9px] font-bold text-bright-orange hover:underline block mt-0.5">
                    + Add Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold text-gold uppercase tracking-wider mt-1 bg-deep-purple px-2 py-0.5 rounded-full text-white shadow-sm">
              Participant
            </span>
          </div>
          {/* Header */}
          <div className="space-y-2">
            {/* Logo + college name side by side */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <img
                src="/assets/images/tihs-logo.webp"
                alt="TIHS Logo"
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  // Fallback: hide image, show initials
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div
                className="w-20 h-20 rounded-full bg-deep-purple text-white font-extrabold text-xl flex items-center justify-center font-heading"
                style={{ display: 'none' }}
              >
                TIHS
              </div>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-deep-purple tracking-wide uppercase">
              Techno Institute of Higher Studies
            </h2>
            <p className="text-[11px] font-bold text-bright-orange uppercase tracking-widest">
              NAAC Accredited | NCTE Approved | ISO 9001:2015
            </p>
            <p className="text-xs text-text-muted italic font-heading">
              "Shaping Future Skilled Professionals" • Affiliated to University of Lucknow
            </p>
          </div>

          <div className="w-32 h-0.5 bg-gold mx-auto" />

          {/* Certificate Title */}
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-deep-purple uppercase tracking-wider">
              Certificate of Participation
            </h1>
            <p className="text-xs text-text-muted mt-2">This is proudly presented to</p>
          </div>

          {/* Student Name */}
          <div className="font-heading text-3xl sm:text-4xl font-extrabold text-deep-purple tracking-wide underline underline-offset-8 decoration-gold">
            {cert.user?.name || 'TIHS Student'}
          </div>

          {/* Body Paragraph */}
          <p className="text-xs sm:text-sm text-text-dark/80 max-w-xl mx-auto leading-relaxed">
            from Department of <strong>{cert.user?.department || 'BCA'}</strong> for active participation and commendable performance in the <strong>{cert.event?.category || 'College'}</strong> event <strong>"{cert.event?.title}"</strong> held on <strong>{formattedDate}</strong> at TIHS Campus, Lucknow.
          </p>

          {/* Footer with Verification Stamp and Signatures */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-center">
            {/* Stamp & Cert ID */}
            <div className="space-y-1 text-left sm:text-center">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Digital Credential
              </div>
              <p className="text-[10px] font-mono text-text-muted mt-1">ID: {cert.certificateId}</p>
            </div>

            {/* Convener Signature */}
            <div className="space-y-1">
              <div className="w-36 h-0.5 bg-text-dark/40 mx-auto" />
              <div className="font-heading font-bold text-xs text-text-dark">Event Convener</div>
              <div className="text-[10px] text-text-muted">Faculty Coordinator, TIHS</div>
            </div>

            {/* Principal Signature */}
            <div className="space-y-1">
              <div className="w-36 h-0.5 bg-text-dark/40 mx-auto" />
              <div className="font-heading font-bold text-xs text-text-dark">Dr. S. K. Singh</div>
              <div className="text-[10px] text-text-muted">Director / Principal, TIHS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
