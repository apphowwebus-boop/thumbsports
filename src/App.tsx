import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft } from 'lucide-react';
import { BelowFoldSections } from './components/BelowFoldSections';
import { CapabilitiesModal } from './components/CapabilitiesModal';
import { CatalogDirectoryModal } from './components/CatalogDirectoryModal';
import { ProductDetailView, type QuoteBagItemInput } from './components/ProductDetailView';
import { QuoteBagDrawer, type BagLineItem } from './components/QuoteBagDrawer';
import { Showroom3D, type ShowroomItem } from './components/Showroom3D';
import { ThumbLogo } from './components/ThumbLogo';
import {
  CATALOG,
  findMainCategory,
  findProduct,
  findSubCategory,
  type MainCategory,
  type ProductSpec,
  type SubCategory,
} from './data/catalog';

type NavigationLevel =
  | { stage: 'main' }
  | { stage: 'sub'; mainId: string }
  | { stage: 'products'; mainId: string; subId: string }
  | { stage: 'detail'; mainId: string; subId: string; productId: string };

const BAG_STORAGE_KEY = 'thumb_sports_quote_bag_v1';

export default function App() {
  const [nav, setNav] = useState<NavigationLevel>({ stage: 'main' });
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<'capabilities' | 'sizing' | null>(null);
  const runwayRef = useRef<HTMLElement | null>(null);

  const [bagItems, setBagItems] = useState<BagLineItem[]>(() => {
    try {
      const raw = localStorage.getItem(BAG_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as BagLineItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(bagItems));
    } catch {
      // ignore storage quota errors
    }
  }, [bagItems]);

  const wallView = useMemo(() => {
    if (nav.stage === 'main') {
      const items: ShowroomItem[] = CATALOG.map((cat) => ({
        id: cat.id,
        title: cat.name,
        subtitle: cat.tagline,
        meta: `${cat.code} · ${cat.division.toUpperCase()} · ${cat.gsmRange}`,
        visualKind: cat.visualKind,
        basePhoto: cat.basePhoto,
        modelWhitePhoto: cat.modelWhitePhoto,
        hookYRatio: cat.hookYRatio,
        appearance: cat.appearance,
      }));
      return {
        items,
        levelKey: 'main',
        levelTitle: 'Thumb Sports Industries · Main Railing',
        levelSubtitle: 'Scroll or glide along the curved rail and click any garment to explore Sub-Categories',
        actionLabel: 'Open Category',
      };
    }

    if (nav.stage === 'sub') {
      const main = findMainCategory(nav.mainId) || CATALOG[0];
      const items: ShowroomItem[] = main.subCategories.map((sub) => ({
        id: sub.id,
        title: sub.name,
        subtitle: sub.specSummary,
        meta: `${sub.code} · ${sub.products.length} STYLES AVAILABLE`,
        visualKind: sub.visualKind,
        basePhoto: sub.basePhoto,
        modelWhitePhoto: sub.modelWhitePhoto,
        hookYRatio: sub.hookYRatio,
        appearance: sub.appearance,
      }));
      return {
        items,
        levelKey: `sub-${main.id}`,
        levelTitle: main.name,
        levelSubtitle: `${main.tagline} · Click a Sub-Category to inspect hanging garments`,
        actionLabel: 'View Products',
        main,
      };
    }

    if (nav.stage === 'products') {
      const main = findMainCategory(nav.mainId) || CATALOG[0];
      const sub = findSubCategory(main.id, nav.subId) || main.subCategories[0];
      const items: ShowroomItem[] = sub.products.map((prod) => ({
        id: prod.id,
        title: prod.name,
        subtitle: prod.subtitle,
        meta: `${prod.sku} · ${prod.division.toUpperCase()} · ${prod.defaultGsm}`,
        visualKind: prod.visualKind,
        basePhoto: prod.basePhoto,
        modelWhitePhoto: prod.modelWhitePhoto,
        hookYRatio: prod.hookYRatio,
        appearance: prod.appearance,
      }));
      return {
        items,
        levelKey: `products-${main.id}-${sub.id}`,
        levelTitle: sub.name,
        levelSubtitle: `${main.name} · Inspect each garment or open full wholesale spec configurator`,
        actionLabel: 'Inspect & Quote',
        main,
        sub,
      };
    }

    return null;
  }, [nav]);

  const detailRecord = useMemo(() => {
    if (nav.stage !== 'detail') return null;
    return findProduct(nav.mainId, nav.subId, nav.productId) || null;
  }, [nav]);

  const handleSelectWallItem = (item: ShowroomItem) => {
    if (nav.stage === 'main') {
      setNav({ stage: 'sub', mainId: item.id });
      window.scrollTo({ top: 0 });
    } else if (nav.stage === 'sub') {
      setNav({ stage: 'products', mainId: nav.mainId, subId: item.id });
      window.scrollTo({ top: 0 });
    } else if (nav.stage === 'products') {
      setNav({
        stage: 'detail',
        mainId: nav.mainId,
        subId: nav.subId,
        productId: item.id,
      });
      window.scrollTo({ top: 0 });
    }
  };

  const handleBackOneLevel = () => {
    if (nav.stage === 'detail') {
      setNav({ stage: 'products', mainId: nav.mainId, subId: nav.subId });
    } else if (nav.stage === 'products') {
      setNav({ stage: 'sub', mainId: nav.mainId });
    } else if (nav.stage === 'sub') {
      setNav({ stage: 'main' });
    }
    window.scrollTo({ top: 0 });
  };

  const handleAddToBag = (input: QuoteBagItemInput) => {
    setBagItems((prev) => {
      const existing = prev.find(
        (line) =>
          line.product.id === input.product.id &&
          line.gsm === input.gsm &&
          line.colorName === input.colorName &&
          line.branding === input.branding,
      );
      if (existing) {
        return prev.map((line) =>
          line.lineId === existing.lineId
            ? { ...line, quantity: line.quantity + input.quantity, unitPrice: input.unitPrice }
            : line,
        );
      }
      return [
        ...prev,
        {
          ...input,
          lineId: `${input.product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        },
      ];
    });
    setIsBagOpen(true);
  };

  const handleUpdateQty = (lineId: string, nextQty: number) => {
    setBagItems((prev) =>
      prev.map((item) => (item.lineId === lineId ? { ...item, quantity: nextQty } : item)),
    );
  };

  const handleRemoveItem = (lineId: string) => {
    setBagItems((prev) => prev.filter((item) => item.lineId !== lineId));
  };

  const handleJumpToMain = (main: MainCategory) => {
    setNav({ stage: 'sub', mainId: main.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToSub = (main: MainCategory, sub: SubCategory) => {
    setNav({ stage: 'products', mainId: main.id, subId: sub.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToProduct = (main: MainCategory, sub: SubCategory, product: ProductSpec) => {
    setNav({ stage: 'detail', mainId: main.id, subId: sub.id, productId: product.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCatalog = () => {
    document.getElementById('catalog-showcase')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Multi-item racks use a scroll runway so scrolling glides smoothly across hanging garments
  const itemCount = wallView?.items.length ?? 0;
  const runwayHeightClass =
    itemCount >= 6 ? 'h-[230vh]' : itemCount >= 2 ? 'h-[145vh]' : 'h-screen';

  return (
    <div className="min-h-screen w-full bg-white text-[#111317] flex flex-col">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white border-b border-black/10">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Thumb Sports Industries Transparent Logo */}
          <button
            type="button"
            onClick={() => {
              setNav({ stage: 'main' });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ThumbLogo compact />
          </button>

          {/* Zone 2: 4 Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-neutral-600">
            <button
              type="button"
              onClick={() => {
                setNav({ stage: 'main' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`hover:text-[#9E7018] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                nav.stage !== 'detail' ? 'text-[#111317] underline decoration-[#C6922D] decoration-2' : ''
              }`}
            >
              3D Showroom
            </button>
            <button
              type="button"
              onClick={() => setIsDirectoryOpen(true)}
              className="hover:text-[#9E7018] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Categories
            </button>
            <button
              type="button"
              onClick={() => setInfoModal('capabilities')}
              className="hover:text-[#9E7018] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Capabilities
            </button>
            <button
              type="button"
              onClick={() => setInfoModal('sizing')}
              className="hover:text-[#9E7018] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sizing &amp; Specs
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsBagOpen(true)}
              className="px-4 py-2.5 bg-[#111317] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#C6922D] hover:text-[#111317] transition-colors whitespace-nowrap shrink-0 tabular-nums cursor-pointer"
            >
              Quote Bag ({bagItems.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      {nav.stage === 'detail' && detailRecord ? (
        <main className="flex-1 w-full">
          <ProductDetailView
            mainCategory={detailRecord.main}
            subCategory={detailRecord.sub}
            product={detailRecord.product}
            onBackToWall={handleBackOneLevel}
            onSelectSiblingProduct={(sib) =>
              setNav({
                stage: 'detail',
                mainId: detailRecord.main.id,
                subId: detailRecord.sub.id,
                productId: sib.id,
              })
            }
            onAddToBag={handleAddToBag}
          />
        </main>
      ) : (
        <main className="flex-1 w-full">
          {/* Scroll-Synced 3D Railing Runway */}
          <section ref={runwayRef} className={`relative w-full ${runwayHeightClass}`}>
            <div className="sticky top-0 w-full h-screen min-h-[640px] pt-16 overflow-hidden">
              {/* Breadcrumb & Back Trail HUD when inside Sub-Category or Products Rail */}
              {nav.stage !== 'main' && wallView && (
                <div className="absolute top-20 left-6 right-6 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
                  <div className="pointer-events-auto inline-flex items-center gap-3 bg-[#F7F6F3] border border-black/12 px-3.5 py-2 shadow-sm">
                    <button
                      type="button"
                      onClick={handleBackOneLevel}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#111317] hover:text-[#9E7018] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                    <span className="text-neutral-300" aria-hidden="true">
                      |
                    </span>
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
                      <button
                        type="button"
                        onClick={() => setNav({ stage: 'main' })}
                        className="hover:text-[#111317] hover:underline whitespace-nowrap cursor-pointer"
                      >
                        Main Categories
                      </button>
                      {wallView.main && (
                        <>
                          <span aria-hidden="true">/</span>
                          <button
                            type="button"
                            onClick={() => setNav({ stage: 'sub', mainId: wallView.main!.id })}
                            className={`hover:text-[#111317] hover:underline whitespace-nowrap cursor-pointer ${
                              nav.stage === 'sub' ? 'text-[#9E7018] font-semibold' : ''
                            }`}
                          >
                            {wallView.main.name}
                          </button>
                        </>
                      )}
                      {wallView.sub && (
                        <>
                          <span aria-hidden="true">/</span>
                          <span className="text-[#9E7018] font-semibold whitespace-nowrap">
                            {wallView.sub.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDirectoryOpen(true)}
                    className="pointer-events-auto hidden sm:inline-flex px-3.5 py-2 bg-[#F7F6F3] border border-black/12 text-xs font-mono uppercase tracking-wider text-[#111317] hover:bg-white shadow-sm whitespace-nowrap cursor-pointer"
                  >
                    All Categories Index
                  </button>
                </div>
              )}

              {/* Quick Scroll-Down Button to Below-the-Fold Model Lookbook & Full Catalog */}
              <button
                type="button"
                onClick={scrollToCatalog}
                className="hidden lg:inline-flex items-center gap-1.5 absolute bottom-6 right-8 z-20 px-3.5 py-2 bg-[#111317] text-white text-[11px] font-mono uppercase tracking-wider hover:bg-[#C6922D] hover:text-[#111317] transition-colors shadow-sm cursor-pointer"
              >
                Models &amp; Catalog Below
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              {wallView && (
                <Showroom3D
                  items={wallView.items}
                  levelKey={wallView.levelKey}
                  levelTitle={wallView.levelTitle}
                  levelSubtitle={wallView.levelSubtitle}
                  actionLabel={wallView.actionLabel}
                  scrollRunwayRef={runwayRef}
                  onSelectItem={handleSelectWallItem}
                />
              )}
            </div>
          </section>

          {/* Dynamic Background-Shifting Below-the-Fold Model Lookbook & Catalog */}
          <BelowFoldSections
            onSelectProduct={handleJumpToProduct}
            onJumpToMainCategory={handleJumpToMain}
            onOpenDirectory={() => setIsDirectoryOpen(true)}
            onOpenQuoteBag={() => setIsBagOpen(true)}
          />
        </main>
      )}

      {/* Slide-Over Quote Bag Drawer */}
      <QuoteBagDrawer
        isOpen={isBagOpen}
        items={bagItems}
        onClose={() => setIsBagOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearBag={() => setBagItems([])}
      />

      {/* Full Category Index Modal */}
      <CatalogDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        onJumpToMain={handleJumpToMain}
        onJumpToSub={handleJumpToSub}
        onJumpToProduct={handleJumpToProduct}
      />

      {/* Manufacturing Capabilities & Sizing/MOQ Modal */}
      <CapabilitiesModal mode={infoModal} onClose={() => setInfoModal(null)} />
    </div>
  );
}
