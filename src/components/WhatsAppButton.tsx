import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WhatsAppButton: React.FC = () => {
  const { settings, language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const cleanNumber = settings.supportWhatsApp.replace(/[^0-9]/g, '');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = customMsg.trim() || 'Hello AS Computer team, I have an inquiry about computer accessories.';
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
    setIsOpen(false);
    setCustomMsg('');
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-40">
      {/* Popover Chat Prompt */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-80 bg-[#08172B] border border-slate-700 rounded-2xl shadow-2xl p-4 space-y-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                AS
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">AS Computer Live Support</h4>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online · Support Desk</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300">
            {language === 'bn'
              ? 'আসসালামু আলাইকুম! কোনো পণ্য বা ওয়ারেন্টি সংক্রান্ত তথ্য জানতে আমাদের হোয়াটসঅ্যাপে মেসেজ দিন।'
              : 'Assalamu Alaikum! Have any questions regarding products, compatibility, or delivery? Chat with our Dhaka team directly.'}
          </p>

          <form onSubmit={handleSend} className="space-y-2">
            <input
              type="text"
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2 rounded-lg focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-900/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Start WhatsApp Chat</span>
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="WhatsApp Support"
        className="w-13 h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/50 flex items-center justify-center transition-all duration-300 hover:scale-105 group relative"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="sr-only">Live WhatsApp Chat</span>
        {/* Subtle ping indicator */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </button>
    </div>
  );
};
