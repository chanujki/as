import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Truck,
  CreditCard,
  Lock,
  Tag,
  AlertCircle,
  LogIn
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, ShippingDetails } from '../types';
import { getSafeImageSrc, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';

const BD_DIVISIONS = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh'
];

const BD_DISTRICTS: Record<string, string[]> = {
  Dhaka: ['Dhaka (Inside City)', 'Gazipur', 'Narayanganj', 'Tangail', 'Narsingdi', 'Manikganj', 'Munshiganj', 'Faridpur'],
  Chattogram: ['Chattogram City', "Cox's Bazar", 'Cumilla', 'Feni', 'Noakhali', 'Brahmanbaria', 'Chandpur'],
  Sylhet: ['Sylhet City', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rajshahi: ['Rajshahi City', 'Bogura', 'Pabna', 'Sirajganj', 'Naogaon', 'Natore', 'Chapai Nawabganj'],
  Khulna: ['Khulna City', 'Jashore', 'Kushtia', 'Satkhira', 'Bagerhat', 'Jhenaidah'],
  Barishal: ['Barishal City', 'Patuakhali', 'Bhola', 'Pirojpur', 'Jhalokathi', 'Barguna'],
  Rangpur: ['Rangpur City', 'Dinajpur', 'Kurigram', 'Gaibandha', 'Thakurgaon', 'Lalmonirhat'],
  Mymensingh: ['Mymensingh City', 'Jamalpur', 'Netrokona', 'Sherpur']
};

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    createOrder,
    setCurrentView,
    formatBDT,
    settings,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    showToast,
    language,
    t,
    currentUser,
    openAuthModal
  } = useApp();

  // Form states with auto-fill from currentUser
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [division, setDivision] = useState(currentUser?.division || 'Dhaka');
  const [district, setDistrict] = useState(currentUser?.district || 'Dhaka (Inside City)');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  React.useEffect(() => {
    if (currentUser) {
      if (!fullName && currentUser.name) setFullName(currentUser.name);
      if (!phone && currentUser.phone) setPhone(currentUser.phone);
      if (!email && currentUser.email) setEmail(currentUser.email);
      if (!address && currentUser.address) setAddress(currentUser.address);
    }
  }, [currentUser]);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  // Interactive bKash modal state
  const [isBkashModalOpen, setIsBkashModalOpen] = useState(false);
  const [bkashNumber, setBkashNumber] = useState('');
  const [bkashPin, setBkashPin] = useState('');
  const [bkashStep, setBkashStep] = useState<'number' | 'otp' | 'pin'>('number');
  const [bkashOtp, setBkashOtp] = useState('');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (cart.length === 0) {
    return (
      <div className="py-24 max-w-xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
        <p className="text-xs text-slate-400">Add some tech accessories before proceeding to checkout.</p>
        <button
          onClick={() => setCurrentView('shop')}
          className="px-6 py-2.5 rounded-lg bg-[#168BFF] text-white text-xs font-semibold"
        >
          {t('continueShopping')}
        </button>
      </div>
    );
  }

  // Delivery calculation
  const isDhaka = division === 'Dhaka' && district.includes('Inside');
  const isFreeShipping = cartSubtotal >= settings.freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : (isDhaka ? settings.shippingFeeInsideDhaka : settings.shippingFeeOutsideDhaka);

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const grandTotal = Math.max(0, cartSubtotal + shippingFee - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;
    const res = applyCouponCode(couponCode);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  const handlePlaceOrder = () => {
    if (!currentUser) {
      showToast(
        language === 'bn'
          ? 'অর্ডার কনফার্ম করার আগে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন বা একাউন্ট তৈরি করুন।'
          : 'Please log in or register before confirming order.',
        'warning'
      );
      openAuthModal('login');
      return;
    }

    const err: Record<string, string> = {};
    if (!fullName.trim()) err.fullName = 'Full name is required';
    if (!phone.trim() || phone.trim().length < 11) err.phone = 'Valid 11-digit BD mobile number required (01xxxxxxxxx)';
    if (!address.trim()) err.address = 'Street address is required';

    if (Object.keys(err).length > 0) {
      setErrors(err);
      showToast('Please correct form errors before placing order', 'warning');
      return;
    }

    if (paymentMethod === 'bkash') {
      setIsBkashModalOpen(true);
      setBkashStep('number');
      return;
    }

    // COD or Card
    const shippingDetails: ShippingDetails = {
      fullName,
      phone,
      email,
      division,
      district,
      address,
      deliveryNotes
    };

    createOrder(shippingDetails, paymentMethod);
  };

  const handleConfirmBkash = () => {
    if (!currentUser) {
      setIsBkashModalOpen(false);
      showToast(
        language === 'bn'
          ? 'অর্ডার কনফার্ম করার আগে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।'
          : 'Please log in to your account before placing order.',
        'warning'
      );
      openAuthModal('login');
      return;
    }

    if (bkashStep === 'number') {
      if (bkashNumber.length < 11) {
        showToast('Enter valid 11-digit bKash account number', 'warning');
        return;
      }
      setBkashStep('otp');
    } else if (bkashStep === 'otp') {
      setBkashStep('pin');
    } else if (bkashStep === 'pin') {
      if (bkashPin.length < 4) {
        showToast('Enter your 5-digit bKash PIN', 'warning');
        return;
      }
      setIsBkashModalOpen(false);

      const shippingDetails: ShippingDetails = {
        fullName,
        phone,
        email,
        division,
        district,
        address,
        deliveryNotes
      };
      createOrder(shippingDetails, 'bkash');
    }
  };

  return (
    <div className="py-8 bg-[#050914] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <button
          onClick={() => setCurrentView('shop')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shopping</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Checkout Form (7 cols) */}
          <div className="w-full lg:w-7/12 space-y-6">
            {/* Login Required Notice if guest, or Logged In Badge */}
            {!currentUser ? (
              <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg shadow-amber-500/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-300 text-sm">
                      {language === 'bn' ? 'অর্ডার করতে অ্যাকাউন্টে লগইন আবশ্যক' : 'Account Login Required to Place Order'}
                    </p>
                    <p className="text-[11px] text-slate-200">
                      {language === 'bn'
                        ? 'আপনার অ্যাকাউন্ট ছাড়া অর্ডার কনফার্ম হবে না। অনুগ্রহ করে এখনই লগইন বা রেজিস্টার করুন।'
                        : 'Orders cannot be placed without an account. Please sign in or register below.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 active:scale-95 flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'লগইন / রেজিস্টার' : 'Sign In / Register'}</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-200">
                    {language === 'bn' ? `লগইন আছেন: ${currentUser.name}` : `Signed in as: ${currentUser.name}`}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                  {language === 'bn' ? 'অটোফিল সক্রিয়' : 'Auto-filled'}
                </span>
              </div>
            )}

            {/* 1. Contact & Shipping Information */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#08172B]/70 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#168BFF] text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h3 className="font-bold text-white text-base">Delivery Address (Bangladesh)</h3>
                </div>
                <span className="text-xs text-[#00D4FF] font-medium">All 64 Districts Supported</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-200">Customer Full Name (ক্রেতার নাম) *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="আপনার নাম লিখুন (Enter Full Name)"
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-3 rounded-lg focus:outline-none focus:border-[#168BFF]"
                  />
                  {errors.fullName && <p className="text-[11px] text-rose-400">{errors.fullName}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Phone Number (মোবাইল নম্বর) *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx (১১ সংখ্যা)"
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-3 rounded-lg focus:outline-none focus:border-[#168BFF] font-mono tabular-nums"
                  />
                  {errors.phone && <p className="text-[11px] text-rose-400">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Email Address (ইনভয়েসের জন্য)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-3 rounded-lg focus:outline-none focus:border-[#168BFF]"
                  />
                </div>

                {/* Division */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Division *</label>
                  <select
                    value={division}
                    onChange={e => {
                      const div = e.target.value;
                      setDivision(div);
                      setDistrict(BD_DISTRICTS[div]?.[0] || '');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-3 rounded-lg focus:outline-none focus:border-[#168BFF]"
                  >
                    {BD_DIVISIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* District / Area */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">District / Area *</label>
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-3 rounded-lg focus:outline-none focus:border-[#168BFF]"
                  >
                    {(BD_DISTRICTS[division] || []).map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                {/* Detailed Street Address */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-200">Complete Delivery Address *</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="House number, road number, flat/level, landmark..."
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-3 rounded-lg focus:outline-none focus:border-[#168BFF]"
                  />
                  {errors.address && <p className="text-[11px] text-rose-400">{errors.address}</p>}
                </div>

                {/* Delivery Notes */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-400">Order Notes (Optional)</label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    placeholder="Special delivery instructions or gate security code..."
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-[#168BFF]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#08172B]/70 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#168BFF] text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h3 className="font-bold text-white text-base">Payment Method</h3>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'bg-[#168BFF]/10 border-[#168BFF] shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-[#168BFF]"
                  />
                  <div>
                    <span className="font-bold text-white text-xs block">Cash on Delivery (COD)</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Pay cash to delivery officer upon receiving & checking package.
                    </span>
                  </div>
                </label>

                {/* bKash */}
                <label
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'bkash'
                      ? 'bg-pink-500/10 border-pink-500 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="mt-1 text-pink-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-pink-400 text-xs">bKash Payment</span>
                      <span className="text-[10px] bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded">Instant</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Instant online checkout via bKash payment gateway.
                    </span>
                  </div>
                </label>

                {/* Nagad */}
                <label
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'nagad'
                      ? 'bg-amber-500/10 border-amber-500 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => setPaymentMethod('nagad')}
                    className="mt-1 text-amber-500"
                  />
                  <div>
                    <span className="font-bold text-amber-400 text-xs block">Nagad Wallet</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Pay via Nagad personal or merchant mobile account.
                    </span>
                  </div>
                </label>

                {/* Debit/Credit Card */}
                <label
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-[#168BFF]/10 border-[#168BFF] shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mt-1 text-[#168BFF]"
                  />
                  <div>
                    <span className="font-bold text-white text-xs block">Debit / Credit Card</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Visa, Mastercard, NexusPay, Amex accepted.
                    </span>
                  </div>
                </label>
              </div>

              {/* Verified Owner Payment Instructions */}
              <div className="p-4 rounded-xl bg-[#050914] border border-[#168BFF]/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00D4FF]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>ভেরিফাইড মার্চেন্ট ও পেমেন্ট তথ্য (AS Computer)</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-medium">প্রোপাইটার ও একাউন্ট নাম:</p>
                    <p className="font-bold text-white text-xs mt-0.5">{settings.ownerName} (মোঃ আমির হামজা)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                    <p className="text-[10px] text-pink-400 font-bold">বিকাশ ও নগদ নম্বর (Personal / Helpline):</p>
                    <p className="font-bold text-[#00D4FF] font-mono text-sm tracking-wide mt-0.5">{settings.supportPhone}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/80">
                  <p>📍 <strong className="text-slate-300">দোকানের ঠিকানা:</strong> {settings.storeAddress}</p>
                  <p>✉️ <strong className="text-slate-300">ইমেইল:</strong> {settings.supportEmail}</p>
                  <p className="text-emerald-400 font-bold flex items-center gap-1.5 pt-0.5">
                    <span>📞 যেকোনো সহায়তায় বা অর্ডারের তথ্যের জন্য সরাসরি কল দিন:</span>
                    <a href={`tel:${settings.supportPhone}`} className="text-[#00D4FF] underline font-mono text-xs">{settings.supportPhone}</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Order Summary (5 cols) */}
          <div className="w-full lg:w-5/12 space-y-6">
            <div className="p-6 rounded-2xl bg-[#08172B]/80 border border-slate-800 space-y-5 sticky top-24">
              <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800">
                Order Summary ({cart.length} items)
              </h3>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-800/60">
                {cart.map((item, i) => (
                  <div key={i} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={getSafeImageSrc(item.product.thumbnail, DEFAULT_PRODUCT_IMAGE)}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE; }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{item.product.name}</p>
                        <p className="text-[11px] text-slate-400">
                          Qty: {item.quantity} {item.selectedVariant ? `· ${item.selectedVariant}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-white tabular-nums shrink-0">
                      {formatBDT(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                {appliedCoupon ? (
                  <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Tag className="w-3.5 h-3.5" />
                      <span className="font-bold">{appliedCoupon.code}</span>
                      <span>({appliedCoupon.description})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-slate-400 hover:text-rose-400 text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Coupon code (e.g. TECHBOOST)"
                        className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white p-2 rounded-lg focus:outline-none focus:border-[#168BFF]"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
                  </form>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-white tabular-nums">{formatBDT(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping ({isDhaka ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                  <span className="tabular-nums font-semibold">
                    {isFreeShipping ? (
                      <span className="text-emerald-400 font-bold">FREE</span>
                    ) : (
                      formatBDT(shippingFee)
                    )}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount</span>
                    <span className="tabular-nums font-bold">-{formatBDT(discountAmount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-extrabold text-white">
                  <span>Final Total</span>
                  <span className="text-[#00D4FF] tabular-nums text-xl">
                    {formatBDT(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Place Order CTA */}
              {!currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    showToast(
                      language === 'bn'
                        ? 'অর্ডার কনফার্ম করার আগে দয়া করে লগইন বা একাউন্ট তৈরি করুন।'
                        : 'Please log in to your account to confirm order.',
                      'warning'
                    );
                    openAuthModal('login');
                  }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-sm font-bold shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <LogIn className="w-5 h-5 text-slate-950" />
                  <span>{language === 'bn' ? 'লগইন করে অর্ডার কনফার্ম করুন' : 'Sign In to Confirm Order'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00a6ff] hover:from-[#1275d8] hover:to-[#0092e0] text-white text-sm font-bold shadow-xl shadow-[#168BFF]/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>{language === 'bn' ? 'অর্ডার নিশ্চিত করুন' : 'Confirm & Place Order'}</span>
                </button>
              )}

              <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Genuine product guarantee & 7-day return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive bKash Gateway Modal */}
      {isBkashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#e2136e] rounded-2xl overflow-hidden shadow-2xl text-white animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 bg-[#d11265] flex items-center justify-between border-b border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white text-[#e2136e] font-extrabold flex items-center justify-center text-sm">
                  bK
                </div>
                <div>
                  <h4 className="font-bold text-sm">bKash Payment</h4>
                  <p className="text-[10px] text-pink-100">প্রাপক: {settings.supportPhone} ({settings.ownerName})</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-pink-200">Amount</p>
                <p className="font-bold text-sm tabular-nums">{formatBDT(grandTotal)}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 bg-white text-slate-800">
              {bkashStep === 'number' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 font-medium">
                    Enter your 11-digit bKash personal account number:
                  </p>
                  <input
                    type="tel"
                    value={bkashNumber}
                    onChange={e => setBkashNumber(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full p-3 rounded-lg border-2 border-pink-400 focus:outline-none text-center font-mono text-base font-bold text-slate-900 tracking-wider"
                  />
                  <p className="text-[10px] text-slate-500 text-center">
                    By clicking confirm, you agree to terms of bKash payment gateway
                  </p>
                </div>
              )}

              {bkashStep === 'otp' && (
                <div className="space-y-3 text-center">
                  <p className="text-xs text-slate-600 font-medium">
                    Enter 6-digit verification code sent to {bkashNumber}:
                  </p>
                  <input
                    type="text"
                    value={bkashOtp}
                    onChange={e => setBkashOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full p-3 rounded-lg border-2 border-pink-400 focus:outline-none text-center font-mono text-base font-bold text-slate-900 tracking-widest"
                  />
                  <p className="text-[10px] text-pink-600 font-semibold cursor-pointer">
                    Resend Code (28s)
                  </p>
                </div>
              )}

              {bkashStep === 'pin' && (
                <div className="space-y-3 text-center">
                  <p className="text-xs text-slate-600 font-medium">
                    Enter your 5-digit bKash PIN to authorize payment:
                  </p>
                  <input
                    type="password"
                    maxLength={5}
                    value={bkashPin}
                    onChange={e => setBkashPin(e.target.value)}
                    placeholder="•••••"
                    className="w-full p-3 rounded-lg border-2 border-pink-400 focus:outline-none text-center font-mono text-xl font-bold text-slate-900 tracking-widest"
                  />
                  <p className="text-[10px] text-slate-400">
                    Your PIN is encrypted and securely verified by bKash.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBkashModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBkash}
                  className="flex-1 py-2.5 rounded-lg bg-[#e2136e] hover:bg-[#c40e5d] text-xs font-bold text-white shadow-md"
                >
                  {bkashStep === 'pin' ? 'Pay Now' : 'Proceed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
