import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Layers, Ruler, ShieldCheck } from 'lucide-react';
import type { MainCategory, ProductSpec, SubCategory } from '../data/catalog';
import { useBrandedModelUrl } from '../hooks/useBrandedModelUrl';
import {
  createMacroWeaveDataUrl,
  createSpecBlueprintDataUrl,
  getGarmentPreviewDataUrl,
} from '../utils/garmentTexture';

export interface QuoteBagItemInput {
  product: ProductSpec;
  mainCategoryName: string;
  subCategoryName: string;
  gsm: string;
  colorName: string;
  colorHex: string;
  branding: string;
  tierLabel: string;
  quantity: number;
  unitPrice: number;
  previewUrl: string;
}

interface ProductDetailViewProps {
  mainCategory: MainCategory;
  subCategory: SubCategory;
  product: ProductSpec;
  onBackToWall: () => void;
  onSelectSiblingProduct: (product: ProductSpec) => void;
  onAddToBag: (item: QuoteBagItemInput) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  mainCategory,
  subCategory,
  product,
  onBackToWall,
  onSelectSiblingProduct,
  onAddToBag,
}) => {
  const [selectedGsm, setSelectedGsm] = useState(product.defaultGsm);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedBranding, setSelectedBranding] = useState(product.brandingOptions[0]);
  const [selectedTierIdx, setSelectedTierIdx] = useState(1); // Default MOQ 50 pcs
  const [activeViewTab, setActiveViewTab] = useState<'model' | 'hang' | 'macro' | 'blueprint'>('model');
  const [openAccordion, setOpenAccordion] = useState<'specs' | 'sizing' | 'freight' | null>('specs');

  const [hangPreviewUrl, setHangPreviewUrl] = useState<string>('');
  const brandedModelUrl = useBrandedModelUrl(product.modelWhitePhoto);

  // Reset selections when product changes
  useEffect(() => {
    setSelectedGsm(product.defaultGsm);
    setSelectedColorIdx(0);
    setSelectedBranding(product.brandingOptions[0]);
    setSelectedTierIdx(product.pricingTiers.length > 1 ? 1 : 0);
    setActiveViewTab('model');
  }, [product]);

  const activeColor = product.colors[selectedColorIdx] || product.colors[0];
  const activeTier = product.pricingTiers[selectedTierIdx] || product.pricingTiers[0];

  // Branding customization slight unit surcharge
  const brandingSurcharge = useMemo(() => {
    const idx = product.brandingOptions.indexOf(selectedBranding);
    if (idx <= 0) return 0;
    if (idx === 1) return 2.4;
    if (idx === 2) return 3.2;
    return 1.8;
  }, [product.brandingOptions, selectedBranding]);

  const effectiveUnitPrice = Number((activeTier.unitPrice + brandingSurcharge).toFixed(2));
  const batchSubtotal = Number((effectiveUnitPrice * activeTier.qty).toFixed(2));

  useEffect(() => {
    let cancelled = false;
    const appearance = selectedColorIdx === 0 ? product.appearance : activeColor.appearance;
    getGarmentPreviewDataUrl(product.visualKind, product.basePhoto, product.hookYRatio, appearance).then(
      (url) => {
        if (!cancelled) setHangPreviewUrl(url);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [product, selectedColorIdx, activeColor]);

  const macroWeaveUrl = useMemo(
    () => createMacroWeaveDataUrl(selectedGsm, activeColor.hex),
    [selectedGsm, activeColor.hex],
  );

  const blueprintUrl = useMemo(() => createSpecBlueprintDataUrl(product), [product]);

  const siblings = useMemo(
    () => subCategory.products.filter((p) => p.id !== product.id),
    [subCategory.products, product.id],
  );

  const activeMainImage =
    activeViewTab === 'model'
      ? brandedModelUrl
      : activeViewTab === 'hang'
        ? hangPreviewUrl
        : activeViewTab === 'macro'
          ? macroWeaveUrl
          : blueprintUrl;

  const handleAdd = () => {
    onAddToBag({
      product,
      mainCategoryName: mainCategory.name,
      subCategoryName: subCategory.name,
      gsm: selectedGsm,
      colorName: activeColor.name,
      colorHex: activeColor.hex,
      branding: selectedBranding,
      tierLabel: activeTier.label,
      quantity: activeTier.qty,
      unitPrice: effectiveUnitPrice,
      previewUrl: brandedModelUrl || hangPreviewUrl || product.basePhoto || '',
    });
  };

  return (
    <div className="w-full min-h-screen bg-white pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Top Back & Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4 mb-8">
          <button
            type="button"
            onClick={onBackToWall}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#141413] hover:opacity-70 transition-opacity whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {subCategory.name} Wall
          </button>
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
            <span>{mainCategory.name}</span>
            <span aria-hidden="true">/</span>
            <span>{subCategory.name}</span>
            <span aria-hidden="true">/</span>
            <span className="text-[#141413] font-medium">{product.sku}</span>
          </div>
        </div>

        {/* Split Editorial Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Sticky Garment Gallery */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div className="aspect-[3/4] w-full bg-white border border-black/10 overflow-hidden relative">
              {activeMainImage ? (
                <>
                  <img
                    src={activeMainImage}
                    alt={`${product.name} — ${activeColor.name}`}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full transition-opacity duration-200 ${
                      activeViewTab === 'model' || activeViewTab === 'hang'
                        ? 'object-contain p-3'
                        : 'object-cover'
                    }`}
                  />
                  {activeViewTab === 'model' && (
                    <div
                      className="pointer-events-none absolute inset-0 shadow-[inset_0_0_28px_14px_#ffffff]"
                      aria-hidden="true"
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-xs text-neutral-500">
                  Rendering studio specimen...
                </div>
              )}
            </div>

            {/* 4 View Thumbnails */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
              <button
                type="button"
                onClick={() => setActiveViewTab('model')}
                className={`text-left border transition-colors p-2 cursor-pointer ${
                  activeViewTab === 'model'
                    ? 'border-[#111317] bg-white'
                    : 'border-black/10 bg-[#EFEDE8] hover:border-black/30'
                }`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-white mb-1.5 p-1">
                  <img
                    src={brandedModelUrl}
                    alt="On-model pure white studio shot"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="block font-mono text-[10px] uppercase tracking-wide text-[#111317] whitespace-nowrap truncate">
                  01. Model View
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveViewTab('hang')}
                className={`text-left border transition-colors p-2 cursor-pointer ${
                  activeViewTab === 'hang'
                    ? 'border-[#111317] bg-white'
                    : 'border-black/10 bg-[#EFEDE8] hover:border-black/30'
                }`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#F5F3EE] mb-1.5 p-1">
                  {hangPreviewUrl && (
                    <img
                      src={hangPreviewUrl}
                      alt="Hanging garment colorway preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <span className="block font-mono text-[10px] uppercase tracking-wide text-[#111317] whitespace-nowrap truncate">
                  02. Dye Preview
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveViewTab('macro')}
                className={`text-left border transition-colors p-2 cursor-pointer ${
                  activeViewTab === 'macro'
                    ? 'border-[#111317] bg-white'
                    : 'border-black/10 bg-[#EFEDE8] hover:border-black/30'
                }`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#E5E3DD] mb-1.5">
                  <img
                    src={macroWeaveUrl}
                    alt="Textile knit macro"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="block font-mono text-[10px] uppercase tracking-wide text-[#111317] whitespace-nowrap truncate">
                  03. Weave Macro
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveViewTab('blueprint')}
                className={`text-left border transition-colors p-2 cursor-pointer ${
                  activeViewTab === 'blueprint'
                    ? 'border-[#111317] bg-white'
                    : 'border-black/10 bg-[#EFEDE8] hover:border-black/30'
                }`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#E5E3DD] mb-1.5">
                  <img
                    src={blueprintUrl}
                    alt="Tech pack pattern blueprint"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="block font-mono text-[10px] uppercase tracking-wide text-[#111317] whitespace-nowrap truncate">
                  04. Spec Sheet
                </span>
              </button>
            </div>
          </div>

          {/* Right Contiguous Wholesale Configurator */}
          <div className="lg:col-span-6">
            <div className="text-xs font-mono uppercase tracking-wider text-[#9E7018] font-semibold">
              THUMB SPORTS INDUSTRIES · {product.division} · {product.sku}
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight uppercase text-[#111317] mt-2 text-balance">
              {product.name}
            </h1>
            <p className="text-sm font-medium text-neutral-600 mt-1">{product.subtitle}</p>

            {/* Dynamic Wholesale Unit & Batch Price */}
            <div className="mt-5 pb-5 border-b border-black/10 flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <span className="text-2xl font-semibold text-[#141413] tabular-nums">
                  ${effectiveUnitPrice.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-neutral-500 ml-2 uppercase">
                  / unit FOB ({activeTier.label})
                </span>
              </div>
              <div className="text-sm font-mono text-neutral-600 tabular-nums">
                Est. Batch: <strong className="text-[#141413]">${batchSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-neutral-700 mt-5">{product.description}</p>

            {/* Selector 1: Fabric Weight / GSM */}
            <div className="mt-7">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-600 mb-2.5">
                <span>Fabric Weight &amp; Knit</span>
                <span className="text-[#141413]">{selectedGsm}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {product.gsmOptions.map((gsm) => {
                  const active = gsm === selectedGsm;
                  return (
                    <button
                      key={gsm}
                      type="button"
                      onClick={() => setSelectedGsm(gsm)}
                      className={`px-3 py-2.5 text-xs font-medium border text-left transition-colors ${
                        active
                          ? 'border-[#141413] bg-[#141413] text-[#F2F1EE]'
                          : 'border-black/15 bg-white text-[#141413] hover:border-black/40'
                      }`}
                    >
                      {gsm}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector 2: Garment Colorway */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-600 mb-2.5">
                <span>Garment Dye &amp; Colorway</span>
                <span className="text-[#141413]">{activeColor.name}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.colors.map((color, idx) => {
                  const active = idx === selectedColorIdx;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => {
                        setSelectedColorIdx(idx);
                        setActiveViewTab(idx === 0 ? 'model' : 'hang');
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium border text-left transition-colors cursor-pointer ${
                        active
                          ? 'border-[#141413] bg-white ring-1 ring-[#141413]'
                          : 'border-black/15 bg-white text-neutral-700 hover:border-black/40'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 shrink-0 border border-black/20"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="truncate">{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector 3: Branding & Print Method */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-600 mb-2.5">
                <span>Branding &amp; Print Spec</span>
                <span className="text-[#141413]">
                  {brandingSurcharge > 0 ? `+$${brandingSurcharge.toFixed(2)}/pc` : 'Base Spec'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.brandingOptions.map((opt) => {
                  const active = opt === selectedBranding;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedBranding(opt)}
                      className={`px-3 py-2.5 text-xs font-medium border text-left transition-colors ${
                        active
                          ? 'border-[#141413] bg-[#141413] text-[#F2F1EE]'
                          : 'border-black/15 bg-white text-[#141413] hover:border-black/40'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector 4: Volume Tier */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-600 mb-2.5">
                <span>Production Volume Tier</span>
                <span className="text-[#141413] tabular-nums">{activeTier.qty} pcs</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {product.pricingTiers.map((tier, idx) => {
                  const active = idx === selectedTierIdx;
                  return (
                    <button
                      key={tier.label}
                      type="button"
                      onClick={() => setSelectedTierIdx(idx)}
                      className={`px-3 py-2.5 border text-left transition-colors ${
                        active
                          ? 'border-[#141413] bg-[#141413] text-[#F2F1EE]'
                          : 'border-black/15 bg-white text-[#141413] hover:border-black/40'
                      }`}
                    >
                      <div className="text-xs font-semibold whitespace-nowrap">{tier.label}</div>
                      <div
                        className={`font-mono text-[11px] tabular-nums mt-0.5 ${
                          active ? 'text-neutral-300' : 'text-neutral-500'
                        }`}
                      >
                        ${(tier.unitPrice + brandingSurcharge).toFixed(2)}/ea
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary CTA Button (Exact Match to Video Solid Black Button) */}
            <button
              type="button"
              onClick={handleAdd}
              className="mt-7 w-full py-4 px-6 bg-[#141413] text-[#F2F1EE] text-xs font-semibold uppercase tracking-[0.14em] hover:bg-[#2a2a28] active:scale-[0.995] transition-all cursor-pointer"
            >
              Add to Quote Bag — ${batchSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </button>

            {/* Technical Accordions */}
            <div className="mt-8 border-t border-black/10 divide-y divide-black/10">
              {/* Accordion 1: Fabric & Stitching */}
              <div>
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'specs' ? null : 'specs')}
                  className="w-full py-4 flex items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-[#141413]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Layers className="w-4 h-4 text-neutral-500" />
                    Fabric &amp; Stitching Specifications
                  </span>
                  {openAccordion === 'specs' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'specs' && (
                  <div className="pb-4 text-xs text-neutral-700 space-y-2 leading-relaxed">
                    <div>
                      <span className="font-mono text-neutral-500 uppercase">Composition: </span>
                      {product.composition}
                    </div>
                    <div>
                      <span className="font-mono text-neutral-500 uppercase">Construction: </span>
                      {product.stitchingSpec}
                    </div>
                    <div>
                      <span className="font-mono text-neutral-500 uppercase">Pre-Shrinkage: </span>
                      Sanforized &amp; enzyme-washed (&lt; 2% residual shrinkage tolerance)
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Sizing & Measurements */}
              <div>
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'sizing' ? null : 'sizing')}
                  className="w-full py-4 flex items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-[#141413]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-neutral-500" />
                    Size Grading &amp; Block Chart
                  </span>
                  {openAccordion === 'sizing' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'sizing' && (
                  <div className="pb-4 overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse tabular-nums">
                      <thead>
                        <tr className="border-b border-black/10 font-mono text-[11px] text-neutral-500 uppercase">
                          <th className="py-2 pr-3">Size</th>
                          <th className="py-2 pr-3">Chest / Waist</th>
                          <th className="py-2 pr-3">Length</th>
                          <th className="py-2">Shoulder / Hem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {product.measurements.map((row) => (
                          <tr key={row.size}>
                            <td className="py-2 pr-3 font-mono font-medium text-[#141413]">{row.size}</td>
                            <td className="py-2 pr-3 text-neutral-700">{row.chest}</td>
                            <td className="py-2 pr-3 text-neutral-700">{row.length}</td>
                            <td className="py-2 text-neutral-700">{row.shoulder}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Accordion 3: Lead Time & Freight */}
              <div>
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'freight' ? null : 'freight')}
                  className="w-full py-4 flex items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-[#141413]"
                >
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-neutral-500" />
                    Sampling, Lead Time &amp; Freight
                  </span>
                  {openAccordion === 'freight' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'freight' && (
                  <div className="pb-4 text-xs text-neutral-700 space-y-2 leading-relaxed">
                    <div>
                      <span className="font-mono text-neutral-500 uppercase">Sample Turnaround: </span>
                      7 – 10 business days via DHL Express Worldwide
                    </div>
                    <div>
                      <span className="font-mono text-neutral-500 uppercase">Bulk Production: </span>
                      {product.leadTimeDays} post tech-pack &amp; strike-off approval
                    </div>
                    <div>
                      <span className="font-mono text-neutral-500 uppercase">Packing &amp; Labels: </span>
                      Custom woven neck/care labels, frosted zip polybags &amp; carton barcoding included at 200+ pcs
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sibling Collection Strip (Matches "SEE THE COLLECTION" in Video) */}
        {siblings.length > 0 && (
          <div className="mt-20 pt-10 border-t border-black/10">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-semibold uppercase tracking-wide text-[#141413]">
                More in {subCategory.name}
              </h2>
              <span className="font-mono text-xs text-neutral-500">{siblings.length} OTHER STYLES</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {siblings.map((sib) => (
                <SiblingProductCard
                  key={sib.id}
                  sib={sib}
                  onSelect={() => {
                    onSelectSiblingProduct(sib);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SiblingProductCard: React.FC<{ sib: ProductSpec; onSelect: () => void }> = ({
  sib,
  onSelect,
}) => {
  const brandedSibUrl = useBrandedModelUrl(sib.modelWhitePhoto);
  return (
    <button type="button" onClick={onSelect} className="group text-left cursor-pointer">
      <div className="aspect-[3/4] w-full bg-white border border-black/8 overflow-hidden p-2 relative">
        <img
          src={brandedSibUrl}
          alt={sib.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div
          className="pointer-events-none absolute inset-0 shadow-[inset_0_0_24px_12px_#ffffff]"
          aria-hidden="true"
        />
      </div>
      <div className="mt-3">
        <div className="font-mono text-[11px] uppercase text-neutral-500">
          {sib.sku} · {sib.division}
        </div>
        <div className="text-base font-semibold text-[#141413] mt-0.5 group-hover:underline">
          {sib.name}
        </div>
        <div className="font-mono text-xs text-neutral-600 mt-1">
          {sib.defaultGsm} · Inspect →
        </div>
      </div>
    </button>
  );
};
