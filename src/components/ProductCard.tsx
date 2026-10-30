import React from 'react';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { getSafeImageSrc, DEFAULT_PRODUCT_IMAGE, handleImageError } from '../utils/imageUtils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    openProductDetail,
    setQuickViewProduct,
    setQuickOrderProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    formatBDT,
    language
  } = useApp();

  const isWish = isInWishlist(product.id);

  return (
    <div className="group relative flex flex-col justify-between rounded-xl bg-[#08172B]/70 border border-slate-800/90 hover:border-[#168BFF]/50 transition-all duration-300 overflow-hidden shadow-md hover:shadow-xl hover:shadow-[#168BFF]/10">
      {/* Top Image Container (Clicking opens product details) */}
      <div
        onClick={() => openProductDetail(product)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#0c1c36]/50 cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            openProductDetail(product);
          }
        }}
        title={language === 'bn' ? 'বিস্তারিত দেখতে ছবিতে চাপুন' : 'Click to view product details'}
      >
        <img
          src={getSafeImageSrc(product.thumbnail, DEFAULT_PRODUCT_IMAGE)}
          alt={product.name}
          referrerPolicy="no-referrer"
          onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Subtle Badge Tag (Top Left) */}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm ${
              product.badges[0] === 'Best Seller'
                ? 'bg-amber-500/90 text-slate-950'
                : product.badges[0] === 'Sale'
                ? 'bg-rose-500/90 text-white'
                : 'bg-[#168BFF]/90 text-white'
            }`}>
              {product.badges[0]}
            </span>
          </div>
        )}

        {/* Quick Action Floating Controls (Top Right) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          {/* Wishlist */}
          <button
            onClick={e => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            aria-label="Add to Wishlist"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              isWish
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-[#050914]/80 text-slate-300 hover:text-rose-400 hover:bg-[#050914] backdrop-blur-sm border border-slate-700/60'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWish ? 'fill-current' : ''}`} />
          </button>

          {/* Quick View */}
          <button
            onClick={e => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            aria-label="Quick View"
            className="w-8 h-8 rounded-lg bg-[#050914]/80 text-slate-300 hover:text-white hover:bg-[#050914] backdrop-blur-sm border border-slate-700/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <Eye className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* Card Content */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-2 sm:gap-3">
        <div className="space-y-1 sm:space-y-1.5">
          {/* Unboxed Metadata: Brand · Category */}
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            <span className="text-slate-300 truncate">{product.brand}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="truncate">{product.category.replace('-', ' ')}</span>
          </div>

          {/* Product Name */}
          <button
            onClick={() => openProductDetail(product)}
            className="text-left w-full group/title focus:outline-none"
          >
            <h4 className="text-xs sm:text-sm font-semibold text-slate-100 line-clamp-2 leading-snug group-hover/title:text-[#00D4FF] transition-colors">
              {language === 'bn' ? (product.nameBn || product.name) : product.name}
            </h4>
          </button>

          {/* Rating */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-slate-400 pt-0.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            </div>
            <span className="font-semibold text-slate-200 tabular-nums">{product.rating}</span>
            <span className="text-slate-500">({product.reviewCount})</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className={`text-[10px] sm:text-[11px] font-medium ${product.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {product.stock > 0 ? (language === 'bn' ? 'স্টকে আছে' : 'In Stock') : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Price & Actions Footer */}
        <div className="pt-2 sm:pt-2.5 border-t border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm sm:text-base font-bold text-white tabular-nums tracking-tight">
                {formatBDT(product.price)}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400">
                  <span className="line-through tabular-nums text-slate-500">{formatBDT(product.originalPrice)}</span>
                  <span className="text-[#00D4FF] font-semibold">-{product.discountPercent}%</span>
                </div>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
              {product.stock} {language === 'bn' ? 'টি' : 'left'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={() => setQuickOrderProduct(product)}
              disabled={product.stock <= 0}
              className="w-full py-1.5 sm:py-2 px-1.5 rounded-lg bg-gradient-to-r from-[#168BFF] to-[#00D4FF] hover:from-[#1272d4] hover:to-[#00bde6] text-white text-[11px] sm:text-xs font-bold shadow-sm shadow-[#168BFF]/20 flex items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{language === 'bn' ? 'অর্ডার করুন' : 'Order Now'}</span>
            </button>

            <button
              onClick={() => addToCart(product, 1, product.variants?.options[0])}
              disabled={product.stock <= 0}
              className="w-full py-1.5 sm:py-2 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00D4FF] shrink-0" />
              <span className="truncate">{language === 'bn' ? 'কার্টে নিন' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
