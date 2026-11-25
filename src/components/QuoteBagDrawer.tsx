import React, { useState } from 'react';
import { CheckCircle2, Minus, Plus, Trash2, X } from 'lucide-react';
import type { QuoteBagItemInput } from './ProductDetailView';

export interface BagLineItem extends QuoteBagItemInput {
  lineId: string;
}

interface QuoteBagDrawerProps {
  isOpen: boolean;
  items: BagLineItem[];
  onClose: () => void;
  onUpdateQty: (lineId: string, nextQty: number) => void;
  onRemoveItem: (lineId: string) => void;
  onClearBag: () => void;
}

export const QuoteBagDrawer: React.FC<QuoteBagDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearBag,
}) => {
  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United States');
  const [notes, setNotes] = useState('');
  const [rfqNumber, setRfqNumber] = useState('');

  if (!isOpen) return null;

  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !email.trim()) return;
    const refCode = `TSI-${Math.floor(100000 + Math.random() * 900000)}`;
    setRfqNumber(refCode);
    setStep('confirmed');
    onClearBag();
  };

  const handleClose = () => {
    if (step === 'confirmed') {
      setStep('bag');
      setBrandName('');
      setEmail('');
      setNotes('');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Solid translucent scrim (no backdrop-blur over WebGL) */}
      <div
        className="fixed inset-0 bg-black/45 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      <aside
        aria-label="Wholesale Quote Bag"
        className="relative z-10 w-full max-w-md bg-white h-full flex flex-col border-l border-black/15 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <div>
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-[#141413]">
              {step === 'bag'
                ? 'Your Quote Bag'
                : step === 'checkout'
                  ? 'Proforma Request'
                  : 'Inquiry Confirmed'}
            </h2>
            {step === 'bag' && (
              <p className="font-mono text-xs text-neutral-500 tabular-nums mt-0.5">
                {items.length} {items.length === 1 ? 'style' : 'styles'} · {totalUnits.toLocaleString()} total pcs
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close quote bag"
            className="p-2 text-neutral-600 hover:text-[#141413] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'confirmed' ? (
            <div className="py-10 text-left space-y-4">
              <CheckCircle2 className="w-10 h-10 text-[#141413]" />
              <div className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                Reference {rfqNumber}
              </div>
              <h3 className="font-display text-3xl font-semibold uppercase text-[#141413]">
                Production Quote Received
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Our production merchandising desk has logged your specification sheet for{' '}
                <strong className="text-[#141413]">{brandName}</strong>. A formal FOB / DDP Proforma
                Invoice and lab-dip schedule will be sent to{' '}
                <strong className="text-[#141413]">{email}</strong> within 24 hours.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-4 w-full py-3.5 bg-[#141413] text-[#F2F1EE] text-xs font-semibold uppercase tracking-[0.14em]"
              >
                Return to 3D Showroom
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl uppercase text-[#141413]">Quote Bag is Empty</p>
              <p className="text-sm text-neutral-500 mt-2 max-w-xs mx-auto">
                Explore the 3D hanging showroom walls, drill down into a category, and configure any
                garment block to build a wholesale quote.
              </p>
            </div>
          ) : step === 'bag' ? (
            <div className="divide-y divide-black/10">
              {items.map((item) => (
                <div key={item.lineId} className="py-4 first:pt-0 flex gap-4">
                  <div className="w-20 h-26 shrink-0 bg-white border border-black/10 overflow-hidden p-1">
                    {item.previewUrl && (
                      <img
                        src={item.previewUrl}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono text-[11px] text-neutral-500">
                          {item.product.sku}
                        </div>
                        <div className="text-sm font-semibold text-[#141413] leading-snug">
                          {item.product.name}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.lineId)}
                        aria-label={`Remove ${item.product.name}`}
                        className="p-1 text-neutral-400 hover:text-[#141413]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-1.5 text-xs text-neutral-600 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 inline-block border border-black/20"
                          style={{ backgroundColor: item.colorHex }}
                        />
                        <span>{item.colorName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{item.gsm}</span>
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">{item.branding}</div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-black/15">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQty(
                              item.lineId,
                              Math.max(1, item.quantity - (item.quantity >= 50 ? 25 : 1)),
                            )
                          }
                          aria-label="Decrease quantity"
                          className="px-2 py-1 text-neutral-700 hover:bg-black/5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-1 font-mono text-xs tabular-nums text-[#141413]">
                          {item.quantity} pcs
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQty(
                              item.lineId,
                              item.quantity + (item.quantity >= 50 ? 25 : 1),
                            )
                          }
                          aria-label="Increase quantity"
                          className="px-2 py-1 text-neutral-700 hover:bg-black/5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right font-mono text-xs tabular-nums">
                        <div className="font-semibold text-[#141413]">
                          ${(item.quantity * item.unitPrice).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          ${item.unitPrice.toFixed(2)}/ea
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form id="rfq-form" onSubmit={handleSubmitQuote} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-600 mb-1.5">
                  Brand / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Studio Archive Apparel LLC"
                  className="w-full px-3 py-2.5 text-sm border border-black/20 focus:border-[#141413] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-600 mb-1.5">
                  Buyer Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sourcing@yourbrand.com"
                  className="w-full px-3 py-2.5 text-sm border border-black/20 focus:border-[#141413] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-600 mb-1.5">
                  Destination Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-black/20 focus:border-[#141413] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-600 mb-1.5">
                  Tech-Pack / Pantone Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Custom woven neck label dimensions, Pantone TCX codes, or target drop date..."
                  className="w-full px-3 py-2.5 text-sm border border-black/20 focus:border-[#141413] focus:outline-none resize-none"
                />
              </div>

              <div className="p-3 bg-[#F7F6F3] border border-black/10 text-xs text-neutral-600 space-y-1">
                <div className="flex justify-between font-mono tabular-nums">
                  <span>Configured Styles:</span>
                  <span className="text-[#141413]">{items.length}</span>
                </div>
                <div className="flex justify-between font-mono tabular-nums">
                  <span>Total Garment Units:</span>
                  <span className="text-[#141413]">{totalUnits.toLocaleString()} pcs</span>
                </div>
                <div className="flex justify-between font-mono tabular-nums font-semibold text-[#141413]">
                  <span>Estimated FOB Total:</span>
                  <span>
                    ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && step !== 'confirmed' && (
          <div className="px-6 py-5 border-t border-black/10 bg-[#FAF9F6]">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-600">
                Estimated FOB Subtotal
              </span>
              <span className="text-xl font-semibold font-mono tabular-nums text-[#141413]">
                ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 bg-[#141413] text-[#F2F1EE] text-xs font-semibold uppercase tracking-[0.14em] hover:bg-[#2a2a28] transition-colors cursor-pointer"
              >
                Request Proforma Quote
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('bag')}
                  className="px-4 py-3.5 border border-black/20 text-xs font-semibold uppercase tracking-wider text-[#141413]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="rfq-form"
                  className="flex-1 py-3.5 bg-[#141413] text-[#F2F1EE] text-xs font-semibold uppercase tracking-[0.14em] hover:bg-[#2a2a28] transition-colors cursor-pointer"
                >
                  Submit RFQ ({totalUnits} pcs)
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};
