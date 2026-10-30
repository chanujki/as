import React from 'react';
import {
  CheckCircle,
  Truck,
  Printer,
  ArrowRight,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSafeImageSrc, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';

export const OrderSuccessView: React.FC = () => {
  const { activeOrder, setCurrentView, formatBDT, setInvoiceOrder, language } = useApp();

  if (!activeOrder) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-slate-300">No active order found.</p>
        <button
          onClick={() => setCurrentView('home')}
          className="px-4 py-2 rounded-lg bg-[#168BFF] text-white text-xs font-semibold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const steps = [
    { label: 'Order Confirmed', date: 'Today', done: true },
    { label: 'Packing & Quality Check', date: 'Today', done: true },
    { label: 'Handed to Courier', date: 'Tomorrow', done: false },
    { label: 'Out for Delivery', date: 'Expected 24-48h', done: false },
  ];

  return (
    <div className="py-12 bg-[#050914] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Success Header Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#08172B] to-[#0c1c36] border border-[#168BFF]/40 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {language === 'bn' ? 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!' : 'Thank You! Order Confirmed'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Your order <span className="text-[#00D4FF] font-bold font-mono">#{activeOrder.id}</span> has been placed. An SMS confirmation was dispatched to <span className="font-mono text-white">{activeOrder.shipping.phone}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setInvoiceOrder(activeOrder)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-[#168BFF] text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4 text-[#00D4FF]" />
              <span>Print Official Invoice</span>
            </button>
            <button
              onClick={() => setCurrentView('account')}
              className="px-5 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#1272d4] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2"
            >
              <span>View Order in Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Delivery Progress Timeline */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#08172B]/70 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Truck className="w-4 h-4 text-[#00D4FF]" />
              <span>Delivery Timeline & Courier Status</span>
            </div>
            <span className="text-xs text-slate-400">
              Tracking No: <span className="font-mono text-slate-200 font-bold">{activeOrder.trackingNumber}</span> ({activeOrder.courierName})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className="relative space-y-2 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step.done
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className={`h-0.5 flex-1 hidden sm:block ${step.done ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${step.done ? 'text-white' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-500">{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Shipping */}
          <div className="p-5 rounded-2xl bg-[#08172B]/60 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-slate-800">
              <MapPin className="w-4 h-4 text-[#00D4FF]" />
              <span>Delivery Destination</span>
            </div>
            <div className="space-y-1 text-slate-300">
              <p className="font-bold text-white">{activeOrder.shipping.fullName}</p>
              <p>{activeOrder.shipping.address}</p>
              <p>{activeOrder.shipping.district}, {activeOrder.shipping.division}</p>
              <p className="font-mono text-slate-400">Phone: {activeOrder.shipping.phone}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-5 rounded-2xl bg-[#08172B]/60 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-slate-800">
              <CreditCard className="w-4 h-4 text-[#00D4FF]" />
              <span>Payment Details</span>
            </div>
            <div className="space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-bold uppercase text-white">{activeOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className={`font-semibold ${activeOrder.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {activeOrder.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span>Grand Total:</span>
                <span className="font-bold text-base text-[#00D4FF] tabular-nums">
                  {formatBDT(activeOrder.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="p-6 rounded-2xl bg-[#08172B]/70 border border-slate-800 space-y-4">
          <h4 className="font-bold text-white text-sm">Ordered Items ({activeOrder.items.length})</h4>
          <div className="divide-y divide-slate-800">
            {activeOrder.items.map((it, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={getSafeImageSrc(it.thumbnail, DEFAULT_PRODUCT_IMAGE)}
                    alt={it.productName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-white">{it.productName}</p>
                    <p className="text-[11px] text-slate-400">
                      SKU: {it.productSku} {it.variant ? `· ${it.variant}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white tabular-nums">{formatBDT(it.price * it.quantity)}</span>
                  <p className="text-[10px] text-slate-500">Qty: {it.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Catalog CTA */}
        <div className="text-center pt-4">
          <button
            onClick={() => setCurrentView('shop')}
            className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold"
          >
            Continue Browsing AS Computer
          </button>
        </div>
      </div>
    </div>
  );
};
