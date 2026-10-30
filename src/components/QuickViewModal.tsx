import React, { useState } from 'react';
import { X, Star, ShoppingCart, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSafeImageSrc, DEFAULT_PRODUCT_IMAGE, handleImageError } from '../utils/imageUtils';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    openProductDetail,
    formatBDT,
    language
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [activeImage, setActiveImage] = useState(
    getSafeImageSrc(quickViewProduct?.thumbnail, DEFAULT_PRODUCT_IMAGE)
  );

  // Synchronize activeImage with quickViewProduct
  React.useEffect(() => {
    if (quickViewProduct) {
      setActiveImage(getSafeImageSrc(quickViewProduct.thumbnail, DEFAULT_PRODUCT_IMAGE));
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const rawImages = (quickViewProduct.images && quickViewProduct.images.length > 0)
    ? quickViewProduct.images.filter(Boolean)
    : [quickViewProduct.thumbnail];

  const galleryImages = rawImages.length > 0
    ? rawImages
    : [DEFAULT_PRODUCT_IMAGE];

  const displayThumbnails = galleryImages.length >= 2
    ? galleryImages.slice(0, 2)
    : [galleryImages[0], galleryImages[0]];

  const handleAdd = () => {
    addToCart(quickViewProduct, quantity, selectedVariant || quickViewProduct.variants?.options[0]);
    setQuickViewProduct(null);
  };

  const handleFullDetail = () => {
    const prod = quickViewProduct;
    setQuickViewProduct(null);
    openProductDetail(prod);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#08172B] border border-slate-700 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700 z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Main Image on Top + 2 Thumbnails Underneath */}
          <div className="space-y-3">
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
              <img
                src={getSafeImageSrc(activeImage || quickViewProduct.thumbnail, DEFAULT_PRODUCT_IMAGE)}
                alt={quickViewProduct.name}
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* 2 Thumbnails Below Main Image */}
            <div className="grid grid-cols-2 gap-2">
              {displayThumbnails.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`p-1.5 rounded-lg border flex items-center gap-2 transition-all ${
                    (activeImage || quickViewProduct.thumbnail) === img
                      ? 'bg-[#168BFF]/20 border-[#00D4FF] ring-1 ring-[#00D4FF]/40'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getSafeImageSrc(img, DEFAULT_PRODUCT_IMAGE)}
                    alt={`Thumb ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                    className="w-9 h-9 rounded object-cover bg-slate-950 shrink-0"
                  />
                  <div className="text-left text-[11px] truncate">
                    <span className="font-semibold text-white block">ভিউ {idx + 1}</span>
                    <span className="text-[10px] text-slate-400 block">{idx === 0 ? 'প্রধান' : 'অতিরিক্ত'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {quickViewProduct.brand} · {quickViewProduct.category.replace('-', ' ')}
              </div>

              <h3 className="text-base font-bold text-white leading-snug">
                {language === 'bn' ? (quickViewProduct.nameBn || quickViewProduct.name) : quickViewProduct.name}
              </h3>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="flex text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="font-bold text-white tabular-nums">{quickViewProduct.rating}</span>
                <span>·</span>
                <span className="text-emerald-400 font-medium">In Stock ({quickViewProduct.stock})</span>
              </div>

              <div className="text-xl font-black text-[#00D4FF] tabular-nums pt-1">
                {formatBDT(quickViewProduct.price)}
              </div>

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {language === 'bn' ? (quickViewProduct.descriptionBn || quickViewProduct.description) : quickViewProduct.description}
              </p>

              {/* Variants */}
              {quickViewProduct.variants && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-slate-300">
                    {quickViewProduct.variants.type}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickViewProduct.variants.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setSelectedVariant(opt)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                          (selectedVariant || quickViewProduct.variants?.options[0]) === opt
                            ? 'bg-[#168BFF] text-white border-[#168BFF]'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-lg bg-[#168BFF] hover:bg-[#1272d4] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleFullDetail}
                className="w-full text-center text-xs text-slate-400 hover:text-[#00D4FF] py-1 flex items-center justify-center gap-1 transition-colors"
              >
                <span>View Full Details & Specs</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
