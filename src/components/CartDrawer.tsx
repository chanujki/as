import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Truck,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSafeImageSrc, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    cartTotalCount,
    formatBDT,
    settings,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    setCurrentView,
    language,
    t
  } = useApp();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isCartDrawerOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (!promoInput.trim()) return;
    const res = applyCouponCode(promoInput);
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setPromoInput('');
    }
  };

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-[420px] max-w-full bg-[#08172B] border-l border-slate-800 shadow-2xl flex flex-col justify-between h-full">
          {/* Header */}
          <div className="p-3.5 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#00D4FF]" />
              <h3 className="font-bold text-white text-sm sm:text-base">
                {t('cart')} ({cartTotalCount})
              </h3>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Ribbon */}
          <div className="bg-[#050914] px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Truck className="w-3.5 h-3.5 text-[#00D4FF]" />
                {amountNeeded === 0 ? (
                  <span className="text-emerald-400 font-semibold text-[11px] sm:text-xs">
                    🎉 Free Express Delivery Unlocked!
                  </span>
                ) : (
                  <span className="text-[11px] sm:text-xs">
                    Add <strong className="text-white tabular-nums">{formatBDT(amountNeeded)}</strong> for Free Delivery
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-500 tabular-nums">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#168BFF] to-[#00D4FF] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-4 divide-y divide-slate-800/60">
            {cart.length === 0 ? (
              <div className="py-16 sm:py-20 text-center space-y-4">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">{t('emptyCart')}</p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setCurrentView('shop');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#168BFF] text-white text-xs font-semibold"
                >
                  {t('continueShopping')}
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={`${item.product.id}-${item.selectedVariant || ''}-${idx}`} className="pt-3 sm:pt-4 first:pt-0 flex gap-3 items-start">
                  <img
                    src={getSafeImageSrc(item.product.thumbnail, DEFAULT_PRODUCT_IMAGE)}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg bg-slate-900 border border-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-white truncate">
                      {language === 'bn' ? (item.product.nameBn || item.product.name) : item.product.name}
                    </h4>
                    {item.selectedVariant && (
                      <p className="text-[10px] sm:text-[11px] text-slate-400">Variant: {item.selectedVariant}</p>
                    )}
                    <div className="text-xs font-bold text-[#00D4FF] tabular-nums">
                      {formatBDT(item.product.price)}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2.5 pt-0.5">
                      <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-md p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedVariant)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-white tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedVariant)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedVariant)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-3.5 sm:p-5 bg-[#050914] border-t border-slate-800 space-y-3 sm:space-y-4">
              {/* Promo Code Input */}
              {appliedCoupon ? (
                <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="font-bold">{appliedCoupon.code}</span>
                    <span className="text-[11px]">({appliedCoupon.description})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-slate-400 hover:text-rose-400 text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Coupon Code (e.g. TECHBOOST)"
                      className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#168BFF]"
                    />
                    <button
                      type="submit"
                      className="px-3 sm:px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-[11px] text-rose-400">{promoError}</p>}
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-bold text-white tabular-nums">{formatBDT(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="tabular-nums">
                    {amountNeeded === 0 ? (
                      <span className="text-emerald-400 font-bold">FREE</span>
                    ) : (
                      'From ৳60'
                    )}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="tabular-nums font-bold">
                      -{appliedCoupon.discountType === 'percentage'
                        ? `${appliedCoupon.discountValue}%`
                        : `৳${appliedCoupon.discountValue}`}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>{t('total')}</span>
                  <span className="text-[#00D4FF] tabular-nums text-base">
                    {formatBDT(cartSubtotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00a6ff] hover:from-[#1275d8] hover:to-[#0092e0] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#168BFF]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>{t('checkout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
