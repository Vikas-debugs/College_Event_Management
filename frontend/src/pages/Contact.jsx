import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Your message has been received by the TIHS Helpdesk!');
    setSent(true);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Header Banner */}
      <section className="bg-purple-gradient text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-gold font-bold text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-gold/30">
            Reach Out
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold">
            Contact TIHS Event Management Cell
          </h1>
          <p className="text-sm sm:text-base text-pale-purple/90 font-heading italic">
            "Techno Institute of Higher Studies, Lucknow • +91-7897123111"
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-pale-purple shadow-sm space-y-6">
              <h3 className="font-heading text-xl font-bold text-deep-purple">Campus Information</h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pale-purple text-deep-purple flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-text-dark">Campus Address</div>
                    <div className="text-text-muted mt-0.5 leading-relaxed">
                      Techno Institute of Higher Studies, Faizabad Road, Lucknow, Uttar Pradesh 226028, India
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pale-purple text-deep-purple flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-text-dark">Admissions & Helpdesk Helpline</div>
                    <div className="text-text-muted mt-0.5">
                      <a href="tel:+917897123111" className="hover:text-deep-purple font-semibold">+91-7897123111</a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pale-purple text-deep-purple flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-text-dark">Official Email</div>
                    <div className="text-text-muted mt-0.5">
                      <a href="mailto:events@tihs.edu.in" className="hover:text-deep-purple">events@tihs.edu.in</a> / <a href="mailto:info@tihs.edu.in" className="hover:text-deep-purple">info@tihs.edu.in</a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pale-purple text-deep-purple flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-text-dark">Office Hours</div>
                    <div className="text-text-muted mt-0.5">
                      Monday to Saturday: 9:00 AM – 5:00 PM
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accreditation reminder */}
            <div className="bg-dark-purple text-pale-purple p-6 rounded-3xl space-y-2 border border-light-purple/30">
              <div className="text-xs font-bold text-gold">Techno Institute of Higher Studies (TIHS)</div>
              <p className="text-xs text-pale-purple/80 leading-relaxed">
                NAAC Accredited • NCTE Approved • ISO 9001:2015 • Affiliated to University of Lucknow.
              </p>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-pale-purple shadow-sm">
            {sent ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-deep-purple">Thank You!</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Your query has been logged. Our event coordination team will reach out shortly.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="px-6 py-2.5 bg-pale-purple text-deep-purple text-xs font-bold rounded-xl hover:bg-light-purple/20"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-heading text-xl font-bold text-deep-purple mb-4">Send a Message / Query</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs focus:outline-none focus:border-deep-purple"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. student@tihs.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs focus:outline-none focus:border-deep-purple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Subject / Event Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Registration inquiry for TechnoUtsav 2026"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs focus:outline-none focus:border-deep-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3.5 bg-cream/60 border border-pale-purple rounded-xl text-xs focus:outline-none focus:border-deep-purple"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-bright-orange hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
