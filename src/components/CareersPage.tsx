import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext.tsx';
import { Briefcase, MapPin, Calendar, Users, Upload, CheckCircle2, RefreshCw } from 'lucide-react';

export default function CareersPage() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Application form fields
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState('My_Resume.pdf');
  
  const [submitting, setSubmitting] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/careers');
      if (response.ok) {
        setJobs(await response.json());
      }
    } catch (err) {
      console.error('Error fetching job listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob.id,
          jobTitle: selectedJob.title,
          fullName,
          email,
          phone,
          coverLetter,
          cvFileName
        })
      });

      if (response.ok) {
        setAppliedSuccess(true);
        setFullName('');
        setEmail('');
        setPhone('');
        setCoverLetter('');
        setTimeout(() => {
          setAppliedSuccess(false);
          setSelectedJob(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error submitting application:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Build Your Career with Guulwade
        </h2>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Join East Africa's premier full-scale logistics team. Drive maritime corridors, fly cargo planes, coordinate dry port warehouses, and build global trading networks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left columns: Jobs List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-black text-gray-900 dark:text-white">Active Vacancies</h3>

          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading vacancies...</div>
          ) : jobs.length === 0 ? (
            <p className="text-xs text-gray-400 p-10 text-center">No current vacancies are listed. Please check back soon!</p>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">{job.department} • {job.type}</span>
                      <h4 className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">{job.title}</h4>
                      <p className="text-xs text-[#0057B8] dark:text-[#FFB000] font-bold flex items-center space-x-1 mt-1">
                        <MapPin size={12} />
                        <span>{job.location}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => { setSelectedJob(job); setAppliedSuccess(false); }}
                      className="px-5 py-2.5 bg-[#0057B8] hover:bg-[#00479b] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Apply Online
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    {job.description}
                  </p>

                  <div className="pt-4 border-t border-gray-50 dark:border-gray-800 space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Candidate Requirements</span>
                    <ul className="list-disc pl-4 text-xs text-gray-500 space-y-1">
                      {job.requirements.map((req: string, i: number) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Application Drawer Form */}
        <div>
          {selectedJob ? (
            <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border-2 border-[#0057B8] dark:border-[#FFB000] shadow-xl space-y-6 sticky top-24">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                <div className="text-left">
                  <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Online application</span>
                  <h4 className="font-extrabold text-xs text-gray-950 dark:text-white max-w-[180px] truncate">{selectedJob.title}</h4>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-xs text-red-500 font-bold hover:underline">Cancel</button>
              </div>

              {appliedSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#00A86B]/10 text-[#00A86B] mx-auto flex items-center justify-center font-bold text-xl">
                    ✓
                  </div>
                  <h5 className="font-bold text-gray-950 dark:text-white">Application Received!</h5>
                  <p className="text-xs text-gray-500">Your resume file {cvFileName} has been uploaded to our HR queue. Amina Yusuf will contact you for a phone interview shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">Full Name *</label>
                    <input
                      type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Abdirahman Cali"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">Email Address *</label>
                    <input
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="abdi@test.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">Phone Number *</label>
                    <input
                      type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+252 61 777..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">Introduce Yourself / Cover Letter</label>
                    <textarea
                      value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Describe why you want to join Guulwade Logistics..."
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* CV File Upload Trigger (Drag & drop ready) */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">Upload Resume (PDF/DOCX) *</label>
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 rounded-xl text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative">
                      <Upload size={18} className="mx-auto text-[#0057B8] dark:text-[#FFB000] mb-1 animate-pulse" />
                      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 block">{cvFileName}</span>
                      <span className="text-[8px] text-gray-400 block mt-1">Tap to select or drop resume PDF</span>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setCvFileName(e.target.files[0].name);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#0057B8] hover:bg-[#00479b] text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    {submitting ? 'Uploading resume...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#0B1220] to-[#121c2e] p-6 rounded-2xl border border-white/5 text-white space-y-4">
              <Briefcase size={24} className="text-[#FFB000]" />
              <h4 className="font-extrabold text-base">Select a Vacancy</h4>
              <p className="text-xs text-gray-400">Click "Apply Online" on any vacancy to open our CV uploader and submit your application immediately.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
