import React, { useState, useEffect, useRef } from 'react';
import { AIInterviewRequest, InterviewAnswer, GradingResult } from '../types';
import { evaluateGrokInterviewAnswers } from '../services/grokService';
import { Video, Mic, CheckCircle2, AlertCircle, Loader2, Sparkles, Send, Play, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface AIInterviewModalProps {
  request: AIInterviewRequest;
  onComplete: (requestId: string, answers: InterviewAnswer[], grading: GradingResult) => void;
  onClose: () => void;
}

export const AIInterviewModal: React.FC<AIInterviewModalProps> = ({ request, onComplete, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [mode, setMode] = useState<'video' | 'text'>('video');
  const [userTextAnswer, setUserTextAnswer] = useState('');
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordedVideo, setHasRecordedVideo] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [finalReport, setFinalReport] = useState<GradingResult | null>(null);

  // Camera WebRTC Ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const currentQuestion = request.questions[currentQuestionIndex];

  // Initialize camera stream
  useEffect(() => {
    let active = true;

    async function setupCamera() {
      if (mode !== 'video') return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (active && videoRef.current) {
          videoRef.current.srcObject = stream;
          mediaStreamRef.current = stream;
        }
      } catch (err) {
        console.warn('Camera access not granted or unavailable, switching to text mode:', err);
        if (active) setMode('text');
      }
    }

    setupCamera();

    return () => {
      active = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode]);

  // Recording Timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setHasRecordedVideo(true);
      if (!userTextAnswer.trim()) {
        setUserTextAnswer(`[Video Answer Recorded - Duration: ${recordingSeconds}s] Candidate answered Question ${currentQuestionIndex + 1} on video webcam.`);
      }
    } else {
      setIsRecording(true);
      setHasRecordedVideo(false);
    }
  };

  const handleNextQuestion = () => {
    const finalAnswerText = userTextAnswer.trim();

    const currentAnswer: InterviewAnswer = {
      questionId: currentQuestion.id,
      transcript: finalAnswerText ? finalAnswerText : 'NO_RESPONSE',
      mode
    };

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setUserTextAnswer('');
    setHasRecordedVideo(false);

    if (currentQuestionIndex + 1 < request.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Final question submitted - trigger Grok AI grading
      finishInterview(newAnswers);
    }
  };

  const finishInterview = async (allAnswers: InterviewAnswer[]) => {
    setIsSubmittingAll(true);
    try {
      const grading = await evaluateGrokInterviewAnswers(
        request.jobTitle,
        request.questions,
        allAnswers
      );
      setFinalReport(grading);
      onComplete(request.id, allAnswers, grading);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingAll(false);
    }
  };

  // 1. FINAL EVALUATION REPORT STATE
  if (finalReport) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-8 text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles size={140} className="text-emerald-500" />
          </div>

          <div className="relative z-10">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 ${
              finalReport.score > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <span className="text-3xl font-black">{finalReport.score}</span>
            </div>

            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
              finalReport.score > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {finalReport.score > 0 ? 'Grok AI Evaluation Complete' : 'Unanswered Interview'}
            </span>

            <h2 className="text-2xl font-black text-white mt-3 mb-2">{request.jobTitle} AI Interview</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">{finalReport.feedbackSummary}</p>

            <div className="space-y-4 text-left mb-8 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              {/* RAG Category Breakdown */}
              {finalReport.categoryBreakdown && finalReport.categoryBreakdown.length > 0 && (
                <div className="space-y-2 pb-3 border-b border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider">RAG Rubric Breakdown</span>
                    {finalReport.ragBenchmarkMatch && (
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                        {finalReport.ragBenchmarkMatch}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {finalReport.categoryBreakdown.map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300 font-medium">{cat.category} ({(cat.weight * 100).toFixed(0)}%)</span>
                          <span className="font-bold text-emerald-400 font-mono">{cat.score}/100</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${cat.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-1">Key Observations</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {finalReport.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">Areas for Growth</span>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  {finalReport.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-emerald-500 text-slate-950 font-bold py-3.5 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Done & Return to Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. SUBMITTING ALL STATE
  if (isSubmittingAll) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white mb-1">Evaluating Video & Technical Answers</h3>
        <p className="text-slate-400 text-sm">Grok AI is analyzing response clarity, domain depth, and problem solving...</p>
      </div>
    );
  }

  // 3. INTERVIEW IN-PROGRESS MODAL
  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 uppercase">
                Grok AI Video Interview
              </span>
              <span className="text-xs text-slate-400">
                Question {currentQuestionIndex + 1} of {request.questions.length}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{request.jobTitle} — {request.companyName}</h3>
          </div>

          <button onClick={onClose} className="text-slate-500 hover:text-white p-2">
            <X size={20} />
          </button>
        </div>

        {/* Question Area */}
        <div className="p-6 bg-slate-900/60 border-b border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-2">
            <span>Category: {currentQuestion.category}</span>
            <span>Est. Time: {currentQuestion.recommendedDurationSeconds}s</span>
          </div>
          <p className="text-lg font-medium text-slate-100 leading-snug">
            "{currentQuestion.question}"
          </p>
        </div>

        {/* Media / Input View Area */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          
          {/* Mode Selector */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Response Mode</span>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  mode === 'video' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Video size={14} /> Video Webcam
              </button>
              <button
                onClick={() => setMode('text')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  mode === 'text' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Text Response
              </button>
            </div>
          </div>

          {/* Video Preview Canvas */}
          {mode === 'video' && (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 h-64 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Overlay Recording Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-emerald-500 text-slate-950 hover:scale-105'
                  }`}
                >
                  {isRecording ? <Mic size={20} /> : <Video size={20} />}
                </button>

                <span className="text-xs font-mono font-bold text-white">
                  {isRecording ? `REC 00:${recordingSeconds.toString().padStart(2, '0')}` : 'Click icon to Record'}
                </span>
              </div>
            </div>
          )}

          {/* Response Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">
              {mode === 'video' ? 'Video Transcript / Notes' : 'Your Answer'}
            </label>
            <textarea
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 font-sans focus:outline-none focus:border-emerald-500 resize-none text-sm"
              placeholder={mode === 'video' ? 'Click the record icon above to record video, or type notes here...' : 'Type your detailed technical/behavioral answer here...'}
              value={userTextAnswer}
              onChange={(e) => setUserTextAnswer(e.target.value)}
            />
            {!userTextAnswer.trim() && !hasRecordedVideo && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1">
                <AlertCircle size={12} /> Note: Submitting without an answer will result in a 0 score.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Powered by Grok AI Evaluator
          </div>

          <button
            onClick={handleNextQuestion}
            disabled={isRecording}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            {currentQuestionIndex + 1 < request.questions.length ? 'Next Question' : 'Submit & Complete Interview'}
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
