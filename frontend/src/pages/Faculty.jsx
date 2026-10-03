import React from 'react';
import { Mail, Phone, BookOpen, Award, GraduationCap } from 'lucide-react';

const Faculty = () => {
  const facultyMembers = [
    {
      name: 'Dr. S. K. Singh',
      designation: 'Director & Professor of Management',
      department: 'Administration / BBA',
      qualification: 'Ph.D (Lucknow Univ), MBA, UGC-NET',
      experience: '22+ Years in Higher Education & Corporate Consulting',
      email: 'director@tihs.edu.in',
    },
    {
      name: 'Prof. Ananya Verma',
      designation: 'Head of Department & Associate Professor',
      department: 'BCA (Computer Applications)',
      qualification: 'M.Tech (CSE), Ph.D (Pursuing), B.Tech',
      experience: '14+ Years in AI, Full Stack & Cloud Technologies',
      email: 'faculty@tihs.edu.in',
    },
    {
      name: 'Dr. Rajesh Mishra',
      designation: 'Professor & Head of Department',
      department: 'B.Com (Commerce & Finance)',
      qualification: 'Ph.D (Commerce), M.Com, FCA (Honorary)',
      experience: '18+ Years in Financial Accounting & Corporate Law',
      email: 'rajesh.mishra@tihs.edu.in',
    },
    {
      name: 'Prof. Meenakshi Dixit',
      designation: 'Associate Professor & Dean of Arts',
      department: 'BFA (Fine Arts & Visual Design)',
      qualification: 'MFA (Gold Medalist), BFA',
      experience: '12+ Years in Contemporary Art, Canvas & Digital Illustration',
      email: 'meenakshi.dixit@tihs.edu.in',
    },
    {
      name: 'Dr. Vivek Srivastava',
      designation: 'Head of Department',
      department: 'BAJMC (Journalism & Mass Comm.)',
      qualification: 'Ph.D (Media Studies), MJMC',
      experience: '15+ Years in Broadcast Journalism & Digital Media',
      email: 'vivek.srivastava@tihs.edu.in',
    },
    {
      name: 'Dr. Sunita Tripathi',
      designation: 'Head of Department (NCTE Division)',
      department: 'B.Ed (Teacher Education)',
      qualification: 'Ph.D (Education), M.Ed, M.Sc',
      experience: '16+ Years in Pedagogy & Teacher Mentorship',
      email: 'sunita.tripathi@tihs.edu.in',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Header Banner */}
      <section className="bg-purple-gradient text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-gold font-bold text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-gold/30">
            Academic Mentors
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold">
            Our Distinguished Faculty
          </h1>
          <p className="text-sm sm:text-base text-pale-purple/90 font-heading italic">
            "Learn from Ph.D scholars, authors, and seasoned industry mentors"
          </p>
        </div>
      </section>

      {/* Directory Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facultyMembers.map((fac, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-pale-purple shadow-sm hover:shadow-md transition-all space-y-4 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-pale-purple text-deep-purple flex items-center justify-center font-heading font-black text-xl">
                  {fac.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-deep-purple group-hover:text-bright-orange transition-colors">
                    {fac.name}
                  </h3>
                  <p className="text-xs font-semibold text-bright-orange">{fac.designation}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-text-muted border-t border-pale-purple/60 pt-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-deep-purple shrink-0" />
                  <span className="truncate">{fac.qualification}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-deep-purple shrink-0" />
                  <span className="truncate">{fac.experience}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-deep-purple shrink-0" />
                  <span className="truncate">{fac.email}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-block bg-pale-purple text-deep-purple text-[10px] font-bold px-2.5 py-1 rounded-full border border-light-purple/30">
                  {fac.department}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Faculty;
