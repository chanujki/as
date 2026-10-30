import React, { useState, useMemo } from 'react';
import { Search, ShoppingBag, Filter, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { CATEGORIES } from '../data/categories';
import { ProductCategory } from '../types';

export const CleanProductShowcase: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    language
  } = useApp();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (localSearch.trim()) {
        const q = localSearch.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q) || (p.nameBn && p.nameBn.includes(q));
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        return matchesName || matchesBrand || matchesCategory;
      }
      return true;
    });
  }, [products, selectedCategory, localSearch]);

  const allCategoryTabs = useMemo(() => {
    const list = [...CATEGORIES];
    const existingIds = new Set(list.map(c => c.id));

    // Find any custom categories created dynamically in products
    products.forEach(p => {
      if (p.category && !existingIds.has(p.category as any)) {
        existingIds.add(p.category as any);
        list.push({
          id: p.category as any,
          name: p.category.charAt(0).toUpperCase() + p.category.slice(1).replace(/-/g, ' '),
          nameBn: p.category.replace(/-/g, ' '),
          description: 'Category',
          iconName: 'Tag',
          itemCount: 1,
          featuredImage: '/images/category_mechanical_keyboard_1793020164307.jpg'
        });
      }
    });
    return list;
  }, [products]);

  const handleCategorySelect = (catId: ProductCategory | 'all') => {
    setSelectedCategory(catId);
  };

  return (
    <section className="py-5 sm:py-8 bg-[#050914] min-h-[500px]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-4 sm:space-y-6">
        {/* Simple & Clean Category Filter Bar + Search Bar */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#08172B]/80 border border-slate-800 space-y-3 sm:space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#00D4FF] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AS Computer Product Catalog</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-0.5">
                {language === 'bn' ? 'সকল মালামাল ও কম্পিউটার গ্যাজেট' : 'All Computer Accessories & Gadgets'}
              </h2>
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={localSearch}
                onChange={e => {
                  setLocalSearch(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                placeholder={language === 'bn' ? 'প্রোডাক্টের নাম দিয়ে খুঁজুন...' : 'Search by product name...'}
                className="w-full bg-slate-900 border border-slate-700 text-xs text-white pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#168BFF]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Clean Segmented Category Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 no-scrollbar text-xs">
            <button
              onClick={() => handleCategorySelect('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all text-xs ${
                selectedCategory === 'all'
                  ? 'bg-[#168BFF] text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              {language === 'bn' ? 'সকল পণ্য' : 'All Products'} ({products.length})
            </button>

            {allCategoryTabs.map(cat => {
              const count = products.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all text-xs ${
                    selectedCategory === cat.id
                      ? 'bg-[#168BFF] text-white font-bold shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>{language === 'bn' ? cat.nameBn : cat.name}</span>
                  <span className="ml-1 opacity-70 tabular-nums">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Count Header */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div>
            {language === 'bn' ? (
              <span>মোট <strong className="text-white tabular-nums">{filteredProducts.length}</strong> টি প্রোডাক্ট পাওয়া গেছে</span>
            ) : (
              <span>Showing <strong className="text-white tabular-nums">{filteredProducts.length}</strong> accessories</span>
            )}
          </div>
          <span className="text-[11px] text-slate-500">
            {language === 'bn' ? 'ছবি, নাম ও দাম দেখে সরাসরি অর্ডার করুন' : 'Click "Order Now" on any item for instant delivery'}
          </span>
        </div>

        {/* Clean, Non-Cluttered Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-[#08172B]/60 border border-slate-800 space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400">অন্য নাম দিয়ে অনুসন্ধান করুন অথবা ক্যাটাগরি রিসেট করুন।</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setLocalSearch('');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg bg-[#168BFF] text-white text-xs font-semibold"
            >
              সকল প্রোডাক্ট দেখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
