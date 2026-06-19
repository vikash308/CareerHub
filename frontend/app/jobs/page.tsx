'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../store/hooks';
import { api } from '../../utils/api';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Plus,
  Search,
  Building2,
  Users,
  Check,
  Loader2,
  ChevronLeft,
  X,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { toast } from 'react-toastify';

function getInitials(name: string): string {
  if (!name) return 'CH';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function JobsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Search & Filters
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  // Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [postSubmitting, setPostSubmitting] = useState(false);
  
  // Post Job Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formSalary, setFormSalary] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formRequirements, setFormRequirements] = useState('');

  const fetchJobs = async (selectFirst = false) => {
    setLoading(true);
    try {
      const res = await api.getJobs();
      if (res && Array.isArray(res.jobs)) {
        setJobs(res.jobs);
        
        // Select the first job by default if list is not empty, or keep current selection if it exists
        if (res.jobs.length > 0) {
          if (selectFirst) {
            setSelectedJob(res.jobs[0]);
          } else {
            // Re-sync currently selected job if it exists in the fetched list
            const currentSelected = selectedJob 
              ? res.jobs.find((j: any) => j._id === selectedJob._id) 
              : null;
            setSelectedJob(currentSelected || res.jobs[0]);
          }
        } else {
          setSelectedJob(null);
        }
      }
    } catch {
      toast.error('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    fetchJobs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Apply to a job
  const handleApply = async (jobId: string) => {
    setActionInProgress(jobId);
    try {
      const res = await api.applyToJob(jobId);
      if (res?.message === 'Applied successfully') {
        toast.success('Successfully applied to this job!');
        // Refresh list
        await fetchJobs(false);
      } else {
        toast.error(res?.message || 'Failed to apply.');
      }
    } catch {
      toast.error('Network error. Could not apply.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Post a new job
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formCompany || !formLocation || !formDescription) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setPostSubmitting(true);
    try {
      const jobData = {
        title: formTitle,
        company: formCompany,
        location: formLocation,
        salary: formSalary,
        description: formDescription,
        requirements: formRequirements,
      };

      const res = await api.createJob(jobData);
      if (res?.message === 'Job created successfully') {
        toast.success('Job posting created successfully!');
        
        // Reset Form
        setFormTitle('');
        setFormCompany('');
        setFormLocation('');
        setFormSalary('');
        setFormDescription('');
        setFormRequirements('');
        
        setShowPostModal(false);
        // Refresh jobs and select new one
        await fetchJobs(true);
      } else {
        toast.error(res?.message || 'Failed to create job posting.');
      }
    } catch {
      toast.error('Network error. Could not post job.');
    } finally {
      setPostSubmitting(false);
    }
  };

  // Filter jobs list
  const filteredJobs = jobs.filter((job) => {
    const titleMatch = job.title.toLowerCase().includes(keyword.toLowerCase()) ||
                       job.company.toLowerCase().includes(keyword.toLowerCase());
    const locationMatch = job.location.toLowerCase().includes(location.toLowerCase());
    return titleMatch && locationMatch;
  });

  // Check if current user has applied to selected job
  const hasApplied = (job: any) => {
    if (!job || !user) return false;
    // applicants could be array of IDs or array of user objects
    return job.applicants.some((app: any) => {
      const id = typeof app === 'object' ? app._id : app;
      return id === user._id;
    });
  };

  // Time formatter
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <div className="relative min-h-screen page-bg overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob-1 absolute top-[10%] left-[10%] w-[35%] h-[35%] rounded-full bg-indigo-500/10 blur-3xl theme-blob" />
        <div className="blob-2 absolute bottom-[15%] right-[10%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-3xl theme-blob" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Widget */}
        <div className="theme-card rounded-2xl p-6 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold theme-text-primary tracking-tight">Career Opportunities</h1>
              <p className="text-xs theme-text-secondary">Explore custom career paths, view applications, or post jobs for free.</p>
            </div>
          </div>

          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all hover:shadow-lg hover:shadow-indigo-600/10 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Post a Job
          </button>
        </div>

        {/* Search Filter Inputs */}
        <div className="theme-card rounded-2xl p-4 mb-6 shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
            <input
              type="text"
              placeholder="Search job title, company, keywords..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full theme-input rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none transition-all"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
            <input
              type="text"
              placeholder="Filter by city, region, or 'Remote'..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full theme-input rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none transition-all"
            />
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-sm theme-text-secondary">Fetching active job postings...</p>
          </div>
        )}

        {/* Main Content Split Pane */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-270px)] min-h-[500px]">
            
            {/* Left Column: Job Cards List */}
            <div className={`lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1 pb-4 h-full ${
              selectedJob && 'hidden lg:flex'
            }`}>
              {filteredJobs.length === 0 ? (
                <div className="theme-card rounded-2xl p-10 text-center shadow-xl">
                  <Briefcase className="w-8 h-8 theme-text-muted mx-auto mb-2" />
                  <p className="text-xs theme-text-secondary font-semibold">No jobs match your search</p>
                  <p className="text-[11px] theme-text-muted mt-0.5">Try adjusting your filters or check back later.</p>
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => setSelectedJob(job)}
                    className={`theme-card rounded-2xl p-4 cursor-pointer hover:border-indigo-500/40 transition-all duration-200 flex gap-3.5 relative overflow-hidden group shadow-md ${
                      selectedJob?._id === job._id ? 'border-indigo-500/50 bg-indigo-500/[0.04]' : 'border-transparent'
                    }`}
                  >
                    {/* Active highlight bar */}
                    {selectedJob?._id === job._id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-md" />
                    )}
                    
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-indigo-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold theme-text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors leading-tight truncate">
                        {job.title}
                      </h3>
                      <p className="text-[11px] theme-text-secondary mt-1 truncate font-medium">
                        {job.company}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] theme-text-muted">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-400" />
                          {job.location}
                        </span>
                        {job.salary && (
                          <span className="flex items-center gap-0.5">
                            <DollarSign className="w-3 h-3 text-emerald-500" />
                            {job.salary}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t theme-border text-[10px] theme-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(job.createdAt)}
                        </span>
                        {job.applicants && job.applicants.length > 0 && (
                          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-300 font-semibold">
                            <Users className="w-3 h-3" />
                            {job.applicants.length} applicant{job.applicants.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Column: Detailed Job View */}
            <div className={`lg:col-span-7 theme-card rounded-2xl p-5 sm:p-6 flex flex-col h-full shadow-lg ${
              !selectedJob && 'hidden lg:flex justify-center items-center text-center'
            } ${selectedJob && 'flex'}`}>
              
              {!selectedJob ? (
                <div>
                  <Briefcase className="w-12 h-12 theme-text-muted mx-auto mb-3" />
                  <h2 className="text-sm font-semibold theme-text-secondary">Select a Job Listing</h2>
                  <p className="text-xs theme-text-muted mt-1">Click on a job from the list to view its full requirements and apply.</p>
                </div>
              ) : (
                <div className="flex flex-col h-full overflow-y-auto">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="flex items-center gap-1 text-[11px] theme-text-secondary hover:theme-text-primary mb-4 lg:hidden self-start"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back to Listings
                  </button>

                  {/* Job Header */}
                  <div className="flex gap-4 items-start border-b theme-border pb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-lg font-bold theme-text-primary leading-tight">
                        {selectedJob.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-300 font-semibold mt-1">
                        {selectedJob.company}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs theme-text-secondary">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                          {selectedJob.location}
                        </span>
                        {selectedJob.salary && (
                          <span className="flex items-center gap-0.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                            {selectedJob.salary}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Posted {formatDate(selectedJob.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Job Content Scroll area */}
                  <div className="flex-1 overflow-y-auto py-5 space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-xs font-bold theme-text-secondary uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        Job Description
                      </h3>
                      <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed whitespace-pre-line bg-[var(--btn-sec-bg)] border theme-border p-3 rounded-xl">
                        {selectedJob.description}
                      </p>
                    </div>

                    {/* Requirements */}
                    {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold theme-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                          <PlusCircle className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                          Key Requirements
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedJob.requirements.map((req: string, i: number) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 bg-[var(--btn-sec-bg)] border theme-border p-2.5 rounded-xl text-xs theme-text-secondary"
                            >
                              <Check className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Meta info / Posted by */}
                    <div className="flex flex-wrap items-center gap-4 bg-[var(--btn-sec-bg)] border theme-border p-4 rounded-xl text-xs">
                      {selectedJob.postedBy && (
                        <div className="flex items-center gap-3">
                          {selectedJob.postedBy.profilePicture ? (
                            <img
                              src={selectedJob.postedBy.profilePicture}
                              alt={selectedJob.postedBy.name}
                              className="w-8 h-8 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold border border-white/10">
                              {getInitials(selectedJob.postedBy.name)}
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] theme-text-muted font-medium">Job Poster</p>
                            <p className="text-[11px] font-bold theme-text-primary">{selectedJob.postedBy.name}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedJob.applicants && selectedJob.applicants.length > 0 && (
                        <div className="sm:ml-auto flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-500 dark:text-indigo-300" />
                          <span className="text-[11px] font-medium theme-text-secondary">
                            {selectedJob.applicants.length} candidate{selectedJob.applicants.length > 1 ? 's' : ''} applied
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply Actions Footer */}
                  <div className="border-t theme-border pt-5 mt-auto flex items-center gap-4">
                    {hasApplied(selectedJob) ? (
                      <span className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-sm font-bold shadow-inner">
                        <Check className="w-4 h-4" />
                        Application Submitted
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(selectedJob._id)}
                        disabled={actionInProgress === selectedJob._id}
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-indigo-600/15 active:scale-[0.98] disabled:opacity-50"
                      >
                        {actionInProgress === selectedJob._id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          'Apply Now'
                        )}
                      </button>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* Post a Job Modal Form */}
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPostModal(false)}
            />

            {/* Modal Glass Container */}
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)] rounded-2xl shadow-2xl profile-modal-enter flex flex-col">
              
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b theme-border bg-[var(--dropdown-bg)]/95 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <h2 className="text-sm font-bold theme-text-primary">Create a New Job Listing</h2>
                </div>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="p-1.5 rounded-lg theme-text-secondary hover:theme-text-primary hover:bg-[var(--btn-sec-bg)] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handlePostJob} className="p-6 space-y-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] theme-text-secondary font-semibold mb-1 block">Job Title *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Senior Software Engineer"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full theme-input rounded-xl px-3 py-2 text-xs outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] theme-text-secondary font-semibold mb-1 block">Company Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Google"
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      className="w-full theme-input rounded-xl px-3 py-2 text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] theme-text-secondary font-semibold mb-1 block">Location *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Mumbai, India (Hybrid)"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full theme-input rounded-xl px-3 py-2 text-xs outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] theme-text-secondary font-semibold mb-1 block">Salary Range (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹15L - ₹25L / year"
                      value={formSalary}
                      onChange={(e) => setFormSalary(e.target.value)}
                      className="w-full theme-input rounded-xl px-3 py-2 text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] theme-text-secondary font-semibold mb-1 block">Key Requirements (Comma-separated) *</label>
                  <input
                    required
                    type="text"
                    placeholder="React, TypeScript, NodeJS, 3+ years experience"
                    value={formRequirements}
                    onChange={(e) => setFormRequirements(e.target.value)}
                    className="w-full theme-input rounded-xl px-3 py-2 text-xs outline-none transition-all"
                  />
                  <p className="text-[9px] theme-text-muted mt-1">Separate requirements with commas to create lists.</p>
                </div>

                <div>
                  <label className="text-[11px] theme-text-secondary font-semibold mb-1 block">Job Description *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the job duties, role expectations, culture, benefits, etc."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full theme-input rounded-xl px-3 py-2 text-xs outline-none transition-all resize-none"
                  />
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t theme-border">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold theme-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={postSubmitting}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                  >
                    {postSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      'Publish Job'
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
