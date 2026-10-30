import React from 'react';
import { X, Scale, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSafeImageSrc, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';

export const ProductCompareModal: React.FC = () => {
  const {
    compareList,
    removeFromCompare,
    clearCompare,
    addToCart,
    formatBDT,
    openProductDetail,
    setCurrentView
  } = useApp();

  if (compareList.length === 0) {
    return (
      <div className="py-24 max-w-xl mx-auto px-4 text-center space-y-4">
        <Scale className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Compare List is Empty</h2>
        <p className="text-xs text-slate-400">
          Add up to 4 products from the catalog to compare their technical specifications side-by-side.
        </p>
        <button
          onClick={() => setCurrentView('shop')}
          className="px-6 py-2.5 rounded-lg bg-[#168BFF] text-white text-xs font-semibold"
        >
          Browse Products
        </button>
      </div>
    );
  }

  // Extract all unique spec keys across compared products
  const allSpecKeys = Array.from(
    new Set(compareList.flatMap(p => Object.keys(p.specs || {})))
  );

  return (
    <div className="py-8 bg-[#050914] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('shop')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#00D4FF]" />
              <span>Side-by-Side Product Comparison</span>
            </h1>
          </div>

          <button
            onClick={clearCompare}
            className="text-xs text-rose-400 hover:underline font-semibold"
          >
            Clear Comparison
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#08172B]/70">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-4 w-48 font-semibold text-slate-400 uppercase tracking-wider text-[11px] bg-slate-900/40">
                  Feature / Item
                </th>
                {compareList.map(p => (
                  <th key={p.id} className="p-4 min-w-[220px] max-w-[280px] align-top">
                    <div className="space-y-3 relative">
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="absolute -top-1 -right-1 p-1 rounded-full text-slate-400 hover:text-rose-400"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <img
                        src={getSafeImageSrc(p.thumbnail, DEFAULT_PRODUCT_IMAGE)}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-32 object-cover rounded-xl bg-slate-900 border border-slate-800"
                      />

                      <h4
                        onClick={() => openProductDetail(p)}
                        className="font-bold text-white text-xs hover:text-[#00D4FF] cursor-pointer line-clamp-2"
                      >
                        {p.name}
                      </h4>

                      <div className="text-base font-extrabold text-[#00D4FF] tabular-nums">
                        {formatBDT(p.price)}
                      </div>

                      <button
                        onClick={() => addToCart(p, 1)}
                        className="w-full py-2 rounded-lg bg-[#168BFF] text-white text-xs font-semibold hover:bg-[#1272d4] flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {/* Brand */}
              <tr>
                <td className="p-4 font-semibold text-slate-400 bg-slate-900/30">Brand</td>
                {compareList.map(p => (
                  <td key={p.id} className="p-4 text-white font-medium">{p.brand}</td>
                ))}
              </tr>

              {/* Category */}
              <tr>
                <td className="p-4 font-semibold text-slate-400 bg-slate-900/30">Category</td>
                {compareList.map(p => (
                  <td key={p.id} className="p-4 text-slate-300 capitalize">{p.category.replace('-', ' ')}</td>
                ))}
              </tr>

              {/* Stock */}
              <tr>
                <td className="p-4 font-semibold text-slate-400 bg-slate-900/30">Availability</td>
                {compareList.map(p => (
                  <td key={p.id} className="p-4">
                    <span className={p.stock > 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                      {p.stock > 0 ? `In Stock (${p.stock} units)` : 'Out of Stock'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Warranty */}
              <tr>
                <td className="p-4 font-semibold text-slate-400 bg-slate-900/30">Official Warranty</td>
                {compareList.map(p => (
                  <td key={p.id} className="p-4 text-slate-200">{p.warranty}</td>
                ))}
              </tr>

              {/* Dynamic Specs */}
              {allSpecKeys.map(key => (
                <tr key={key}>
                  <td className="p-4 font-semibold text-slate-400 bg-slate-900/30">{key}</td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-4 text-slate-200 tabular-nums">
                      {p.specs[key] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
