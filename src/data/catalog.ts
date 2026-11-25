export type GarmentVisualKind =
  | 'sweatsuit-set'
  | 'sports-kit'
  | 'spats-compression'
  | 'puffer-jacket'
  | 'drawstring-bag'
  | 'jiujitsu-gi'
  | 'hoodie-pullover'
  | 'hoodie-zip'
  | 'crewneck'
  | 'jacket-bomber'
  | 'jacket-workwear'
  | 'cargo-ripstop'
  | 'cargo-carpenter'
  | 'tee-boxy'
  | 'tee-acid'
  | 'track-windbreaker'
  | 'track-shell'
  | 'jersey-match';

export type GarmentPatternStyle =
  | 'none'
  | 'chest-band'
  | 'varsity-stripes'
  | 'split-block'
  | 'nida-crest-pro';

export interface GarmentAppearance {
  softTintHex?: string;
  hueShiftDeg?: number;
  satScale?: number;
  lightScale?: number;
  patternStyle?: GarmentPatternStyle;
  accentHex?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  appearance: GarmentAppearance;
}

export interface ProductSpec {
  id: string;
  sku: string;
  name: string;
  subtitle: string;
  division: 'Sportswear' | 'Streetwear' | 'Combat & Bags';
  visualKind: GarmentVisualKind;
  basePhoto: string;
  modelWhitePhoto: string;
  hookYRatio: number;
  appearance: GarmentAppearance;
  gsmOptions: string[];
  defaultGsm: string;
  colors: ColorSwatch[];
  brandingOptions: string[];
  pricingTiers: {
    label: string;
    qty: number;
    unitPrice: number;
  }[];
  moq: number;
  leadTimeDays: string;
  composition: string;
  stitchingSpec: string;
  description: string;
  measurements: {
    size: string;
    chest: string;
    length: string;
    shoulder: string;
  }[];
}

export interface SubCategory {
  id: string;
  name: string;
  code: string;
  specSummary: string;
  visualKind: GarmentVisualKind;
  basePhoto: string;
  modelWhitePhoto: string;
  hookYRatio: number;
  appearance: GarmentAppearance;
  products: ProductSpec[];
}

export interface MainCategory {
  id: string;
  name: string;
  code: string;
  division: 'Sportswear' | 'Streetwear' | 'Combat & Bags';
  tagline: string;
  gsmRange: string;
  visualKind: GarmentVisualKind;
  basePhoto: string;
  modelWhitePhoto: string;
  hookYRatio: number;
  appearance: GarmentAppearance;
  subCategories: SubCategory[];
}

export interface ModelEditorialLook {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  modelPhoto: string;
  accentHex: string;
  mainId: string;
  subId: string;
  productId: string;
}

export const PHOTO_ASSETS = {
  sweatsuit: {
    url: '/src/assets/images/sweatsuit_set_hanger_1795542734750.jpg',
    hookYRatio: 0.068,
  },
  mensSweatsuitMocha: {
    url: '/src/assets/images/mens_sweatsuit_mocha_hanger_1795543476158.jpg',
    hookYRatio: 0.128,
  },
  sportsKit: {
    url: '/src/assets/images/sports_kit_hanger_1795542761465.jpg',
    hookYRatio: 0.138,
  },
  spats: {
    url: '/src/assets/images/spats_compression_hanger_1795542762033.jpg',
    hookYRatio: 0.064,
  },
  ladiesJacketCyan: {
    url: '/src/assets/images/ladies_jacket_cyan_hanger_1795543476656.jpg',
    hookYRatio: 0.102,
  },
  puffer: {
    url: '/src/assets/images/puffer_jacket_hanger_1795542734167.jpg',
    hookYRatio: 0.098,
  },
  mensJacketCyanAmber: {
    url: '/src/assets/images/mens_jacket_cyan_amber_hanger_1795543475970.jpg',
    hookYRatio: 0.118,
  },
  drawstring: {
    url: '/src/assets/images/drawstring_bag_hanger_1795542762326.jpg',
    hookYRatio: 0.112,
  },
  jiujitsu: {
    url: '/src/assets/images/jiujitsu_gi_hanger_1795542734818.jpg',
    hookYRatio: 0.052,
  },
  hoodie: {
    url: '/src/assets/images/streetwear_hoodie_hanging_1795282868519.jpg',
    hookYRatio: 0.135,
  },
  burgundyHoodie: {
    url: '/src/assets/images/burgundy_hoodie_hanger_1795543476401.jpg',
    hookYRatio: 0.125,
  },
  sweatshirt: {
    url: '/src/assets/images/real_sweatshirt_hanger_1795283993876.jpg',
    hookYRatio: 0.075,
  },
  jacket: {
    url: '/src/assets/images/streetwear_jacket_hanging_1795282870991.jpg',
    hookYRatio: 0.13,
  },
  cargo: {
    url: '/src/assets/images/real_cargo_hanger_1795283993951.jpg',
    hookYRatio: 0.048,
  },
  tee: {
    url: '/src/assets/images/streetwear_tee_hanging_1795282871088.jpg',
    hookYRatio: 0.13,
  },
  trackjacket: {
    url: '/src/assets/images/real_trackjacket_hanger_1795283994115.jpg',
    hookYRatio: 0.082,
  },
  jersey: {
    url: '/src/assets/images/nida_sport_jersey_cobalt_1795284877703.jpg',
    hookYRatio: 0.078,
  },
} as const;

export const MODEL_WHITE_ASSETS = {
  ladiesCoralSweatsuit: '/src/assets/images/model_white_ladies_coral_sweatsuit_1795546593320.jpg',
  mensMochaSweatsuit: '/src/assets/images/model_white_mens_mocha_sweatsuit_1795546593521.jpg',
  ladiesSportsKit: '/src/assets/images/model_white_ladies_sports_kit_1795546596456.jpg',
  mensCompressionSpats: '/src/assets/images/model_white_mens_compression_spats_1795546594357.jpg',
  ladiesCyanPuffer: '/src/assets/images/model_white_ladies_cyan_puffer_1795546596963.jpg',
  mensOrangePuffer: '/src/assets/images/model_white_mens_orange_puffer_1795546597026.jpg',
  mensCyanAmberTrack: '/src/assets/images/model_white_mens_cyan_amber_track_1795546596668.jpg',
  mensOliveBomber: '/src/assets/images/model_white_mens_olive_bomber_1795546598389.jpg',
  ladiesChalkWindbreaker: '/src/assets/images/model_white_ladies_chalk_windbreaker_1795546598815.jpg',
  mensDrawstringBag: '/src/assets/images/model_white_mens_drawstring_bag_1795546598252.jpg',
  mensJiujitsuGi: '/src/assets/images/model_white_mens_jiujitsu_gi_1795546599447.jpg',
  mensUmberCrewneck: '/src/assets/images/model_white_mens_umber_crewneck_1795546600149.jpg',
  ladiesBurgundyHoodie: '/src/assets/images/model_white_ladies_burgundy_hoodie_1795546750709.jpg',
  mensCharcoalHoodie: '/src/assets/images/model_white_mens_charcoal_hoodie_1795546751629.jpg',
  mensCobaltJersey: '/src/assets/images/model_white_mens_cobalt_jersey_1795546601147.jpg',
  ladiesBoneTee: '/src/assets/images/model_white_ladies_bone_tee_1795546753133.jpg',
  mensBlackCargo: '/src/assets/images/model_white_mens_black_cargo_1795546687126.jpg',
  newEmeraldSweatsuit: '/src/assets/images/model_white_new_emerald_sweatsuit_1795547552307.jpg',
  newLavenderSportsKit: '/src/assets/images/model_white_new_lavender_sportskit_1795547552895.jpg',
  newCobaltSpats: '/src/assets/images/model_white_new_cobalt_spats_1795547554490.jpg',
  newTealWindbreaker: '/src/assets/images/model_white_new_teal_windbreaker_1795547554495.jpg',
  newCrimsonVarsity: '/src/assets/images/model_white_new_crimson_varsity_1795547554490.jpg',
  newCobaltJiujitsu: '/src/assets/images/model_white_new_cobalt_jiujitsu_1795547556442.jpg',
} as const;

export const ACTIVE_SECTION_BACKDROPS = {
  trackStadium: '/src/assets/images/bg_dark_track_sprinter_1795619514394.jpg',
  fitnessStudio: '/src/assets/images/bg_active_fitness_studio_1795618436963.jpg',
  streetwearCrew: '/src/assets/images/bg_dark_streetwear_night_1795619514307.jpg',
  jiujitsuMat: '/src/assets/images/bg_active_jiujitsu_mat_1795618439464.jpg',
  footballPitch: '/src/assets/images/bg_active_football_pitch_1795618440468.jpg',
} as const;

