/**
 * FICTIONAL development data. None of these people or businesses exist.
 * Phone numbers use the +94 70 000 xxxx block and are flagged is_demo.
 */

type Unit = "job" | "visit" | "hour" | "day" | "sqft";

export type ProviderSeed = {
  name: string;
  business?: string;
  cats: string[];
  town: string;
  radius: number;
  bio: string;
  services: [string, number | null, Unit?][];
  today?: boolean;
  verified?: boolean;
  whatsapp?: boolean;
  status?: "approved" | "pending";
  reviews?: number; // how many seed reviews
  quality?: number; // average-ish rating 3.5–5
};

export const PROVIDERS: ProviderSeed[] = [
  {
    name: "Kasun", business: "Kasun Electrical", cats: ["electrician"], town: "walgama", radius: 12,
    bio: "House wiring, trip switch faults and new points. Twelve years in Matara. I carry common parts so most jobs are done in one visit.",
    services: [["Electrical repairs", 1500, "visit"], ["House wiring", null], ["Trip switch faults", 1500, "visit"], ["Fan & light fitting", 800, "job"]],
    today: true, verified: true, whatsapp: true, reviews: 14, quality: 4.8,
  },
  {
    name: "Nimal", business: "Nimal Plumbing Works", cats: ["plumber"], town: "matara", radius: 10,
    bio: "Leaks, blocked drains, toilet cisterns and water motors. Clean work, fair price. Call before 8 pm.",
    services: [["Leak repair", 1200, "visit"], ["Toilet & cistern repair", 1500, "job"], ["Water motor repair", 2500, "job"], ["New bathroom lines", null]],
    today: true, verified: true, whatsapp: true, reviews: 11, quality: 4.7,
  },
  {
    name: "Ruwan", business: "Ruwan AC Care", cats: ["ac-repair"], town: "matara", radius: 20,
    bio: "AC service, gas refill and installation for all major brands. Service includes filter and coil cleaning.",
    services: [["AC full service", 4500, "job"], ["Gas refill", 6500, "job"], ["Installation", 12000, "job"]],
    today: false, verified: true, whatsapp: true, reviews: 9, quality: 4.6,
  },
  {
    name: "Chaminda", business: "Chaminda Wood Works", cats: ["carpenter"], town: "kamburupitiya", radius: 15,
    bio: "Doors, windows, pantry cupboards and roof timber. Repairs or new work. I can visit and give a price.",
    services: [["Door & window repair", 2000, "job"], ["Pantry cupboards", null], ["Roof timber work", null]],
    today: true, verified: false, whatsapp: false, reviews: 5, quality: 4.5,
  },
  {
    name: "Sunil", cats: ["mason"], town: "akuressa", radius: 15,
    bio: "Plastering, wall cracks, floors and small extensions. Work with my own team of two.",
    services: [["Plastering", 180, "sqft"], ["Crack repair", null], ["Floor concreting", null]],
    today: true, verified: true, whatsapp: false, reviews: 6, quality: 4.4,
  },
  {
    name: "Tharindu", business: "Tharindu Appliance Repair", cats: ["appliance-repair"], town: "matara", radius: 12,
    bio: "Washing machines, fridges and microwaves. Front-load and top-load. Home visits in Matara town.",
    services: [["Washing machine repair", 2000, "visit"], ["Fridge repair", 2500, "visit"], ["Microwave repair", 1500, "job"]],
    today: true, verified: true, whatsapp: true, reviews: 12, quality: 4.9,
  },
  {
    name: "Priyantha", business: "Priyantha Painting", cats: ["painter"], town: "pamburana", radius: 15,
    bio: "Interior and exterior painting, putty and damp treatment. Free estimate for full houses.",
    services: [["Interior painting", 45, "sqft"], ["Exterior painting", 55, "sqft"], ["Damp treatment", null]],
    today: false, verified: false, whatsapp: true, reviews: 4, quality: 4.3,
  },
  {
    name: "Mohamed Rizwan", business: "Rizwan Cooling", cats: ["ac-repair", "appliance-repair"], town: "weligama", radius: 20,
    bio: "AC and fridge specialist. Gas refills, compressor work, and servicing for homes and small shops.",
    services: [["AC service", 4000, "job"], ["Fridge gas refill", 5500, "job"], ["Compressor replacement", null]],
    today: true, verified: true, whatsapp: true, reviews: 10, quality: 4.7,
  },
  {
    name: "Selvaraj", business: "Selvaraj Electricals", cats: ["electrician"], town: "galle", radius: 12,
    bio: "Domestic and shop wiring, DB boards, earthing. Available most evenings for urgent faults.",
    services: [["Fault finding", 1500, "visit"], ["DB board installation", null], ["Earthing", 6000, "job"]],
    today: true, verified: true, whatsapp: true, reviews: 8, quality: 4.6,
  },
  {
    name: "Dinesh Madushanka", cats: ["plumber"], town: "galle", radius: 10,
    bio: "Plumbing repairs and bathroom fittings around Galle Fort, Karapitiya and Unawatuna.",
    services: [["Tap & leak repair", 1000, "visit"], ["Bathroom fittings", null], ["Drain cleaning", 2000, "job"]],
    today: false, verified: false, whatsapp: true, reviews: 3, quality: 4.2,
  },
  {
    name: "Lahiru", business: "Lahiru Electric", cats: ["electrician"], town: "akuressa", radius: 15,
    bio: "Wiring for new houses and repairs. Solar inverter connections.",
    services: [["New house wiring", null], ["Repairs", 1200, "visit"], ["Inverter connection", 5000, "job"]],
    today: false, verified: true, whatsapp: false, reviews: 5, quality: 4.5,
  },
  {
    name: "Asanka", cats: ["carpenter"], town: "galle", radius: 12,
    bio: "Furniture repairs, wardrobes and doors. Teak and mahogany work.",
    services: [["Furniture repair", 1500, "job"], ["Wardrobes", null], ["Door fitting", 3000, "job"]],
    today: true, verified: false, whatsapp: true, reviews: 4, quality: 4.4,
  },
  {
    name: "Buddhika", business: "Buddhika Welding", cats: ["welder"], town: "matara", radius: 15,
    bio: "Gates, grills, railings and roller doors. Repairs at your place or new work in my workshop.",
    services: [["Gate repair", 2500, "job"], ["Window grills", null], ["Roller door repair", 4000, "job"]],
    today: true, verified: true, whatsapp: true, reviews: 7, quality: 4.6,
  },
  {
    name: "Gayan", cats: ["tiler", "mason"], town: "hakmana", radius: 20,
    bio: "Floor and wall tiles, bathroom tiling, granite tops. Neat finishing.",
    services: [["Floor tiling", 120, "sqft"], ["Bathroom tiling", 150, "sqft"], ["Granite tops", null]],
    today: false, verified: false, whatsapp: false, reviews: 3, quality: 4.7,
  },
  {
    name: "Nuwan", business: "Nuwan CCTV Solutions", cats: ["cctv"], town: "matara", radius: 25,
    bio: "CCTV cameras, WiFi routers and intercoms for homes and shops. Phone viewing set up included.",
    services: [["4-camera CCTV setup", 65000, "job"], ["Camera repair", 2500, "visit"], ["WiFi setup", 2000, "job"]],
    today: true, verified: true, whatsapp: true, reviews: 6, quality: 4.8,
  },
  {
    name: "Pradeep", cats: ["painter"], town: "galle", radius: 15,
    bio: "House painting with a small team. Old houses and new houses.",
    services: [["House painting", 40, "sqft"], ["Wall putty", null]],
    today: true, verified: false, whatsapp: true, reviews: 2, quality: 4.0,
  },
  {
    name: "Sampath", business: "Sampath Motor & Pump", cats: ["plumber", "electrician"], town: "kekanadura", radius: 15,
    bio: "Water motors and pumps — repair, rewinding and installation. Also basic plumbing.",
    services: [["Motor repair", 2500, "job"], ["Motor rewinding", 6000, "job"], ["Pump installation", 3500, "job"]],
    today: true, verified: true, whatsapp: false, reviews: 9, quality: 4.6,
  },
  {
    name: "Upul", cats: ["mason"], town: "galle", radius: 15,
    bio: "Masonry and small construction. Boundary walls, extensions, repairs.",
    services: [["Boundary wall", null], ["Repairs", 3000, "day"]],
    today: false, verified: true, whatsapp: false, reviews: 5, quality: 4.3,
  },
  {
    name: "Janaka", business: "Janaka Home Appliances", cats: ["appliance-repair"], town: "galle", radius: 12,
    bio: "TV, washing machine and rice cooker repairs. Shop near the bus stand, home visits too.",
    services: [["TV repair", 1500, "job"], ["Washing machine repair", 2000, "visit"]],
    today: true, verified: false, whatsapp: true, reviews: 4, quality: 4.2,
  },
  {
    name: "Roshan", cats: ["electrician"], town: "weligama", radius: 10,
    bio: "Electrical repairs in Weligama and Mirissa. Guest houses welcome.",
    services: [["Repairs", 1500, "visit"], ["Wiring", null]],
    today: true, verified: false, whatsapp: true, reviews: 3, quality: 4.5,
  },
  {
    name: "Farook", business: "Farook Plumbing", cats: ["plumber"], town: "weligama", radius: 12,
    bio: "Plumbing, water tanks and bathroom lines. Fast response in Weligama.",
    services: [["Leak repair", 1200, "visit"], ["Water tank cleaning", 3500, "job"], ["Bathroom lines", null]],
    today: false, verified: true, whatsapp: true, reviews: 6, quality: 4.5,
  },
  {
    name: "Ramesh", cats: ["ac-repair"], town: "galle", radius: 15,
    bio: "AC servicing and repairs. Inverter AC experience.",
    services: [["AC service", 4500, "job"], ["AC repair", 2500, "visit"]],
    today: true, verified: false, whatsapp: true, reviews: 3, quality: 4.4,
  },
  {
    name: "Dilani", business: "Dilani Painting & Design", cats: ["painter"], town: "matara", radius: 15,
    bio: "Interior painting, feature walls and colour advice. Careful with furniture and floors.",
    services: [["Interior painting", 50, "sqft"], ["Feature walls", 8000, "job"]],
    today: true, verified: true, whatsapp: true, reviews: 7, quality: 4.9,
  },
  {
    name: "Wasantha", cats: ["carpenter"], town: "dikwella", radius: 20,
    bio: "Roof repairs, ceilings and doors. Also termite-damaged timber replacement.",
    services: [["Roof repair", null], ["Ceiling work", null], ["Door repair", 2000, "job"]],
    today: false, verified: false, whatsapp: false, reviews: 2, quality: 4.0,
  },
  {
    name: "Harshana", business: "Harshana Pest Control", cats: ["pest-control"], town: "matara", radius: 25,
    bio: "Termite and cockroach treatment for houses. Safe for children and pets when dry.",
    services: [["Termite treatment", 8000, "job"], ["Cockroach treatment", 4500, "job"]],
    today: true, verified: true, whatsapp: true, reviews: 5, quality: 4.6,
  },
  {
    name: "Thilina", cats: ["electrician", "cctv"], town: "hikkaduwa", radius: 15,
    bio: "Electrical and CCTV for houses and hotels between Hikkaduwa and Ambalangoda.",
    services: [["Electrical repairs", 1500, "visit"], ["CCTV installation", null]],
    today: true, verified: false, whatsapp: true, reviews: 3, quality: 4.3,
  },
  {
    name: "Chathura", business: "Chathura Tiles", cats: ["tiler"], town: "galle", radius: 20,
    bio: "Tiling for floors, bathrooms and kitchens. Titanium and granite work.",
    services: [["Floor tiling", 110, "sqft"], ["Kitchen tops", null]],
    today: false, verified: true, whatsapp: true, reviews: 4, quality: 4.6,
  },
  {
    name: "Mahesh", cats: ["welder"], town: "galle", radius: 15,
    bio: "Welding repairs and new gates. Mobile welding plant.",
    services: [["Gate & grill repair", 2500, "job"], ["New gates", null]],
    today: true, verified: false, whatsapp: false, reviews: 2, quality: 4.5,
  },
  {
    name: "Anura", cats: ["plumber"], town: "akuressa", radius: 15,
    bio: "Plumbing repairs and new lines around Akuressa and Kamburupitiya.",
    services: [["Leak repair", 1000, "visit"], ["New lines", null]],
    today: true, verified: false, whatsapp: false, reviews: 3, quality: 4.4,
  },
  {
    name: "Isuru", business: "Isuru Fridge & AC", cats: ["appliance-repair", "ac-repair"], town: "akuressa", radius: 20,
    bio: "Fridge and AC repairs. Visits to Deniyaya on weekends.",
    services: [["Fridge repair", 2500, "visit"], ["AC service", 4000, "job"]],
    today: false, verified: true, whatsapp: true, reviews: 5, quality: 4.5,
  },
  // Pending — for the admin queue
  {
    name: "Kavinda", cats: ["electrician"], town: "mirissa", radius: 10,
    bio: "Electrical repairs and fan fitting.",
    services: [["Repairs", 1200, "visit"]],
    status: "pending", whatsapp: true,
  },
  {
    name: "Rukshan", business: "Rukshan Plumbing", cats: ["plumber"], town: "ahangama", radius: 12,
    bio: "Plumbing for houses and villas.",
    services: [["Leak repair", 1500, "visit"]],
    status: "pending",
  },
];

