import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Truck, ShieldCheck, ShoppingBag, Plus, Minus, AlertCircle, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, ShippingDetails } from '../types';
import { getSafeImageSrc, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';

export const InstantOrderModal: React.FC = () => {
  const {
    quickOrderProduct,
    setQuickOrderProduct,
    createDirectOrder,
    formatBDT,
    settings,
    language,
    currentUser,
    openAuthModal,
    showToast
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [districtType, setDistrictType] = useState<'dhaka' | 'outside'>('dhaka');
  const [districtName, setDistrictName] = useState('ঢাকা সিটি (Dhaka City)');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      if (!fullName && currentUser.name) setFullName(currentUser.name);
      if (!phone && currentUser.phone) setPhone(currentUser.phone);
      if (!address && currentUser.address) setAddress(currentUser.address);
    }
  }, [currentUser]);

  if (!quickOrderProduct) return null;

  const itemSubtotal = quickOrderProduct.price * quantity;
  const isFree = itemSubtotal >= settings.freeShippingThreshold;
  const deliveryFee = isFree ? 0 : (districtType === 'dhaka' ? settings.shippingFeeInsideDhaka : settings.shippingFeeOutsideDhaka);
  const totalAmount = itemSubtotal + deliveryFee;

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) {
      setErrorMsg(
        language === 'bn'
          ? 'অর্ডার কনফার্ম করার জন্য অ্যাকাউন্টে লগইন থাকা আবশ্যক।'
          : 'Please sign in or create an account to confirm order.'
      );
      showToast(
        language === 'bn'
          ? 'অর্ডার নিশ্চিত করার আগে দয়া করে লগইন করুন।'
          : 'Please log in to confirm order.',
        'warning'
      );
      openAuthModal('login');
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg(language === 'bn' ? 'দয়া করে আপনার নাম লিখুন' : 'Please enter your full name');
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      setErrorMsg(language === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01xxxxxxxxx)' : 'Please enter valid 11-digit phone number');
      return;
    }
    if (!address.trim()) {
      setErrorMsg(language === 'bn' ? 'ডেলিভারির জন্য আপনার পূর্ণ ঠিকানা দিন' : 'Please enter your delivery street address');
      return;
    }

    const shipping: ShippingDetails = {
      fullName,
      phone,
      email: currentUser.email || 'customer@ascomputer.com',
      division: districtType === 'dhaka' ? 'Dhaka' : 'Outside Dhaka',
      district: districtName,
      address,
      deliveryNotes: 'Quick Instant Order'
    };

    createDirectOrder(quickOrderProduct, quantity, shipping, paymentMethod);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[94vh] overflow-y-auto bg-[#08172B] border border-cyan-500/40 rounded-2xl shadow-2xl text-slate-100 my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0c1c36] to-[#08172B] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#168BFF]/20 text-[#00D4FF] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {language === 'bn' ? 'দ্রুত অর্ডার কনফার্ম করুন' : 'Confirm Instant Order'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'ক্যাশ অন ডেলিভারি অথবা বিকাশে পেমেন্ট করুন' : 'Cash on Delivery or bKash Payment'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setQuickOrderProduct(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Brief Row: Image, Name, Price */}
        <div className="p-4 bg-slate-900/70 border-b border-slate-800 flex items-center gap-3.5">
          <img
            src={getSafeImageSrc(quickOrderProduct.thumbnail, DEFAULT_PRODUCT_IMAGE)}
            alt={quickOrderProduct.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 object-cover rounded-xl bg-slate-950 border border-slate-800 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
              {language === 'bn' ? (quickOrderProduct.nameBn || quickOrderProduct.name) : quickOrderProduct.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-extrabold text-[#00D4FF] tabular-nums">
                {formatBDT(quickOrderProduct.price)}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-[11px] text-emerald-400 font-medium">
                {language === 'bn' ? 'স্টকে আছে' : 'In Stock'}
              </span>
            </div>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-1 text-slate-400 hover:text-white"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 text-xs font-bold text-white tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(q => Math.min(quickOrderProduct.stock, q + 1))}
              className="p-1 text-slate-400 hover:text-white"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Customer Information Form */}
        <form onSubmit={handleConfirmOrder} className="p-5 space-y-4 text-xs">
          {!currentUser && (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-amber-300 block">
                    {language === 'bn' ? 'অর্ডার করতে অ্যাকাউন্টে লগইন আবশ্যক' : 'Login Required to Place Order'}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    {language === 'bn' ? 'অর্ডার কনফার্ম করার আগে দয়া করে লগইন বা রেজিস্টার করুন।' : 'Please sign in or create an account.'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1 shadow"
              >
                <LogIn className="w-3 h-3" />
                <span>লগইন</span>
              </button>
            </div>
          )}
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-200">
              {language === 'bn' ? 'আপনার নাম লিখুন *' : 'Customer Full Name *'}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="আপনার নাম লিখুন"
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-[#168BFF]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-200">
              {language === 'bn' ? '১১ ডিজিটের মোবাইল নম্বর *' : 'Mobile Phone Number *'}
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="01xxxxxxxxx (১১ সংখ্যা)"
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-[#168BFF] font-mono tabular-nums"
            />
          </div>

          {/* District Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">
              {language === 'bn' ? 'ডেলিভারি এরিয়া / জেলা *' : 'Delivery Area *'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDistrictType('dhaka');
                  setDistrictName('ঢাকা সিটি (Dhaka City)');
                }}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  districtType === 'dhaka'
                    ? 'bg-[#168BFF]/20 border-[#168BFF] text-white font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-xs font-semibold">{language === 'bn' ? 'ঢাকার ভিতরে' : 'Inside Dhaka'}</div>
                <div className="text-[10px] text-slate-400">
                  {isFree ? 'ফ্রি ডেলিভারি' : `৳${settings.shippingFeeInsideDhaka} চার্জ`}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDistrictType('outside');
                  setDistrictName('ঢাকার বাইরে / সারা বাংলাদেশ (Outside Dhaka)');
                }}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  districtType === 'outside'
                    ? 'bg-[#168BFF]/20 border-[#168BFF] text-white font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-xs font-semibold">{language === 'bn' ? 'ঢাকার বাইরে' : 'Outside Dhaka'}</div>
                <div className="text-[10px] text-slate-400">
                  {isFree ? 'ফ্রি ডেলিভারি' : `৳${settings.shippingFeeOutsideDhaka} চার্জ`}
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-200">
              {language === 'bn' ? 'সম্পূর্ণ ঠিকানা লিখুন *' : 'Complete Delivery Address *'}
            </label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="বাড়ি নং, রোড নং, এলাকা..."
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-[#168BFF]"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-200">
              {language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="modalPayMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="text-emerald-500"
                />
                <span className="text-xs">{language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</span>
              </label>

              <label
                onClick={() => setPaymentMethod('bkash')}
                className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer ${
                  paymentMethod === 'bkash'
                    ? 'bg-pink-500/15 border-pink-500 text-pink-300 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="modalPayMethod"
                  checked={paymentMethod === 'bkash'}
                  onChange={() => setPaymentMethod('bkash')}
                  className="text-pink-500"
                />
                <span className="text-xs font-semibold">bKash (বিকাশ)</span>
              </label>
            </div>
          </div>

          {/* Order Summary Pricing */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>পণ্য মূল্য:</span>
              <span className="font-bold text-white tabular-nums">{formatBDT(itemSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>ডেলিভারি চার্জ:</span>
              <span className="tabular-nums font-semibold">
                {deliveryFee === 0 ? <strong className="text-emerald-400">ফ্রি</strong> : formatBDT(deliveryFee)}
              </span>
            </div>
            <div className="pt-1.5 border-t border-slate-800 flex justify-between font-extrabold text-white text-sm">
              <span>সর্বমোট পরিশোধ:</span>
              <span className="text-[#00D4FF] text-base tabular-nums">{formatBDT(totalAmount)}</span>
            </div>
          </div>

          {/* Confirm Button */}
          {!currentUser ? (
            <button
              type="button"
              onClick={() => {
                showToast(
                  language === 'bn'
                    ? 'অর্ডার কনফার্ম করার জন্য অনুগ্রহ করে অ্যাকাউন্টে লগইন বা একাউন্ট তৈরি করুন।'
                    : 'Please log in to confirm order.',
                  'warning'
                );
                openAuthModal('login');
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-sm font-extrabold shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <LogIn className="w-5 h-5" />
              <span>{language === 'bn' ? 'লগইন করে অর্ডার সম্পন্ন করুন' : 'Sign In to Confirm Order'}</span>
            </button>
          ) : (
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00D4FF] hover:from-[#1272d4] hover:to-[#00bfe6] text-white text-sm font-extrabold shadow-lg shadow-[#168BFF]/30 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{language === 'bn' ? 'অর্ডার কনফার্ম করুন' : 'Confirm Order Now'}</span>
            </button>
          )}

          {/* Direct helpline information */}
          <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-800/60">
            <span>📞 কোনো জিজ্ঞাসা থাকলে কল করুন: </span>
            <a href={`tel:${settings.supportPhone}`} className="text-[#00D4FF] font-bold font-mono hover:underline">
              {settings.supportPhone}
            </a>
            <span className="text-slate-500"> ({settings.ownerName})</span>
          </div>
        </form>
      </div>
    </div>
  );
};
