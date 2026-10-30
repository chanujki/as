import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  Scale,
  User,
  ShieldCheck,
  Menu,
  X,
  Phone,
  Sparkles,
  ArrowRight,
  LogIn,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSafeImageSrc, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cartTotalCount,
    setIsCartDrawerOpen,
    wishlist,
    compareList,
    language,
    setLanguage,
    t,
    products,
    openProductDetail,
    setSelectedCategory,
    setSearchQuery,
    settings,
    currentUser,
    isAdmin,
    openAuthModal,
    logout
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [localSearch, setLocalSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter products for autocomplete
  const searchSuggestions = localSearch.trim().length > 1
    ? products
        .filter(p =>
          p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(localSearch.toLowerCase()) ||
          p.brand.toLowerCase().includes(localSearch.toLowerCase())
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchQuery(localSearch.trim());
      setCurrentView('shop');
      setIsSearchFocused(false);
    }
  };

  const handleSelectSuggestion = (product: any) => {
    openProductDetail(product);
    setIsSearchFocused(false);
    setLocalSearch('');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050914]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Red Notice / Alert Bar (Controlled via Admin Panel) */}
      {settings.noticeEnabled !== false && settings.noticeText && (
        <div
          className={`w-full py-1.5 px-3 sm:px-4 text-xs font-semibold text-white shadow-md transition-colors overflow-hidden ${
            settings.noticeBgColor === 'amber'
              ? 'bg-amber-600 border-b border-amber-700'
              : settings.noticeBgColor === 'blue'
              ? 'bg-[#168BFF] border-b border-blue-700'
              : settings.noticeBgColor === 'emerald'
              ? 'bg-emerald-600 border-b border-emerald-700'
              : settings.noticeBgColor === 'purple'
              ? 'bg-purple-700 border-b border-purple-800'
              : settings.noticeBgColor === 'custom' && settings.noticeCustomBg
              ? 'border-b border-black/20'
              : 'bg-rose-600 border-b border-rose-700'
          }`}
          style={
            settings.noticeBgColor === 'custom' && settings.noticeCustomBg
              ? { backgroundColor: settings.noticeCustomBg }
              : undefined
          }
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span className="px-2 py-0.5 rounded bg-black/30 font-black text-[10px] tracking-wider uppercase shrink-0 z-10 shadow-sm">
              {settings.noticeBadgeText || 'NOTICE'}
            </span>
            {settings.noticeScrollable ? (
              <div className="overflow-hidden whitespace-nowrap w-full relative flex items-center">
                <div className="inline-block animate-[marquee_24s_linear_infinite] hover:[animation-play-state:paused] text-[11px] sm:text-xs font-medium">
                  <span className="mx-4">{settings.noticeText}</span>
                  <span className="mx-4 text-white/50">✦</span>
                  <span className="mx-4">{settings.noticeText}</span>
                  <span className="mx-4 text-white/50">✦</span>
                  <span className="mx-4">{settings.noticeText}</span>
                </div>
              </div>
            ) : (
              <span className="text-[11px] sm:text-xs font-medium leading-snug text-center">
                {settings.noticeText}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Announcement Bar */}
      <div className="bg-[#08172B] border-b border-slate-800/60 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-[#00D4FF] flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AS Computer BD</span>
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-300 truncate">
              {language === 'bn' ? settings.announcementTextBn : settings.announcementText}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 font-medium">
            <a
              href={`tel:${settings.supportPhone}`}
              className="hidden lg:flex items-center gap-1.5 text-slate-400 hover:text-[#00D4FF] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#168BFF]" />
              <span className="tabular-nums">{settings.supportPhone}</span>
            </a>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-900/80 rounded-md p-0.5 border border-slate-700/60 text-[11px]">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded transition-all ${
                  language === 'en'
                    ? 'bg-[#168BFF] text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2 py-0.5 rounded transition-all ${
                  language === 'bn'
                    ? 'bg-[#168BFF] text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* Admin Switcher - Only visible if logged in as mdrakibhasanrion404@gmail.com */}
            {isAdmin && (
              <button
                onClick={() => setCurrentView(currentView === 'admin' ? 'home' : 'admin')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all ${
                  currentView === 'admin'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span>{currentView === 'admin' ? (language === 'bn' ? 'স্টোরে ফিরুন' : 'Storefront') : t('admin')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 md:gap-8">
        {/* Brand Zone */}
        <button
          onClick={() => {
            setSelectedCategory('all');
            setSearchQuery('');
            setCurrentView('home');
          }}
          className="flex items-center gap-3 text-left shrink-0 group focus:outline-none"
        >
          {/* Website Logo Image */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#168BFF]/40 to-[#00D4FF]/30 p-0.5 shadow-lg shadow-[#168BFF]/25 group-hover:shadow-[#00D4FF]/40 group-hover:scale-105 transition-all duration-300 shrink-0 overflow-hidden">
            <div className="w-full h-full bg-[#050914] rounded-[10px] overflow-hidden flex items-center justify-center border border-[#168BFF]/30">
              <img
                src={settings.logoUrl || 'https://i.imgur.com/OfCvr1N.jpeg'}
                alt="AS Computer Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-1">
              <span>AS</span>
              <span className="text-[#00D4FF]">Computer</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 tracking-wider uppercase font-medium truncate max-w-[170px] sm:max-w-none">
              {language === 'bn' ? 'পাওয়ার ইউর ডিজিটাল ওয়ার্ল্ড' : 'Power Your Digital World'}
            </p>
          </div>
        </button>

        {/* Search Bar with Autocomplete (Desktop & Tablet) */}
        <div ref={searchRef} className="relative hidden md:block flex-1 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={localSearch}
              onChange={e => {
                setLocalSearch(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-[#08172B]/90 text-sm text-slate-100 placeholder-slate-400 pl-10 pr-24 py-2.5 rounded-lg border border-slate-700/80 focus:border-[#168BFF] focus:ring-1 focus:ring-[#168BFF] focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#168BFF] hover:bg-[#1272d4] text-white text-xs font-semibold rounded-md transition-colors"
            >
              {language === 'bn' ? 'অনুসন্ধান' : 'Search'}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#08172B] border border-slate-700 rounded-xl shadow-2xl shadow-black/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800 text-[11px] font-medium text-slate-400 flex justify-between">
                <span>{language === 'bn' ? 'সুপারিশকৃত পণ্য' : 'Suggested Products'}</span>
                <span>{searchSuggestions.length} items</span>
              </div>
              <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto">
                {searchSuggestions.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full p-2.5 flex items-center gap-3 hover:bg-[#0c1c36] text-left transition-colors"
                  >
                    <img
                      src={getSafeImageSrc(item.thumbnail, DEFAULT_PRODUCT_IMAGE)}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-md bg-slate-900 shrink-0 border border-slate-800"
                      onError={e => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-[#00D4FF] font-semibold tabular-nums">৳{item.price.toLocaleString('en-IN')}</span>
                        <span>·</span>
                        <span className="capitalize">{item.category.replace('-', ' ')}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Wishlist */}
          <button
            onClick={() => setCurrentView('account')}
            aria-label="Wishlist"
            className="hidden sm:inline-flex relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            title={t('wishlist')}
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#168BFF] text-white text-[10px] font-bold flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Compare */}
          <button
            onClick={() => setCurrentView('compare')}
            aria-label="Compare Products"
            className="hidden md:inline-flex relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            title={t('compare')}
          >
            <Scale className="w-5 h-5" />
            {compareList.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {compareList.length}
              </span>
            )}
          </button>

          {/* Account & Login Button */}
          {currentUser ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-[#168BFF] text-left transition-all"
                title={currentUser.name}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#168BFF] to-[#00D4FF] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block min-w-0 max-w-[110px]">
                  <p className="text-xs font-bold text-white truncate leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-[#00D4FF] font-medium leading-none mt-0.5">
                    {currentUser.role === 'admin' ? (language === 'bn' ? 'অ্যাডমিন' : 'Admin') : (language === 'bn' ? 'কাস্টমার' : 'Customer')}
                  </p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#08172B] border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn divide-y divide-slate-800">
                  <div className="px-3.5 py-2">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate font-mono">{currentUser.email || currentUser.phone}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#168BFF]/20 text-[#00D4FF] border border-[#168BFF]/30">
                      {currentUser.role === 'admin' ? 'Admin / Store Owner' : 'Verified Customer'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setCurrentView('account');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-slate-800/80 hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#00D4FF]" />
                      <span>{language === 'bn' ? 'আমার অ্যাকাউন্ট ও অর্ডার' : 'My Account & Orders'}</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setCurrentView('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-amber-300 hover:bg-amber-500/10 flex items-center gap-2 transition-colors font-semibold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>{language === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex items-center gap-2 transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#168BFF]/20 hover:bg-[#168BFF]/30 border border-[#168BFF]/50 text-[#00D4FF] hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'bn' ? 'লগইন' : 'Login'}</span>
            </button>
          )}

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            aria-label="Shopping Cart"
            className="relative flex items-center gap-2 bg-[#168BFF]/15 hover:bg-[#168BFF]/25 border border-[#168BFF]/40 text-slate-100 px-3 py-2 rounded-lg transition-all group"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-[#00D4FF] group-hover:scale-105 transition-transform" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-2 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#168BFF] text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                  {cartTotalCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-200">
              {t('cart')}
            </span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Primary Category Nav Strip (Desktop) */}
      <div className="hidden md:block bg-[#08172B]/70 border-t border-slate-800/50 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 text-xs font-medium py-2">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setCurrentView('home');
              }}
              className={`whitespace-nowrap transition-colors hover:text-[#00D4FF] ${
                currentView === 'home' ? 'text-[#00D4FF] font-semibold' : 'text-slate-300'
              }`}
            >
              {t('navHome')}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setCurrentView('shop');
              }}
              className={`whitespace-nowrap transition-colors hover:text-[#00D4FF] ${
                currentView === 'shop' ? 'text-[#00D4FF] font-semibold' : 'text-slate-300'
              }`}
            >
              {t('navShop')}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('mini-fans');
                setCurrentView('shop');
              }}
              className="whitespace-nowrap text-slate-300 hover:text-[#00D4FF] transition-colors"
            >
              {language === 'bn' ? 'মিনি ফ্যান' : 'Mini Fans'}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('cables-connectors');
                setCurrentView('shop');
              }}
              className="whitespace-nowrap text-slate-300 hover:text-[#00D4FF] transition-colors"
            >
              {language === 'bn' ? 'কেবল ও কানেক্টর' : 'Cables & USB'}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('headphones-audio');
                setCurrentView('shop');
              }}
              className="whitespace-nowrap text-slate-300 hover:text-[#00D4FF] transition-colors"
            >
              {language === 'bn' ? 'হেডফোন ও অডিও' : 'Audio & Headsets'}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('computer-accessories');
                setCurrentView('shop');
              }}
              className="whitespace-nowrap text-slate-300 hover:text-[#00D4FF] transition-colors"
            >
              {language === 'bn' ? 'কিবোর্ড ও মাউস' : 'Keyboards & Mice'}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('cooling-fans');
                setCurrentView('shop');
              }}
              className="whitespace-nowrap text-slate-300 hover:text-[#00D4FF] transition-colors"
            >
              {language === 'bn' ? 'কুলিং ফ্যান' : 'PC Cooling'}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('power-charging');
                setCurrentView('shop');
              }}
              className="whitespace-nowrap text-slate-300 hover:text-[#00D4FF] transition-colors"
            >
              {language === 'bn' ? 'পাওয়ার ও চার্জার' : 'GaN Chargers & PSU'}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('deals-bundles');
                setCurrentView('shop');
              }}
              className="whitespace-nowrap text-amber-400 font-semibold hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{language === 'bn' ? 'স্পেশাল ডিলস' : 'Deals & Bundles'}</span>
            </button>
          </div>

          <button
            onClick={() => setCurrentView('compare')}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 shrink-0"
          >
            <Scale className="w-3 h-3 text-[#00D4FF]" />
            <span>{t('compare')} ({compareList.length})</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#08172B] border-b border-slate-700 px-4 py-4 space-y-4 animate-in slide-in-from-top duration-200">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-slate-900 text-sm text-slate-100 placeholder-slate-400 pl-9 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-[#168BFF]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Mobile Nav Links */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                setCurrentView('home');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-slate-900/60 text-slate-200 text-left hover:bg-slate-800"
            >
              {t('navHome')}
            </button>
            <button
              onClick={() => {
                setCurrentView('shop');
                setSelectedCategory('all');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-slate-900/60 text-slate-200 text-left hover:bg-slate-800"
            >
              {t('navShop')}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('mini-fans');
                setCurrentView('shop');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-slate-900/60 text-slate-200 text-left hover:bg-slate-800"
            >
              Mini Fans
            </button>
            <button
              onClick={() => {
                setSelectedCategory('cables-connectors');
                setCurrentView('shop');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-slate-900/60 text-slate-200 text-left hover:bg-slate-800"
            >
              Cables & Docks
            </button>
            <button
              onClick={() => {
                setSelectedCategory('headphones-audio');
                setCurrentView('shop');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-slate-900/60 text-slate-200 text-left hover:bg-slate-800"
            >
              Audio & Headsets
            </button>
            <button
              onClick={() => {
                setSelectedCategory('gaming-accessories');
                setCurrentView('shop');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-slate-900/60 text-slate-200 text-left hover:bg-slate-800"
            >
              Gaming Gear
            </button>
          </div>

          <div className="pt-2.5 border-t border-slate-800 flex flex-col gap-2 text-xs">
            {currentUser ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#168BFF] to-[#00D4FF] flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email || currentUser.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 hover:text-white text-[11px] font-bold"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openAuthModal('login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00D4FF] text-white font-bold flex items-center justify-center gap-2 shadow"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'bn' ? 'লগইন / নতুন অ্যাকাউন্ট খুলুন' : 'Login / Register'}</span>
              </button>
            )}

            <div className="flex justify-between items-center pt-1 text-xs">
              <button
                onClick={() => {
                  setCurrentView('account');
                  setIsMobileMenuOpen(false);
                }}
                className="text-slate-300 flex items-center gap-1.5 hover:text-white"
              >
                <User className="w-4 h-4 text-[#00D4FF]" />
                <span>{t('account')}</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    setCurrentView('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-amber-400 flex items-center gap-1.5 hover:text-amber-300 font-semibold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('admin')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