export const BRAND_EDITORIAL_MEDIA = {
  craftEmbroidery: '/src/assets/images/brand_craft_embroidery_1795548552727.jpg',
  factoryAtelier: '/src/assets/images/brand_factory_atelier_1795548552291.jpg',
  fabricSwatches: '/src/assets/images/brand_fabric_swatches_ts_1795548625547.jpg',
  athleteDuo: '/src/assets/images/brand_athlete_duo_1795548554592.jpg',
} as const;

export const MODEL_EDITORIAL_LOOKBOOK: ModelEditorialLook[] = [
  {
    id: 'look-track-kit',
    badge: 'Pro Sportswear Look 01',
    title: 'Cyan & Amber Track Shell on Floodlit Stadium',
    subtitle: 'Active Sprinter · DWR Crinkle Taslan Outerwear',
    description:
      'Engineered for track sprinters and stadium conditioning: water-repellent Cyan & Amber colorblock shell finished with embroidered TS chest cresting.',
    modelPhoto: '/src/assets/images/bg_dark_track_sprinter_1795619514394.jpg',
    accentHex: '#06B6D4',
    mainId: 'mens-jackets',
    subId: 'athletic-shell-jackets',
    productId: 'tsi-mj-01',
  },
  {
    id: 'look-sweatsuit-duo',
    badge: 'Streetwear Drop Look 02',
    title: 'Emerald Sweat Suit, Crimson Varsity & Alpine Puffer',
    subtitle: 'Night Architectural Streetwear Crew Campaign',
    description:
      'Heavyweight 500 GSM emerald fleece, crimson scarlet varsity wool-blend, and thermal tangerine puffer wearing custom TS chest embroidery.',
    modelPhoto: '/src/assets/images/bg_dark_streetwear_night_1795619514307.jpg',
    accentHex: '#10B981',
    mainId: 'mens-sweat-suits',
    subId: 'mens-heavyweight-sets',
    productId: 'tsi-ms-02',
  },
  {
    id: 'look-jiujitsu-gi',
    badge: 'Combat Division Look 03',
    title: 'IBJJF Spec 450 GSM Pearl-Weave Jiu-Jitsu Gis',
    subtitle: 'Live Mat Sparring · Cobalt & Pearl White',
    description:
      'Competition-grade pearl weave cotton kimono with EVA foam collar, triple-reinforced knee ripstop trousers, and embroidered TS shoulder cresting.',
    modelPhoto: '/src/assets/images/bg_active_jiujitsu_mat_1795618439464.jpg',
    accentHex: '#2563EB',
    mainId: 'jiujitsu-gi',
    subId: 'pearl-weave-gis',
    productId: 'tsi-jj-02',
  },
  {
    id: 'look-football-pitch',
    badge: 'Team Match Kit Look 04',
    title: 'Cobalt Geometric Pro Match Jerseys',
    subtitle: 'Floodlit Pitch Action · 160 GSM Dry-Fit Mesh',
    description:
      'Full-sublimation cobalt geometric football match jersey worn by men’s and women’s squad players with centered TS chest identity.',
    modelPhoto: '/src/assets/images/bg_active_football_pitch_1795618440468.jpg',
    accentHex: '#1D4ED8',
    mainId: 'pro-jerseys-tees',
    subId: 'sublimated-jerseys-tees',
    productId: 'tsi-jr-01',
  },
];

const LADIES_SWEATSUIT_SWATCHES: ColorSwatch[] = [
  { name: 'Coral Rose / Cream', hex: '#DF6458', appearance: {} },
  { name: 'Dusty Berry / Cream', hex: '#9D3B5E', appearance: { hueShiftDeg: -18, satScale: 0.85, lightScale: 0.84 } },
  { name: 'Sage Olive / Cream', hex: '#5D7059', appearance: { hueShiftDeg: 105, satScale: 0.35, lightScale: 0.82 } },
  { name: 'Royal Cobalt / Cream', hex: '#2563EB', appearance: { hueShiftDeg: 215, satScale: 0.95, lightScale: 0.88 } },
];

const MENS_SWEATSUIT_SWATCHES: ColorSwatch[] = [
  { name: 'Mocha Earth / Cream', hex: '#6E5242', appearance: {} },
  { name: 'Washed Charcoal / Cream', hex: '#383A3E', appearance: { satScale: 0.15, lightScale: 0.78 } },
  { name: 'Forest Moss / Cream', hex: '#4B5E4A', appearance: { hueShiftDeg: 95, satScale: 0.6, lightScale: 0.88 } },
  { name: 'Deep Navy / Cream', hex: '#1E3A5F', appearance: { softTintHex: '#1E3A5F', satScale: 0.85 } },
];

const SPORTS_KIT_SWATCHES: ColorSwatch[] = [
  { name: 'Coral / Slate', hex: '#E07A72', appearance: {} },
  { name: 'Electric Teal / Pitch', hex: '#0891B2', appearance: { hueShiftDeg: 185, satScale: 0.95 } },
  { name: 'Violet Pulse / Charcoal', hex: '#7C3AED', appearance: { hueShiftDeg: -105, satScale: 0.9 } },
  { name: 'Emerald / Slate', hex: '#059669', appearance: { hueShiftDeg: 145, satScale: 0.9 } },
];

const SPATS_SWATCHES: ColorSwatch[] = [
  { name: 'Graphite / Steel', hex: '#4B5056', appearance: {} },
  { name: 'Cobalt Tech / Navy', hex: '#1D4ED8', appearance: { softTintHex: '#1D4ED8', satScale: 0.95 } },
  { name: 'Crimson Velocity', hex: '#991B1B', appearance: { softTintHex: '#991B1B', satScale: 0.95 } },
  { name: 'Forest Moss / Slate', hex: '#1E563B', appearance: { softTintHex: '#1D5C3E', satScale: 0.9 } },
];

const LADIES_PUFFER_SWATCHES: ColorSwatch[] = [
  { name: 'Electric Cyan / Charcoal', hex: '#06B6D4', appearance: {} },
  { name: 'Cobalt Blue / Charcoal', hex: '#2563EB', appearance: { hueShiftDeg: 32, satScale: 0.95 } },
  { name: 'Violet Slate / Charcoal', hex: '#7C3AED', appearance: { hueShiftDeg: 78, satScale: 0.85 } },
  { name: 'Crimson / Charcoal', hex: '#DC2626', appearance: { hueShiftDeg: 170, satScale: 0.9 } },
];

const MENS_PUFFER_SWATCHES: ColorSwatch[] = [
  { name: 'Tangerine / Charcoal', hex: '#EA580C', appearance: {} },
  { name: 'Cobalt Blue / Charcoal', hex: '#2563EB', appearance: { hueShiftDeg: 205, satScale: 0.92 } },
  { name: 'Forest Emerald / Pitch', hex: '#059669', appearance: { hueShiftDeg: 130, satScale: 0.82 } },
  { name: 'Signal Crimson / Charcoal', hex: '#DC2626', appearance: { hueShiftDeg: -16, satScale: 0.95 } },
];

const MENS_TRACK_SWATCHES: ColorSwatch[] = [
  { name: 'Cyan / Amber Gold', hex: '#0891B2', appearance: {} },
  { name: 'Emerald / Signal Gold', hex: '#059669', appearance: { hueShiftDeg: -42, satScale: 0.9 } },
  { name: 'Royal / Tangerine', hex: '#2563EB', appearance: { hueShiftDeg: 35, satScale: 0.92 } },
];

const DRAWSTRING_SWATCHES: ColorSwatch[] = [
  { name: 'Signal Orange / Black', hex: '#F97316', appearance: {} },
  { name: 'Electric Cyan / Black', hex: '#0891B2', appearance: { hueShiftDeg: 175, satScale: 0.92 } },
  { name: 'Royal Blue / Black', hex: '#2563EB', appearance: { hueShiftDeg: 205, satScale: 0.92 } },
  { name: 'Crimson Red / Black', hex: '#DC2626', appearance: { hueShiftDeg: -18, satScale: 0.95 } },
];

