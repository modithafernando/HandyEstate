/**
 * Reference data shared by the seed script and tests.
 * Plain data only — no imports from server code.
 */

export type CategorySeed = {
  slug: string;
  name: string;
  icon: string;
  sort: number;
  searchTerms: string[];
};

export const CATEGORIES: CategorySeed[] = [
  {
    slug: "plumber",
    name: "Plumber",
    icon: "pipe-wrench",
    sort: 10,
    searchTerms: [
      "plumber", "plumbing", "tap", "taps", "leak", "leaking", "pipe", "pipes", "toilet", "commode",
      "flush", "cistern", "sink", "drain", "blocked", "water tank", "tank", "water motor", "water pump",
      "motor", "shower", "geyser", "bathroom", "no water", "water line",
    ],
  },
  {
    slug: "electrician",
    name: "Electrician",
    icon: "lightning",
    sort: 20,
    searchTerms: [
      "electrician", "electrical", "electric", "wiring", "rewiring", "trip switch", "trip", "breaker",
      "fuse", "power", "no power", "current", "socket", "plug", "switch", "light", "lights", "fan",
      "ceiling fan", "meter", "earthing", "short circuit", "inverter", "solar",
    ],
  },
  {
    slug: "ac-repair",
    name: "AC Repair",
    icon: "snowflake",
    sort: 30,
    searchTerms: [
      "ac", "a/c", "air con", "aircon", "air conditioner", "air conditioning", "ac repair", "ac service",
      "ac gas", "gas refill", "ac not cooling", "ac installation", "ac leaking",
    ],
  },
  {
    slug: "carpenter",
    name: "Carpenter",
    icon: "hammer",
    sort: 40,
    searchTerms: [
      "carpenter", "carpentry", "wood", "wooden", "door", "doors", "window", "cupboard", "wardrobe",
      "furniture", "pantry", "cabinet", "roof", "ceiling", "hinge", "lock",
    ],
  },
  {
    slug: "mason",
    name: "Mason",
    icon: "wall",
    sort: 50,
    searchTerms: [
      "mason", "masonry", "bass", "baas", "wall", "walls", "cement", "plaster", "plastering", "crack",
      "cracks", "brick", "concrete", "floor", "renovation", "extension", "construction", "parapet",
    ],
  },
  {
    slug: "appliance-repair",
    name: "Appliance Repair",
    icon: "washing-machine",
    sort: 60,
    searchTerms: [
      "appliance", "appliances", "washing machine", "washer", "fridge", "refrigerator", "freezer",
      "microwave", "oven", "rice cooker", "tv", "television", "blender", "iron", "gas cooker", "cooker",
    ],
  },
  {
    slug: "painter",
    name: "Painter",
    icon: "paint-roller",
    sort: 70,
    searchTerms: [
      "painter", "painting", "paint", "repaint", "wall paint", "colour", "color", "putty", "damp",
      "waterproofing", "whitewash",
    ],
  },
  {
    slug: "welder",
    name: "Welder",
    icon: "fire",
    sort: 80,
    searchTerms: ["welder", "welding", "gate", "grill", "grille", "iron gate", "steel", "railing", "roller door"],
  },
  {
    slug: "tiler",
    name: "Tiler",
    icon: "grid",
    sort: 90,
    searchTerms: ["tiler", "tiles", "tile", "tiling", "floor tiles", "granite", "bathroom tiles", "titanium"],
  },
  {
    slug: "cctv",
    name: "CCTV & Networking",
    icon: "security-camera",
    sort: 100,
    searchTerms: ["cctv", "camera", "cameras", "security camera", "wifi", "router", "network", "intercom"],
  },
  {
    slug: "pest-control",
    name: "Pest Control",
    icon: "bug",
    sort: 110,
    searchTerms: ["pest", "pest control", "termite", "termites", "cockroach", "ants", "rats", "mosquito"],
  },
];

export type TownSeed = { slug: string; name: string; district: "Matara" | "Galle" | "Hambantota"; lat: number; lng: number; sort?: number };

/** Launch area: Matara & Galle districts plus Tangalle. Coordinates are town centres (approximate). */
export const TOWNS: TownSeed[] = [
  { slug: "matara", name: "Matara", district: "Matara", lat: 5.9485, lng: 80.5353, sort: 1 },
  { slug: "galle", name: "Galle", district: "Galle", lat: 6.0329, lng: 80.2168, sort: 2 },
  { slug: "weligama", name: "Weligama", district: "Matara", lat: 5.975, lng: 80.429 },
  { slug: "akuressa", name: "Akuressa", district: "Matara", lat: 6.097, lng: 80.481 },
  { slug: "kamburupitiya", name: "Kamburupitiya", district: "Matara", lat: 6.075, lng: 80.563 },
  { slug: "dikwella", name: "Dikwella", district: "Matara", lat: 5.966, lng: 80.696 },
  { slug: "mirissa", name: "Mirissa", district: "Matara", lat: 5.9483, lng: 80.4716 },
  { slug: "walgama", name: "Walgama", district: "Matara", lat: 5.9455, lng: 80.5575 },
  { slug: "devinuwara", name: "Devinuwara", district: "Matara", lat: 5.928, lng: 80.589 },
  { slug: "hakmana", name: "Hakmana", district: "Matara", lat: 6.08, lng: 80.66 },
  { slug: "deniyaya", name: "Deniyaya", district: "Matara", lat: 6.344, lng: 80.56 },
  { slug: "kekanadura", name: "Kekanadura", district: "Matara", lat: 5.988, lng: 80.604 },
  { slug: "pamburana", name: "Pamburana", district: "Matara", lat: 5.952, lng: 80.548 },
  { slug: "hikkaduwa", name: "Hikkaduwa", district: "Galle", lat: 6.1395, lng: 80.1063 },
  { slug: "ambalangoda", name: "Ambalangoda", district: "Galle", lat: 6.235, lng: 80.054 },
  { slug: "unawatuna", name: "Unawatuna", district: "Galle", lat: 6.01, lng: 80.249 },
  { slug: "karapitiya", name: "Karapitiya", district: "Galle", lat: 6.064, lng: 80.227 },
  { slug: "habaraduwa", name: "Habaraduwa", district: "Galle", lat: 5.999, lng: 80.309 },
  { slug: "ahangama", name: "Ahangama", district: "Galle", lat: 5.973, lng: 80.362 },
  { slug: "koggala", name: "Koggala", district: "Galle", lat: 5.99, lng: 80.328 },
  { slug: "baddegama", name: "Baddegama", district: "Galle", lat: 6.166, lng: 80.178 },
  { slug: "elpitiya", name: "Elpitiya", district: "Galle", lat: 6.29, lng: 80.16 },
  { slug: "tangalle", name: "Tangalle", district: "Hambantota", lat: 6.024, lng: 80.794 },
];

export const REVIEW_TAGS = [
  { slug: "punctual", name: "Punctual", sort: 1 },
  { slug: "fair-price", name: "Fair price", sort: 2 },
  { slug: "good-work", name: "Good work", sort: 3 },
  { slug: "friendly", name: "Friendly", sort: 4 },
  { slug: "clean-work", name: "Clean work", sort: 5 },
  { slug: "quick-response", name: "Quick response", sort: 6 },
];
