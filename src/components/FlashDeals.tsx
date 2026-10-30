import React, { useState, useEffect } from 'react';
import { Zap, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';

export const FlashDeals: React.FC = () => {
  const { products, setCurrentView, setSelectedCategory, language, t } = useApp();

  // Real-time countdown timer: 14 hours 28 mins 45 secs from now
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 28,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = products.filter(p => p.isFlashDeal);

  if (flashProducts.length === 0) return null;

  return (
    <section className="py-10 bg-gradient-to-b from-[#08172B]/40 via-[#050914] to-[#050914] border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header with Countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {t('flashDeals')}
                </h2>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {language === 'bn' ? 'সীমিত অফার' : 'Limited Time'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' ? 'আজকের সেরা গ্যাজেট ডিলস' : 'Exclusive discounts on selected computer & tech gear'}
              </p>
            </div>
          </div>

          {/* Countdown Clock Display */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-[#08172B] border border-slate-700/80 rounded-xl px-3.5 py-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400 font-medium">{t('endsIn')}:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-xs tabular-nums text-white">
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {flashProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="mt-8 p-4 rounded-xl bg-[#08172B]/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-300">
            {language === 'bn'
              ? '⚡ প্রো টিপ: কুপন কোড TECHBOOST ব্যবহার করে ২০০০+ টাকার অর্ডারে অতিরিক্ত ১০% ছাড় উপভোগ করুন!'
              : '⚡ Pro Tip: Apply promo code TECHBOOST at checkout for an extra 10% OFF orders over ৳2,000!'}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setCurrentView('shop');
            }}
            className="text-[#00D4FF] hover:underline font-semibold flex items-center gap-1 shrink-0"
          >
            <span>{language === 'bn' ? 'সকল অফার দেখুন' : 'Explore All Deals'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
