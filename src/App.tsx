import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { AppProvider, useApp, ADMIN_EMAIL } from './context/AppContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CleanProductShowcase } from './components/CleanProductShowcase';
import { ProductListing } from './components/ProductListing';
import { ProductDetail } from './components/ProductDetail';
import { CheckoutView } from './components/CheckoutView';
import { OrderSuccessView } from './components/OrderSuccessView';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProductCompareModal } from './components/ProductCompareModal';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { InstantOrderModal } from './components/InstantOrderModal';
import { InvoiceModal } from './components/InvoiceModal';
import { LiveChatWidget } from './components/LiveChatWidget';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';

const MainContent: React.FC = () => {
  const { currentView, selectedProduct, isAdmin, setCurrentView, openAuthModal } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#050914] text-slate-100 selection:bg-[#168BFF]/30 selection:text-[#00D4FF] w-full max-w-full overflow-x-hidden">
      {/* Sticky Top Header */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1 pb-16 md:pb-0">
        {currentView === 'home' && (
          <>
            <HeroSection />
            <CleanProductShowcase />
          </>
        )}

        {currentView === 'shop' && <ProductListing />}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetail product={selectedProduct} />
        )}

        {currentView === 'checkout' && <CheckoutView />}

        {currentView === 'order-success' && <OrderSuccessView />}

        {currentView === 'account' && <CustomerDashboard />}

        {currentView === 'admin' && (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <div className="max-w-md mx-auto my-16 px-6 py-10 bg-[#08172B] border border-rose-500/30 rounded-2xl text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">অ্যাডমিন অনুমতি নেই</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  এই প্যানেলটিতে প্রবেশের অনুমতি শুধুমাত্র নির্ধারিত অ্যাডমিন (<span className="text-[#00D4FF] font-semibold font-mono">{ADMIN_EMAIL}</span>) এর জন্য প্রযোজ্য। সাধারণ ইউজার বা কাস্টমাররা অ্যাডমিন প্যানেল দেখতে বা প্রবেশ করতে পারবেন না।
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                <button
                  onClick={() => setCurrentView('home')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>হোম পেইজে যান</span>
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00D4FF] hover:opacity-90 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md shadow-[#168BFF]/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span>অনুমোদিত অ্যাডমিন লগইন</span>
                </button>
              </div>
            </div>
          )
        )}

        {currentView === 'compare' && <ProductCompareModal />}
      </main>

      {/* Global Overlays & Modals */}
      <CartDrawer />
      <QuickViewModal />
      <InstantOrderModal />
      <InvoiceModal />
      <LiveChatWidget />
      <AuthModal />
      <ToastContainer />

      {/* Footer */}
      <Footer />

      {/* Mobile Floating Bottom Navigation (Phone View) */}
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
