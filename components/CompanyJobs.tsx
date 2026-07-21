import React, { useState } from 'react';
import { JobPosting, Candidate, AIInterviewRequest, CompanyProfile } from '../types';
import { generateGrokInterviewQuestions } from '../services/grokService';
import { PixelAvatar } from './ui/PixelAvatar';
import { Briefcase, Plus, CheckCircle2, Clock, Users, Send, Sparkles, X, ChevronRight, Award, MapPin, DollarSign, Filter } from 'lucide-react';

interface CompanyJobsProps {
  company: CompanyProfile;
  jobs: JobPosting[];
  candidates: Candidate[];
  interviewRequests: AIInterviewRequest[];
  onCreateJob: (newJob: JobPosting) => void;
  onSendInterview: (request: AIInterviewRequest) => void;
  onUpdateJobStatus: (jobId: string, status: 'Open' | 'Filled') => void;
}

export const CompanyJobs: React.FC<CompanyJobsProps> = ({
  company,
  jobs,
  candidates,
  interviewRequests,
  onCreateJob,
  onSendInterview,
  onUpdateJobStatus
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobs[0]?.id || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // New Job Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Remote');
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote'>('Full-time');
  const [salaryRange, setSalaryRange] = useState('$120,000 - $160,000');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('TypeScript, React, Node.js');

  // Invite Candidate State
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const selectedJobRequests = interviewRequests.filter(r => r.jobId === selectedJobId);

  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

    const newJob: JobPosting = {
      id: `job-${Date.now()}`,
      companyId: company.id,
      companyName: company.companyName,
      title: title.trim(),
      location,
      type,
      salaryRange,
      description: description.trim() || `Seeking an experienced ${title} to join our team.`,
      requiredSkills: skills.length ? skills : ['General'],
      status: 'Open',
      createdAt: Date.now(),
      applicantsCount: 0,
      interviewsSentCount: 0
    };

    onCreateJob(newJob);
    setSelectedJobId(newJob.id);
    setShowCreateModal(false);
    // Reset Form
    setTitle('');
    setDescription('');
  };

  const handleDispatchInterview = async () => {
    if (!selectedJob || !selectedCandidateId) return;

    const candidate = candidates.find(c => c.id === selectedCandidateId);
    if (!candidate) return;

    setIsGeneratingQuestions(true);

    try {
      // Generate questions via Grok AI
      const questions = await generateGrokInterviewQuestions(selectedJob.title, selectedJob.requiredSkills);

      const request: AIInterviewRequest = {
        id: `req-${Date.now()}`,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        companyId: company.id,
        companyName: company.companyName,
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateAvatar: candidate.avatar,
        status: 'Pending',
        sentAt: Date.now(),
        questions
      };

      onSendInterview(request);
      setShowInviteModal(false);
      setSelectedCandidateId('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-24">
      
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-white tracking-tight">Jobs Tracker & AI Interviews</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              {company.companyName}
            </span>
          </div>
          <p className="text-slate-400 text-sm">Post positions, send AI Video Interviews, and review Grok candidate evaluations.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Plus size={18} /> Post New Position
        </button>
      </div>

      {/* Main Grid: Job Selector Sidebar + Applicants Table */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        
        {/* Job Postings Sidebar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Positions ({jobs.length})</h3>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {jobs.map((job) => {
              const isSelected = job.id === selectedJobId;
              const pendingCount = interviewRequests.filter(r => r.jobId === job.id && r.status === 'Pending').length;
              const completedCount = interviewRequests.filter(r => r.jobId === job.id && r.status === 'Completed').length;

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500/50 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white text-sm leading-snug">{job.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      job.status === 'Open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                    <span>•</span>
                    <span className="text-emerald-300 font-mono">{job.salaryRange}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <span>{completedCount} Evaluated</span>
                    {pendingCount > 0 && (
                      <span className="text-amber-400 font-bold">{pendingCount} Invites Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Job Applicants & Interview Tracker */}
        {selectedJob ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            
            {/* Header Details */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{selectedJob.title}</h2>
                  <button
                    onClick={() => onUpdateJobStatus(selectedJob.id, selectedJob.status === 'Open' ? 'Filled' : 'Open')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      selectedJob.status === 'Open' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                  >
                    Mark as {selectedJob.status === 'Open' ? 'Filled' : 'Open'}
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Posted {new Date(selectedJob.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{selectedJob.type}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-mono">{selectedJob.salaryRange}</span>
                </div>
              </div>

              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors border border-slate-700"
              >
                <Send size={14} className="text-emerald-400" /> Send AI Interview Request
              </button>
            </div>

            {/* Candidates & Interviews List */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Interview Submissions & Candidates ({selectedJobRequests.length})
              </h3>

              {selectedJobRequests.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800/80 p-8 space-y-3">
                  <Users className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="font-bold text-slate-300 text-sm">No interviews sent for this position yet</h4>
                  <p className="text-slate-500 text-xs max-w-sm mx-auto">
                    Click "Send AI Interview Request" to invite candidates from the Talent Pool to take a 3-question Grok AI video interview.
                  </p>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="mt-2 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400"
                  >
                    Invite Candidate
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedJobRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <PixelAvatar config={req.candidateAvatar || { archetype: 'android', color: '#10b981' }} size={44} />
                        <div>
                          <h4 className="font-bold text-white text-sm">{req.candidateName}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {req.status}
                            </span>
                            <span>Sent {new Date(req.sentAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Grading Score breakdown */}
                      {req.grading ? (
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-xl font-black text-emerald-400">{req.grading.score}/100</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Grok AI Score</div>
                          </div>
                          <div className="max-w-xs text-xs text-slate-400 italic">
                            "{req.grading.feedbackSummary}"
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                          <Clock size={14} /> Waiting for candidate to complete interview
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* CREATE JOB MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Post New Job Position</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateJobSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={e => setSalaryRange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={e => setSkillsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Job brief..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition-colors mt-2"
              >
                Create Position
              </button>
            </form>
          </div>
        </div>
      )}

      {/* INVITE CANDIDATE MODAL */}
      {showInviteModal && selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Send Grok AI Video Interview</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <p className="text-xs text-slate-400">
              Select a candidate from the Talent Pool to dispatch an automated AI Video Interview for <strong>{selectedJob.title}</strong>.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase">Select Candidate</label>
              <select
                value={selectedCandidateId}
                onChange={e => setSelectedCandidateId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">-- Choose Candidate --</option>
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.role} · Score {c.hiringReadiness})</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDispatchInterview}
              disabled={!selectedCandidateId || isGeneratingQuestions}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors mt-4"
            >
              {isGeneratingQuestions ? <Sparkles className="animate-spin" size={16} /> : <Send size={16} />}
              {isGeneratingQuestions ? 'Generating Grok Questions...' : 'Dispatch Interview Request'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
