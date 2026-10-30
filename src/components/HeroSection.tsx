import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HeroBannerSlide } from '../types';
import { getSafeImageSrc, DEFAULT_BANNER_IMAGE } from '../utils/imageUtils';

export const HeroSection: React.FC = () => {
  const { setCurrentView, setSelectedCategory, language, settings, isAdmin } = useApp();

  // Load slides list or fallback to single legacy banner
  const slides: HeroBannerSlide[] = (settings.banners && settings.banners.length > 0)
    ? settings.banners
    : [
        {
          id: 'default-1',
          image: settings.bannerImage || '/images/hero_setup_showcase_1793020165334.jpg',
          title: settings.bannerTitle || 'AS Computer — কম্পিউটার এক্সেসরিজ ও গ্যাজেট শপ',
          titleBn: settings.bannerTitleBn || settings.bannerTitle || 'AS Computer — কম্পিউটার এক্সেসরিজ ও গ্যাজেট শপ',
          subtitle: settings.bannerSubtitle || 'কিবোর্ড, মাউস, মিনি ফ্যান, কেবল, কনভার্টার, অডিও ও কুলিং ফ্যান সহ সকল কম্পিউটার সামগ্রী সহজে ও দ্রুত অর্ডার করুন।',
          subtitleBn: settings.bannerSubtitleBn || settings.bannerSubtitle || 'কিবোর্ড, মাউস, মিনি ফ্যান, কেবল, কনভার্টার, অডিও ও কুলিং ফ্যান সহ সকল কম্পিউটার সামগ্রী সহজে ও দ্রুত অর্ডার করুন।',
          buttonText: settings.bannerButtonText || 'সকল প্রোডাক্ট দেখুন',
          buttonTextBn: settings.bannerButtonTextBn || settings.bannerButtonText || 'সকল প্রোডাক্ট দেখুন',
          link: settings.bannerLink || 'all',
        }
      ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Safely clamp index if banners list count changed
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  // Automatic scrolling every 5 seconds if multiple slides exist ("একটা পর একটা স্ক্রোল করবে")
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const currentSlide = slides[currentIndex] || slides[0];

  const handleBannerAction = (targetLink: string) => {
    if (!targetLink || targetLink === 'shop' || targetLink === 'all') {
      setSelectedCategory('all');
      setCurrentView('shop');
    } else {
      setSelectedCategory(targetLink as any);
      setCurrentView('shop');
    }
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
  };

  const title = (language === 'bn' ? (currentSlide.titleBn || currentSlide.title) : currentSlide.title) || 'AS Computer Tech Store';
  const subtitle = (language === 'bn' ? (currentSlide.subtitleBn || currentSlide.subtitle) : currentSlide.subtitle) || '';
  const buttonText = (language === 'bn' ? (currentSlide.buttonTextBn || currentSlide.buttonText) : currentSlide.buttonText) || 'সকল প্রোডাক্ট দেখুন';

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-b from-[#050914] via-[#08172B] to-[#050914] py-4 sm:py-8 border-b border-slate-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 relative">
        {/* Main Slide Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center min-h-[220px] sm:min-h-[290px]">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4 text-left transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#168BFF]/20 text-[#00D4FF] border border-[#00D4FF]/30">
                <Sparkles className="w-3 h-3" />
                <span>{language === 'bn' ? 'অফিসিয়াল গ্যাজেট শপ' : 'Official Tech Gear'}</span>
              </span>
              {slides.length > 1 && (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                  {currentIndex + 1} / {slides.length}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              {title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl line-clamp-3">
              {subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              <button
                onClick={() => handleBannerAction(currentSlide.link)}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00D4FF] hover:from-[#1272d4] hover:to-[#00bfe6] text-white text-xs font-bold shadow-md shadow-[#168BFF]/25 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {isAdmin ? (
                <button
                  onClick={() => setCurrentView('admin')}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-bold transition-all"
                >
                  <span>{language === 'bn' ? 'এডমিন প্যানেল' : 'Admin Panel'}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setCurrentView('shop');
                  }}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
                >
                  <span>{language === 'bn' ? 'সব পণ্য ব্রাউজ করুন' : 'Browse All'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Product Image with Hover Zoom & Action */}
          <div className="lg:col-span-5 relative">
            <div
              onClick={() => handleBannerAction(currentSlide.link)}
              className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-[#08172B] shadow-2xl group cursor-pointer"
            >
              <img
                src={getSafeImageSrc(currentSlide.image, DEFAULT_BANNER_IMAGE)}
                alt={title}
                key={currentSlide.image || 'default-banner'}
                referrerPolicy="no-referrer"
                onError={e => {
                  (e.target as HTMLImageElement).src = DEFAULT_BANNER_IMAGE;
                }}
                className="w-full h-44 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3.5">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] text-white font-semibold bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                    {language === 'bn' ? 'ক্লিক করে কালেকশন দেখুন' : 'Explore Collection'}
                  </span>
                  <span className="text-xs text-[#00D4FF] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>দেখুন</span> →
                  </span>
                </div>
              </div>
            </div>

            {/* Left/Right Arrow Controls (visible when multiple slides exist) */}
            {slides.length > 1 && (
              <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 left-2 right-2 pointer-events-none">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm border border-slate-700 pointer-events-auto transition-transform hover:scale-110 active:scale-95 shadow-lg"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm border border-slate-700 pointer-events-auto transition-transform hover:scale-110 active:scale-95 shadow-lg"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Carousel Indicators / Dots (shown when 2 or more slides) */}
        {slides.length > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {slides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all rounded-full ${
                  currentIndex === idx
                    ? 'w-7 h-2 bg-gradient-to-r from-[#168BFF] to-[#00D4FF] shadow-md shadow-[#00D4FF]/40'
                    : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
