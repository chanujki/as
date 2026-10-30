import React, { useState } from 'react';
import { ArrowRight, Star, Quote, CheckCircle2, Mail, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { INITIAL_REVIEWS } from '../data/mockProducts';

export const HomeFeaturedSections: React.FC = () => {
  const {
    products,
    setCurrentView,
    setSelectedCategory,
    language,
    t,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers' | 'newarrivals'>('featured');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const displayedProducts = products
    .filter(p => {
      if (activeTab === 'featured') return p.isFeatured;
      if (activeTab === 'bestsellers') return p.isBestSeller;
      if (activeTab === 'newarrivals') return p.isNewArrival;
      return true;
    })
    .slice(0, 8);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast(language === 'bn' ? 'সঠিক ইমেইল এড্রেস লিখুন' : 'Please enter a valid email address', 'warning');
      return;
    }
    setNewsletterSubscribed(true);
    showToast(language === 'bn' ? 'সাবস্ক্রিপশন সম্পন্ন হয়েছে!' : 'Subscribed to tech newsletter!', 'success');
  };

  const budgetTiers = [
    { label: 'Under ৳1,500', labelBn: '৳১,৫০০ এর নিচে', maxPrice: 1500 },
    { label: '৳1,500 – ৳3,500', labelBn: '৳১,৫০০ – ৳৩,৫০০', minPrice: 1500, maxPrice: 3500 },
    { label: '৳3,500 – ৳7,000', labelBn: '৳৩,৫০০ – ৳৭,০০০', minPrice: 3500, maxPrice: 7000 },
    { label: 'Premium ৳7,000+', labelBn: 'প্রিমিয়াম ৳৭,০০০+', minPrice: 7000 },
  ];

  return (
    <div className="space-y-16 py-12 bg-[#050914]">
      {/* 1. Curated Products Showcase with Tab Switches */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
              Catalog Highlights
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {activeTab === 'featured'
                ? t('featuredProducts')
                : activeTab === 'bestsellers'
                ? t('bestSellers')
                : t('newArrivals')}
            </h2>
          </div>

          {/* Tab Filter Controls */}
          <div className="flex items-center gap-1 p-1 bg-[#08172B] border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'featured'
                  ? 'bg-[#168BFF] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('featuredProducts')}
            </button>
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'bestsellers'
                  ? 'bg-[#168BFF] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('bestSellers')}
            </button>
            <button
              onClick={() => setActiveTab('newarrivals')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'newarrivals'
                  ? 'bg-[#168BFF] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('newArrivals')}
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setCurrentView('shop');
            }}
            className="px-6 py-2.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-[#168BFF] text-slate-200 hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-2 group"
          >
            <span>{language === 'bn' ? 'পুরো ক্যাটালগ দেখুন' : 'Explore All Products'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* 2. Shop by Budget Strips */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
            Price Filters
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {language === 'bn' ? 'বাজেট অনুযায়ী গ্যাজেট খুঁজুন' : 'Shop by Budget'}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {budgetTiers.map((tier, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedCategory('all');
                setCurrentView('shop');
              }}
              className="p-5 rounded-xl bg-[#08172B]/60 hover:bg-[#0c1c36] border border-slate-800 hover:border-[#168BFF]/50 transition-all text-left flex flex-col justify-between group shadow-sm"
            >
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Budget Range</p>
                <h4 className="text-base sm:text-lg font-bold text-white mt-1 group-hover:text-[#00D4FF] transition-colors">
                  {language === 'bn' ? tier.labelBn : tier.label}
                </h4>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400 group-hover:text-white">
                <span>View Products</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Customer Testimonials (if present) */}
      {INITIAL_REVIEWS.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
              Verified Feedback
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {language === 'bn' ? 'গ্রাহকদের মতামত' : 'Customer Feedback'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_REVIEWS.map(rev => (
              <div
                key={rev.id}
                className="p-6 rounded-2xl bg-[#08172B]/70 border border-slate-800/80 relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400 gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Buyer</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-white">{rev.userName}</h5>
                    <p className="text-[11px] text-slate-400">{rev.userCity}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Newsletter Subscription */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-[#08172B] via-[#0c1c36] to-[#08172B] border border-slate-800 p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#168BFF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#00D4FF]">
              <Mail className="w-4 h-4" />
              <span>{language === 'bn' ? 'টেক নিউজলেটার' : 'Exclusive Access & Secret Drops'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              {language === 'bn'
                ? 'নতুন গ্যাজেট ও অফারের আপডেট পান সবার আগে'
                : 'Stay Ahead with AS Computer Tech Updates'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {language === 'bn'
                ? 'আমাদের নিউজলেটারে সাবস্ক্রাইব করুন এবং আপনার প্রথম অর্ডারে ২০০ টাকা ছাড় পান।'
                : 'Subscribe to our newsletter for flash sales, newly arrived PC components, and unlock ৳200 flat discount.'}
            </p>

            {newsletterSubscribed ? (
              <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'ধন্যবাদ! আপনার ইমেইলে ওয়েলকাম কুপন পাঠানো হয়েছে।'
                    : 'Thank you! You are now subscribed. Use code ASWELCOME for ৳200 OFF!'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 bg-[#050914] text-xs text-white placeholder-slate-500 px-4 py-3 rounded-lg border border-slate-700 focus:outline-none focus:border-[#168BFF]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-[#168BFF] hover:bg-[#1272d4] text-white text-xs font-semibold shadow-md transition-all shrink-0"
                >
                  {language === 'bn' ? 'সাবস্ক্রাইব করুন' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
