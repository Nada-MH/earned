import React, { useState, useRef, useEffect } from 'react';
import { AIInterviewRequest, DirectMessage, UserProfile, CompanyProfile, InterviewAnswer, GradingResult } from '../types';
import { AIInterviewModal } from './AIInterviewModal';
import { PixelAvatar } from './ui/PixelAvatar';
import { Mail, Video, Send, CheckCircle2, Clock, Sparkles, MessageSquare, AlertCircle, Plus, X, ArrowLeft, ChevronRight } from 'lucide-react';

interface MessagesViewProps {
  user?: UserProfile;
  companyUser?: CompanyProfile;
  interviewRequests: AIInterviewRequest[];
  messages: DirectMessage[];
  onCompleteInterview: (requestId: string, answers: InterviewAnswer[], grading: GradingResult) => void;
  onSendMessage: (msg: DirectMessage) => void;
}

interface ChatThread {
  partnerId: string;
  partnerName: string;
  partnerRole: 'talent' | 'recruiter';
  messages: DirectMessage[];
  lastMessage: DirectMessage;
  unreadCount: number;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  user,
  companyUser,
  interviewRequests,
  messages,
  onCompleteInterview,
  onSendMessage
}) => {
  const [activeTab, setActiveTab] = useState<'invites' | 'messages'>('messages');
  const [activeInterviewModalReq, setActiveInterviewModalReq] = useState<AIInterviewRequest | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isTalent = !!user && !companyUser;
  const myId = isTalent ? (user?.id || 'demo-talent') : (companyUser?.id || 'company-demo');

  // Group messages into chat threads by conversation partner
  const threads: ChatThread[] = React.useMemo(() => {
    const threadMap = new Map<string, DirectMessage[]>();

    messages.forEach(msg => {
      const partnerId = msg.senderId === myId ? msg.receiverId : msg.senderId;
      const partnerKey = msg.subject?.startsWith('Re:')
        ? msg.subject.replace(/^Re:\s*/, '')
        : msg.subject;
      // Group by partnerId + base subject to create conversation threads
      const threadKey = `${partnerId}__${partnerKey}`;
      if (!threadMap.has(threadKey)) threadMap.set(threadKey, []);
      threadMap.get(threadKey)!.push(msg);
    });

    return Array.from(threadMap.entries()).map(([key, msgs]) => {
      const sorted = msgs.sort((a, b) => a.timestamp - b.timestamp);
      const lastMsg = sorted[sorted.length - 1];
      const partnerId = key.split('__')[0];
      const partnerMsg = sorted.find(m => m.senderId !== myId) || sorted[0];
      return {
        partnerId,
        partnerName: partnerMsg.senderId === myId ? partnerMsg.senderName : partnerMsg.senderName,
        partnerRole: partnerMsg.senderRole,
        messages: sorted,
        lastMessage: lastMsg,
        unreadCount: sorted.filter(m => !m.isRead && m.senderId !== myId).length
      };
    }).sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
  }, [messages, myId]);

  const activeThread = threads.find(t => t.partnerId + '__' + (t.messages[0]?.subject?.replace(/^Re:\s*/, '') || '') === activeThreadId)
    || (activeThreadId ? threads[0] : null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread?.messages.length]);

  // Auto-select first thread on desktop
  useEffect(() => {
    if (!activeThreadId && threads.length > 0) {
      const t = threads[0];
      setActiveThreadId(t.partnerId + '__' + (t.messages[0]?.subject?.replace(/^Re:\s*/, '') || ''));
    }
  }, [threads.length]);

  const relevantRequests = isTalent
    ? interviewRequests.filter(r => r.candidateId === (user?.id || 'demo-talent'))
    : interviewRequests.filter(r => r.companyId === (companyUser?.id || 'company-demo'));

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThread) return;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: myId,
      senderName: isTalent ? (user?.name || 'Talent') : (companyUser?.recruiterName || companyUser?.companyName || 'Recruiter'),
      senderRole: isTalent ? 'talent' : 'recruiter',
      receiverId: activeThread.partnerId,
      subject: activeThread.messages[0]?.subject?.replace(/^Re:\s*/, '') || 'Chat',
      body: newMessage.trim(),
      timestamp: Date.now(),
      isRead: false
    };

    onSendMessage(newMsg);
    setNewMessage('');
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatChatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateSeparator = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Check if we need a date separator between two messages
  const needsDateSep = (prev: DirectMessage | null, curr: DirectMessage) => {
    if (!prev) return true;
    const pDay = new Date(prev.timestamp).toDateString();
    const cDay = new Date(curr.timestamp).toDateString();
    return pDay !== cDay;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 pb-24">

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
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Mail className="text-emerald-500" /> Mailbox & AI Interviews
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isTalent
            ? 'Chat with recruiters and complete Grok AI Video Interviews.'
            : 'Manage candidate conversations and track AI interview results.'}
        </p>
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
          AI Interviews ({relevantRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'messages' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <MessageSquare size={14} className="text-blue-400" />
          Chats ({threads.length})
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
                      Company: <strong className="text-slate-200">{req.companyName}</strong> · {req.questions?.length || 3} Grok AI Questions
                    </p>
                  </div>
                </div>

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

      {/* 2. CHAT THREADS TAB */}
      {activeTab === 'messages' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl" style={{ height: '520px' }}>
          <div className="flex h-full">

            {/* Left: Conversation List */}
            <div className={`${activeThread ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-slate-800 bg-slate-900`}>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">Conversations</h3>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{threads.length} chats</span>
              </div>

              <div className="flex-1 overflow-y-auto">
                {threads.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs">No conversations yet</p>
                  </div>
                ) : (
                  threads.map((thread) => {
                    const threadKey = thread.partnerId + '__' + (thread.messages[0]?.subject?.replace(/^Re:\s*/, '') || '');
                    const isActive = activeThreadId === threadKey;
                    return (
                      <button
                        key={threadKey}
                        onClick={() => setActiveThreadId(threadKey)}
                        className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-all border-b border-slate-800/50 ${
                          isActive
                            ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500'
                            : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                          {thread.partnerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white text-xs truncate">{thread.partnerName}</span>
                            <span className="text-[10px] text-slate-500 shrink-0 ml-2">{formatTime(thread.lastMessage.timestamp)}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{thread.lastMessage.body}</p>
                        </div>
                        {thread.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-emerald-500 rounded-full text-[10px] font-bold text-slate-950 flex items-center justify-center shrink-0">
                            {thread.unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Chat Area */}
            <div className={`${activeThread ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-slate-950/50`}>
              {activeThread ? (
                <>
                  {/* Chat Header */}
                  <div className="px-5 py-3.5 border-b border-slate-800 flex items-center gap-3 bg-slate-900/80">
                    <button
                      onClick={() => setActiveThreadId(null)}
                      className="md:hidden text-slate-400 hover:text-white"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      {activeThread.partnerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{activeThread.partnerName}</h4>
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase">{activeThread.partnerRole === 'recruiter' ? '● Online' : '● Active'}</span>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                    {activeThread.messages.map((msg, idx) => {
                      const isMe = msg.senderId === myId;
                      const prev = idx > 0 ? activeThread.messages[idx - 1] : null;
                      const showDateSep = needsDateSep(prev, msg);
                      const showAvatar = !prev || prev.senderId !== msg.senderId || showDateSep;

                      return (
                        <React.Fragment key={msg.id}>
                          {/* Date separator */}
                          {showDateSep && (
                            <div className="flex items-center justify-center py-3">
                              <span className="text-[10px] text-slate-500 bg-slate-800/80 px-3 py-1 rounded-full font-medium">
                                {formatDateSeparator(msg.timestamp)}
                              </span>
                            </div>
                          )}

                          {/* Chat bubble */}
                          <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}>
                            <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                              {/* Sender name (only for first in group) */}
                              {showAvatar && !isMe && (
                                <span className="text-[10px] text-slate-500 font-semibold ml-1 mb-1 block">
                                  {msg.senderName}
                                </span>
                              )}

                              <div
                                className={`px-4 py-2.5 text-[13px] leading-relaxed ${
                                  isMe
                                    ? 'bg-emerald-500 text-slate-950 rounded-2xl rounded-br-md'
                                    : 'bg-slate-800 text-slate-200 rounded-2xl rounded-bl-md border border-slate-700/50'
                                }`}
                              >
                                {msg.body}
                              </div>

                              <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[9px] text-slate-600">{formatChatTime(msg.timestamp)}</span>
                                {isMe && (
                                  <CheckCircle2 size={10} className="text-emerald-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendChat} className="px-4 py-3 border-t border-slate-800 bg-slate-900/80">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="w-10 h-10 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 rounded-full flex items-center justify-center transition-colors shrink-0"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <MessageSquare className="w-12 h-12 text-slate-700 mx-auto" />
                    <h3 className="font-bold text-slate-500 text-sm">Select a conversation</h3>
                    <p className="text-slate-600 text-xs">Choose a chat from the left to start messaging</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