export const CUSTOMER_NAMES = [
  "Sanduni", "Harsha", "Nadeesha", "Chamara", "Ishara", "Malith", "Thushari", "Kalana", "Fathima",
  "Pavithra", "Dulaj", "Shehan", "Nirosha", "Suresh", "Anjali", "Rashmi", "Kamal", "Hiruni",
  "Yasas", "Priya", "Nilanthi", "Sajith", "Madhavi", "Rizna", "Tharaka", "Kumari",
];

export const REVIEW_COMMENTS: Record<string, string[]> = {
  general: [
    "Came on time and explained the problem clearly.",
    "Fair price. Would call again.",
    "Did a neat job and cleaned up after.",
    "Answered the phone quickly and came the same day.",
    "Good work, a bit late but called to say.",
    "Honest about what needed fixing and what didn't.",
  ],
  electrician: [
    "Found the fault in the trip switch in ten minutes.",
    "Rewired the kitchen points, tidy work.",
    "Fixed the fan and two lights in one visit.",
  ],
  plumber: [
    "Fixed the leaking tap under the sink. No more water on the floor.",
    "Sorted the toilet cistern that was running all night.",
    "Water motor working again the same evening.",
  ],
  "ac-repair": [
    "AC is cooling properly again after the service.",
    "Cleaned the indoor unit well, no leaking now.",
  ],
  carpenter: ["Door closes properly now. Good finishing.", "Built a pantry cupboard, solid work."],
  mason: ["Plastered the crack on the front wall, can't see it now.", "Good team, finished in two days."],
  "appliance-repair": [
    "Washing machine was not spinning, fixed it at home.",
    "Fridge cooling again. Told me what caused it.",
  ],
  painter: ["Painted two rooms, careful with the furniture.", "Colour advice was helpful."],
  welder: ["Fixed the gate hinge and repainted it.", "Roller door works smoothly now."],
  tiler: ["Bathroom tiles are straight and neat."],
  cctv: ["Set up four cameras and showed us how to view on the phone."],
  "pest-control": ["No more termites in the roof after treatment."],
};
