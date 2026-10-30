import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/categories';

export const Footer: React.FC = () => {
  const { setCurrentView, setSelectedCategory, settings, language, t, isAdmin } = useApp();

  return (
    <footer className="bg-[#03060d] border-t border-slate-800 text-slate-400 text-xs">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#168BFF]/40 to-[#08172B] p-0.5 shadow-md shadow-[#168BFF]/20 overflow-hidden">
                <div className="w-full h-full bg-[#050914] rounded-[10px] overflow-hidden flex items-center justify-center border border-[#168BFF]/30">
                  <img
                    src={settings.logoUrl || 'https://i.imgur.com/OfCvr1N.jpeg'}
                    alt="AS Computer Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  <span>AS</span> <span className="text-[#00D4FF]">Computer</span>
                </div>
                <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                  Power Your Digital World.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your trusted hub for premium computer accessories, mechanical keyboards, studio audio, high-speed USB-C docking stations, cooling solutions, and everyday gadgets in Bangladesh.
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="text-[#00D4FF] font-bold">প্রোপাইটার:</span>
                <span className="text-white font-bold">{settings.ownerName || 'Md. Amir Hamza'}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#00D4FF] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{settings.storeAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#168BFF] shrink-0" />
                <a href={`tel:${settings.supportPhone}`} className="text-[#00D4FF] hover:underline font-mono font-bold tabular-nums">
                  {settings.supportPhone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#168BFF] shrink-0" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-white font-mono">
                  {settings.supportEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 6).map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(c.id);
                      setCurrentView('shop');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#00D4FF] transition-colors text-left"
                  >
                    {language === 'bn' ? c.nameBn : c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentView('account')}
                  className="hover:text-white transition-colors"
                >
                  Track Your Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('account')}
                  className="hover:text-white transition-colors"
                >
                  Warranty & Returns Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('account')}
                  className="hover:text-white transition-colors"
                >
                  My Orders & Profile
                </button>
              </li>
              <li>
                <a
                  href={`tel:${settings.supportPhone}`}
                  className="hover:text-white transition-colors block"
                >
                  Hotline Helpline
                </a>
              </li>
              {isAdmin && (
                <li>
                  <button
                    onClick={() => setCurrentView('admin')}
                    className="text-amber-400 hover:underline"
                  >
                    Staff Portal
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Payment & Logistics Partners */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Payment & Logistics</h4>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-slate-400 mb-1.5">Accepted Payment Methods:</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-1 rounded bg-[#08172B] border border-slate-700 text-[11px] font-bold text-pink-400">
                    bKash
                  </span>
                  <span className="px-2 py-1 rounded bg-[#08172B] border border-slate-700 text-[11px] font-bold text-amber-400">
                    Nagad
                  </span>
                  <span className="px-2 py-1 rounded bg-[#08172B] border border-slate-700 text-[11px] font-bold text-blue-400">
                    Visa / MC
                  </span>
                  <span className="px-2 py-1 rounded bg-[#08172B] border border-slate-700 text-[11px] font-bold text-emerald-400">
                    Cash on Delivery
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 mb-1.5">Official Couriers:</p>
                <p className="text-slate-300 font-medium">Steadfast Courier · Pathao Express · Paperfly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} AS Computer. All rights reserved. Power Your Digital World.</p>
          <div className="flex items-center gap-4">
            <span>Terms of Service</span>
            <span>·</span>
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Refund Policy</span>
            <span>·</span>
            <span className="text-slate-400">Dhaka, Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
