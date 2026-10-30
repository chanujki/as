import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InvoiceModal: React.FC = () => {
  const { invoiceOrder, setInvoiceOrder, formatBDT, settings } = useApp();

  if (!invoiceOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#ffffff] text-slate-900 rounded-2xl p-8 shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-150">
        {/* Action Header (No print) */}
        <div className="no-print flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-[#168BFF]" />
            <span>Official AS Computer Tax Invoice</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-[#168BFF] text-white text-xs font-bold hover:bg-[#1272d4] flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={() => setInvoiceOrder(null)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Content */}
        <div className="space-y-6 print:space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div className="flex items-start gap-3.5">
              <img
                src={settings.logoUrl || 'https://i.imgur.com/OfCvr1N.jpeg'}
                alt="AS Computer Logo"
                className="w-12 h-12 object-contain rounded-xl border border-slate-200 shadow-sm shrink-0"
              />
              <div>
                <div className="text-2xl font-black tracking-tight text-slate-950 flex items-center gap-1">
                  <span>AS</span>
                  <span className="text-[#168BFF]">Computer</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold mt-0.5">প্রোপাইটার: {settings.ownerName || 'Md. Amir Hamza'}</p>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">{settings.storeAddress}</p>
                <p className="text-xs text-slate-500 font-mono">
                  Phone: {settings.supportPhone} | Email: {settings.supportEmail}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Govt. Trade Reg · Puthia, Rajshahi, Bangladesh</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">INVOICE</span>
              <span className="text-lg font-mono font-bold text-slate-900">#{invoiceOrder.id}</span>
              <p className="text-xs text-slate-500 mt-1">
                Date: {new Date(invoiceOrder.createdAt).toLocaleDateString('en-GB')}
              </p>
              <p className="text-xs text-slate-500">
                Payment: <strong className="uppercase">{invoiceOrder.paymentMethod}</strong> ({invoiceOrder.paymentStatus})
              </p>
            </div>
          </div>

          {/* Customer & Shipping info */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                Billed & Shipped To:
              </span>
              <p className="font-bold text-slate-900 text-sm">{invoiceOrder.shipping.fullName}</p>
              <p className="text-slate-600">{invoiceOrder.shipping.address}</p>
              <p className="text-slate-600">{invoiceOrder.shipping.district}, {invoiceOrder.shipping.division}</p>
              <p className="font-mono text-slate-700 mt-1">Phone: {invoiceOrder.shipping.phone}</p>
            </div>

            <div className="text-right">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                Courier Tracking:
              </span>
              <p className="font-bold text-slate-900">{invoiceOrder.courierName || 'Steadfast Courier'}</p>
              <p className="font-mono text-slate-600 font-bold">{invoiceOrder.trackingNumber}</p>
              <p className="text-slate-500 mt-1">Status: <strong className="text-emerald-700">{invoiceOrder.orderStatus}</strong></p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2">Item Description</th>
                <th className="py-2 text-center">SKU</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoiceOrder.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-2.5">
                    <p className="font-bold text-slate-900">{it.productName}</p>
                    {it.variant && <p className="text-[10px] text-slate-500">Variant: {it.variant}</p>}
                  </td>
                  <td className="py-2.5 text-center font-mono text-slate-500">{it.productSku}</td>
                  <td className="py-2.5 text-center tabular-nums font-bold">{it.quantity}</td>
                  <td className="py-2.5 text-right tabular-nums">{formatBDT(it.price)}</td>
                  <td className="py-2.5 text-right font-bold tabular-nums">{formatBDT(it.price * it.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Breakdown */}
          <div className="border-t-2 border-slate-200 pt-3 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900 tabular-nums">{formatBDT(invoiceOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {invoiceOrder.shippingFee === 0 ? 'FREE' : formatBDT(invoiceOrder.shippingFee)}
                </span>
              </div>
              {invoiceOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount Applied:</span>
                  <span className="tabular-nums">-{formatBDT(invoiceOrder.discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-extrabold text-slate-950">
                <span>Total Amount:</span>
                <span className="text-[#168BFF] text-base tabular-nums">{formatBDT(invoiceOrder.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
            <p>Thank you for shopping with AS Computer — Power Your Digital World.</p>
            <p className="mt-0.5">For warranty claims or technical questions, bring this invoice or order ID to our Dhaka store.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
