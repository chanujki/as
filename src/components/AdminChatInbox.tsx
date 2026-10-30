import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Phone,
  Clock,
  CheckCheck,
  ShieldCheck,
  Database,
  Sparkles,
  Search,
  Mail,
  ShoppingBag,
  BadgeCheck,
  Maximize2,
  Minimize2,
  ArrowLeft,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';

export const AdminChatInbox: React.FC = () => {
  const { chatMessages, sendChatMessage, language, showToast, orders } = useApp();
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Group messages by session and customer account
  const sessions = useMemo(() => {
    const map = new Map<string, {
      sessionId: string;
      customerName: string;
      customerEmail?: string;
      customerPhone?: string;
      userId?: string;
      lastMessage: string;
      lastTimestamp: number;
      messages: ChatMessage[];
      unreadCount: number;
    }>();

    chatMessages.forEach(msg => {
      const sId = msg.sessionId || 'guest_general';
      const existing = map.get(sId);
      const isCustomer = !msg.isAdmin;

      if (!existing) {
        map.set(sId, {
          sessionId: sId,
          customerName: isCustomer && msg.senderName ? msg.senderName : 'সম্মানিত কাস্টমার',
          customerEmail: msg.senderEmail || undefined,
          customerPhone: msg.senderPhone || undefined,
          userId: msg.userId || undefined,
          lastMessage: msg.text,
          lastTimestamp: msg.timestamp || (msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now()),
          messages: [msg],
          unreadCount: isCustomer ? 1 : 0
        });
      } else {
        existing.messages.push(msg);
        existing.lastMessage = msg.text;
        const msgTime = msg.timestamp || (msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now());
        if (msgTime > existing.lastTimestamp) {
          existing.lastTimestamp = msgTime;
        }
        if (isCustomer && msg.senderName && (existing.customerName === 'সম্মানিত কাস্টমার' || !existing.customerName)) {
          existing.customerName = msg.senderName;
        }
        if (msg.senderEmail && !existing.customerEmail) {
          existing.customerEmail = msg.senderEmail;
        }
        if (msg.senderPhone && !existing.customerPhone) {
          existing.customerPhone = msg.senderPhone;
        }
        if (msg.userId && !existing.userId) {
          existing.userId = msg.userId;
        }
      }
    });

    const list = Array.from(map.values());
    list.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
    return list;
  }, [chatMessages]);

  // Default select first session if none selected
  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0].sessionId);
    }
  }, [sessions, selectedSessionId]);

  const activeSession = sessions.find(s => s.sessionId === selectedSessionId) || sessions[0];

  // Active messages sorted by timestamp ascending
  const activeMessages = useMemo(() => {
    if (!activeSession) return [];
    return [...activeSession.messages].sort((a, b) => {
      const timeA = a.timestamp || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const timeB = b.timestamp || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return timeA - timeB;
    });
  }, [activeSession]);

  // Scroll to bottom when message or session changes
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSessionId, activeMessages.length, mobileView]);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setMobileView('chat');
  };

  const handleSendReply = async (e?: React.FormEvent, presetReply?: string) => {
    if (e) e.preventDefault();
    const textToSend = (presetReply || replyText).trim();
    if (!textToSend || !activeSession || isSending) return;

    setIsSending(true);
    try {
      await sendChatMessage(
        textToSend,
        'AS Computer অ্যাডমিন',
        '01723-373133',
        true,
        activeSession.sessionId,
        activeSession.customerEmail,
        activeSession.userId
      );
      if (!presetReply) {
        setReplyText('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      }
      showToast('উত্তর সফলভাবে পাঠানো হয়েছে!', 'success');
    } catch (err) {
      console.error(err);
      showToast('বার্তা পাঠাতে ত্রুটি হয়েছে, পুনরায় চেষ্টা করুন', 'warning');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const quickCannedReplies = [
    'আসসালামু আলাইকুম, জি এই পণ্যটি আমাদের বানেশ্বর শপে রেডি স্টকে আছে। অর্ডার করলে দ্রুত পৌঁছে দেওয়া যাবে।',
    'আমাদের এই প্রোডাক্টে ১ বছরের অফিশিয়াল ওয়ারেন্টি ও ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি অন্তর্ভুক্ত রয়েছে।',
    'ঢাকার ভিতরে ডেলিভারি চার্জ ৬০ টাকা (১-২ দিন) এবং ঢাকার বাইরে বা রাজশাহীতে ১২০ টাকা (২-৩ দিন)।',
    'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। কুরিয়ার ট্র্যাকিং নম্বর সহ দ্রুত আপডেট দেওয়া হবে।',
    'যেকোনো জরুরি প্রয়োজনে আমাদের হটলাইনে সরাসরি কল করতে পারেন: ০১৭২৩-৩৭৩১-৩৩।'
  ];

  const filteredSessions = sessions.filter(s => {
    const term = searchFilter.toLowerCase();
    return s.customerName.toLowerCase().includes(term) ||
           (s.customerEmail && s.customerEmail.toLowerCase().includes(term)) ||
           (s.customerPhone && s.customerPhone.includes(term)) ||
           s.lastMessage.toLowerCase().includes(term);
  });

  const activeCustomerOrders = useMemo(() => {
    if (!activeSession) return [];
    return orders.filter(
      o => (activeSession.customerEmail && o.userEmail?.toLowerCase() === activeSession.customerEmail.toLowerCase()) ||
           (activeSession.customerPhone && o.shipping?.phone === activeSession.customerPhone)
    );
  }, [activeSession, orders]);

  const cleanWhatsAppNumber = activeSession?.customerPhone?.replace(/[^0-9]/g, '') || '';
  const formattedWhatsApp = cleanWhatsAppNumber.startsWith('88') ? cleanWhatsAppNumber : `88${cleanWhatsAppNumber}`;

  return (
    <div className={`space-y-4 ${isExpanded ? 'fixed inset-2 md:inset-5 z-50 bg-[#050B18]/95 backdrop-blur-2xl p-4 md:p-6 rounded-3xl border border-[#168BFF]/40 shadow-[0_0_80px_rgba(22,139,255,0.25)] flex flex-col overflow-hidden' : ''}`}>
      
      {/* Header Info Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#08172B] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                লাইভ চ্যাট ইনবক্স (Firebase Firestore Live Inbox)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ক্লাউড লাইভ সিঙ্ক
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              কাস্টমার যা বলছেন তা দেখতে যেকোনো নামের উপর ক্লিক করুন। আপনি এখান থেকেই বিস্তারিত উত্তর দিতে পারবেন।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-xs text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
            মোট কাস্টমার: <strong className="text-[#00D4FF] font-mono font-bold text-sm">{sessions.length}</strong> · মোট মেসেজ: <strong className="text-emerald-400 font-mono font-bold text-sm">{chatMessages.length}</strong>
          </div>

          {/* Expand / Maximize Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors shadow-sm"
            title={isExpanded ? 'ছোট ভিউতে ফিরুন' : 'বড় পর্দায় বিস্তারিত দেখুন'}
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">ছোট ভিউ</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-[#00D4FF]" />
                <span className="hidden sm:inline">বড় পর্দা (Maximize)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Inbox 2-Column Grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 ${isExpanded ? 'flex-1 overflow-hidden' : 'h-[720px] max-h-[85vh]'}`}>
        
        {/* Left Column: Sessions List (4 cols) */}
        <div className={`lg:col-span-4 bg-[#08172B] border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-lg ${mobileView === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-3.5 border-b border-slate-800 space-y-2.5 bg-slate-900/70">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                <span>কাস্টমার তালিকা</span>
                <span className="px-2 py-0.5 rounded-full bg-[#168BFF]/20 text-[#00D4FF] text-xs font-mono font-bold">
                  {filteredSessions.length}
                </span>
              </span>
              <span className="text-[11px] text-slate-400">ক্লিক করে চ্যাট খুলুন</span>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="নাম, ফোন বা বার্তা দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#168BFF]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-1.5 space-y-1">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs sm:text-sm space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <p className="font-semibold text-slate-300">এখনও কোনো চ্যাট বার্তা আসেনি।</p>
                <p className="text-xs text-slate-500">
                  ওয়েবসাইটে কাস্টমার কোনো মেসেজ পাঠালে সাথে সাথে এখানে ভেসে উঠবে।
                </p>
              </div>
            ) : (
              filteredSessions.map((sess, idx) => {
                const isSelected = sess.sessionId === selectedSessionId;
                const customerOrdersCount = orders.filter(
                  o => (sess.customerEmail && o.userEmail?.toLowerCase() === sess.customerEmail.toLowerCase()) ||
                       (sess.customerPhone && o.shipping?.phone === sess.customerPhone)
                ).length;

                return (
                  <button
                    key={sess.sessionId}
                    onClick={() => handleSelectSession(sess.sessionId)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 hover:bg-slate-800/80 active:scale-[0.99] ${
                      isSelected
                        ? 'bg-gradient-to-r from-slate-800 to-slate-800/80 border-2 border-[#168BFF] shadow-lg shadow-[#168BFF]/10'
                        : 'border border-transparent'
                    }`}
                  >
                    {/* Serial Number & Avatar */}
                    <div className="relative shrink-0 mt-0.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow ${
                        isSelected
                          ? 'bg-[#168BFF] text-white shadow-[#168BFF]/40'
                          : 'bg-slate-800 text-[#00D4FF] border border-slate-700'
                      }`}>
                        {sess.customerName.charAt(0) || 'U'}
                      </div>
                      <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.2 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-mono font-bold text-amber-400 shadow">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                          <span>{sess.customerName}</span>
                          {customerOrdersCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 shrink-0">
                              {customerOrdersCount} অর্ডার
                            </span>
                          )}
                        </h4>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap font-mono">
                          {new Date(sess.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {sess.customerPhone && (
                        <p className="text-xs text-emerald-400 font-mono flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{sess.customerPhone}</span>
                        </p>
                      )}

                      {sess.customerEmail && (
                        <p className="text-xs text-slate-300 font-mono truncate flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-[#00D4FF] shrink-0" />
                          <span className="truncate">{sess.customerEmail}</span>
                        </p>
                      )}

                      <p className="text-xs text-slate-400 truncate mt-1.5 line-clamp-1 bg-slate-900/50 p-1.5 rounded-lg border border-slate-800/80">
                        {sess.lastMessage}
                      </p>
                    </div>

                    <ChevronRight className={`w-4 h-4 self-center shrink-0 text-slate-500 ${isSelected ? 'text-[#00D4FF]' : ''}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Conversation Thread (8 cols) */}
        <div className={`lg:col-span-8 bg-[#08172B] border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>
          {activeSession ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  {/* Back to list on mobile */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>তালিকা</span>
                  </button>

                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#168BFF]/30 to-[#00D4FF]/30 text-[#00D4FF] border border-[#168BFF]/50 flex items-center justify-center font-extrabold text-lg shadow-lg">
                    {activeSession.customerName.charAt(0) || 'C'}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-extrabold text-white">
                        {activeSession.customerName}
                      </h3>
                      {activeCustomerOrders.length > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40 flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          <span>{activeCustomerOrders.length}টি অর্ডার সম্পন্ন</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-slate-300">
                      {activeSession.customerPhone && (
                        <span className="font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                          <Phone className="w-3 h-3" />
                          <span>{activeSession.customerPhone}</span>
                        </span>
                      )}
                      {activeSession.customerEmail && (
                        <span className="font-mono text-slate-300 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#00D4FF]" />
                          <span>{activeSession.customerEmail}</span>
                        </span>
                      )}
                      <span className="text-slate-400 font-mono text-[11px]">
                        মোট {activeMessages.length} টি বার্তা
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons for this customer */}
                <div className="flex items-center gap-2">
                  {activeSession.customerPhone && (
                    <>
                      <a
                        href={`tel:${activeSession.customerPhone}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        title="কাস্টমারকে সরাসরি কল দিন"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">সরাসরি কল</span>
                      </a>

                      <a
                        href={`https://wa.me/${formattedWhatsApp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        title="হোয়াটসঅ্যাপে চ্যাট করুন"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-teal-400" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    </>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/80">
                    <Database className="w-3.5 h-3.5 text-[#00D4FF]" />
                    <span className="hidden md:inline">Firestore Live</span>
                  </div>
                </div>
              </div>

              {/* Message Thread (Enlarged, Clear, High-Contrast) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#050C1B]">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                    <MessageSquare className="w-12 h-12 opacity-20 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-300">এই সেশনে এখনও কোনো বার্তা নেই</p>
                    <p className="text-xs text-slate-500">নিচের বক্সে লিখে কাস্টমারকে সরাসরি বার্তা পাঠান</p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isAdmin = msg.isAdmin;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-3 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* Customer Avatar on left */}
                        {!isAdmin && (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#168BFF]/30 to-[#00D4FF]/30 text-[#00D4FF] border border-[#168BFF]/40 flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-md">
                            {msg.senderName.charAt(0) || 'C'}
                          </div>
                        )}

                        <div
                          className={`max-w-[88%] sm:max-w-[78%] p-4 rounded-2xl space-y-2 shadow-lg transition-all ${
                            isAdmin
                              ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-tr-sm border border-emerald-400/30'
                              : 'bg-[#0E1A30] border-2 border-[#168BFF]/30 text-slate-100 rounded-tl-sm shadow-cyan-950/40'
                          }`}
                        >
                          {/* Sender Info Bar */}
                          <div className="flex items-center justify-between gap-4 text-xs opacity-90 pb-1.5 border-b border-white/10">
                            <div className="flex items-center gap-1.5 font-bold">
                              {isAdmin ? (
                                <>
                                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                                  <span className="text-emerald-100">আপনি (AS Computer অ্যাডমিন)</span>
                                </>
                              ) : (
                                <>
                                  <User className="w-4 h-4 text-[#00D4FF]" />
                                  <span className="text-[#00D4FF] font-semibold">{msg.senderName || 'কাস্টমার'}</span>
                                  {msg.senderPhone && (
                                    <span className="text-[11px] text-emerald-400 font-mono font-normal">
                                      ({msg.senderPhone})
                                    </span>
                                  )}
                                </>
                              )}
                            </div>

                            <span className="text-[11px] font-mono text-slate-300 whitespace-nowrap">
                              {msg.createdAt
                                ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : ''}
                            </span>
                          </div>

                          {/* Message Content (Big & Readable) */}
                          <p className="leading-relaxed whitespace-pre-wrap text-sm sm:text-base font-normal tracking-wide">
                            {msg.text}
                          </p>

                          {/* Delivery status */}
                          {isAdmin && (
                            <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200 pt-0.5">
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>কাস্টমারের কাছে পাঠানো হয়েছে</span>
                            </div>
                          )}
                        </div>

                        {/* Admin Avatar on right */}
                        {isAdmin && (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-md">
                            AS
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={chatScrollRef} />
              </div>

              {/* Quick Canned Preset Buttons */}
              <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
                <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#00D4FF]" />
                  <span>দ্রুত উত্তর:</span>
                </span>
                {quickCannedReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendReply(undefined, reply)}
                    disabled={isSending}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700/80 whitespace-nowrap transition-all shadow-sm"
                  >
                    {reply.substring(0, 36)}...
                  </button>
                ))}
              </div>

              {/* Reply Form (Spacious Auto-grow Textarea + Big Send Button) */}
              <form onSubmit={handleSendReply} className="p-3.5 sm:p-4 bg-slate-900/95 border-t border-slate-800 flex items-end gap-3 shrink-0">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="কাস্টমারকে বিস্তারিতভাবে উত্তর লিখুন... (Enter চাপলে পাঠানো হবে, Shift+Enter এ নতুন লাইন)"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none transition-all leading-relaxed"
                  />
                  <div className="absolute right-3 bottom-2 text-[10px] text-slate-500 font-mono hidden sm:block">
                    Enter = Send · Shift+Enter = Line
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'পাঠানো হচ্ছে...' : 'উত্তর দিন'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <MessageSquare className="w-14 h-14 opacity-20 text-slate-400" />
              <h3 className="text-base font-bold text-white">কোনো বার্তা নির্বাচন করা হয়নি</h3>
              <p className="text-xs sm:text-sm max-w-sm">
                বাম পাশের কাস্টমার তালিকা থেকে যেকোনো নামের উপর চাপ দিন, তাহলে তার সব মেসেজ এখানে বড় আকারে দেখতে পাবেন এবং উত্তর দিতে পারবেন।
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
