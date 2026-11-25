import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Check,
  Factory,
  Flame,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import {
  ACTIVE_SECTION_BACKDROPS,
  ALL_PRODUCTS,
  BRAND_EDITORIAL_MEDIA,
  CATALOG,
  MODEL_EDITORIAL_LOOKBOOK,
  findProduct,
  type MainCategory,
  type ProductSpec,
  type SubCategory,
} from '../data/catalog';
import { useBrandedModelUrl } from '../hooks/useBrandedModelUrl';
import { ThumbLogo } from './ThumbLogo';

interface BelowFoldSectionsProps {
  onSelectProduct: (main: MainCategory, sub: SubCategory, product: ProductSpec) => void;
  onJumpToMainCategory: (main: MainCategory) => void;
  onOpenDirectory: () => void;
  onOpenQuoteBag: () => void;
}

type FilterKey =
  | 'all'
  | 'Sportswear'
  | 'Streetwear'
  | 'Combat & Bags'
  | 'sweat-suits'
  | 'jackets'
  | 'kits-spats';

interface ProductCardProps {
  main: MainCategory;
  sub: SubCategory;
  product: ProductSpec;
  index: number;
  onSelect: () => void;
}

const ProductGridCard: React.FC<ProductCardProps> = ({ main, product, index, onSelect }) => {
  const brandedModelPhoto = useBrandedModelUrl(product.modelWhitePhoto);

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, delay: Math.min((index % 4) * 0.05, 0.2), ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white border border-white/15 flex flex-col overflow-hidden hover:border-[#C6922D] hover:-translate-y-1 transition-all duration-300 shadow-[0_14px_34px_rgba(0,0,0,0.45)] hover:shadow-[0_22px_46px_rgba(0,0,0,0.65)]"
    >
      <button
        type="button"
        onClick={onSelect}
        className="relative aspect-[3/4] w-full bg-white overflow-hidden text-left cursor-pointer"
      >
        {brandedModelPhoto ? (
          <img
            src={brandedModelPhoto}
            alt={`${product.name} branded Thumb Sports Industries worn by model`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-xs text-neutral-400">
            {product.name}
          </div>
        )}
      </button>

      <div className="p-4 flex-1 flex flex-col justify-between bg-white border-t border-neutral-100 text-[#111317]">
        <div>
          <div className="text-[11px] font-mono uppercase text-neutral-500 tracking-wide">
            {product.sku} · {product.division}
          </div>

          <button
            type="button"
            onClick={onSelect}
            className="mt-1.5 text-left text-base font-semibold text-[#111317] group-hover:underline leading-snug block cursor-pointer"
          >
            {product.name}
          </button>

          <p className="text-xs text-neutral-500 mt-0.5 truncate">{main.name}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] text-neutral-500 truncate">
            {product.defaultGsm}
          </span>

          <button
            type="button"
            onClick={onSelect}
            className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#111317] group-hover:text-[#9E7018] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Inspect
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

interface SpotlightMiniCardProps {
  mainId: string;
  subId: string;
  productId: string;
  badgeText: string;
  onSelect: (main: MainCategory, sub: SubCategory, product: ProductSpec) => void;
}

const SpotlightProductMiniCard: React.FC<SpotlightMiniCardProps> = ({
  mainId,
  subId,
  productId,
  badgeText,
  onSelect,
}) => {
  const record = findProduct(mainId, subId, productId);
  const brandedUrl = useBrandedModelUrl(record?.product.modelWhitePhoto);
  if (!record) return null;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect(record.main, record.sub, record.product)}
      className="group bg-white text-[#111317] border border-white/20 hover:border-[#C6922D] overflow-hidden text-left flex flex-col shadow-[0_14px_34px_rgba(0,0,0,0.45)] cursor-pointer transition-colors"
    >
      <div className="relative aspect-[3/4] w-full bg-white overflow-hidden">
        <img
          src={brandedUrl}
          alt={record.product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-4 border-t border-neutral-100 flex-1 flex flex-col justify-between w-full">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#9E7018] font-semibold">
            {badgeText} · {record.product.sku}
          </div>
          <div className="text-sm font-semibold text-[#111317] mt-1 group-hover:underline leading-snug">
            {record.product.name}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-500 truncate pr-2">{record.product.defaultGsm}</span>
          <span className="font-semibold text-[#111317] group-hover:text-[#9E7018] shrink-0">
            Inspect →
          </span>
        </div>
      </div>
    </motion.button>
  );
};

interface CraftSpecItem {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  image: string;
  detail: string;
  specs: string[];
}

const CRAFT_PILLARS: CraftSpecItem[] = [
  {
    id: 'cresting',
    index: '01',
    title: 'Tajima TS Gold & Steel Cresting',
    subtitle: '3D Silicone, High-Density Embroidery & Woven Labels',
    image: BRAND_EDITORIAL_MEDIA.craftEmbroidery,
    detail:
      'Every garment leaves our floor finished with multi-thread Tajima embroidery, raised 3D matte silicone transfers, or custom woven neck & thigh crests.',
    specs: ['12-Head Japanese Tajima', 'Gold Metallic & Steel Thread', 'Wash-Tested 60+ Cycles'],
  },
  {
    id: 'fabrics',
    index: '02',
    title: 'Mill-Dyed GSM Performance Textiles',
    subtitle: '500 GSM French Terry · 450 GSM Pearl Weave · Taslan',
    image: BRAND_EDITORIAL_MEDIA.fabricSwatches,
    detail:
      'Custom knitted cotton fleece, DWR crinkle ripstop nylon, high-recovery compression Lycra, and competition pearl weave dyed to exact Pantone TCX standards.',
    specs: ['Pantone TCX Lab-Dips', '< 2% Sanforized Shrinkage', 'OEKO-TEX Standard 100'],
  },
  {
    id: 'atelier',
    index: '03',
    title: 'Sialkot Export Floor & Rail QC',
    subtitle: 'Piece-by-Piece Suspended Rail Inspection',
    image: BRAND_EDITORIAL_MEDIA.factoryAtelier,
    detail:
      'From automated CAD cutting to brushed-steel inspection racks, every track shell, puffer baffle, and BJJ Gi passes AQL 2.5 garment tolerances before sealing.',
    specs: ['AQL 2.5 Piece Audit', 'YKK Hardware Standard', 'DHL Express & Sea Freight'],
  },
  {
    id: 'athletes',
    index: '04',
    title: 'Pro Athlete & Streetwear Fit Blocks',
    subtitle: 'Contoured Ladies & Boxy Men’s CAD Grading',
    image: BRAND_EDITORIAL_MEDIA.athleteDuo,
    detail:
      'Developed on real track sprinters, BJJ grapplers, and studio models so seam placements stretch comfortably under movement while keeping crisp silhouettes.',
    specs: ['Contoured & Oversized Blocks', 'Flatlock 6-Thread Seams', 'Private-Label Ready'],
  },
];

export const BelowFoldSections: React.FC<BelowFoldSectionsProps> = ({
  onSelectProduct,
  onJumpToMainCategory,
  onOpenDirectory,
  onOpenQuoteBag,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [activeCraftId, setActiveCraftId] = useState<string>('cresting');

  const scrollWrapperRef = useRef<HTMLDivElement | null>(null);
  const sec1CatalogRef = useRef<HTMLElement | null>(null);
  const sec2SportswearRef = useRef<HTMLElement | null>(null);
  const sec3StreetwearRef = useRef<HTMLElement | null>(null);
  const sec4CombatRef = useRef<HTMLElement | null>(null);
  const sec5CraftPipelineRef = useRef<HTMLElement | null>(null);
  const lookbookGridRef = useRef<HTMLDivElement | null>(null);

  // Horizontal scroll-linked marquee tracks across overall wrapper
  const { scrollYProgress: wrapperProgress } = useScroll({
    target: scrollWrapperRef,
    offset: ['start end', 'end end'],
  });
  const marqueeLeftX = useTransform(wrapperProgress, [0, 1], ['0%', '-18%']);
  const marqueeRightX = useTransform(wrapperProgress, [0, 1], ['-14%', '6%']);

  // Per-section scroll progress drives sticky full-bleed active player / model background crossfades
  const { scrollYProgress: pSec1 } = useScroll({
    target: sec1CatalogRef,
    offset: ['start end', 'end start'],
  });
  const bg1Opacity = useTransform(pSec1, [0, 0.12, 0.84, 1], [1, 1, 1, 0]);
  const bg1Scale = useTransform(pSec1, [0, 1], [1.01, 1.08]);

  const { scrollYProgress: pSec2 } = useScroll({
    target: sec2SportswearRef,
    offset: ['start end', 'end start'],
  });
  const bg2Opacity = useTransform(pSec2, [0.04, 0.24, 0.78, 0.96], [0, 1, 1, 0]);
  const bg2Scale = useTransform(pSec2, [0, 1], [1.02, 1.1]);

  const { scrollYProgress: pSec3 } = useScroll({
    target: sec3StreetwearRef,
    offset: ['start end', 'end start'],
  });
  const bg3Opacity = useTransform(pSec3, [0.04, 0.24, 0.78, 0.96], [0, 1, 1, 0]);
  const bg3Scale = useTransform(pSec3, [0, 1], [1.02, 1.1]);

  const { scrollYProgress: pSec4 } = useScroll({
    target: sec4CombatRef,
    offset: ['start end', 'end start'],
  });
  const bg4Opacity = useTransform(pSec4, [0.04, 0.24, 0.78, 0.96], [0, 1, 1, 0]);
  const bg4Scale = useTransform(pSec4, [0, 1], [1.02, 1.1]);

  const { scrollYProgress: pSec5 } = useScroll({
    target: sec5CraftPipelineRef,
    offset: ['start end', 'end start'],
  });
  const bg5Opacity = useTransform(pSec5, [0.04, 0.24, 1], [0, 1, 1]);
  const bg5Scale = useTransform(pSec5, [0, 1], [1.02, 1.09]);

  // Lookbook & pipeline specific motion
  const { scrollYProgress: lookbookProgress } = useScroll({
    target: lookbookGridRef,
    offset: ['start end', 'end start'],
  });
  const colParallaxA = useTransform(lookbookProgress, [0, 1], [34, -34]);
  const colParallaxB = useTransform(lookbookProgress, [0, 1], [-22, 28]);

  const timelineBeamScaleX = useTransform(pSec5, [0.18, 0.78], [0.08, 1]);

  const activeCraft = useMemo(
    () => CRAFT_PILLARS.find((p) => p.id === activeCraftId) || CRAFT_PILLARS[0],
    [activeCraftId],
  );

  const filteredProducts = useMemo(() => {
    if (activeFilter === 'all') return ALL_PRODUCTS;
    if (
      activeFilter === 'Sportswear' ||
      activeFilter === 'Streetwear' ||
      activeFilter === 'Combat & Bags'
    ) {
      return ALL_PRODUCTS.filter((entry) => entry.product.division === activeFilter);
    }
    if (activeFilter === 'sweat-suits') {
      return ALL_PRODUCTS.filter((entry) =>
        ['sweatsuit-set', 'crewneck', 'hoodie-pullover', 'hoodie-zip'].includes(
          entry.product.visualKind,
        ),
      );
    }
    if (activeFilter === 'jackets') {
      return ALL_PRODUCTS.filter((entry) =>
        ['puffer-jacket', 'track-windbreaker', 'track-shell', 'jacket-bomber'].includes(
          entry.product.visualKind,
        ),
      );
    }
    return ALL_PRODUCTS.filter((entry) =>
      ['sports-kit', 'spats-compression', 'jersey-match'].includes(entry.product.visualKind),
    );
  }, [activeFilter]);

  const filterTabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: `All Products (${ALL_PRODUCTS.length})` },
    { key: 'Sportswear', label: 'Sportswear Line' },
    { key: 'Streetwear', label: 'Streetwear Line' },
    { key: 'Combat & Bags', label: 'Jiu-Jitsu & Bags' },
    { key: 'sweat-suits', label: 'Sweat Suits & Sweats' },
    { key: 'jackets', label: 'Puffer & Jackets' },
    { key: 'kits-spats', label: 'Sports Kits & Spats' },
  ];

  return (
    <div
      ref={scrollWrapperRef}
      className="relative w-full border-t border-black/10 overflow-x-clip bg-[#0C1017]"
    >
      {/* STICKY SCROLL-DRIVEN ACTIVE ATHLETE & MODEL BACKDROP STAGE (Changes smoothly with every section) */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none z-0 -mb-[100vh]"
        aria-hidden="true"
      >
        {/* Background 1: Dark Floodlit Night Stadium Track Sprinters */}
        <motion.div
          style={{ opacity: bg1Opacity, scale: bg1Scale }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={ACTIVE_SECTION_BACKDROPS.trackStadium}
            alt=""
            className="w-full h-full object-cover object-center brightness-[0.82] contrast-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070A10]/68 via-[#0A0E16]/52 to-[#080B12]/74" />
        </motion.div>

        {/* Background 2: Active Gym Athletes in Lavender Kit & Cobalt/Crimson Spats */}
        <motion.div
          style={{ opacity: bg2Opacity, scale: bg2Scale }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={ACTIVE_SECTION_BACKDROPS.fitnessStudio}
            alt=""
            className="w-full h-full object-cover object-center brightness-[0.78] contrast-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080C14]/72 via-[#0A0F1A]/56 to-[#080C14]/78" />
        </motion.div>

        {/* Background 3: Dark Architectural Streetwear Crew */}
        <motion.div
          style={{ opacity: bg3Opacity, scale: bg3Scale }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={ACTIVE_SECTION_BACKDROPS.streetwearCrew}
            alt=""
            className="w-full h-full object-cover object-center brightness-[0.82] contrast-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080B10]/70 via-[#0C0F14]/52 to-[#080B10]/76" />
        </motion.div>

        {/* Background 4: Jiu-Jitsu Sparring Athletes in Royal Cobalt & Pearl White Gis */}
        <motion.div
          style={{ opacity: bg4Opacity, scale: bg4Scale }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={ACTIVE_SECTION_BACKDROPS.jiujitsuMat}
            alt=""
            className="w-full h-full object-cover object-center brightness-[0.76] contrast-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070B13]/72 via-[#0A111D]/56 to-[#070B13]/78" />
        </motion.div>

        {/* Background 5: Floodlit Stadium Soccer Players in Cobalt Match Jerseys */}
        <motion.div
          style={{ opacity: bg5Opacity, scale: bg5Scale }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={ACTIVE_SECTION_BACKDROPS.footballPitch}
            alt=""
            className="w-full h-full object-cover object-center brightness-[0.82] contrast-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070A10]/74 via-[#090D16]/60 to-[#070A10]/86" />
        </motion.div>
      </div>

      {/* FOREGROUND SCROLL CONTENT LAYER */}
      <div className="relative z-10">
        {/* Scroll-Driven Dual-Track Brand Marquee */}
        <div className="bg-[#111317] text-[#F8F7F4] py-4 border-b border-white/10 overflow-hidden select-none">
          <motion.div
            style={{ x: marqueeLeftX }}
            className="flex items-center gap-8 whitespace-nowrap font-mono text-xs uppercase tracking-[0.2em]"
          >
            {[
              'THUMB SPORTS INDUSTRIES',
              'TS CREST EMBROIDERY',
              '450 GSM PEARL-WEAVE BJJ GI',
              '520 GSM ENZYME FLEECE SETS',
              'ACTIVE SPORTSWEAR KITS',
              'COMPRESSION GRAPPLING SPATS',
              'CRINKLE TASLAN WINDBREAKERS',
              'THERMAL INSULATED PUFFERS',
              'PRIVATE LABEL OEM · SIALKOT',
            ].map((item, idx) => (
              <span key={item} className="inline-flex items-center gap-6">
                <span className={idx % 2 === 0 ? 'text-[#E2B75B] font-semibold' : 'text-neutral-200'}>
                  {item}
                </span>
                <span className="w-1.5 h-1.5 bg-[#C6922D] inline-block" aria-hidden="true" />
              </span>
            ))}
          </motion.div>

          <motion.div
            style={{ x: marqueeRightX }}
            className="mt-2 flex items-center gap-8 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400"
          >
            {[
              'ISO-9001 & OEKO-TEX CERTIFIED',
              'PANTONE TCX REACTIVE DYEING',
              'CUSTOM CUT & SEW PATTERNING',
              '7-DAY PROTOTYPE DISPATCH',
              'CUSTOM WOVEN NECK & CARE TAGS',
              '48+ GLOBAL EXPORT MARKETS',
              'YKK HARDWARE & 6-THREAD FLATLOCK',
              'THUMB SPORTS INDUSTRIES OFFICIAL FACTORY',
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-6">
                <span>{item}</span>
                <span className="text-neutral-600" aria-hidden="true">
                  /
                </span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* SECTION 01: Full Branded Model Catalog Grid (Dark Night Stadium Backdrop) */}
        <section
          ref={sec1CatalogRef}
          id="catalog-showcase"
          className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0B0F17]/90 text-white p-7 md:p-9 border border-white/15 flex flex-col lg:flex-row lg:items-end justify-between gap-6 shadow-2xl"
          >
            <div>
              <div className="flex items-center gap-3">
                <ThumbLogo variant="light" compact />
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-white mt-4 text-balance">
                01. Complete Model Lineup ({ALL_PRODUCTS.length} Garments)
              </h2>
              <p className="text-sm text-neutral-300 mt-2 max-w-2xl">
                Set against our floodlit night stadium sprint backdrop—every sweat suit, sports kit,
                spats set, puffer, windbreaker, bag, and Jiu-Jitsu Gi worn on studio models with
                genuine Thumb Sports Industries TS branding.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenDirectory}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#C6922D] text-[#111317] text-xs font-semibold uppercase tracking-wider hover:bg-[#DFB459] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Full Category Index
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <div className="mt-6 flex items-center gap-1.5 overflow-x-auto pb-2">
            {filterTabs.map((tab) => {
              const active = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm ${
                    active
                      ? 'bg-[#C6922D] text-[#111317] border border-[#C6922D]'
                      : 'bg-[#10151F]/90 border border-white/15 text-neutral-200 hover:border-[#C6922D] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(({ main, sub, product }, idx) => (
              <ProductGridCard
                key={product.id}
                main={main}
                sub={sub}
                product={product}
                index={idx}
                onSelect={() => onSelectProduct(main, sub, product)}
              />
            ))}
          </div>
        </section>

        {/* SECTION 02: Active Sportswear & Gym Kits (Active Gym Athletes Backdrop) */}
        <section
          ref={sec2SportswearRef}
          id="sportswear-division"
          className="border-t border-white/15 py-24 md:py-32 text-white"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-5 bg-[#0B111C]/82 border border-white/15 p-7 md:p-9 shadow-2xl"
              >
                <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#E2B75B]">
                  <Flame className="w-4 h-4" />
                  <span>02. Active Sportswear Division</span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mt-2 text-balance">
                  Built for Sprinters, Gym Athletes &amp; Track Teams
                </h2>
                <p className="text-sm text-neutral-200 mt-3 leading-relaxed">
                  High-recovery 260 GSM Tactel Lycra kits, chafe-free 6-thread flatlock compression
                  spats, and water-repellent Taslan track shells crested with metallic TS embroidery.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-xs">
                  <div>
                    <div className="font-mono text-[#E2B75B] font-semibold">4-WAY STRETCH</div>
                    <div className="text-neutral-300 mt-0.5">Squat-Proof Nylon-Spandex</div>
                  </div>
                  <div>
                    <div className="font-mono text-[#E2B75B] font-semibold">UPF 50+ DRY-TECH</div>
                    <div className="text-neutral-300 mt-0.5">Sweat-Wicking Mesh &amp; Knit</div>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const main = CATALOG.find((c) => c.id === 'sports-kits');
                      if (main) onJumpToMainCategory(main);
                    }}
                    className="px-5 py-3 bg-[#C6922D] text-[#111317] text-xs font-semibold uppercase tracking-wider hover:bg-[#DFB459] transition-colors cursor-pointer"
                  >
                    Explore Sports Kits
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const main = CATALOG.find((c) => c.id === 'mens-spats');
                      if (main) onJumpToMainCategory(main);
                    }}
                    className="px-5 py-3 border border-white/25 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white hover:text-[#111317] transition-colors cursor-pointer"
                  >
                    Men’s Spats Rail →
                  </button>
                </div>
              </motion.div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <SpotlightProductMiniCard
                  mainId="sports-kits"
                  subId="activewear-two-piece"
                  productId="tsi-sk-02"
                  badgeText="Women’s Active"
                  onSelect={onSelectProduct}
                />
                <SpotlightProductMiniCard
                  mainId="mens-spats"
                  subId="compression-spats"
                  productId="tsi-sp-02"
                  badgeText="Compression"
                  onSelect={onSelectProduct}
                />
                <SpotlightProductMiniCard
                  mainId="mens-jackets"
                  subId="athletic-shell-jackets"
                  productId="tsi-mj-01"
                  badgeText="Track Shell"
                  onSelect={onSelectProduct}
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 03: Heavyweight Streetwear & Urban Outerwear (Golden Hour Models Crew Backdrop) */}
        <section
          ref={sec3StreetwearRef}
          id="streetwear-division"
          className="border-t border-white/15 py-24 md:py-32 text-white"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <SpotlightProductMiniCard
                  mainId="mens-sweat-suits"
                  subId="mens-heavyweight-sets"
                  productId="tsi-ms-02"
                  badgeText="500 GSM Set"
                  onSelect={onSelectProduct}
                />
                <SpotlightProductMiniCard
                  mainId="mens-jackets"
                  subId="athletic-shell-jackets"
                  productId="tsi-mj-04"
                  badgeText="Varsity Drop"
                  onSelect={onSelectProduct}
                />
                <SpotlightProductMiniCard
                  mainId="puffer-jackets"
                  subId="unisex-hooded-puffers"
                  productId="tsi-pj-01"
                  badgeText="Winter Puffer"
                  onSelect={onSelectProduct}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-5 order-1 lg:order-2 bg-[#16120E]/84 border border-[#C6922D]/35 p-7 md:p-9 shadow-2xl"
              >
                <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#E2B75B]">
                  <Sparkles className="w-4 h-4" />
                  <span>03. Heavyweight Streetwear Division</span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mt-2 text-balance">
                  500 GSM Colorblock Fleece, Varsity &amp; Puffers
                </h2>
                <p className="text-sm text-neutral-200 mt-3 leading-relaxed">
                  Custom emerald &amp; cream sweatsuits, crimson melange varsity jackets, and
                  tangerine insulated puffers crafted for retail street labels with full TS cresting
                  and private neck labels.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-xs">
                  <div>
                    <div className="font-mono text-[#E2B75B] font-semibold">480 – 540 GSM</div>
                    <div className="text-neutral-300 mt-0.5">Enzyme-Washed Fleece</div>
                  </div>
                  <div>
                    <div className="font-mono text-[#E2B75B] font-semibold">350G THERMAL</div>
                    <div className="text-neutral-300 mt-0.5">Featherless Baffle Fill</div>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const main = CATALOG.find((c) => c.id === 'mens-sweat-suits');
                      if (main) onJumpToMainCategory(main);
                    }}
                    className="px-5 py-3 bg-[#C6922D] text-[#111317] text-xs font-semibold uppercase tracking-wider hover:bg-[#DFB459] transition-colors cursor-pointer"
                  >
                    Men’s Sweat Suits
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const main = CATALOG.find((c) => c.id === 'puffer-jackets');
                      if (main) onJumpToMainCategory(main);
                    }}
                    className="px-5 py-3 border border-white/25 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white hover:text-[#111317] transition-colors cursor-pointer"
                  >
                    Puffer Collection →
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 04: Combat Sports & Jiu-Jitsu Division (Active BJJ Mat Sparring Backdrop) */}
        <section
          ref={sec4CombatRef}
          id="combat-jiujitsu-division"
          className="border-t border-white/15 py-24 md:py-32 text-white"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="bg-[#0A111D]/82 border border-white/15 p-7 md:p-9 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 shadow-2xl"
            >
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-[#E2B75B]">
                  04. Combat Athletics &amp; Dojo Gear
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mt-2 text-balance">
                  450 GSM Pearl-Weave Jiu-Jitsu Gis &amp; Tournament Packs
                </h2>
                <p className="text-sm text-neutral-200 mt-2 max-w-2xl">
                  Built in Sialkot for IBJJF tournaments and martial arts academies worldwide:
                  triple-stitched stress gussets, EVA foam collars, ripstop knee reinforcement, and
                  branded drawstring carry packs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const main = CATALOG.find((c) => c.id === 'jiujitsu-gi');
                  if (main) onJumpToMainCategory(main);
                }}
                className="px-5 py-3 bg-[#C6922D] text-[#111317] text-xs font-semibold uppercase tracking-wider hover:bg-[#DFB459] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explore Jiu-Jitsu Rail →
              </button>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <SpotlightProductMiniCard
                mainId="jiujitsu-gi"
                subId="pearl-weave-gis"
                productId="tsi-jj-02"
                badgeText="Royal Cobalt Gi"
                onSelect={onSelectProduct}
              />
              <SpotlightProductMiniCard
                mainId="jiujitsu-gi"
                subId="pearl-weave-gis"
                productId="tsi-jj-01"
                badgeText="Pearl White Gi"
                onSelect={onSelectProduct}
              />
              <SpotlightProductMiniCard
                mainId="mens-spats"
                subId="compression-spats"
                productId="tsi-sp-01"
                badgeText="No-Gi Spats"
                onSelect={onSelectProduct}
              />
              <SpotlightProductMiniCard
                mainId="drawstring-bags"
                subId="ripstop-gym-sacks"
                productId="tsi-db-01"
                badgeText="Ripstop Gym Pack"
                onSelect={onSelectProduct}
              />
            </div>
          </div>
        </section>

        {/* SECTION 05: Football Pitch, Craftsmanship Lab, Editorial Lookbook & Production Pipeline */}
        <section
          ref={sec5CraftPipelineRef}
          id="brand-craft-pipeline"
          className="border-t border-white/15 py-24 md:py-28 text-white"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-24">
            {/* 5A. Brand Craftsmanship & Tajima TS Embroidery Showcase */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
                className="bg-[#090D16]/82 border border-white/15 p-7 md:p-9 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6"
              >
                <div>
                  <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#E2B75B]">
                    <Award className="w-4 h-4" />
                    <span>05. Brand Identity Lab &amp; Stadium Match Kits</span>
                  </div>
                  <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mt-2 text-balance">
                    Crafted Under the TS Crest From Yarn to Pitch
                  </h2>
                </div>
                <p className="text-sm text-neutral-300 max-w-md">
                  Inspect our live Japanese Tajima embroidery, Pantone TCX fabric rolls, Sialkot
                  inspection rails, and floodlit stadium football jerseys.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                  {CRAFT_PILLARS.map((pillar) => {
                    const isActive = pillar.id === activeCraft.id;
                    return (
                      <button
                        key={pillar.id}
                        type="button"
                        onClick={() => setActiveCraftId(pillar.id)}
                        className={`text-left p-5 border transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-white text-[#111317] border-[#C6922D] shadow-xl'
                            : 'bg-[#090D16]/82 text-white border-white/15 hover:bg-[#111726] hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-mono text-xs font-semibold ${
                              isActive ? 'text-[#9E7018]' : 'text-[#E2B75B]'
                            }`}
                          >
                            {pillar.index}. {pillar.subtitle}
                          </span>
                          <ArrowUpRight
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-[#111317]' : 'text-neutral-400'
                            }`}
                          />
                        </div>
                        <div className="font-display text-2xl font-bold uppercase mt-1.5">
                          {pillar.title}
                        </div>
                        {isActive && (
                          <div className="mt-3 pt-3 border-t border-neutral-200 space-y-2">
                            <p className="text-xs text-neutral-600 leading-relaxed">{pillar.detail}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-[#9E7018] font-medium">
                              {pillar.specs.map((sp) => (
                                <span key={sp} className="inline-flex items-center gap-1">
                                  <Check className="w-3 h-3" /> {sp}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  <div className="sm:col-span-8 bg-[#0E131E] border border-white/20 overflow-hidden shadow-2xl">
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      <img
                        src={activeCraft.image}
                        alt={activeCraft.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5 bg-[#101624] border-t border-white/10 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-mono text-[11px] uppercase tracking-wider text-[#E2B75B]">
                          {activeCraft.index} · Thumb Sports Verification
                        </div>
                        <div className="text-sm font-semibold text-white mt-0.5">{activeCraft.title}</div>
                      </div>
                      <ThumbLogo variant="light" compact />
                    </div>
                  </div>

                  <div className="sm:col-span-4 space-y-5">
                    <div className="bg-[#0E131E]/95 border border-white/20 overflow-hidden">
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img
                          src={BRAND_EDITORIAL_MEDIA.fabricSwatches}
                          alt="Thumb Sports Industries Pantone mill fabric swatches and woven labels"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3.5 text-xs text-neutral-300">
                        <div className="font-mono text-[10px] uppercase text-[#E2B75B]">
                          Woven &amp; Hardware Trim
                        </div>
                        <div className="mt-0.5 font-medium text-white">
                          TS Neck Tags &amp; Brass YKK Zips
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0E131E]/95 border border-white/20 p-4 space-y-2.5">
                      <div className="font-mono text-[11px] uppercase text-[#E2B75B]">
                        Football &amp; League Jerseys
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        Custom sublimated 160 GSM jerseys with TS cresting and team roster numbers.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const target = findProduct('pro-jerseys-tees', 'sublimated-jerseys-tees', 'tsi-jr-01');
                          if (target) onSelectProduct(target.main, target.sub, target.product);
                        }}
                        className="w-full py-2.5 px-3 bg-[#C6922D] text-[#111317] text-xs font-semibold uppercase tracking-wider hover:bg-[#DFB459] transition-colors cursor-pointer"
                      >
                        Configure Match Jersey →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5B. Staggered Parallax Editorial Action Lookbook */}
            <div ref={lookbookGridRef}>
              <div className="bg-[#090D16]/80 border border-white/15 p-7 md:p-9 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-[#E2B75B]">
                    On-Body Active Player Lookbook
                  </div>
                  <h3 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mt-1">
                    Every Division Proven in Live Action
                  </h3>
                </div>
                <span className="font-mono text-xs text-neutral-300">
                  CLICK ANY CAMPAIGN FRAME TO CONFIGURE
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <motion.div style={{ y: colParallaxA }} className="space-y-8">
                  {MODEL_EDITORIAL_LOOKBOOK.filter((_, i) => i % 2 === 0).map((look) => {
                    const targetRecord = findProduct(look.mainId, look.subId, look.productId);
                    return (
                      <div
                        key={look.id}
                        className="group bg-[#11151E]/95 border border-white/15 hover:border-[#C6922D] transition-colors overflow-hidden flex flex-col shadow-xl"
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1D212B]">
                          <img
                            src={look.modelPhoto}
                            alt={look.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"
                            aria-hidden="true"
                          />
                          <div className="absolute bottom-5 left-5 right-5">
                            <div className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[#E2B75B]">
                              {look.badge}
                            </div>
                            <h4 className="font-display text-2xl md:text-3xl font-bold uppercase text-white mt-1">
                              {look.title}
                            </h4>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <p className="text-xs text-neutral-300 leading-relaxed max-w-md">
                            {look.description}
                          </p>
                          {targetRecord && (
                            <button
                              type="button"
                              onClick={() =>
                                onSelectProduct(
                                  targetRecord.main,
                                  targetRecord.sub,
                                  targetRecord.product,
                                )
                              }
                              className="px-4 py-2.5 bg-white text-[#111317] text-xs font-semibold uppercase tracking-wider hover:bg-[#C6922D] hover:text-[#111317] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Inspect Kit →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>

                <motion.div style={{ y: colParallaxB }} className="space-y-8 lg:mt-14">
                  {MODEL_EDITORIAL_LOOKBOOK.filter((_, i) => i % 2 === 1).map((look) => {
                    const targetRecord = findProduct(look.mainId, look.subId, look.productId);
                    return (
                      <div
                        key={look.id}
                        className="group bg-[#11151E]/95 border border-white/15 hover:border-[#C6922D] transition-colors overflow-hidden flex flex-col shadow-xl"
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1D212B]">
                          <img
                            src={look.modelPhoto}
                            alt={look.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"
                            aria-hidden="true"
                          />
                          <div className="absolute bottom-5 left-5 right-5">
                            <div className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[#E2B75B]">
                              {look.badge}
                            </div>
                            <h4 className="font-display text-2xl md:text-3xl font-bold uppercase text-white mt-1">
                              {look.title}
                            </h4>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <p className="text-xs text-neutral-300 leading-relaxed max-w-md">
                            {look.description}
                          </p>
                          {targetRecord && (
                            <button
                              type="button"
                              onClick={() =>
                                onSelectProduct(
                                  targetRecord.main,
                                  targetRecord.sub,
                                  targetRecord.product,
                                )
                              }
                              className="px-4 py-2.5 bg-white text-[#111317] text-xs font-semibold uppercase tracking-wider hover:bg-[#C6922D] hover:text-[#111317] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Inspect Kit →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </div>

            {/* 5C. 4-Stage Production Floor & OEM Pipeline */}
            <div className="bg-white text-[#111317] border border-black/10 p-8 md:p-12 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-[#9E7018] font-semibold">
                    From Custom Mill to Worldwide Delivery
                  </div>
                  <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-[#111317] mt-1">
                    Thumb Sports Industries Production Floor
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-600">
                  <ShieldCheck className="w-4 h-4 text-[#9E7018]" />
                  ISO-9001 &amp; OEKO-TEX CERTIFIED
                </span>
              </div>

              <div className="w-full h-1 bg-neutral-200 mb-10 overflow-hidden">
                <motion.div
                  style={{ scaleX: timelineBeamScaleX, transformOrigin: 'left' }}
                  className="h-full w-full bg-gradient-to-r from-[#C6922D] via-[#E2B75B] to-[#111317]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    step: '01',
                    title: 'Mill & GSM Weaving',
                    desc: '450 GSM pearl-weave BJJ cotton, 500 GSM French terry, crinkle Taslan, and 260 GSM Lycra compression knits.',
                    accent: '#C6922D',
                    icon: Factory,
                  },
                  {
                    step: '02',
                    title: 'Pantone Dye & Wash',
                    desc: 'Reactive Pantone TCX lab-dip color matching, enzyme mineral sun-fading, and zero-bleed athletic sublimation.',
                    accent: '#475569',
                    icon: Palette,
                  },
                  {
                    step: '03',
                    title: 'TS Emblem & Stitching',
                    desc: 'Flatlock 6-thread athletic seams, metallic silicone TS crests, high-density Tajima embroidery, and YKK hardware.',
                    accent: '#C6922D',
                    icon: Layers,
                  },
                  {
                    step: '04',
                    title: 'AQL 2.5 & Air Freight',
                    desc: 'Piece-by-piece QC inspection, branded frosted polybags, and express DHL Air or FOB Sea shipping worldwide.',
                    accent: '#475569',
                    icon: Truck,
                  },
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.step}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.45, delay: idx * 0.08 }}
                      whileHover={{ y: -4 }}
                      className="bg-[#F8F9FA] text-[#111317] border border-neutral-200 p-6 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-[#9E7018]">
                            {card.step}.
                          </span>
                          <Icon className="w-5 h-5" style={{ color: card.accent }} />
                        </div>
                        <h3 className="font-display text-2xl font-bold uppercase text-[#111317] mt-4">
                          {card.title}
                        </h3>
                        <p className="text-xs text-neutral-600 leading-relaxed mt-2">{card.desc}</p>
                      </div>
                      <div className="mt-6 h-0.5 w-12" style={{ backgroundColor: card.accent }} />
                    </motion.div>
                  );
                })}
              </div>

              {/* 4-Column Manufacturing Proof */}
              <div className="mt-10 pt-8 border-t border-neutral-200 grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { metric: '140,000+', label: 'Monthly Garment Output' },
                  { metric: '12 Lines', label: 'Sports & Streetwear Production' },
                  { metric: '7 Days', label: 'Proto Sample Dispatch' },
                  { metric: '48+', label: 'Export Countries Served' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-display text-4xl font-bold text-[#9E7018] tabular-nums">
                      {stat.metric}
                    </div>
                    <div className="text-xs font-mono uppercase tracking-wider text-neutral-600 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wholesale CTA Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
              className="bg-gradient-to-r from-[#14171F]/95 via-[#1C212C]/95 to-[#12151C]/95 border border-[#C6922D]/50 text-white p-8 md:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-2xl"
            >
              <div className="max-w-2xl">
                <div className="font-mono text-xs uppercase tracking-wider text-[#E2B75B]">
                  Start Your Custom Production Order
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mt-2 text-balance">
                  Manufacture Your Next Sports, Street &amp; Combat Collection
                </h2>
                <p className="text-sm text-neutral-300 mt-2">
                  Configure Sweat Suits, Sports Kits, Compression Spats, Puffer Jackets, Jiu-Jitsu
                  Gis, and Bags straight from our 3D railing into your Quote Bag for an instant
                  Proforma.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onOpenQuoteBag}
                  className="px-6 py-3.5 bg-[#C6922D] text-[#111317] text-xs font-semibold uppercase tracking-wider hover:bg-[#DFB459] transition-colors cursor-pointer"
                >
                  Open Quote Bag
                </button>
                <button
                  type="button"
                  onClick={onOpenDirectory}
                  className="px-6 py-3.5 bg-white text-[#111317] text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  View 12 Categories
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Branded Footer */}
        <footer className="bg-[#090B0E] text-[#F8F7F4] border-t border-white/10 py-14 px-6 md:px-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-5">
              <ThumbLogo variant="light" />
              <p className="text-xs text-neutral-400 mt-4 max-w-sm leading-relaxed">
                Direct manufacturer &amp; global wholesale supplier of Ladies &amp; Men’s Sweat Suits,
                Sports Kits, Men’s Spats, Puffer Jackets, Jiu-Jitsu Gis, Drawstring Bags &amp; Streetwear.
              </p>
            </div>

            <div className="md:col-span-4">
              <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-3">
                Brand Categories
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {CATALOG.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onJumpToMainCategory(cat);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-left text-neutral-300 hover:text-[#E2B75B] hover:underline truncate cursor-pointer"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-3">
                Export Desk
              </div>
              <div className="text-xs text-neutral-300 space-y-1.5">
                <div>sales@thumbsportsindustries.com</div>
                <div>Sialkot Export Manufacturing Zone</div>
                <div className="font-mono text-[11px] text-neutral-500 pt-2">
                  © 2026 Thumb Sports Industries. All Rights Reserved.
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
