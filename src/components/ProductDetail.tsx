import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Heart,
  ShoppingCart,
  Share2,
  Plus,
  Minus,
  MessageSquare,
  HelpCircle,
  Sparkles,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { getSafeImageSrc, DEFAULT_PRODUCT_IMAGE, handleImageError } from '../utils/imageUtils';

export const ProductDetail: React.FC<{ product: Product }> = ({ product }) => {
  const {
    setCurrentView,
    addToCart,
    toggleWishlist,
    isInWishlist,
    formatBDT,
    products,
    openProductDetail,
    showToast,
    language,
    t,
    settings
  } = useApp();

  const [selectedImg, setSelectedImg] = useState(
    getSafeImageSrc(product.images?.[0] || product.thumbnail, DEFAULT_PRODUCT_IMAGE)
  );
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.options[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'qa'>('desc');

  // Review submission state
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewCity, setNewReviewCity] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [userReviews, setUserReviews] = useState<any[]>([]);

  // QA submission state
  const [newQuestion, setNewQuestion] = useState('');
  const [qaList, setQaList] = useState<any[]>([
    {
      id: 'qa-01',
      question: 'Is this compatible with standard USB-C and Windows/Mac systems?',
      askedBy: 'Customer Question',
      date: '2026-10-20',
      answer: 'Yes, full compatibility is supported with plug-and-play operation.',
      answeredBy: 'AS Computer Support'
    }
  ]);

  const isWish = isInWishlist(product.id);

  // Bundle recommendation (e.g. keyboard + mouse or fan + cable)
  const bundleProduct = products.find(p => p.id !== product.id && p.category !== product.category) || products[0];

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      showToast('Please fill all review fields', 'warning');
      return;
    }
    const newRev = {
      id: `rev-${Date.now()}`,
      userName: newReviewName,
      userCity: newReviewCity || 'Dhaka, BD',
      rating: newReviewRating,
      date: new Date().toISOString().split('T')[0],
      comment: newReviewComment,
      verifiedPurchase: true
    };
    setUserReviews(prev => [newRev, ...prev]);
    setNewReviewName('');
    setNewReviewCity('');
    setNewReviewComment('');
    showToast('Your verified review was submitted!', 'success');
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const newQa = {
      id: `qa-${Date.now()}`,
      question: newQuestion,
      askedBy: 'Customer',
      date: new Date().toISOString().split('T')[0],
      answer: 'Thank you for your question. Our tech team will post a verified answer within 2 hours.',
      answeredBy: 'AS Computer Care'
    };
    setQaList(prev => [newQa, ...prev]);
    setNewQuestion('');
    showToast('Question submitted to support!', 'success');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddBundle = () => {
    addToCart(product, 1, selectedVariant);
    addToCart(bundleProduct, 1);
    showToast('Bundle added to your cart with combo savings!', 'success');
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="py-8 bg-[#050914] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Back Button */}
        <button
          onClick={() => setCurrentView('shop')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#00D4FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'ক্যাটালগে ফিরে যান' : 'Back to Products'}</span>
        </button>

        {/* Top Product Showcase (Gallery Left, Purchase Module Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Gallery (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#08172B] border border-slate-800 shadow-xl group">
              <img
                src={getSafeImageSrc(selectedImg || product.thumbnail, DEFAULT_PRODUCT_IMAGE)}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 cursor-zoom-in"
              />
              {product.badges && product.badges.length > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="px-2.5 py-1 rounded bg-[#168BFF] text-white text-xs font-bold uppercase tracking-wider shadow-md">
                    {product.badges[0]}
                  </span>
                </div>
              )}
            </div>

            {/* 2 Thumbnail View Options Below Main Image */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  {language === 'bn' ? 'ছবি নির্বাচন করুন (ক্লিক করে পরিবর্তন করুন):' : 'Select View Option:'}
                </span>
                <span className="text-[11px] text-[#00D4FF]">
                  {language === 'bn' ? 'নিচে ২টি ভিউ অপশন' : '2 Image Views'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {((product.images && product.images.filter(Boolean).length >= 2)
                  ? product.images.filter(Boolean).slice(0, 2)
                  : [product.thumbnail, product.images?.[1] || product.thumbnail].filter(Boolean)
                ).map((rawImg, idx) => {
                  const safeImg = getSafeImageSrc(rawImg, product.thumbnail);
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedImg(safeImg)}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                        selectedImg === safeImg
                          ? 'bg-[#168BFF]/20 border-[#00D4FF] ring-2 ring-[#00D4FF]/40 shadow-lg'
                          : 'bg-[#08172B] border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                        <img
                          src={safeImg}
                          alt={`${product.name} view ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-white">
                          {language === 'bn' ? `ভিউ অপশন ${idx + 1}` : `View ${idx + 1}`}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {idx === 0
                            ? (language === 'bn' ? 'প্রধান ছবি (Main)' : 'Front Angle')
                            : (language === 'bn' ? 'অতিরিক্ত ছবি (Angle)' : 'Side Angle')}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* If there are more than 2 images (e.g. 3rd image), show additional mini selector below */}
              {product.images && product.images.filter(Boolean).length > 2 && (
                <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                  <span className="text-[10px] text-slate-400">সকল ছবি:</span>
                  {product.images.filter(Boolean).map((rawImg, idx) => {
                    const safeImg = getSafeImageSrc(rawImg, product.thumbnail);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImg(safeImg)}
                        className={`w-9 h-9 rounded-lg overflow-hidden border transition-all shrink-0 ${
                          selectedImg === safeImg ? 'border-[#00D4FF] ring-1 ring-[#00D4FF]' : 'border-slate-800 opacity-60'
                        }`}
                      >
                        <img
                          src={safeImg}
                          alt=""
                          onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Contiguous Purchase Module (6 cols) */}
          <div className="lg:col-span-6 space-y-6 bg-[#08172B]/60 border border-slate-800 p-6 sm:p-8 rounded-2xl">
            {/* Meta */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="uppercase tracking-wider font-semibold text-slate-300">
                  {product.brand} · {product.category.replace('-', ' ')}
                </span>
                <span className="font-mono text-slate-500">SKU: {product.sku}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {language === 'bn' ? (product.nameBn || product.name) : product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="flex items-center gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-white tabular-nums">{product.rating}</span>
                </div>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">({product.reviewCount} customer reviews)</span>
                <span className="text-slate-500">·</span>
                <span className={`font-semibold ${product.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-white tabular-nums tracking-tight">
                  {formatBDT(product.price)}
                </div>
                {product.originalPrice && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="line-through tabular-nums text-slate-500">{formatBDT(product.originalPrice)}</span>
                    <span className="text-[#00D4FF] font-bold">Save {product.discountPercent}%</span>
                  </div>
                )}
              </div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                Inclusive of all taxes in BD
              </span>
            </div>

            {/* Product Description Summary (Directly Visible) */}
            {product.description && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 shadow-inner">
                <div className="flex items-center justify-between text-xs font-bold text-[#00D4FF]">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'পণ্যের বিবরণ (Description)' : 'Product Description'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">বিস্তারিত নিচে দেখুন</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line line-clamp-4">
                  {language === 'bn' ? (product.descriptionBn || product.description) : product.description}
                </p>
              </div>
            )}

            {/* Variants Selector (if applicable) */}
            {product.variants && (
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Select {product.variants.type}: <span className="text-[#00D4FF] font-normal">{selectedVariant}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setSelectedVariant(opt)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border ${
                        selectedVariant === opt
                          ? 'bg-[#168BFF] text-white border-[#168BFF] shadow-sm'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Buy Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-white tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product, quantity, selectedVariant)}
                  className="flex-1 py-3 px-4 rounded-lg bg-[#168BFF]/20 hover:bg-[#168BFF]/30 text-[#00D4FF] hover:text-white border border-[#168BFF]/50 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t('addToCart')}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3 px-4 rounded-lg bg-[#168BFF] hover:bg-[#1272d4] text-white text-xs font-bold transition-all shadow-lg shadow-[#168BFF]/25"
                >
                  {t('buyNow')}
                </button>
              </div>

              {/* Wishlist & Compare actions */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    isWish ? 'text-rose-400 font-semibold' : 'hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWish ? 'fill-current' : ''}`} />
                  <span>{isWish ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('Product link copied to clipboard', 'info');
                  }}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Delivery & Warranty Estimates for Bangladesh */}
            <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#00D4FF] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Delivery to Dhaka:</span> Next Day Delivery (৳{settings.shippingFeeInsideDhaka} or Free over ৳{settings.freeShippingThreshold})
                  <br />
                  <span className="font-bold text-white">Outside Dhaka:</span> 2–3 Days across 64 districts (৳{settings.shippingFeeOutsideDhaka})
                </div>
              </div>

              {/* Dynamic Product-Specific Warranty */}
              {(() => {
                const w = (product.warranty || '').trim();
                const isNoWarranty = !w || w.toLowerCase() === 'no warranty' || w.toLowerCase().includes('নো ওয়ারেন্টি') || w.toLowerCase() === 'none' || w === 'নাই';
                if (isNoWarranty) {
                  return (
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-400">Warranty:</span>{' '}
                        <span className="text-slate-400 font-medium">{language === 'bn' ? 'কোনো ওয়ারেন্টি প্রযোজ্য নয় (No Warranty)' : 'No Warranty'}</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white">Warranty:</span>{' '}
                      <span className="text-emerald-300 font-semibold">{w}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Dynamic Product-Specific Return / Replacement Policy */}
              {(() => {
                const r = (product.returnPolicy || '').trim();
                const isNoReturn = r.toLowerCase().includes('no return') || r.toLowerCase().includes('no replacement') || r.toLowerCase().includes('রিপ্লেসমেন্ট নেই') || r.toLowerCase().includes('প্রযোজ্য নয়');
                if (isNoReturn) {
                  return (
                    <div className="flex items-center gap-2.5">
                      <RotateCcw className="w-4 h-4 text-slate-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-400">Easy Returns:</span>{' '}
                        <span className="text-slate-400 font-medium">{r || (language === 'bn' ? 'রিপ্লেসমেন্ট সুবিধা প্রযোজ্য নয় (Non-returnable)' : 'No Replacement / Non-returnable')}</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 text-[#00D4FF] shrink-0" />
                    <div>
                      <span className="font-bold text-white">Easy Returns:</span>{' '}
                      <span className="text-cyan-300 font-semibold">{r || '7 Days Replacement for physical defects'}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Frequently Bought Together Bundle */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#08172B] via-[#0c1c36] to-[#08172B] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Frequently Bought Together</span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <img
                  src={getSafeImageSrc(product.thumbnail, DEFAULT_PRODUCT_IMAGE)}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-cover rounded-lg bg-slate-900 border border-slate-700"
                />
                <div>
                  <p className="text-xs font-bold text-white max-w-[200px] truncate">{product.name}</p>
                  <p className="text-xs text-[#00D4FF] font-semibold tabular-nums">{formatBDT(product.price)}</p>
                </div>
              </div>

              <span className="text-lg font-bold text-slate-500">+</span>

              <div className="flex items-center gap-3">
                <img
                  src={getSafeImageSrc(bundleProduct.thumbnail, DEFAULT_PRODUCT_IMAGE)}
                  alt={bundleProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-cover rounded-lg bg-slate-900 border border-slate-700"
                />
                <div>
                  <p className="text-xs font-bold text-white max-w-[200px] truncate">{bundleProduct.name}</p>
                  <p className="text-xs text-[#00D4FF] font-semibold tabular-nums">{formatBDT(bundleProduct.price)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-400">Combo Total</p>
                <p className="text-xl font-bold text-white tabular-nums">
                  {formatBDT(product.price + bundleProduct.price)}
                </p>
              </div>

              <button
                onClick={handleAddBundle}
                className="px-5 py-2.5 rounded-lg bg-[#168BFF] hover:bg-[#1272d4] text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
              >
                Add Both to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Tabbed Section: Description / Technical Specs / Customer Reviews / Q&A */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 text-sm overflow-x-auto">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-3 font-semibold transition-colors relative flex items-center gap-1.5 shrink-0 ${
                activeTab === 'desc'
                  ? 'text-[#00D4FF]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{language === 'bn' ? 'পণ্যের বিবরণ (Description)' : 'Product Description'}</span>
              {activeTab === 'desc' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D4FF]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 font-semibold transition-colors relative shrink-0 ${
                activeTab === 'specs'
                  ? 'text-[#00D4FF]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{language === 'bn' ? 'স্পেসিফিকেশন' : 'Technical Specifications'}</span>
              {activeTab === 'specs' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D4FF]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 font-semibold transition-colors relative flex items-center gap-1.5 shrink-0 ${
                activeTab === 'reviews'
                  ? 'text-[#00D4FF]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{language === 'bn' ? 'কাস্টমার রিভিউ' : 'Customer Reviews'} ({userReviews.length})</span>
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D4FF]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('qa')}
              className={`pb-3 font-semibold transition-colors relative flex items-center gap-1.5 shrink-0 ${
                activeTab === 'qa'
                  ? 'text-[#00D4FF]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{language === 'bn' ? 'প্রশ্ন ও উত্তর' : 'Questions & Answers'} ({qaList.length})</span>
              {activeTab === 'qa' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D4FF]" />
              )}
            </button>
          </div>

          {/* Description Tab Content */}
          {activeTab === 'desc' && (
            <div className="p-6 rounded-2xl bg-[#08172B]/60 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#00D4FF]" />
                  <span>{language === 'bn' ? 'পণ্যের বিস্তারিত বিবরণ' : 'Detailed Product Description'}</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  SKU: {product.sku}
                </span>
              </div>

              {/* Full Multi-paragraph formatted description */}
              <div className="text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-line bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
                {language === 'bn' ? (product.descriptionBn || product.description) : product.description}
              </div>

              {/* Quick specs / policy highlights cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 block text-[11px] font-medium">ব্র্যান্ড ও ক্যাটাগরি:</span>
                  <span className="font-bold text-white text-sm">{product.brand} · {product.category}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 block text-[11px] font-medium">ওয়ারেন্টি পলিসি:</span>
                  <span className="font-bold text-emerald-400 text-sm">{product.warranty || 'No Warranty'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 block text-[11px] font-medium">রিপ্লেসমেন্ট সুবিধা:</span>
                  <span className="font-bold text-[#00D4FF] text-sm">{product.returnPolicy || '7 Days Replacement'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Specs Tab */}
          {activeTab === 'specs' && (
            <div className="p-6 rounded-2xl bg-[#08172B]/60 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Hardware & Engineering Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-slate-800/80 text-xs">
                    <span className="text-slate-400 font-medium">{key}</span>
                    <span className="text-slate-100 font-semibold text-right tabular-nums">{value}</span>
                  </div>
                ))}
                {product.compatibility && (
                  <div className="flex justify-between py-2 border-b border-slate-800/80 text-xs">
                    <span className="text-slate-400 font-medium">Verified Compatibility</span>
                    <span className="text-emerald-400 font-semibold text-right">{product.compatibility}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Review Form */}
              <div className="p-6 rounded-2xl bg-[#08172B]/70 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white">Write a Verified Review</h4>
                <form onSubmit={handleAddReview} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={newReviewName}
                    onChange={e => setNewReviewName(e.target.value)}
                    placeholder="আপনার নাম বা পদবী (Name)"
                    className="bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-[#168BFF]"
                  />
                  <input
                    type="text"
                    value={newReviewCity}
                    onChange={e => setNewReviewCity(e.target.value)}
                    placeholder="শহর বা জেলা (City / District)"
                    className="bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-[#168BFF]"
                  />
                  <div className="sm:col-span-2 flex items-center gap-2 text-xs text-slate-300">
                    <span>Rating:</span>
                    <select
                      value={newReviewRating}
                      onChange={e => setNewReviewRating(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 text-xs text-white p-1 rounded"
                    >
                      <option value="5">5 Stars - Outstanding</option>
                      <option value="4">4 Stars - Very Good</option>
                      <option value="3">3 Stars - Average</option>
                    </select>
                  </div>
                  <textarea
                    rows={3}
                    value={newReviewComment}
                    onChange={e => setNewReviewComment(e.target.value)}
                    placeholder="প্রোডাক্ট সম্পর্কে আপনার মূল্যবান মতামত লিখুন..."
                    className="sm:col-span-2 bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-[#168BFF]"
                  />
                  <button
                    type="submit"
                    className="sm:col-span-2 py-2.5 px-4 rounded-lg bg-[#168BFF] text-white text-xs font-bold hover:bg-[#1272d4] transition-colors"
                  >
                    রিভিউ সাবমিট করুন (Submit Review)
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {userReviews.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-[#08172B]/60 border border-slate-800 text-slate-400 text-xs">
                    এখনো কোনো পাবলিক রিভিউ যুক্ত হয়নি। আপনার মতামত জানাতে ওপরের ফর্মটি পূরণ করুন।
                  </div>
                ) : (
                  userReviews.map(r => (
                    <div key={r.id} className="p-4 rounded-xl bg-[#08172B]/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{r.userName}</span>
                          <span className="text-[11px] text-slate-400">({r.userCity})</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Verified Purchase</span>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300">{r.comment}</p>
                      <div className="text-[10px] text-slate-500 font-mono">{r.date}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Q&A Tab */}
          {activeTab === 'qa' && (
            <div className="space-y-6">
              {/* Question input */}
              <form onSubmit={handleAddQuestion} className="flex gap-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  placeholder="Ask a technical or compatibility question..."
                  className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-[#168BFF]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-[#168BFF] text-white text-xs font-bold hover:bg-[#1272d4] transition-colors shrink-0"
                >
                  Ask Question
                </button>
              </form>

              <div className="space-y-4">
                {qaList.map(item => (
                  <div key={item.id} className="p-4 rounded-xl bg-[#08172B]/60 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <HelpCircle className="w-4 h-4 text-[#00D4FF]" />
                      <span>{item.question}</span>
                    </div>
                    <div className="pl-6 text-xs text-slate-300 space-y-1">
                      <p>{item.answer}</p>
                      <p className="text-[10px] text-[#00D4FF] font-semibold">— {item.answeredBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-slate-800">
            <h3 className="text-xl font-bold text-white">Related Accessories in this Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
