export const GALLERY = {
  mustard: [
    "https://images.unsplash.com/photo-1720468750623-39e9a09f5067?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "https://images.unsplash.com/photo-1646476110859-f1d73d8436b6?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "https://images.unsplash.com/photo-1515931215890-366d3990cf8d?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "https://images.unsplash.com/photo-1768572781055-e5cc64015255?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
  ],
  groundnut: [
    "https://images.unsplash.com/photo-1596522869169-95231d2b6864?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "https://images.unsplash.com/photo-1561911298-389ebc538835?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "https://images.unsplash.com/photo-1671116810287-f2081bb6597a?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "https://images.unsplash.com/photo-1768572781055-e5cc64015255?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
  ],
  soyabean: [
    "https://images.unsplash.com/photo-1703218039342-779a2487f176?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "https://images.unsplash.com/photo-1515931215890-366d3990cf8d?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "https://images.unsplash.com/photo-1671116810287-f2081bb6597a?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
    "https://images.unsplash.com/photo-1646476110859-f1d73d8436b6?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
  ],
};

export const CATEGORIES = [
  { slug: "mustard", name: "Mustard", tagline: "Kachi Ghani Cold Pressed", bg: "#D98F00", text: "#1F3D2B", image: "https://images.unsplash.com/photo-1646476110859-f1d73d8436b6?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
  { slug: "soyabean", name: "Soyabean", tagline: "Refined Heart-Light", bg: "#2B2A28", text: "#F5F1E8", image: "https://images.unsplash.com/photo-1703218039342-779a2487f176?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
  { slug: "groundnut", name: "Groundnut", tagline: "Filtered Nutty Rich", bg: "#B8431A", text: "#F5F1E8", image: "https://images.unsplash.com/photo-1561911298-389ebc538835?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
];

export const PRODUCTS = [
  { id: "m1l", name: "Kachi Ghani Mustard Oil", category: "mustard", sizes: [{label:"500ml", price:159},{label:"1L", price:289},{label:"5L", price:1399}], rating: 4.9, reviews: 2184, badge: "BESTSELLER", image: "https://images.unsplash.com/photo-1720468750623-39e9a09f5067?crop=entropy&cs=srgb&fm=jpg&q=85&w=900", description: "Wood cold-pressed from hand-picked Rajasthani mustard seeds. Pungent, sharp, fiery — the way Dadi used to cook.", benefits: ["Cold Pressed","Unrefined","High in Omega-3","No Additives"], nutrition: {energy:"900 kcal", fat:"100g", sat:"9g", trans:"0g"}, bg:"#D98F00" },
  { id: "g1l", name: "Filtered Groundnut Oil", category: "groundnut", sizes: [{label:"1L", price:249},{label:"5L", price:1199},{label:"15L", price:3499}], rating: 4.8, reviews: 1542, badge: "PURE", image: "https://images.unsplash.com/photo-1596522869169-95231d2b6864?crop=entropy&cs=srgb&fm=jpg&q=85&w=900", description: "Kolhu-filtered single origin Saurashtra groundnuts. Deep nutty aroma, perfect for deep frying.", benefits: ["Single Origin","High Smoke Point","Rich in Vit E","Zero Cholesterol"], nutrition: {energy:"884 kcal", fat:"100g", sat:"17g", trans:"0g"}, bg:"#B8431A" },
  { id: "s1l", name: "Refined Soyabean Oil", category: "soyabean", sizes: [{label:"1L", price:139},{label:"5L", price:649}], rating: 4.7, reviews: 987, badge: "LIGHT", image: "https://images.unsplash.com/photo-1703218039342-779a2487f176?crop=entropy&cs=srgb&fm=jpg&q=85&w=900", description: "Six-stage refined MP soyabean oil. Light, neutral and heart-friendly — your everyday warrior.", benefits: ["6x Refined","Heart Light","Vit A+D Fortified","Neutral Flavour"], nutrition: {energy:"884 kcal", fat:"100g", sat:"16g", trans:"0g"}, bg:"#2B2A28" },
  { id: "m5l", name: "Mustard Oil Family Jar", category: "mustard", sizes: [{label:"5L", price:1399},{label:"15L", price:4049}], rating: 4.9, reviews: 812, badge: "FAMILY", image: "https://images.unsplash.com/photo-1720468750623-39e9a09f5067?crop=entropy&cs=srgb&fm=jpg&q=85&w=900", description: "The monthly ration your family deserves. Vacuum-sealed tins keep it fresh for 9 months.", benefits: ["Bulk Value","Sealed Freshness","Kachi Ghani","Handmade"], nutrition: {energy:"900 kcal", fat:"100g", sat:"9g", trans:"0g"}, bg:"#D98F00" },
  { id: "g5l", name: "Groundnut Oil Tin", category: "groundnut", sizes: [{label:"5L", price:1199},{label:"15L", price:3499}], rating: 4.8, reviews: 621, badge: "TIN", image: "https://images.unsplash.com/photo-1596522869169-95231d2b6864?crop=entropy&cs=srgb&fm=jpg&q=85&w=900", description: "The authentic tin pack — built for the halwai, loved by the home cook.", benefits: ["Traditional Tin","Cold Filtered","Bulk Value","Kolhu Pressed"], nutrition: {energy:"884 kcal", fat:"100g", sat:"17g", trans:"0g"}, bg:"#B8431A" },
  { id: "s5l", name: "Soyabean Family Pack", category: "soyabean", sizes: [{label:"5L", price:649},{label:"15L", price:1899}], rating: 4.6, reviews: 445, badge: "VALUE", image: "https://images.unsplash.com/photo-1703218039342-779a2487f176?crop=entropy&cs=srgb&fm=jpg&q=85&w=900", description: "Light on the stomach, heavy on value. 15L of everyday goodness.", benefits: ["Family Size","Vit A+D","Refined","Affordable"], nutrition: {energy:"884 kcal", fat:"100g", sat:"16g", trans:"0g"}, bg:"#2B2A28" },
];

export const TESTIMONIALS = [
  { name: "Meera Iyer", city: "Bengaluru", quote: "The mustard oil actually smells like my grandmother's kitchen. Finally.", rating: 5 },
  { name: "Rohan Gupta", city: "Delhi", quote: "Switched our entire restaurant to Laxmi groundnut. Guests notice.", rating: 5 },
  { name: "Priya Shah", city: "Ahmedabad", quote: "Clean, honest oil. The tin packaging is a throwback I love.", rating: 5 },
  { name: "Anil Kulkarni", city: "Pune", quote: "My dal tadka has never tasted this alive. Kachi Ghani is the real deal.", rating: 5 },
];

export const BLOGS = [
  { id: 1, title: "Why Cold-Pressed Matters", tag: "SCIENCE", read: "4 min", image: "https://images.unsplash.com/photo-1768572781055-e5cc64015255?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
  { id: 2, title: "The Mustard Belt of Rajasthan", tag: "STORY", read: "6 min", image: "https://images.unsplash.com/photo-1646476110859-f1d73d8436b6?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
  { id: 3, title: "5 Dishes That Demand Groundnut", tag: "RECIPES", read: "3 min", image: "https://images.unsplash.com/photo-1671116810287-f2081bb6597a?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
];

export const TRUST = [
  { num: "2026", label: "Born In Jaipur" },
  { num: "100%", label: "Batches Tested" },
  { num: "12+", label: "Partner Mills" },
  { num: "4.9★", label: "Early Reviews" },
];
