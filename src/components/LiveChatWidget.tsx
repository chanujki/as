import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Phone,
  User,
  ShieldCheck,
  CheckCheck,
  HelpCircle,
  Database,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LiveChatWidget: React.FC = () => {
  const {
    settings,
    language,
    chatMessages,
    sendChatMessage,
    isChatOpen,
    setIsChatOpen,
    chatSessionId,
    isFirestoreConnected,
    currentUser,
    openAuthModal
  } = useApp();

  const [inputMsg, setInputMsg] = useState('');
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('as_chat_name') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('as_chat_phone') || '');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Each logged-in customer has their own dedicated session ID tied to their account ID/Email
  const effectiveSessionId = currentUser
    ? `user_${currentUser.id || currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`
    : chatSessionId;

  // Filter messages strictly for this customer's account/session
  const mySessionMessages = chatMessages.filter(
    m => m.sessionId === effectiveSessionId ||
         (currentUser && m.userId && m.userId === currentUser.id) ||
         (currentUser && m.senderEmail && m.senderEmail.toLowerCase() === currentUser.email.toLowerCase())
  );

  // Auto-scroll to bottom
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mySessionMessages.length, isChatOpen]);

  const handleSend = async (e?: React.FormEvent, presetText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (presetText || inputMsg).trim();
    if (!textToSend || isSending) return;

    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    setIsSending(true);
    try {
      await sendChatMessage(
        textToSend,
        currentUser.name || customerName.trim() || 'সম্মানিত কাস্টমার',
        currentUser.phone || customerPhone.trim() || '',
        false,
        effectiveSessionId,
        currentUser.email,
        currentUser.id
      );
      if (!presetText) setInputMsg('');
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    'পণ্যটি স্টকে আছে কি না জানতে চাই',
    'ওয়ারেন্টি ও রিপ্লেসমেন্ট পলিসি কীভাবে কাজ করে?',
    'ঢাকার বাইরে ডেলিভারি পেতে কতদিন সময় লাগবে?',
    'অর্ডার ট্র্যাকিং সাহায্য প্রয়োজন'
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#168BFF] to-[#00D4FF] text-white font-semibold text-xs md:text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
          aria-label="Open Live Chat"
        >
          <MessageSquare className="w-5 h-5 text-white" />
          <span className="hidden sm:inline">লাইভ চ্যাট সাপোর্ট</span>
          <span className="sm:hidden font-bold">চ্যাট</span>
          
          {/* Status Dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </button>
      </div>

      {/* Live Chat Modal Drawer */}
      {isChatOpen && (
        <div className="fixed inset-x-2 bottom-20 md:inset-x-auto md:right-6 md:bottom-20 z-50 w-auto md:w-[390px] h-[520px] max-h-[82vh] bg-[#0A1124] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-200">
          
          {/* Chat Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-[#0B1A36] to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#168BFF]/40 to-[#00D4FF]/30 p-0.5 overflow-hidden flex items-center justify-center shadow-md shrink-0">
                <img
                  src={settings.logoUrl || 'https://i.imgur.com/OfCvr1N.jpeg'}
                  alt="AS Computer Logo"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    AS Computer সাপোর্ট
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    লাইভ
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Database className="w-2.5 h-2.5 text-[#00D4FF]" />
                  <span>ফায়ারবেস ফায়ারস্টোর ডেটাবেসে সংযুক্ত</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditingInfo(!isEditingInfo)}
                title="আপনার নাম/ফোন এডিট করুন"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <User className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* If Not Logged In, Show Required Login Screen */}
          {!currentUser ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#168BFF]/20 to-[#00D4FF]/20 border border-[#168BFF]/40 flex items-center justify-center text-[#00D4FF] shadow-xl">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h4 className="text-sm font-bold text-white">
                  {language === 'bn' ? 'লাইভ চ্যাট করতে লগইন করুন' : 'Sign In for Live Chat'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'bn'
                    ? 'আপনার অ্যাকাউন্টে লগইন করে সরাসরি অ্যাডমিন টিমের সাথে চ্যাট করুন। অ্যাডমিন আপনার অ্যাকাউন্টে আলাদাভাবে সরাসরি রিপ্লাই প্রদান করবেন।'
                    : 'Please log in to your account to start live chat. Our admin will directly reply to your personal account thread.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00D4FF] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#168BFF]/25 flex items-center gap-2 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'bn' ? 'লগইন / নতুন অ্যাকাউন্ট' : 'Sign In / Register'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Customer Account Indicator */}
              <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                  <span className="text-slate-300 truncate">
                    লগইন আছেন: <strong className="text-white">{currentUser.name}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
                  ভেরিফাইড আইডি
                </span>
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
                {/* Welcome Bot Bubble */}
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-[#00D4FF] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    AS
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-sm bg-slate-800/90 border border-slate-700/70 text-slate-200 space-y-1 shadow-sm">
                    <p className="font-semibold text-[#00D4FF] text-[11px]">
                      স্বাগতম, {currentUser.name}! ⚡
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      পণ্য, স্টক, ওয়ারেন্টি বা অর্ডার সংক্রান্ত যে কোনো প্রশ্ন এখানে লিখুন। অ্যাডমিন আপনার অ্যাকাউন্টে সরাসরি উত্তর পাঠাবেন।
                    </p>
                  </div>
                </div>

                {/* Quick Prompt Chips */}
                {mySessionMessages.length === 0 && (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] text-slate-400 font-medium">দ্রুত প্রশ্ন নির্বাচন করুন:</p>
                    <div className="flex flex-col gap-1.5">
                      {quickPrompts.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(undefined, q)}
                          className="text-left px-2.5 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-[11px] transition-colors flex items-center justify-between"
                        >
                          <span>{q}</span>
                          <Send className="w-3 h-3 text-slate-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Realtime Synced Messages from Firestore */}
                {mySessionMessages.map((msg) => {
                  const isMe = !msg.isAdmin;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-emerald-500/40">
                          AS
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-2.5 rounded-2xl text-xs space-y-1 ${
                          isMe
                            ? 'bg-gradient-to-r from-[#168BFF] to-[#00A3FF] text-white rounded-tr-sm shadow-md'
                            : 'bg-slate-800/90 border border-slate-700/70 text-slate-200 rounded-tl-sm shadow-sm'
                        }`}
                      >
                        {!isMe && (
                          <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>AS Computer অ্যাডমিন</span>
                          </p>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap text-[11.5px] break-words">
                          {msg.text}
                        </p>
                        <div className="flex items-center justify-end gap-1 text-[9px] opacity-75">
                          <span>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'এখনই'}
                          </span>
                          {isMe && <CheckCheck className="w-3 h-3 text-white/90" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Footer / Input Form */}
              <form
                onSubmit={(e) => handleSend(e)}
                className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="আপনার বার্তা এখানে লিখুন..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#168BFF] transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim() || isSending}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00D4FF] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
