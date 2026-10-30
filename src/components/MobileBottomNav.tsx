import React from 'react';
import { Home, Grid, ShoppingBag, ShieldCheck, Phone, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cartTotalCount,
    setIsCartDrawerOpen,
    setSelectedCategory,
    settings,
    language,
    isAdmin,
    currentUser,
    openAuthModal
  } = useApp();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08172B]/95 backdrop-blur-md border-t border-slate-800/90 px-2 py-1.5 shadow-2xl shadow-black"
    >
      <div className="grid grid-cols-5 items-center justify-around text-center">
        {/* Home */}
        <button
          onClick={() => {
            setSelectedCategory('all');
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentView === 'home' ? 'text-[#00D4FF]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">
            {language === 'bn' ? 'হোম' : 'Home'}
          </span>
        </button>

        {/* Shop / Products */}
        <button
          onClick={() => {
            setSelectedCategory('all');
            setCurrentView('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentView === 'shop' ? 'text-[#00D4FF]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">
            {language === 'bn' ? 'মালামাল' : 'Products'}
          </span>
        </button>

        {/* Cart */}
        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 relative transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#168BFF] text-white text-[9px] font-bold flex items-center justify-center shadow-md animate-pulse">
                {cartTotalCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium mt-0.5">
            {language === 'bn' ? 'কার্ট' : 'Cart'}
          </span>
        </button>

        {/* Direct Call to Md. Amir Hamza */}
        <a
          href={`tel:${settings.supportPhone}`}
          className="flex flex-col items-center justify-center py-1 text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <Phone className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">
            {language === 'bn' ? 'কল দিন' : 'Call'}
          </span>
        </a>

        {/* 5th Tab: Admin for mdrakibhasanrion404@gmail.com, Account/Login for all others */}
        {isAdmin ? (
          <button
            onClick={() => {
              setCurrentView(currentView === 'admin' ? 'home' : 'admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              currentView === 'admin' ? 'text-amber-400' : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">
              {language === 'bn' ? 'এডমিন' : 'Admin'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (!currentUser) {
                openAuthModal('login');
              } else {
                setCurrentView('account');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              currentView === 'account' ? 'text-[#00D4FF]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">
              {currentUser
                ? (language === 'bn' ? 'একাউন্ট' : 'Account')
                : (language === 'bn' ? 'লগইন' : 'Login')}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
