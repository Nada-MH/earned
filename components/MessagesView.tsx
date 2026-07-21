import React, { useState } from 'react';
import { AIInterviewRequest, DirectMessage, UserProfile, CompanyProfile, InterviewAnswer, GradingResult } from '../types';
import { AIInterviewModal } from './AIInterviewModal';
import { PixelAvatar } from './ui/PixelAvatar';
import { Mail, Video, Send, CheckCircle2, Clock, Sparkles, MessageSquare, AlertCircle, Plus, X } from 'lucide-react';

interface MessagesViewProps {
  user?: UserProfile;
  companyUser?: CompanyProfile;
  interviewRequests: AIInterviewRequest[];
  messages: DirectMessage[];
  onCompleteInterview: (requestId: string, answers: InterviewAnswer[], grading: GradingResult) => void;
  onSendMessage: (msg: DirectMessage) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  user,
  companyUser,
  interviewRequests,
  messages,
  onCompleteInterview,
  onSendMessage
}) => {
  const [activeTab, setActiveTab] = useState<'invites' | 'messages'>('invites');
  const [activeInterviewModalReq, setActiveInterviewModalReq] = useState<AIInterviewRequest | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);

  // Compose Message state
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const isTalent = !!user && !companyUser;

  // Filter requests relevant to current logged in entity
  const relevantRequests = isTalent
    ? interviewRequests.filter(r => r.candidateId === (user?.id || 'demo-talent'))
    : interviewRequests.filter(r => r.companyId === (companyUser?.id || 'company-demo'));

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: isTalent ? (user?.id || 'talent') : (companyUser?.id || 'company'),
      senderName: isTalent ? (user?.name || 'Talent') : (companyUser?.companyName || 'Recruiter'),
      senderRole: isTalent ? 'talent' : 'recruiter',
      receiverId: 'partner',
      subject: subject.trim(),
      body: body.trim(),
      timestamp: Date.now(),
      isRead: false
    };

    onSendMessage(newMsg);
    setShowComposeModal(false);
    setSubject('');
    setBody('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pb-24">
      
      {/* Active AI Interview Modal Overlay */}
      {activeInterviewModalReq && (
        <AIInterviewModal
          request={activeInterviewModalReq}
          onComplete={(reqId, answers, grading) => {
            onCompleteInterview(reqId, answers, grading);
            setActiveInterviewModalReq(null);
          }}
          onClose={() => setActiveInterviewModalReq(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Mail className="text-emerald-500" /> Mailbox & AI Interviews
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isTalent 
              ? 'Receive recruiter invitations, complete Grok AI Video Interviews, and chat directly with hiring teams.'
              : 'Track sent AI interview requests and direct messages with candidates.'}
          </p>
        </div>

        <button
          onClick={() => setShowComposeModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus size={16} /> New Message
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('invites')}
          className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'invites' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Video size={14} className="text-emerald-400" />
          AI Video Interviews ({relevantRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'messages' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <MessageSquare size={14} className="text-blue-400" />
          Direct Messages ({messages.length})
        </button>
      </div>

      {/* 1. AI INTERVIEW REQUESTS TAB */}
      {activeTab === 'invites' && (
        <div className="space-y-4">
          {relevantRequests.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8 space-y-3">
              <Sparkles className="w-12 h-12 text-emerald-500/40 mx-auto" />
              <h3 className="font-bold text-white text-base">No AI Interview Invites Yet</h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                {isTalent 
                  ? 'When recruiters view your verified skill tree and readiness score, their AI Interview requests will appear here.'
                  : 'Send AI Interview requests from your Jobs page or Talent Pool to see responses here.'}
              </p>
            </div>
          ) : (
            relevantRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg hover:border-slate-700 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 shrink-0">
                    <Video size={28} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {req.status === 'Completed' ? 'Interview Completed' : 'Pending Action'}
                      </span>
                      <span className="text-xs text-slate-500">Sent {new Date(req.sentAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{req.jobTitle}</h3>
                    <p className="text-xs text-slate-400">
                      Company: <strong className="text-slate-200">{req.companyName}</strong> · 3 Grok AI Questions
                    </p>
                  </div>
                </div>

                {/* Right Side Actions */}
                <div className="shrink-0 w-full md:w-auto">
                  {req.status === 'Pending' && isTalent ? (
                    <button
                      onClick={() => setActiveInterviewModalReq(req)}
                      className="w-full md:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <Video size={16} /> Start AI Video Interview
                    </button>
                  ) : req.status === 'Completed' ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-400">{req.grading?.score || 90}/100</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Grok AI Score</div>
                      </div>
                      <button
                        onClick={() => setActiveInterviewModalReq(req)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors border border-slate-700"
                      >
                        Review Score
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                      <Clock size={14} /> Pending candidate completion
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. DIRECT MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8 space-y-3">
              <MessageSquare className="w-12 h-12 text-blue-500/40 mx-auto" />
              <h3 className="font-bold text-white text-base">No Direct Messages Yet</h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                Communicate directly with recruiters or talent candidates regarding open roles.
              </p>
              <button
                onClick={() => setShowComposeModal(true)}
                className="mt-2 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400"
              >
                Send Message
              </button>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      {msg.senderName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{msg.senderName}</h4>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">{msg.senderRole}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(msg.timestamp).toLocaleDateString()}</span>
                </div>

                <div className="pl-13 space-y-1">
                  <h5 className="font-bold text-slate-200 text-sm">{msg.subject}</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">{msg.body}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* COMPOSE MESSAGE MODAL */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">New Direct Message</h3>
              <button onClick={() => setShowComposeModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleSendSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regarding Senior Engineer position"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Message Body</label>
                <textarea
                  required
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Type your message here..."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm flex justify-center items-center gap-2 transition-colors mt-2"
              >
                <Send size={16} /> Send Message
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
