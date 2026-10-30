import React from 'react';
import {
  Fan,
  Cable,
  Zap,
  Headphones,
  Keyboard,
  Cpu,
  Wind,
  HardDrive,
  Wifi,
  Layers,
  Gamepad2,
  Lamp,
  ArrowRight
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { useApp } from '../context/AppContext';
import { ProductCategory } from '../types';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Fan,
  Cable,
  Zap,
  Headphones,
  Keyboard,
  Cpu,
  Wind,
  HardDrive,
  Wifi,
  Layers,
  Gamepad2,
  Lamp,
};

export const CategoryGrid: React.FC = () => {
  const { setSelectedCategory, setCurrentView, language, t } = useApp();

  const handleCategoryClick = (catId: ProductCategory) => {
    setSelectedCategory(catId);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select top 12 prominent categories
  const featuredCategories = CATEGORIES.slice(0, 12);

  return (
    <section className="py-12 bg-[#050914]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
              <span>Categories</span>
              <span>·</span>
              <span>Hardware & Accessories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {t('shopByCategory')}
            </h2>
          </div>

          <button
            onClick={() => {
              setSelectedCategory('all');
              setCurrentView('shop');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#168BFF] hover:text-[#00D4FF] transition-colors"
          >
            <span>{t('viewAll')} (15 {language === 'bn' ? 'ক্যাটাগরি' : 'Categories'})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 or 4 columns responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {featuredCategories.map(cat => {
            const Icon = ICON_MAP[cat.iconName] || Keyboard;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="group relative p-4 rounded-xl bg-[#08172B]/60 hover:bg-[#0c1c36] border border-slate-800/80 hover:border-[#168BFF]/50 transition-all duration-300 text-left flex flex-col justify-between overflow-hidden shadow-md hover:shadow-xl hover:shadow-[#168BFF]/10 focus:outline-none focus:ring-1 focus:ring-[#168BFF]"
              >
                {/* Subtle cyan glow on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#168BFF]/5 rounded-full blur-xl group-hover:bg-[#00D4FF]/15 transition-all duration-300 pointer-events-none" />

                <div className="space-y-3 relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700/60 flex items-center justify-center text-[#00D4FF] group-hover:scale-110 group-hover:border-[#168BFF] transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-white transition-colors">
                      {language === 'bn' ? cat.nameBn : cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {cat.itemCount} {language === 'bn' ? 'টি পণ্য' : 'items'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-[#00D4FF] transition-colors">
                  <span>{language === 'bn' ? 'ব্রাউজ করুন' : 'Browse'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
