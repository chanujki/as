import React from 'react';
import { ArrowRight, Sparkles, Zap, Headphones, Wind } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PromotionalBanners: React.FC = () => {
  const { setSelectedCategory, setCurrentView, language } = useApp();

  return (
    <section className="py-6 bg-[#050914]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Banner 1: Cooling & Mini Fans */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0c1c36] via-[#08172B] to-[#050914] border border-cyan-900/40 p-6 flex flex-col justify-between group hover:border-cyan-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
            <div className="space-y-2 z-10">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                <Wind className="w-4 h-4" />
                <span>{language === 'bn' ? 'সামার ব্যাকআপ কুলিং' : 'Summer Heat Relief'}</span>
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">
                {language === 'bn' ? 'কুল ইয়োর সেটআপ' : 'Cool Your Setup'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'রিচার্জেবল মিনি ফ্যান ও কেসিং এয়ারফ্লো সলিউশন।'
                  : 'Rechargeable desktop mini fans, 4000mAh backup & silent ARGB fans.'}
              </p>
            </div>
            <div className="mt-6 z-10">
              <button
                onClick={() => {
                  setSelectedCategory('mini-fans');
                  setCurrentView('shop');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors"
              >
                <span>{language === 'bn' ? 'ফ্যান কালেকশন দেখুন' : 'Explore Cooling'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Banner 2: Cables & Power */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#08172B] via-[#0b2447] to-[#050914] border border-[#168BFF]/40 p-6 flex flex-col justify-between group hover:border-[#168BFF]/70 transition-all duration-300">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#168BFF]/15 rounded-full blur-2xl group-hover:bg-[#168BFF]/25 transition-all pointer-events-none" />
            <div className="space-y-2 z-10">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00D4FF]">
                <Zap className="w-4 h-4" />
                <span>{language === 'bn' ? 'হাই-স্পিড চার্জিং' : 'Fast PD 3.1 & Thunderbolt'}</span>
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">
                {language === 'bn' ? 'পাওয়ার এভরি কানেকশন' : 'Power Every Connection'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? '১০০ ওয়াট গ্যান চার্জার ও ৪০ জিবিপিএস ব্রেইডেড কেবলস।'
                  : '100W GaN chargers, certified 40Gbps USB4 cables & multi-port docks.'}
              </p>
            </div>
            <div className="mt-6 z-10">
              <button
                onClick={() => {
                  setSelectedCategory('cables-connectors');
                  setCurrentView('shop');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D4FF] group-hover:text-white transition-colors"
              >
                <span>{language === 'bn' ? 'পাওয়ার গ্যাজেট দেখুন' : 'Shop Power & Cables'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Banner 3: Studio & Gaming Audio */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#12182c] via-[#09152b] to-[#050914] border border-blue-800/40 p-6 flex flex-col justify-between group hover:border-blue-400/60 transition-all duration-300">
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
            <div className="space-y-2 z-10">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                <Headphones className="w-4 h-4" />
                <span>{language === 'bn' ? 'প্রিমিয়াম সাউন্ড' : 'Lossless Acoustic Drivers'}</span>
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">
                {language === 'bn' ? 'লেভেল আপ ইয়োর অডিও' : 'Level Up Your Audio'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'লো-ল্যাটেন্সি গেমিং হেডসেট ও ওয়্যারলেস স্টুডিও মনিটর।'
                  : 'Ultra-low latency wireless headsets, desktop DACs & studio sound.'}
              </p>
            </div>
            <div className="mt-6 z-10">
              <button
                onClick={() => {
                  setSelectedCategory('headphones-audio');
                  setCurrentView('shop');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors"
              >
                <span>{language === 'bn' ? 'অডিও গিয়ার দেখুন' : 'Explore Audio Gear'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