const GI_SWATCHES: ColorSwatch[] = [
  { name: 'Pearl White / Black Belt', hex: '#F3F2EE', appearance: {} },
  { name: 'Competition Royal Blue', hex: '#1E40AF', appearance: { softTintHex: '#1E429F', satScale: 0.95 } },
  { name: 'Midnight Pitch Black', hex: '#1C1D20', appearance: { softTintHex: '#202226', lightScale: 0.45 } },
  { name: 'Tactical Olive Drab', hex: '#4B553A', appearance: { softTintHex: '#4F5C3B', lightScale: 0.72 } },
];

const FLEECE_SWATCHES: ColorSwatch[] = [
  { name: 'Washed Charcoal', hex: '#37393B', appearance: {} },
  { name: 'Deep Navy', hex: '#1F3A6B', appearance: { softTintHex: '#1F3F7A', satScale: 0.9 } },
  { name: 'Forest Pine', hex: '#23533D', appearance: { softTintHex: '#205C41', satScale: 0.9 } },
  { name: 'Warm Ochre', hex: '#9A6324', appearance: { softTintHex: '#A66A22', satScale: 0.88 } },
];

const BURGUNDY_HOODIE_SWATCHES: ColorSwatch[] = [
  { name: 'Burgundy Oxblood / Cream', hex: '#6D2434', appearance: {} },
  { name: 'Deep Forest / Cream', hex: '#234B38', appearance: { hueShiftDeg: 145, satScale: 0.75, lightScale: 0.9 } },
  { name: 'Slate Navy / Cream', hex: '#1E3A5F', appearance: { hueShiftDeg: 215, satScale: 0.8, lightScale: 0.92 } },
];

const JERSEY_SWATCHES: ColorSwatch[] = [
  { name: 'Royal Cobalt / White', hex: '#1D4ED8', appearance: {} },
  { name: 'Crimson / White', hex: '#DC2626', appearance: { hueShiftDeg: 145, satScale: 0.92 } },
  { name: 'Emerald / White', hex: '#059669', appearance: { hueShiftDeg: -68, satScale: 0.9 } },
  { name: 'Amber Gold / White', hex: '#D97706', appearance: { hueShiftDeg: 184, satScale: 0.9 } },
];

const WINDBREAKER_SWATCHES: ColorSwatch[] = [
  { name: 'Chalk / Charcoal', hex: '#2B2D30', appearance: {} },
  { name: 'Chalk / Navy', hex: '#1E3A8A', appearance: { softTintHex: '#1E3F8C', satScale: 0.9 } },
  { name: 'Chalk / Crimson', hex: '#991B1B', appearance: { softTintHex: '#A81D24', satScale: 0.9 } },
];

const JACKET_SWATCHES: ColorSwatch[] = [
  { name: 'Field Olive', hex: '#555E44', appearance: {} },
  { name: 'Slate Navy', hex: '#2E3C54', appearance: { softTintHex: '#2C3D5C' } },
  { name: 'Rust Tobacco', hex: '#7A462C', appearance: { softTintHex: '#824628' } },
];

const CARGO_SWATCHES: ColorSwatch[] = [
  { name: 'Matte Pitch', hex: '#1E2022', appearance: {} },
  { name: 'Tactical Moss', hex: '#435036', appearance: { softTintHex: '#465735' } },
  { name: 'Navy Utility', hex: '#24344D', appearance: { softTintHex: '#223656' } },
];

const TEE_SWATCHES: ColorSwatch[] = [
  { name: 'Bone / Slate', hex: '#DED8CC', appearance: {} },
  { name: 'Sage Mist / Slate', hex: '#A9B5A4', appearance: { softTintHex: '#6D856A', satScale: 0.7 } },
  { name: 'Dusty Steel / Navy', hex: '#7C8FA6', appearance: { softTintHex: '#3B5880', satScale: 0.7 } },
];

const TOP_MEASUREMENTS = [
  { size: 'S', chest: '58 cm', length: '66 cm', shoulder: '55 cm' },
  { size: 'M', chest: '61 cm', length: '69 cm', shoulder: '58 cm' },
  { size: 'L', chest: '64 cm', length: '72 cm', shoulder: '61 cm' },
  { size: 'XL', chest: '67 cm', length: '75 cm', shoulder: '64 cm' },
  { size: 'XXL', chest: '70 cm', length: '77 cm', shoulder: '67 cm' },
];

const BOTTOM_MEASUREMENTS = [
  { size: '28 / S', chest: '74 cm waist', length: '101 cm outseam', shoulder: '23 cm hem' },
  { size: '30 / M', chest: '79 cm waist', length: '103 cm outseam', shoulder: '24 cm hem' },
  { size: '32 / L', chest: '84 cm waist', length: '105 cm outseam', shoulder: '25 cm hem' },
  { size: '34 / XL', chest: '89 cm waist', length: '107 cm outseam', shoulder: '26 cm hem' },
  { size: '36 / XXL', chest: '94 cm waist', length: '109 cm outseam', shoulder: '27 cm hem' },
];

const STANDARD_BRANDING = [
  'Thumb Sports Woven Crest + Private Neck Tag',
  '3D Matte Silicone Transfer + Hangtag Set',
  'High-Density Embroidery + Woven Care Label',
  'Custom Sublimation + Branded Zip Pullers',
];

function makeTiers(base50: number) {
  return [
    { label: 'Sample (1 pc)', qty: 1, unitPrice: Math.round(base50 * 2.1) },
    { label: 'MOQ 50 pcs', qty: 50, unitPrice: base50 },
    { label: '200 pcs', qty: 200, unitPrice: Number((base50 * 0.82).toFixed(2)) },
    { label: '500+ pcs', qty: 500, unitPrice: Number((base50 * 0.68).toFixed(2)) },
  ];
}

