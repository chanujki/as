import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Heart,
  Scale,
  MapPin,
  Lock,
  RotateCcw,
  Headphones,
  Printer,
  ChevronRight,
  Truck,
  CheckCircle2,
  Trash2,
  ExternalLink,
  LogIn,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSafeImageSrc, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';

export const CustomerDashboard: React.FC = () => {
  const {
    orders,
    deleteOrder,
    updateOrderStatus,
    wishlist,
    products,
    toggleWishlist,
    addToCart,
    compareList,
    removeFromCompare,
    formatBDT,
    setInvoiceOrder,
    openProductDetail,
    setCurrentView,
    showToast,
    language,
    currentUser,
    isAdmin,
    openAuthModal,
    logout,
    updateUserProfile
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'warranty' | 'settings'>('orders');
  const [confirmDeleteCustOrderId, setConfirmDeleteCustOrderId] = useState<string | null>(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileAddress, setProfileAddress] = useState(currentUser?.address || '');

  React.useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfilePhone(currentUser.phone || '');
      setProfileAddress(currentUser.address || '');
    }
  }, [currentUser]);

  // Warranty form state
  const [claimOrderId, setClaimOrderId] = useState(orders[0]?.id || '');
  const [claimReason, setClaimReason] = useState('Hardware Fault / Defect');
  const [claimDescription, setClaimDescription] = useState('');
  const [warrantySubmitted, setWarrantySubmitted] = useState(false);

  // Wishlist products
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const handleWarrantySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimDescription.trim()) {
      showToast('Please provide details for the warranty claim', 'warning');
      return;
    }
    setWarrantySubmitted(true);
    showToast('Warranty claim ticket #WR-4920 submitted! Our technical support team will contact you within 24 hours.', 'success');
  };

  return (
    <div className="py-8 bg-[#050914] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Profile Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#08172B] via-[#0c1c36] to-[#08172B] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#168BFF] to-[#00D4FF] p-0.5 shadow-xl shadow-[#168BFF]/20 shrink-0">
              <div className="w-full h-full bg-[#050914] rounded-[14px] flex items-center justify-center text-white text-xl font-extrabold">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'AS'}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {currentUser ? currentUser.name : (language === 'bn' ? 'গ্রাহক অ্যাকাউন্ট' : 'Customer Account')}
                </h1>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                  currentUser?.role === 'admin'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {currentUser ? (currentUser.role === 'admin' ? 'Store Admin' : 'Verified Member') : 'Guest'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser?.email || currentUser?.phone || 'অর্ডার ইতিহাস, ট্র্যাকিং ও ডেলিভারি স্ট্যাটাস'}
              </p>
              <p className="text-[11px] text-slate-500">Dhaka & Nationwide Coverage · AS Computer Bangladesh</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentUser ? (
              <>
                {isAdmin && (
                  <button
                    onClick={() => setCurrentView('admin')}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>অ্যাডমিন ড্যাশবোর্ড</span>
                  </button>
                )}
                <button
                  onClick={logout}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগআউট</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00D4FF] hover:from-[#1272d4] hover:to-[#00b4d8] text-white text-xs font-bold shadow-lg flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'bn' ? 'লগইন / নতুন অ্যাকাউন্ট' : 'Sign In / Register'}</span>
              </button>
            )}

            <button
              onClick={() => setCurrentView('shop')}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              {language === 'bn' ? 'শপে ফিরুন' : 'Continue Shopping'}
            </button>
          </div>
        </div>

        {/* Dashboard Grid (Sidebar + Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar (3 cols) */}
          <aside className="lg:col-span-3 bg-[#08172B]/70 border border-slate-800 rounded-2xl p-4 space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#168BFF] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Order History</span>
              </div>
              <span className="tabular-nums px-1.5 py-0.2 rounded bg-black/20 text-[10px]">{orders.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'wishlist'
                  ? 'bg-[#168BFF] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4" />
                <span>My Wishlist</span>
              </div>
              <span className="tabular-nums px-1.5 py-0.2 rounded bg-black/20 text-[10px]">{wishlistedProducts.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'addresses'
                  ? 'bg-[#168BFF] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('warranty')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'warranty'
                  ? 'bg-[#168BFF] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4" />
                <span>Warranty & Returns</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#168BFF] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4" />
                <span>Security & Password</span>
              </div>
            </button>
          </aside>

          {/* Right Main Content (9 cols) */}
          <main className="lg:col-span-9 space-y-6">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Your Orders & Tracking</h3>
                  <span className="text-xs text-slate-400">{orders.length} total orders</span>
                </div>

                {orders.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-[#08172B]/60 border border-slate-800 space-y-3">
                    <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">No orders placed yet.</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <div
                      key={order.id}
                      className="p-6 rounded-2xl bg-[#08172B]/70 border border-slate-800 space-y-4 shadow-sm"
                    >
                      {/* Top Bar of Order */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-white text-sm">#{order.id}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : order.orderStatus === 'Shipped'
                              ? 'bg-[#168BFF]/15 text-[#00D4FF] border border-[#168BFF]/30'
                              : order.orderStatus === 'Cancelled' || order.orderStatus === 'Rejected'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}>
                            {order.orderStatus}
                          </span>
                          <button
                            onClick={() => setInvoiceOrder(order)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-[#168BFF] transition-colors"
                            title="Print Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={getSafeImageSrc(it.thumbnail, DEFAULT_PRODUCT_IMAGE)}
                                alt={it.productName}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 object-cover rounded-lg bg-slate-900 border border-slate-800 shrink-0"
                              />
                              <div>
                                <p className="font-semibold text-white">{it.productName}</p>
                                <p className="text-[11px] text-slate-400">
                                  Qty: {it.quantity} {it.variant ? `· ${it.variant}` : ''}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-white tabular-nums">
                              {formatBDT(it.price * it.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Courier & Tracking info */}
                      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#00D4FF]" />
                          <span>
                            Courier: <strong className="text-white">{order.courierName || 'Steadfast'}</strong> | Tracking: <span className="font-mono text-[#00D4FF]">{order.trackingNumber}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span>Total Paid: </span>
                          <strong className="text-base text-white tabular-nums font-bold">
                            {formatBDT(order.total)}
                          </strong>
                        </div>
                      </div>

                      {/* Customer Order Actions: Cancel or Delete from Dashboard */}
                      <div className="pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          {order.orderStatus === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                updateOrderStatus(order.id, 'Cancelled');
                                showToast(`অর্ডার #${order.id} বাতিল করা হয়েছে`, 'info');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-[11px] font-semibold transition-colors"
                            >
                              অর্ডার বাতিল করুন
                            </button>
                          )}
                          {order.orderStatus === 'Cancelled' && (
                            <span className="text-[11px] text-rose-400 font-medium">
                              (এই অর্ডারটি ক্যানসেল করা হয়েছে)
                            </span>
                          )}
                        </div>

                        {/* Delete Order option */}
                        {confirmDeleteCustOrderId === order.id ? (
                          <div className="flex items-center gap-1.5 bg-rose-950/90 border border-rose-500/60 px-2.5 py-1 rounded-lg shadow-md animate-fadeIn ml-auto">
                            <span className="text-[11px] text-rose-200 font-bold">স্থায়ীভাবে মুছবেন?</span>
                            <button
                              type="button"
                              onClick={() => {
                                deleteOrder(order.id);
                                setConfirmDeleteCustOrderId(null);
                                showToast(`অর্ডার #${order.id} ড্যাশবোর্ড থেকে মুছে ফেলা হয়েছে`, 'info');
                              }}
                              className="px-2.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shadow"
                            >
                              হ্যাঁ, মুছুন
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteCustOrderId(null)}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                            >
                              না
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteCustOrderId(order.id)}
                            className="text-slate-400 hover:text-rose-400 text-[11px] font-semibold flex items-center gap-1 ml-auto transition-colors"
                            title="তালিকা থেকে এই অর্ডারটি মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>ড্যাশবোর্ড থেকে ডিলিট করুন</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Your Saved Wishlist ({wishlistedProducts.length})</h3>
                {wishlistedProducts.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-[#08172B]/60 border border-slate-800 space-y-3">
                    <Heart className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">Your wishlist is currently empty.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistedProducts.map(p => (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-[#08172B]/70 border border-slate-800 flex items-center gap-4 justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={getSafeImageSrc(p.thumbnail, DEFAULT_PRODUCT_IMAGE)}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 object-cover rounded-lg bg-slate-900 border border-slate-800 shrink-0"
                          />
                          <div>
                            <h4
                              onClick={() => openProductDetail(p)}
                              className="text-xs font-bold text-white hover:text-[#00D4FF] cursor-pointer line-clamp-1"
                            >
                              {p.name}
                            </h4>
                            <p className="text-xs font-bold text-[#00D4FF] tabular-nums mt-0.5">
                              {formatBDT(p.price)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="px-3 py-1.5 rounded-lg bg-[#168BFF] text-white text-xs font-semibold hover:bg-[#1272d4]"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Saved Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">ডেলিভারি ঠিকানা (Saved Delivery Addresses)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#08172B]/70 border border-[#168BFF]/40 space-y-2 text-xs relative">
                    <span className="text-[10px] bg-[#168BFF]/20 text-[#00D4FF] border border-[#168BFF]/30 px-2 py-0.5 rounded font-bold">
                      Primary Address (Dhaka)
                    </span>
                    <h5 className="font-bold text-white text-sm">হোম ডেলিভারি (Home Delivery)</h5>
                    <p className="text-slate-300">Mirpur DOHS / Banani Area</p>
                    <p className="text-slate-400">Dhaka City, Dhaka Division</p>
                    <p className="text-slate-400 font-mono">Courier: Regular Express</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#08172B]/50 border border-slate-800 space-y-2 text-xs">
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold">
                      Secondary Address (Outside Dhaka)
                    </span>
                    <h5 className="font-bold text-white text-sm">অফিস / জেলা ডেলিভারি (District Delivery)</h5>
                    <p className="text-slate-300">District HQ / Central Hub</p>
                    <p className="text-slate-400">All 64 Districts Coverage</p>
                    <p className="text-slate-400 font-mono">Courier: Steadfast / RedX</p>
                  </div>
                </div>
              </div>
            )}

            {/* Warranty & Returns Tab */}
            {activeTab === 'warranty' && (
              <div className="p-6 rounded-2xl bg-[#08172B]/70 border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Submit Warranty / Return Claim</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    AS Computer provides hassle-free official brand warranty support for customers in Bangladesh.
                  </p>
                </div>

                {warrantySubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Your warranty ticket #WR-4920 has been registered. Our technician in Dhaka will contact your phone.</span>
                  </div>
                ) : (
                  <form onSubmit={handleWarrantySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-200">Select Order</label>
                        <select
                          value={claimOrderId}
                          onChange={e => setClaimOrderId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-lg"
                        >
                          {orders.map(o => (
                            <option key={o.id} value={o.id}>Order #{o.id} ({formatBDT(o.total)})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-200">Issue Category</label>
                        <select
                          value={claimReason}
                          onChange={e => setClaimReason(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-lg"
                        >
                          <option>Hardware Fault / Defect</option>
                          <option>Cable / Port Connection Issue</option>
                          <option>Damaged during transit</option>
                          <option>Missing accessory in package</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">Detailed Description of Issue</label>
                      <textarea
                        rows={3}
                        value={claimDescription}
                        onChange={e => setClaimDescription(e.target.value)}
                        placeholder="Please explain what is happening with the device..."
                        className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-3 rounded-lg focus:outline-none focus:border-[#168BFF]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-[#168BFF] text-white text-xs font-bold hover:bg-[#1272d4] transition-colors"
                    >
                      Submit Warranty Request
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Profile & Account Settings Tab */}
            {activeTab === 'settings' && (
              <div className="p-6 rounded-2xl bg-[#08172B]/70 border border-slate-800 space-y-5 max-w-lg">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {language === 'bn' ? 'অ্যাকাউন্ট ও প্রোফাইল সেটিংস' : 'Account & Profile Settings'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'bn' ? 'আপনার নাম, মোবাইল নাম্বার ও ঠিকানা আপডেট করুন' : 'Update your contact details and default delivery address'}
                  </p>
                </div>

                {currentUser ? (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      updateUserProfile({
                        name: profileName.trim(),
                        phone: profilePhone.trim(),
                        address: profileAddress.trim()
                      });
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">
                        {language === 'bn' ? 'আপনার নাম (Full Name)' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-[#168BFF]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">
                        {language === 'bn' ? 'মোবাইল নাম্বার (Phone Number)' : 'Contact Phone'}
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={e => setProfilePhone(e.target.value)}
                        placeholder="01723-373133"
                        className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl font-mono focus:outline-none focus:border-[#168BFF]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">
                        {language === 'bn' ? 'ইমেইল এড্রেস (Email Address)' : 'Email'}
                      </label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email || '—'}
                        className="w-full bg-slate-950/60 border border-slate-800 text-slate-400 p-2.5 rounded-xl font-mono cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">
                        {language === 'bn' ? 'ডিফল্ট ডেলিভারি ঠিকানা (Primary Shipping Address)' : 'Delivery Address'}
                      </label>
                      <textarea
                        rows={2}
                        value={profileAddress}
                        onChange={e => setProfileAddress(e.target.value)}
                        placeholder="বাড়ি/রোড, এলাকা, থানা..."
                        className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-[#168BFF]"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#00D4FF] hover:from-[#1272d4] hover:to-[#00b4d8] text-white font-bold transition-all shadow-md active:scale-95"
                      >
                        {language === 'bn' ? 'প্রোফাইল সংরক্ষণ করুন' : 'Save Profile Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6 text-center rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <User className="w-10 h-10 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-300">
                      {language === 'bn'
                        ? 'প্রোফাইল দেখতে এবং পরিবর্তন করতে আপনার অ্যাকাউন্টে লগইন করুন।'
                        : 'Please log in to manage your profile and saved addresses.'}
                    </p>
                    <button
                      onClick={() => openAuthModal('login')}
                      className="px-5 py-2.5 rounded-xl bg-[#168BFF] text-white font-bold text-xs"
                    >
                      {language === 'bn' ? 'লগইন করুন' : 'Sign In Now'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
