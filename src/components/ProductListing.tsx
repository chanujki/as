import React, { useState, useMemo } from 'react';
import {
  Filter,
  Grid,
  List,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { CATEGORIES } from '../data/categories';
import { ProductCategory, Product } from '../types';
import { getSafeImageSrc, DEFAULT_PRODUCT_IMAGE, handleImageError } from '../utils/imageUtils';

export const ProductListing: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    formatBDT,
    openProductDetail,
    addToCart,
    language,
    t
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(20000); // max price filter
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price-asc' | 'price-desc' | 'rating'>('popular');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Extract unique brands from the current products catalog
  const availableBrands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand))).sort();
  }, [products]);

  // Aggregate static and dynamic categories from catalog
  const allCategories = useMemo(() => {
    const list = [...CATEGORIES];
    const existingIds = new Set(list.map(c => c.id));
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

  // Filter products based on active criteria
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q) || (p.nameBn && p.nameBn.includes(q));
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesDescription = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesDescription) {
          return false;
        }
      }
      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) {
        return false;
      }
      // Price filter
      if (p.price > priceRange) {
        return false;
      }
      // In-stock filter
      if (onlyInStock && p.stock <= 0) {
        return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery, selectedBrands, priceRange, onlyInStock]);

  // Sort filtered products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    } else {
      // popularity default
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return list;
  }, [filteredProducts, sortBy]);

  // Pagination calculation
  const paginatedProducts = sortedProducts.slice(0, page * pageSize);
  const hasMore = paginatedProducts.length < sortedProducts.length;

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrands([]);
    setPriceRange(20000);
    setOnlyInStock(false);
    setSearchQuery('');
    setPage(1);
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedBrands.length +
    (onlyInStock ? 1 : 0) +
    (priceRange < 20000 ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="py-8 bg-[#050914] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Page Title & Breadcrumb */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400">
              <span className="hover:text-slate-200 cursor-pointer" onClick={() => setSelectedCategory('all')}>Store</span>
              <span className="mx-1.5">/</span>
              <span className="text-[#00D4FF] capitalize">
                {selectedCategory === 'all'
                  ? (language === 'bn' ? 'সকল পণ্য' : 'All Products')
                  : selectedCategory.replace('-', ' ')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {selectedCategory === 'all'
                ? (language === 'bn' ? 'সকল কম্পিউটার ও গ্যাজেট অ্যাক্সেসরিজ' : 'All Computer Accessories & Gadgets')
                : CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory}
            </h1>
          </div>

          {/* Action Bar (Total Count, Sorting, View Toggle) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Toggle for Mobile */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden px-3 py-2 rounded-lg bg-[#08172B] border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
            >
              <Filter className="w-4 h-4 text-[#00D4FF]" />
              <span>Filters ({activeFilterCount})</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="appearance-none bg-[#08172B] border border-slate-700 text-slate-200 text-xs font-medium pl-3 pr-8 py-2 rounded-lg focus:outline-none focus:border-[#168BFF]"
              >
                <option value="popular">{t('sortPopular')}</option>
                <option value="newest">{t('sortNewest')}</option>
                <option value="price-asc">{t('sortPriceAsc')}</option>
                <option value="price-desc">{t('sortPriceDesc')}</option>
                <option value="rating">{t('sortRating')}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Grid / List View Toggle */}
            <div className="flex items-center bg-[#08172B] border border-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#168BFF] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="List View"
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[#168BFF] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#168BFF]/15 border border-[#168BFF]/40 text-[#00D4FF]">
                Category: {selectedCategory.replace('-', ' ')}
                <button onClick={() => setSelectedCategory('all')}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {selectedBrands.map(b => (
              <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200">
                Brand: {b}
                <button onClick={() => toggleBrand(b)}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            ))}
            {onlyInStock && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                In Stock Only
                <button onClick={() => setOnlyInStock(false)}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {priceRange < 20000 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200">
                Max Price: {formatBDT(priceRange)}
                <button onClick={() => setPriceRange(20000)}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200">
                Query: "{searchQuery}"
                <button onClick={() => setSearchQuery('')}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-[#00D4FF] hover:underline font-semibold ml-2 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('clearAll')}</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Desktop Sidebar Filters (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-[#08172B]/60 border border-slate-800 p-5 rounded-2xl">
            {/* Filter Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <SlidersHorizontal className="w-4 h-4 text-[#00D4FF]" />
                <span>Filters & Options</span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-[11px] text-[#00D4FF] hover:underline font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Categories List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {t('filterByCategory')}
              </h4>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-[#168BFF] text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{language === 'bn' ? 'সকল পণ্য' : 'All Products'}</span>
                  <span className="tabular-nums text-[11px] opacity-75">{products.length}</span>
                </button>
                {allCategories.map(cat => {
                  const count = products.filter(p => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                        selectedCategory === cat.id
                          ? 'bg-[#168BFF] text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{language === 'bn' ? cat.nameBn : cat.name}</span>
                      <span className="tabular-nums text-[11px] opacity-75">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {t('filterByPrice')}
                </h4>
                <span className="text-xs font-bold text-[#00D4FF] tabular-nums">
                  Up to {formatBDT(priceRange)}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="20000"
                step="500"
                value={priceRange}
                onChange={e => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#168BFF] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 tabular-nums">
                <span>৳500</span>
                <span>৳10,000</span>
                <span>৳20,000+</span>
              </div>
            </div>

            {/* In-Stock Filter Toggle */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">In-Stock Only</span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={e => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#168BFF] focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Brand Checkboxes */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {t('filterByBrand')}
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableBrands.map(brand => {
                  const isChecked = selectedBrands.includes(brand);
                  return (
                    <label
                      key={brand}
                      className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleBrand(brand)}
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-[#168BFF] focus:ring-0"
                      />
                      <span className="flex-1 truncate">{brand}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Product Grid Area (9 cols) */}
          <main className="lg:col-span-9 space-y-6">
            {/* Results count header */}
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
              <div>
                Showing <span className="font-bold text-white tabular-nums">{paginatedProducts.length}</span> of{' '}
                <span className="font-bold text-white tabular-nums">{sortedProducts.length}</span> items
              </div>
            </div>

            {/* Products List/Grid */}
            {paginatedProducts.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
                  {paginatedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                /* List View Layout */
                <div className="space-y-4">
                  {paginatedProducts.map(product => (
                    <div
                      key={product.id}
                      className="p-4 rounded-xl bg-[#08172B]/70 border border-slate-800 hover:border-[#168BFF]/50 transition-all flex flex-col sm:flex-row gap-5 items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <img
                          src={getSafeImageSrc(product.thumbnail, DEFAULT_PRODUCT_IMAGE)}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                          className="w-24 h-24 object-cover rounded-lg bg-slate-900 shrink-0 border border-slate-800"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 uppercase tracking-wider">
                            <span>{product.brand}</span>
                            <span>·</span>
                            <span>{product.category.replace('-', ' ')}</span>
                          </div>
                          <button
                            onClick={() => openProductDetail(product)}
                            className="text-left font-bold text-white text-sm hover:text-[#00D4FF] transition-colors"
                          >
                            {language === 'bn' ? (product.nameBn || product.name) : product.name}
                          </button>
                          <p className="text-xs text-slate-400 line-clamp-2 max-w-lg">
                            {product.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800 shrink-0">
                        <div className="text-right">
                          <div className="text-lg font-bold text-white tabular-nums">
                            {formatBDT(product.price)}
                          </div>
                          {product.originalPrice && (
                            <div className="text-xs line-through text-slate-500 tabular-nums">
                              {formatBDT(product.originalPrice)}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart(product, 1)}
                          className="px-4 py-2 rounded-lg bg-[#168BFF] hover:bg-[#1272d4] text-white text-xs font-semibold transition-all shadow-md"
                        >
                          {t('addToCart')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Empty State */
              <div className="text-center py-20 p-8 rounded-2xl bg-[#08172B]/40 border border-slate-800 space-y-4">
                <Search className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No products found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  We couldn't find any accessories matching your selected criteria. Try adjusting your filters or price range.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-lg bg-[#168BFF] text-white text-xs font-semibold hover:bg-[#1272d4] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Load More Pagination */}
            {hasMore && (
              <div className="pt-8 text-center">
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  className="px-8 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-[#168BFF] text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-md"
                >
                  Load More Products ({sortedProducts.length - paginatedProducts.length} remaining)
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-[#08172B] h-full overflow-y-auto p-6 space-y-6 shadow-2xl z-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Category
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left p-1.5 rounded text-xs ${
                      selectedCategory === 'all' ? 'bg-[#168BFF] text-white font-semibold' : 'text-slate-300'
                    }`}
                  >
                    All Categories
                  </button>
                  {allCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left p-1.5 rounded text-xs ${
                        selectedCategory === cat.id ? 'bg-[#168BFF] text-white font-semibold' : 'text-slate-300'
                      }`}
                    >
                      {language === 'bn' ? cat.nameBn : cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Max Price:</span>
                  <span className="font-bold text-[#00D4FF] tabular-nums">{formatBDT(priceRange)}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={priceRange}
                  onChange={e => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#168BFF]"
                />
              </div>

              {/* In-Stock */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={e => setOnlyInStock(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#168BFF]"
                />
                <span>In-Stock Only</span>
              </label>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 rounded-lg bg-[#168BFF] text-white text-xs font-bold shadow-lg"
            >
              Apply Filters ({sortedProducts.length} Results)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