export const CATALOG: MainCategory[] = [
  {
    id: 'ladies-sweat-suits',
    name: 'Ladies Sweat Suits',
    code: 'TSI-01',
    division: 'Sportswear',
    tagline: 'Coordinated women’s heavyweight fleece crew & cuffed jogger sets',
    gsmRange: '380 – 480 GSM',
    visualKind: 'sweatsuit-set',
    basePhoto: PHOTO_ASSETS.sweatsuit.url,
    modelWhitePhoto: MODEL_WHITE_ASSETS.ladiesCoralSweatsuit,
    hookYRatio: PHOTO_ASSETS.sweatsuit.hookYRatio,
    appearance: {},
    subCategories: [
      {
        id: 'ladies-fleece-sets',
        name: 'Contoured Two-Piece Sweat Suits',
        code: 'SUB 01.A',
        specSummary: 'Cream Rib Trim · Soft Brushed Cotton Fleece',
        visualKind: 'sweatsuit-set',
        basePhoto: PHOTO_ASSETS.sweatsuit.url,
        modelWhitePhoto: MODEL_WHITE_ASSETS.ladiesCoralSweatsuit,
        hookYRatio: PHOTO_ASSETS.sweatsuit.hookYRatio,
        appearance: {},
        products: [
          {
            id: 'tsi-ls-01',
            sku: 'TSI-LS-01',
            name: 'Coral Rose Two-Piece Fleece Sweat Suit',
            subtitle: 'Cream Contrast Rib · Brushed Fleece Set',
            division: 'Sportswear',
            visualKind: 'sweatsuit-set',
            basePhoto: PHOTO_ASSETS.sweatsuit.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.ladiesCoralSweatsuit,
            hookYRatio: PHOTO_ASSETS.sweatsuit.hookYRatio,
            appearance: {},
            gsmOptions: ['380 GSM French Terry', '440 GSM Brushed Fleece', '480 GSM Heavy Loopback'],
            defaultGsm: '440 GSM Brushed Fleece',
            colors: LADIES_SWEATSUIT_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(34.5),
            moq: 50,
            leadTimeDays: '16 – 20 Days',
            composition: '85% Ring-Spun Combed Cotton / 15% Recycled Polyester Fleece',
            stitchingSpec: 'Flatlock athletic seams, 2x2 cotton rib waistband & cuffs, tipped drawcord',
            description:
              'Coordinated coral rose women’s sweat suit crafted with ultra-soft brushed fleece, contrast cream rib trim, and Thumb Sports woven chest & thigh branding.',
            measurements: TOP_MEASUREMENTS,
          },
        ],
      },
    ],
  },
  {
    id: 'mens-sweat-suits',
    name: "Men's Sweat Suits",
    code: 'TSI-02',
    division: 'Streetwear',
    tagline: 'Emerald & cream colorblock + mocha boxy heavyweight fleece sets',
    gsmRange: '440 – 540 GSM',
    visualKind: 'sweatsuit-set',
    basePhoto: PHOTO_ASSETS.mensSweatsuitMocha.url,
    modelWhitePhoto: MODEL_WHITE_ASSETS.newEmeraldSweatsuit,
    hookYRatio: PHOTO_ASSETS.mensSweatsuitMocha.hookYRatio,
    appearance: {},
    subCategories: [
      {
        id: 'mens-heavyweight-sets',
        name: "Men's Boxy Fleece Sets",
        code: 'SUB 02.A',
        specSummary: '500 GSM Colorblock & Heavyweight Sets · Cream Rib Trim',
        visualKind: 'sweatsuit-set',
        basePhoto: PHOTO_ASSETS.mensSweatsuitMocha.url,
        modelWhitePhoto: MODEL_WHITE_ASSETS.newEmeraldSweatsuit,
        hookYRatio: PHOTO_ASSETS.mensSweatsuitMocha.hookYRatio,
        appearance: {},
        products: [
          {
            id: 'tsi-ms-02',
            sku: 'TSI-MS-02',
            name: 'Emerald & Cream Colorblock Fleece Set',
            subtitle: 'Cut & Sew Cream Chest Block · Piped Joggers',
            division: 'Streetwear',
            visualKind: 'sweatsuit-set',
            basePhoto: PHOTO_ASSETS.mensSweatsuitMocha.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.newEmeraldSweatsuit,
            hookYRatio: PHOTO_ASSETS.mensSweatsuitMocha.hookYRatio,
            appearance: { hueShiftDeg: 95, satScale: 0.9, lightScale: 0.92 },
            gsmOptions: ['440 GSM Terry', '500 GSM Heavy Fleece'],
            defaultGsm: '500 GSM Heavy Fleece',
            colors: MENS_SWEATSUIT_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(37.5),
            moq: 50,
            leadTimeDays: '18 – 22 Days',
            composition: '100% Combed Heavyweight Cotton Fleece',
            stitchingSpec: 'Cut-and-sew cream panel, side seam piping, 2x2 ribbed ankle cuffs',
            description:
              'Vibrant forest emerald and crisp cream two-piece street sweat suit featuring contrast side-piped joggers and heavyweight rib trim.',
            measurements: TOP_MEASUREMENTS,
          },
          {
            id: 'tsi-ms-01',
            sku: 'TSI-MS-01',
            name: "Mocha Earth Men's 500 GSM Sweat Suit",
            subtitle: 'Contrast Topstitching · Heavy Cuff Jogger',
            division: 'Streetwear',
            visualKind: 'sweatsuit-set',
            basePhoto: PHOTO_ASSETS.mensSweatsuitMocha.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.mensMochaSweatsuit,
            hookYRatio: PHOTO_ASSETS.mensSweatsuitMocha.hookYRatio,
            appearance: {},
            gsmOptions: ['440 GSM Terry', '500 GSM Heavy Fleece'],
            defaultGsm: '500 GSM Heavy Fleece',
            colors: MENS_SWEATSUIT_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(36.0),
            moq: 50,
            leadTimeDays: '18 – 22 Days',
            composition: '100% Combed Heavyweight Cotton (Enzyme Washed)',
            stitchingSpec: 'Contrast flatlock seams, double waistband elastic with cream drawcord',
            description:
              'Complete mocha earth heavyweight two-piece street sweat suit built on a generous boxy men’s silhouette with natural cream rib trim.',
            measurements: TOP_MEASUREMENTS,
          },
        ],
      },
    ],
  },
  {
    id: 'sports-kits',
    name: 'Sports Kit',
    code: 'TSI-03',
    division: 'Sportswear',
    tagline: 'Sculpted lavender long-sleeve & coral seamless activewear sets',
    gsmRange: '220 – 280 GSM',
    visualKind: 'sports-kit',
    basePhoto: PHOTO_ASSETS.sportsKit.url,
    modelWhitePhoto: MODEL_WHITE_ASSETS.newLavenderSportsKit,
    hookYRatio: PHOTO_ASSETS.sportsKit.hookYRatio,
    appearance: {},
    subCategories: [
      {
        id: 'activewear-two-piece',
        name: 'Compression Training Kits',
        code: 'SUB 03.A',
        specSummary: '260 GSM Nylon-Spandex · Squat-Proof 4-Way Stretch',
        visualKind: 'sports-kit',
        basePhoto: PHOTO_ASSETS.sportsKit.url,
        modelWhitePhoto: MODEL_WHITE_ASSETS.newLavenderSportsKit,
        hookYRatio: PHOTO_ASSETS.sportsKit.hookYRatio,
        appearance: {},
        products: [
          {
            id: 'tsi-sk-02',
            sku: 'TSI-SK-02',
            name: 'Lavender & White Cutout Activewear Set',
            subtitle: 'Long-Sleeve Keyhole Top + Contoured Leggings',
            division: 'Sportswear',
            visualKind: 'sports-kit',
            basePhoto: PHOTO_ASSETS.sportsKit.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.newLavenderSportsKit,
            hookYRatio: PHOTO_ASSETS.sportsKit.hookYRatio,
            appearance: { hueShiftDeg: -105, satScale: 0.9 },
            gsmOptions: ['240 GSM Nylon-Elastane', '280 GSM Matte Interlock'],
            defaultGsm: '280 GSM Matte Interlock',
            colors: SPORTS_KIT_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(22.5),
            moq: 50,
            leadTimeDays: '14 – 18 Days',
            composition: '78% Tactel Nylon / 22% High-Recovery Lycra Spandex',
            stitchingSpec: 'White architectural seam piping, thumbhole sleeves, high-rise waist',
            description:
              'Sculpted dusty lavender long-sleeve keyhole crop & full-length contoured legging set engineered for studio Pilates, gym, and athleisure drops.',
            measurements: TOP_MEASUREMENTS,
          },
          {
            id: 'tsi-sk-01',
            sku: 'TSI-SK-01',
            name: 'Coral & Slate Seamless Pro Sports Kit',
            subtitle: 'Racerback Crop + High-Waist Bike Shorts',
            division: 'Sportswear',
            visualKind: 'sports-kit',
            basePhoto: PHOTO_ASSETS.sportsKit.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.ladiesSportsKit,
            hookYRatio: PHOTO_ASSETS.sportsKit.hookYRatio,
            appearance: {},
            gsmOptions: ['240 GSM Nylon-Elastane', '280 GSM Matte Interlock'],
            defaultGsm: '280 GSM Matte Interlock',
            colors: SPORTS_KIT_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(19.5),
            moq: 50,
            leadTimeDays: '14 – 18 Days',
            composition: '78% Tactel Nylon / 22% High-Recovery Lycra Spandex',
            stitchingSpec: 'Chafe-free 6-thread flatlock contour paneling, removable cup pockets',
            description:
              'Sculpted high-compression athletic kit designed for gym clubs, running crews, and activewear labels.',
            measurements: TOP_MEASUREMENTS,
          },
        ],
      },
    ],
  },
  {
    id: 'mens-spats',
    name: "Men's Spats",
    code: 'TSI-04',
    division: 'Sportswear',
    tagline: 'Cobalt & crimson MMA, grappling & running compression spats',
    gsmRange: '220 – 270 GSM',
    visualKind: 'spats-compression',
    basePhoto: PHOTO_ASSETS.spats.url,
    modelWhitePhoto: MODEL_WHITE_ASSETS.newCobaltSpats,
    hookYRatio: PHOTO_ASSETS.spats.hookYRatio,
    appearance: {},
    subCategories: [
      {
        id: 'compression-spats',
        name: 'Sublimated & Panelled Compression Spats',
        code: 'SUB 04.A',
        specSummary: 'Zero-Slip Silicone Hem · Anti-Mat Burn Flatlock',
        visualKind: 'spats-compression',
        basePhoto: PHOTO_ASSETS.spats.url,
        modelWhitePhoto: MODEL_WHITE_ASSETS.newCobaltSpats,
        hookYRatio: PHOTO_ASSETS.spats.hookYRatio,
        appearance: {},
        products: [
          {
            id: 'tsi-sp-02',
            sku: 'TSI-SP-02',
            name: 'Cobalt & Crimson Velocity Grappling Spats',
            subtitle: 'Panelled Compression Spats + Matching Rashguard',
            division: 'Sportswear',
            visualKind: 'spats-compression',
            basePhoto: PHOTO_ASSETS.spats.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.newCobaltSpats,
            hookYRatio: PHOTO_ASSETS.spats.hookYRatio,
            appearance: { softTintHex: '#1D4ED8', satScale: 0.95 },
            gsmOptions: ['220 GSM Dry-Tech Poly', '260 GSM Heavy Nylon Spandex'],
            defaultGsm: '260 GSM Heavy Nylon Spandex',
            colors: SPATS_SWATCHES,
            brandingOptions: ['Full Sublimation + Jacquard Waistband', 'Silicone Crest + Flatlock'],
            pricingTiers: makeTiers(17.5),
            moq: 50,
            leadTimeDays: '12 – 16 Days',
            composition: '82% High-Density Polyester / 18% Spandex (UPF 50+)',
            stitchingSpec: 'Crimson contrast 6-thread flatlock, geometric cobalt leg panels',
            description:
              'High-contrast royal cobalt and crimson panelled grappling compression spats designed for No-Gi BJJ, MMA, and high-output track training.',
            measurements: BOTTOM_MEASUREMENTS,
          },
          {
            id: 'tsi-sp-01',
            sku: 'TSI-SP-01',
            name: 'Graphite & Steel Pro Grappling Spats',
            subtitle: 'Ergonomic Knee & Hip Gussets · Flatlock Seams',
            division: 'Sportswear',
            visualKind: 'spats-compression',
            basePhoto: PHOTO_ASSETS.spats.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.mensCompressionSpats,
            hookYRatio: PHOTO_ASSETS.spats.hookYRatio,
            appearance: {},
            gsmOptions: ['220 GSM Dry-Tech Poly', '260 GSM Heavy Nylon Spandex'],
            defaultGsm: '260 GSM Heavy Nylon Spandex',
            colors: SPATS_SWATCHES,
            brandingOptions: ['Full Sublimation + Jacquard Waistband', 'Silicone Crest + Flatlock'],
            pricingTiers: makeTiers(15.5),
            moq: 50,
            leadTimeDays: '12 – 16 Days',
            composition: '82% High-Density Polyester / 18% Spandex (UPF 50+)',
            stitchingSpec: 'Reinforced 4-needle 6-thread flatlock, internal ankle grip band',
            description:
              'Second-skin compression spats built to withstand Jiu-Jitsu mat friction, sprint intervals, and heavy leg training.',
            measurements: BOTTOM_MEASUREMENTS,
          },
        ],
      },
    ],
  },
  {
    id: 'ladies-jackets',
    name: 'Ladies Jacket',
    code: 'TSI-05',
    division: 'Sportswear',
    tagline: 'Electric cyan & charcoal insulated quilted winter outerwear',
    gsmRange: '280 – 360 GSM',
    visualKind: 'puffer-jacket',
    basePhoto: PHOTO_ASSETS.ladiesJacketCyan.url,
    modelWhitePhoto: MODEL_WHITE_ASSETS.ladiesCyanPuffer,
    hookYRatio: PHOTO_ASSETS.ladiesJacketCyan.hookYRatio,
    appearance: {},
    subCategories: [
      {
        id: 'ladies-puffer-jackets',
        name: 'Quilted Cyan & Charcoal Puffer Jackets',
        code: 'SUB 05.A',
        specSummary: 'Water-Resistant Nylon · High-Loft Thermal Fill',
        visualKind: 'puffer-jacket',
        basePhoto: PHOTO_ASSETS.ladiesJacketCyan.url,
        modelWhitePhoto: MODEL_WHITE_ASSETS.ladiesCyanPuffer,
        hookYRatio: PHOTO_ASSETS.ladiesJacketCyan.hookYRatio,
        appearance: {},
        products: [
          {
            id: 'tsi-lj-01',
            sku: 'TSI-LJ-01',
            name: 'Electric Cyan & Charcoal Ladies Puffer',
            subtitle: 'Grid-Quilted Ripstop · Contrast Shoulder Yoke',
            division: 'Sportswear',
            visualKind: 'puffer-jacket',
            basePhoto: PHOTO_ASSETS.ladiesJacketCyan.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.ladiesCyanPuffer,
            hookYRatio: PHOTO_ASSETS.ladiesJacketCyan.hookYRatio,
            appearance: {},
            gsmOptions: ['280g Micro-Ripstop + 300g Polyfill', '340g Matte Taslan + Down-Alt'],
            defaultGsm: '280g Micro-Ripstop + 300g Polyfill',
            colors: LADIES_PUFFER_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(39.0),
            moq: 50,
            leadTimeDays: '22 – 28 Days',
            composition: 'Shell: 100% DWR Matte Nylon · Fill: 300g Recycled Thermal Loft',
            stitchingSpec: 'Precision grid-quilt lock-stitch, YKK front zipper, elastic cuffs & hem toggle',
            description:
              'Bright electric cyan women’s grid-quilted puffer with matte charcoal shoulder yoke and chest cresting.',
            measurements: TOP_MEASUREMENTS,
          },
          {
            id: 'tsi-lj-02',
            sku: 'TSI-LJ-02',
            name: 'Teal, Violet & Chalk Retro Track Windbreaker',
            subtitle: 'Cut & Sew Crinkle Nylon · Air-Mesh Liner',
            division: 'Sportswear',
            visualKind: 'track-windbreaker',
            basePhoto: PHOTO_ASSETS.trackjacket.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.newTealWindbreaker,
            hookYRatio: PHOTO_ASSETS.trackjacket.hookYRatio,
            appearance: {},
            gsmOptions: ['175 GSM Crinkle Taslan', '200 GSM Matte Poly'],
            defaultGsm: '175 GSM Crinkle Taslan',
            colors: WINDBREAKER_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(32.0),
            moq: 50,
            leadTimeDays: '18 – 24 Days',
            composition: '100% DWR Crinkle Polyamide + Breathable Mesh Liner',
            stitchingSpec: 'Multi-angle chevron paneling, contrast white zip & elastic storm cuffs',
            description:
              'Standout electric turquoise, violet, and white chevron retro track windbreaker tailored for women’s athletic collections.',
            measurements: TOP_MEASUREMENTS,
          },
        ],
      },
    ],
  },
  {
    id: 'puffer-jackets',
    name: 'Puffer Jacket',
    code: 'TSI-06',
    division: 'Streetwear',
    tagline: 'Signature tangerine & charcoal heavyweight thermal winter puffers',
    gsmRange: '320 – 450 GSM',
    visualKind: 'puffer-jacket',
    basePhoto: PHOTO_ASSETS.puffer.url,
    modelWhitePhoto: MODEL_WHITE_ASSETS.mensOrangePuffer,
    hookYRatio: PHOTO_ASSETS.puffer.hookYRatio,
    appearance: {},
    subCategories: [
      {
        id: 'unisex-hooded-puffers',
        name: 'Heavyweight Baffle Hooded Puffers',
        code: 'SUB 06.A',
        specSummary: 'Windproof Matte Ripstop · 350g High-Loft Insulation',
        visualKind: 'puffer-jacket',
        basePhoto: PHOTO_ASSETS.puffer.url,
        modelWhitePhoto: MODEL_WHITE_ASSETS.mensOrangePuffer,
        hookYRatio: PHOTO_ASSETS.puffer.hookYRatio,
        appearance: {},
        products: [
          {
            id: 'tsi-pj-01',
            sku: 'TSI-PJ-01',
            name: 'Tangerine & Charcoal Alpine Puffer Jacket',
            subtitle: 'Two-Tone Baffle Shell · Internal Storm Drawcord',
            division: 'Streetwear',
            visualKind: 'puffer-jacket',
            basePhoto: PHOTO_ASSETS.puffer.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.mensOrangePuffer,
            hookYRatio: PHOTO_ASSETS.puffer.hookYRatio,
            appearance: {},
            gsmOptions: ['320g Thermal Loft Puffer', '420g Expedition Heavy Fill'],
            defaultGsm: '320g Thermal Loft Puffer',
            colors: MENS_PUFFER_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(42.0),
            moq: 50,
            leadTimeDays: '24 – 30 Days',
            composition: 'Shell: 100% Waterproof Matte Polyamide · Fill: 350g Featherless Down',
            stitchingSpec: 'Double-needle contrast shoulder panel, branded zip pullers, inner chest pocket',
            description:
              'Statement tangerine and slate charcoal puffer engineered for cold-weather streetwear capsules and team travel.',
            measurements: TOP_MEASUREMENTS,
          },
        ],
      },
    ],
  },
  {
    id: 'mens-jackets',
    name: "Men's Jacket",
    code: 'TSI-07',
    division: 'Sportswear',
    tagline: 'Colorblock cyan & amber track shells, canvas bombers & windbreakers',
    gsmRange: '175 – 480 GSM',
    visualKind: 'track-windbreaker',
    basePhoto: PHOTO_ASSETS.mensJacketCyanAmber.url,
    modelWhitePhoto: MODEL_WHITE_ASSETS.mensCyanAmberTrack,
    hookYRatio: PHOTO_ASSETS.mensJacketCyanAmber.hookYRatio,
    appearance: {},
    subCategories: [
      {
        id: 'athletic-shell-jackets',
        name: 'Team Track, Canvas & Windbreaker Jackets',
        code: 'SUB 07.A',
        specSummary: 'Crinkle Taslan Track Shells & 14oz Duck Canvas Bombers',
        visualKind: 'track-windbreaker',
        basePhoto: PHOTO_ASSETS.mensJacketCyanAmber.url,
        modelWhitePhoto: MODEL_WHITE_ASSETS.mensCyanAmberTrack,
        hookYRatio: PHOTO_ASSETS.mensJacketCyanAmber.hookYRatio,
        appearance: {},
        products: [
          {
            id: 'tsi-mj-01',
            sku: 'TSI-MJ-01',
            name: 'Cyan & Amber Pro Colorblock Track Jacket',
            subtitle: 'Water-Repellent Crinkle Nylon · Air-Mesh Lined',
            division: 'Sportswear',
            visualKind: 'track-windbreaker',
            basePhoto: PHOTO_ASSETS.mensJacketCyanAmber.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.mensCyanAmberTrack,
            hookYRatio: PHOTO_ASSETS.mensJacketCyanAmber.hookYRatio,
            appearance: {},
            gsmOptions: ['175 GSM Crinkle Nylon', '210 GSM Matte Taslan'],
            defaultGsm: '175 GSM Crinkle Nylon',
            colors: MENS_TRACK_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(31.5),
            moq: 50,
            leadTimeDays: '18 – 24 Days',
            composition: 'Shell: 100% DWR Polyamide · Lining: 100% Breathable Air Mesh',
            stitchingSpec: 'Cut-and-sew amber lower body panel, contrast zip welt pockets, raglan sleeves',
            description:
              'High-energy cyan and amber gold men’s athletic jacket featured on our stadium campaign lookbook.',
            measurements: TOP_MEASUREMENTS,
          },
          {
            id: 'tsi-mj-02',
            sku: 'TSI-MJ-02',
            name: 'Field Olive 14oz Duck Canvas Flight Bomber',
            subtitle: 'Boxy Cropped Fit · Quilted Satin Lining',
            division: 'Streetwear',
            visualKind: 'jacket-bomber',
            basePhoto: PHOTO_ASSETS.jacket.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.mensOliveBomber,
            hookYRatio: PHOTO_ASSETS.jacket.hookYRatio,
            appearance: {},
            gsmOptions: ['12oz Washed Canvas', '14oz Heavy Duck Canvas'],
            defaultGsm: '14oz Heavy Duck Canvas',
            colors: JACKET_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(44.5),
            moq: 50,
            leadTimeDays: '22 – 28 Days',
            composition: '100% Enzyme-Washed Duck Canvas + 120g Quilted Liner',
            stitchingSpec: 'Triple-needle felled seams, brass #10 YKK front zip',
            description:
              'Rugged washed olive workwear bomber with utility sleeve pocket and Thumb Sports chest badge.',
            measurements: TOP_MEASUREMENTS,
          },
          {
            id: 'tsi-mj-04',
            sku: 'TSI-MJ-04',
            name: 'Crimson & Cream Heavyweight Varsity Jacket',
            subtitle: 'Wool-Fleece Body · Cream Sleeves & Striped Rib',
            division: 'Streetwear',
            visualKind: 'jacket-bomber',
            basePhoto: PHOTO_ASSETS.jacket.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.newCrimsonVarsity,
            hookYRatio: PHOTO_ASSETS.jacket.hookYRatio,
            appearance: { softTintHex: '#991B1B' },
            gsmOptions: ['520 GSM Heavy Melange Fleece', '600 GSM Wool-Blend Melton'],
            defaultGsm: '520 GSM Heavy Melange Fleece',
            colors: JACKET_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(48.0),
            moq: 50,
            leadTimeDays: '22 – 28 Days',
            composition: 'Body: 80% Cotton / 20% Heavy Fleece · Trim: Striped 2x2 Yarn-Dyed Rib',
            stitchingSpec: 'Enamel matte snap buttons, welt pockets, quilted diamond satin lining',
            description:
              'Classic crimson scarlet and cream varsity streetwear bomber featuring yarn-dyed striped ribs and custom cresting.',
            measurements: TOP_MEASUREMENTS,
          },
          {
            id: 'tsi-mj-03',
            sku: 'TSI-MJ-03',
            name: 'Chalk & Charcoal Crinkle Taslan Windbreaker',
            subtitle: 'Two-Tone Stand Collar · Breathable Mesh Liner',
            division: 'Sportswear',
            visualKind: 'track-windbreaker',
            basePhoto: PHOTO_ASSETS.trackjacket.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.ladiesChalkWindbreaker,
            hookYRatio: PHOTO_ASSETS.trackjacket.hookYRatio,
            appearance: {},
            gsmOptions: ['175 GSM Crinkle Taslan', '200 GSM Matte Poly'],
            defaultGsm: '175 GSM Crinkle Taslan',
            colors: WINDBREAKER_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(30.5),
            moq: 50,
            leadTimeDays: '18 – 24 Days',
            composition: '100% Water-Resistant Crinkle Nylon + Micro-Mesh Lining',
            stitchingSpec: 'Contrast yoke piping, elastic storm cuffs, zip hand pockets',
            description:
              'Clean chalk white and charcoal team track shell tailored for stadium warmups and lifestyle drops.',
            measurements: TOP_MEASUREMENTS,
          },
        ],
      },
    ],
  },
  {
    id: 'drawstring-bags',
    name: 'Drawstring Bags',
    code: 'TSI-08',
    division: 'Combat & Bags',
    tagline: 'Heavy-duty ripstop athletic gym sacks & tournament cinch packs',
    gsmRange: '240 – 320 GSM',
    visualKind: 'drawstring-bag',
    basePhoto: PHOTO_ASSETS.drawstring.url,
    modelWhitePhoto: MODEL_WHITE_ASSETS.mensDrawstringBag,
    hookYRatio: PHOTO_ASSETS.drawstring.hookYRatio,
    appearance: {},
    subCategories: [
      {
        id: 'ripstop-gym-sacks',
        name: 'Ripstop Athletic Drawstring Packs',
        code: 'SUB 08.A',
        specSummary: 'Waterproof PU-Backed Ripstop · Brass Grommets',
        visualKind: 'drawstring-bag',
        basePhoto: PHOTO_ASSETS.drawstring.url,
        modelWhitePhoto: MODEL_WHITE_ASSETS.mensDrawstringBag,
        hookYRatio: PHOTO_ASSETS.drawstring.hookYRatio,
        appearance: {},
        products: [
          {
            id: 'tsi-db-01',
            sku: 'TSI-DB-01',
            name: 'Signal Orange Ripstop Gym Drawstring Bag',
            subtitle: 'Reinforced Base Panel · Thick Braided Cinch Cord',
            division: 'Combat & Bags',
            visualKind: 'drawstring-bag',
            basePhoto: PHOTO_ASSETS.drawstring.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.mensDrawstringBag,
            hookYRatio: PHOTO_ASSETS.drawstring.hookYRatio,
            appearance: {},
            gsmOptions: ['240 GSM PU Ripstop', '320 GSM 600D Cordura Base'],
            defaultGsm: '320 GSM 600D Cordura Base',
            colors: DRAWSTRING_SWATCHES,
            brandingOptions: ['High-Build Screenprint Crest', 'Woven Brand Patch + Custom Cords'],
            pricingTiers: makeTiers(7.8),
            moq: 100,
            leadTimeDays: '12 – 15 Days',
            composition: '600D Grid Ripstop Nylon with Waterproof PU Backing',
            stitchingSpec: 'Bar-tacked corner gussets, rustproof anodized metal grommets, hanging loop',
            description:
              'Durable everyday team and gym drawstring backpack in vivid tangerine orange with reinforced matte black base.',
            measurements: [
              { size: 'Standard (18L)', chest: '38 cm width', length: '48 cm height', shoulder: '8 mm cord' },
              { size: 'Pro XL (24L)', chest: '42 cm width', length: '52 cm height', shoulder: '10 mm cord' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'jiujitsu-gi',
    name: 'Jiu-Jitsu',
    code: 'TSI-09',
    division: 'Combat & Bags',
    tagline: 'Royal cobalt & pearl white 450–550 GSM competition BJJ Gis',
    gsmRange: '450 – 550 GSM',
    visualKind: 'jiujitsu-gi',
    basePhoto: PHOTO_ASSETS.jiujitsu.url,
    modelWhitePhoto: MODEL_WHITE_ASSETS.newCobaltJiujitsu,
    hookYRatio: PHOTO_ASSETS.jiujitsu.hookYRatio,
    appearance: { softTintHex: '#1E429F', satScale: 0.95 },
    subCategories: [
      {
        id: 'pearl-weave-gis',
        name: 'Pearl-Weave BJJ Kimono Sets',
        code: 'SUB 09.A',
        specSummary: 'EVA Foam Collar · Triple-Stitched Stress Seams',
        visualKind: 'jiujitsu-gi',
        basePhoto: PHOTO_ASSETS.jiujitsu.url,
        modelWhitePhoto: MODEL_WHITE_ASSETS.newCobaltJiujitsu,
        hookYRatio: PHOTO_ASSETS.jiujitsu.hookYRatio,
        appearance: { softTintHex: '#1E429F', satScale: 0.95 },
        products: [
          {
            id: 'tsi-jj-02',
            sku: 'TSI-JJ-02',
            name: 'Royal Cobalt & Gold 450 GSM Jiu-Jitsu Gi',
            subtitle: 'IBJJF Royal Blue · Gold Contrast Stitching',
            division: 'Combat & Bags',
            visualKind: 'jiujitsu-gi',
            basePhoto: PHOTO_ASSETS.jiujitsu.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.newCobaltJiujitsu,
            hookYRatio: PHOTO_ASSETS.jiujitsu.hookYRatio,
            appearance: { softTintHex: '#1E429F', satScale: 0.95 },
            gsmOptions: ['380 GSM Feather Pearl Weave', '450 GSM Competition Pearl Weave', '550 GSM Gold Weave'],
            defaultGsm: '450 GSM Competition Pearl Weave',
            colors: GI_SWATCHES,
            brandingOptions: ['High-Density Embroidery + Woven Seam Tape', 'Full Academy Patch Kit'],
            pricingTiers: makeTiers(54.0),
            moq: 30,
            leadTimeDays: '20 – 26 Days',
            composition: 'Jacket: 100% Pre-shrunk Royal Pearl Weave Cotton · Pants: 10oz Ripstop',
            stitchingSpec: 'Gold contrast 6-row EVA lapel stitching, reinforced knee ripstop panels',
            description:
              'Vibrant competition royal blue Brazilian Jiu-Jitsu kimono finished with gold contrast stitching and woven internal seam tape.',
            measurements: [
              { size: 'A1', chest: '165–173 cm height', length: '60–70 kg', shoulder: 'Standard IBJJF' },
              { size: 'A2', chest: '174–183 cm height', length: '71–83 kg', shoulder: 'Standard IBJJF' },
              { size: 'A3', chest: '184–191 cm height', length: '84–96 kg', shoulder: 'Standard IBJJF' },
              { size: 'A4', chest: '192–199 cm height', length: '97–115 kg', shoulder: 'Standard IBJJF' },
            ],
          },
          {
            id: 'tsi-jj-01',
            sku: 'TSI-JJ-01',
            name: 'Pearl White 450 GSM Pro Jiu-Jitsu Gi',
            subtitle: 'EVA Vulcanized Lapel · 10oz Ripstop Trousers',
            division: 'Combat & Bags',
            visualKind: 'jiujitsu-gi',
            basePhoto: PHOTO_ASSETS.jiujitsu.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.mensJiujitsuGi,
            hookYRatio: PHOTO_ASSETS.jiujitsu.hookYRatio,
            appearance: {},
            gsmOptions: ['380 GSM Feather Pearl Weave', '450 GSM Competition Pearl Weave', '550 GSM Gold Weave'],
            defaultGsm: '450 GSM Competition Pearl Weave',
            colors: GI_SWATCHES,
            brandingOptions: ['High-Density Embroidery + Woven Seam Tape', 'Full Academy Patch Kit'],
            pricingTiers: makeTiers(52.0),
            moq: 30,
            leadTimeDays: '20 – 26 Days',
            composition: 'Jacket: 100% Pre-shrunk Pearl Weave Cotton · Pants: 10oz Cotton Ripstop',
            stitchingSpec: '6-row stitched EVA collar, triple-stitched gussets, reinforced knee panels',
            description:
              'Flagship Thumb Sports competition Jiu-Jitsu kimono engineered for high grip resistance and lightweight breathability.',
            measurements: [
              { size: 'A1', chest: '165–173 cm height', length: '60–70 kg', shoulder: 'Standard IBJJF' },
              { size: 'A2', chest: '174–183 cm height', length: '71–83 kg', shoulder: 'Standard IBJJF' },
              { size: 'A3', chest: '184–191 cm height', length: '84–96 kg', shoulder: 'Standard IBJJF' },
              { size: 'A4', chest: '192–199 cm height', length: '97–115 kg', shoulder: 'Standard IBJJF' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sweat-shirts',
    name: 'Sweat Shirts',
    code: 'TSI-10',
    division: 'Streetwear',
    tagline: 'Mineral-washed crewnecks & heavyweight 520 GSM fleece hoodies',
    gsmRange: '440 – 560 GSM',
    visualKind: 'crewneck',
    basePhoto: PHOTO_ASSETS.sweatshirt.url,
    modelWhitePhoto: MODEL_WHITE_ASSETS.mensUmberCrewneck,
    hookYRatio: PHOTO_ASSETS.sweatshirt.hookYRatio,
    appearance: {},
    subCategories: [
      {
        id: 'heavyweight-crewnecks',
        name: 'Crewnecks & 520 GSM Street Hoodies',
        code: 'SUB 10.A',
        specSummary: 'Enzyme Mineral Wash · Heavyweight Colorblock Hoodies',
        visualKind: 'crewneck',
        basePhoto: PHOTO_ASSETS.sweatshirt.url,
        modelWhitePhoto: MODEL_WHITE_ASSETS.mensUmberCrewneck,
        hookYRatio: PHOTO_ASSETS.sweatshirt.hookYRatio,
        appearance: {},
        products: [
          {
            id: 'tsi-sw-01',
            sku: 'TSI-SW-01',
            name: 'Earth Umber 500 GSM Mineral Crewneck',
            subtitle: 'Sun-Faded Enzyme Wash · Heavy Rib Collar',
            division: 'Streetwear',
            visualKind: 'crewneck',
            basePhoto: PHOTO_ASSETS.sweatshirt.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.mensUmberCrewneck,
            hookYRatio: PHOTO_ASSETS.sweatshirt.hookYRatio,
            appearance: {},
            gsmOptions: ['440 GSM Terry', '500 GSM Brushed Fleece'],
            defaultGsm: '500 GSM Brushed Fleece',
            colors: FLEECE_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(25.5),
            moq: 50,
            leadTimeDays: '16 – 20 Days',
            composition: '100% Ring-Spun Combed Cotton',
            stitchingSpec: 'Twin-needle straddle stitch across collar, cuffs & hem',
            description:
              'Heavyweight earth-washed crewneck with wide dropped-shoulder drape and Thumb Sports chest crest.',
            measurements: TOP_MEASUREMENTS,
          },
          {
            id: 'tsi-sw-02',
            sku: 'TSI-SW-02',
            name: 'Burgundy & Cream Panel 520 GSM Hoodie',
            subtitle: 'Cut & Sew Cream Lower Panel · Boxy Pullover',
            division: 'Streetwear',
            visualKind: 'hoodie-pullover',
            basePhoto: PHOTO_ASSETS.burgundyHoodie.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.ladiesBurgundyHoodie,
            hookYRatio: PHOTO_ASSETS.burgundyHoodie.hookYRatio,
            appearance: {},
            gsmOptions: ['480 GSM Terry', '520 GSM Heavy Fleece'],
            defaultGsm: '520 GSM Heavy Fleece',
            colors: BURGUNDY_HOODIE_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(29.5),
            moq: 50,
            leadTimeDays: '18 – 22 Days',
            composition: '100% Organic Cotton Heavyweight Fleece',
            stitchingSpec: 'Cut-and-sew cream lower pocket inlay, double-layer hood',
            description:
              'Rich burgundy pullover hoodie tailored with a natural cream lower pocket block, heavy rib cuffs, and silver-tipped drawcords.',
            measurements: TOP_MEASUREMENTS,
          },
          {
            id: 'tsi-sw-03',
            sku: 'TSI-SW-03',
            name: 'Washed Charcoal 520 GSM Drop-Shoulder Hoodie',
            subtitle: 'Pigment Enzyme Fade · 2x2 Heavyweight Rib',
            division: 'Streetwear',
            visualKind: 'hoodie-pullover',
            basePhoto: PHOTO_ASSETS.hoodie.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.mensCharcoalHoodie,
            hookYRatio: PHOTO_ASSETS.hoodie.hookYRatio,
            appearance: {},
            gsmOptions: ['460 GSM Loopback', '520 GSM Brushed Fleece'],
            defaultGsm: '520 GSM Brushed Fleece',
            colors: FLEECE_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(28.5),
            moq: 50,
            leadTimeDays: '18 – 22 Days',
            composition: '100% Ring-Spun Combed Cotton',
            stitchingSpec: 'Double-lined structured hood, bar-tacked kangaroo pocket',
            description:
              'Vintage-washed charcoal oversized street hoodie built for graphic capsules and private-label collections.',
            measurements: TOP_MEASUREMENTS,
          },
        ],
      },
    ],
  },
  {
    id: 'pro-jerseys-tees',
    name: 'Match Jerseys & Tees',
    code: 'TSI-11',
    division: 'Sportswear',
    tagline: 'Sublimated geometric match jerseys & 300 GSM boxy tees',
    gsmRange: '160 – 330 GSM',
    visualKind: 'jersey-match',
    basePhoto: PHOTO_ASSETS.jersey.url,
    modelWhitePhoto: MODEL_WHITE_ASSETS.mensCobaltJersey,
    hookYRatio: PHOTO_ASSETS.jersey.hookYRatio,
    appearance: {},
    subCategories: [
      {
        id: 'sublimated-jerseys-tees',
        name: 'Geometric Match Kits & Boxy Blanks',
        code: 'SUB 11.A',
        specSummary: 'Breathable Micro-Mesh Jerseys & 300 GSM Ring-Spun Tees',
        visualKind: 'jersey-match',
        basePhoto: PHOTO_ASSETS.jersey.url,
        modelWhitePhoto: MODEL_WHITE_ASSETS.mensCobaltJersey,
        hookYRatio: PHOTO_ASSETS.jersey.hookYRatio,
        appearance: {},
        products: [
          {
            id: 'tsi-jr-01',
            sku: 'TSI-JR-01',
            name: 'Cobalt Geometric Pro Match Jersey',
            subtitle: 'Breathable Side Mesh · Thumb Sports Pro Lockup',
            division: 'Sportswear',
            visualKind: 'jersey-match',
            basePhoto: PHOTO_ASSETS.jersey.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.mensCobaltJersey,
            hookYRatio: PHOTO_ASSETS.jersey.hookYRatio,
            appearance: {},
            gsmOptions: ['160 GSM Interlock Dry-Fit', '190 GSM Jacquard Mesh'],
            defaultGsm: '160 GSM Interlock Dry-Fit',
            colors: JERSEY_SWATCHES,
            brandingOptions: ['All-Over Sublimation + Thumb Crest', 'Team Roster Numbering'],
            pricingTiers: makeTiers(14.5),
            moq: 50,
            leadTimeDays: '12 – 16 Days',
            composition: '92% Moisture-Wicking Polyester / 8% Elastane',
            stitchingSpec: 'Flatlock athletic seams, striped V-neck rib collar',
            description:
              'Sublimated cobalt & white geometric jersey engineered for football clubs, leagues, and athletic teams.',
            measurements: TOP_MEASUREMENTS,
          },
          {
            id: 'tsi-ts-01',
            sku: 'TSI-TS-01',
            name: 'Bone & Slate 300 GSM Mock-Collar Tee',
            subtitle: 'Heavy Single Jersey · Contrast Raglan Trim',
            division: 'Streetwear',
            visualKind: 'tee-boxy',
            basePhoto: PHOTO_ASSETS.tee.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.ladiesBoneTee,
            hookYRatio: PHOTO_ASSETS.tee.hookYRatio,
            appearance: {},
            gsmOptions: ['260 GSM Combed Jersey', '300 GSM Heavy Jersey'],
            defaultGsm: '300 GSM Heavy Jersey',
            colors: TEE_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(13.5),
            moq: 50,
            leadTimeDays: '12 – 16 Days',
            composition: '100% Organic Ring-Spun Combed Cotton',
            stitchingSpec: '1.25-inch dense rib collar, double-needle sleeve & hem',
            description:
              'Boxy streetwear tee block with contrast collar and shoulder panels plus Thumb Sports chest emblem.',
            measurements: TOP_MEASUREMENTS,
          },
        ],
      },
    ],
  },
  {
    id: 'street-cargos',
    name: 'Tactical Cargos',
    code: 'TSI-12',
    division: 'Streetwear',
    tagline: 'Wide-leg ripstop cargos & utility field trousers',
    gsmRange: '280 – 360 GSM',
    visualKind: 'cargo-ripstop',
    basePhoto: PHOTO_ASSETS.cargo.url,
    modelWhitePhoto: MODEL_WHITE_ASSETS.mensBlackCargo,
    hookYRatio: PHOTO_ASSETS.cargo.hookYRatio,
    appearance: {},
    subCategories: [
      {
        id: 'ripstop-utility-cargos',
        name: 'Wide-Leg Ripstop Field Cargos',
        code: 'SUB 12.A',
        specSummary: 'Articulated Knees · Bellows Pockets · Hem Toggles',
        visualKind: 'cargo-ripstop',
        basePhoto: PHOTO_ASSETS.cargo.url,
        modelWhitePhoto: MODEL_WHITE_ASSETS.mensBlackCargo,
        hookYRatio: PHOTO_ASSETS.cargo.hookYRatio,
        appearance: {},
        products: [
          {
            id: 'tsi-cg-01',
            sku: 'TSI-CG-01',
            name: 'Matte Black 320 GSM Ripstop Cargo Pant',
            subtitle: 'Articulated Knee Pleats · Convertible Bungee Hem',
            division: 'Streetwear',
            visualKind: 'cargo-ripstop',
            basePhoto: PHOTO_ASSETS.cargo.url,
            modelWhitePhoto: MODEL_WHITE_ASSETS.mensBlackCargo,
            hookYRatio: PHOTO_ASSETS.cargo.hookYRatio,
            appearance: {},
            gsmOptions: ['280 GSM Cotton Ripstop', '320 GSM NyCo Ripstop'],
            defaultGsm: '320 GSM NyCo Ripstop',
            colors: CARGO_SWATCHES,
            brandingOptions: STANDARD_BRANDING,
            pricingTiers: makeTiers(31.0),
            moq: 50,
            leadTimeDays: '18 – 24 Days',
            composition: '70% Cotton / 30% High-Tenacity Nylon Grid Ripstop',
            stitchingSpec: '3D gusseted cargo pockets, knee expansion darts',
            description:
              'Wide-leg streetwear utility cargo trouser featuring multi-bellows storage and Thumb Sports pocket crest.',
            measurements: BOTTOM_MEASUREMENTS,
          },
        ],
      },
    ],
  },
];

export const ALL_PRODUCTS: { main: MainCategory; sub: SubCategory; product: ProductSpec }[] =
  CATALOG.flatMap((main) =>
    main.subCategories.flatMap((sub) =>
      sub.products.map((product) => ({ main, sub, product })),
    ),
  );

export function findMainCategory(id: string): MainCategory | undefined {
  return CATALOG.find((c) => c.id === id);
}

export function findSubCategory(mainId: string, subId: string): SubCategory | undefined {
  return findMainCategory(mainId)?.subCategories.find((s) => s.id === subId);
}

export function findProduct(
  mainId: string,
  subId: string,
  productId: string,
): { main: MainCategory; sub: SubCategory; product: ProductSpec } | undefined {
  const main = findMainCategory(mainId);
  if (!main) return undefined;
  const sub = main.subCategories.find((s) => s.id === subId);
  if (!sub) return undefined;
  const product = sub.products.find((p) => p.id === productId);
  if (!product) return undefined;
  return { main, sub, product };
}
