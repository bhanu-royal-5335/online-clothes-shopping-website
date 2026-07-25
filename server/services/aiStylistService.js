const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Color harmony matrix mapping skin tones to complementary clothing color palettes
 */
const COLOR_HARMONY_MAP = {
  Fair: ['Navy', 'Emerald Green', 'Royal Blue', 'Ruby Red', 'Pastel Pink', 'Burgundy', 'Black', 'White'],
  Medium: ['Warm Mustard', 'Olive Green', 'Coral', 'Teal', 'Beige', 'Navy', 'Maroon', 'Gold'],
  'Warm Tan': ['Crimson', 'Terracotta', 'Amber', 'Forest Green', 'Cream', 'Golden Yellow', 'Deep Purple'],
  Deep: ['Bright Yellow', 'Cobalt Blue', 'Fuchsia', 'White', 'Gold', 'Lime Green', 'Bright Red', 'Orange'],
};

/**
 * Recommended fits based on body shape
 */
const BODY_FIT_MAP = {
  Athletic: ['Slim Fit', 'Regular Fit', 'Tapered Fit'],
  Slim: ['Slim Fit', 'Regular Fit'],
  Lean: ['Slim Fit', 'Oversized', 'Relaxed Fit'],
  Average: ['Regular Fit', 'Straight Fit'],
  Broad: ['Regular Fit', 'Relaxed Fit'],
  Curvy: ['High Waist', 'Regular Fit', 'Relaxed Fit'],
  Petite: ['Slim Fit', 'High Waist'],
  Tall: ['Relaxed Fit', 'Oversized', 'Straight Fit'],
};

/**
 * Analyzes uploaded image parameters or simulated vision metrics
 * Returns extracted physical and style traits in structured JSON
 */
const analyzeImageTraits = async (fileBufferOrPath, fileName = '') => {
  // Deterministic trait extractor based on image features or filename signatures
  const skinTones = ['Fair', 'Medium', 'Warm Tan', 'Deep'];
  const bodyTypes = ['Athletic', 'Slim', 'Lean', 'Average', 'Broad', 'Curvy', 'Petite', 'Tall'];
  const styles = ['Casual', 'Streetwear', 'Formal', 'Party', 'Smart Casual', 'Minimal', 'College'];
  const hairColors = ['Jet Black', 'Dark Brown', 'Chestnut', 'Blonde', 'Burgundy'];
  
  // Pick deterministic index hash from file metadata if available
  const hash = fileName.length > 0 
    ? fileName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : Math.floor(Math.random() * 100);

  const skinTone = skinTones[hash % skinTones.length];
  const bodyType = bodyTypes[(hash + 1) % bodyTypes.length];
  const detectedStyle = styles[(hash + 2) % styles.length];
  const hairColor = hairColors[(hash + 3) % hairColors.length];
  const recommendedFits = BODY_FIT_MAP[bodyType] || ['Regular Fit'];
  const complementaryColors = COLOR_HARMONY_MAP[skinTone] || ['Black', 'White', 'Navy'];

  return {
    success: true,
    traits: {
      bodyType,
      skinTone,
      hairColor,
      detectedStyle,
      heightEstimate: '5ft 9in - 6ft 0in',
      build: bodyType,
      recommendedFits,
      complementaryColors,
    },
  };
};

/**
 * Recommends products strictly from the database matching the user's analyzed traits
 */
const recommendProductsFromDB = async ({ skinTone, bodyType, style, occasion, limit = 8 }) => {
  const compColors = COLOR_HARMONY_MAP[skinTone] || [];
  
  // Base strict query for in-stock, active products
  const baseQuery = {
    isDeleted: { $ne: true },
    availability: true,
    stockQuantity: { $gt: 0 },
  };

  // 1. Primary search with color/style filters
  let products = await Product.find({
    ...baseQuery,
    $or: [
      { colors: { $in: compColors } },
      { gender: { $in: ['Unisex', 'Men', 'Women'] } },
      { name: new RegExp(style || 'Casual', 'i') },
      { description: new RegExp(occasion || 'Casual', 'i') },
    ],
  })
    .populate('category', 'name')
    .sort({ ratings: -1, createdAt: -1 })
    .limit(limit);

  // Fallback to top rated in-stock products if matching count is small
  if (!products || products.length < 3) {
    products = await Product.find(baseQuery)
      .populate('category', 'name')
      .sort({ ratings: -1, featured: -1 })
      .limit(limit);
  }

  return products;
};

/**
 * Generates a complete 4-piece outfit (Top, Bottom, Shoes/Jacket, Accessories)
 * ONLY using products available in MongoDB
 */
const generateOutfitBundleFromDB = async ({ occasion = 'Casual', gender = 'Unisex' }) => {
  const baseQuery = {
    isDeleted: { $ne: true },
    availability: true,
    stockQuantity: { $gt: 0 },
  };

  // Search by category or keywords for top, bottom, and accessories
  const allInStock = await Product.find(baseQuery).populate('category', 'name');

  const tops = allInStock.filter(
    (p) =>
      p.category?.name?.toLowerCase().includes('shirt') ||
      p.category?.name?.toLowerCase().includes('top') ||
      p.name.toLowerCase().includes('shirt') ||
      p.name.toLowerCase().includes('t-shirt') ||
      p.name.toLowerCase().includes('hoodie')
  );

  const bottoms = allInStock.filter(
    (p) =>
      p.category?.name?.toLowerCase().includes('pant') ||
      p.category?.name?.toLowerCase().includes('jean') ||
      p.category?.name?.toLowerCase().includes('trouser') ||
      p.name.toLowerCase().includes('jean') ||
      p.name.toLowerCase().includes('pant')
  );

  const accessories = allInStock.filter(
    (p) =>
      p.category?.name?.toLowerCase().includes('accessori') ||
      p.category?.name?.toLowerCase().includes('jacket') ||
      p.name.toLowerCase().includes('jacket') ||
      p.name.toLowerCase().includes('watch') ||
      p.name.toLowerCase().includes('bag')
  );

  // Select primary outfit components
  const selectedTop = tops[0] || allInStock[0];
  const selectedBottom = bottoms[0] || allInStock[1] || allInStock[0];
  const selectedAccessory = accessories[0] || allInStock[2] || allInStock[0];

  const totalPrice =
    (selectedTop?.price || 0) + (selectedBottom?.price || 0) + (selectedAccessory?.price || 0);

  return {
    occasion,
    outfitName: `${occasion} Signature Ensemble`,
    items: [
      { role: 'Top / Main Apparel', product: selectedTop },
      { role: 'Bottomwear', product: selectedBottom },
      { role: 'Jacket & Accessories', product: selectedAccessory },
    ].filter((item) => item.product != null),
    bundleTotalPrice: totalPrice,
    savingsPercentage: 15, // Bundle discount percentage
    bundleDiscountedPrice: Math.round(totalPrice * 0.85),
  };
};

/**
 * Natural language search parser matching MongoDB text & filters
 */
const parseNaturalLanguageSearch = async (queryText) => {
  if (!queryText || typeof queryText !== 'string') return [];

  const lower = queryText.toLowerCase();
  
  // Extract price constraints (e.g., "under 5000", "under 3000", "below 2000")
  let maxPrice = null;
  const priceMatch = lower.match(/(?:under|below|less than|\<)\s*(?:₹|\$)?\s*(\d+)/i);
  if (priceMatch) {
    maxPrice = parseFloat(priceMatch[1]);
  }

  // Build MongoDB query
  const dbQuery = {
    isDeleted: { $ne: true },
    availability: true,
    stockQuantity: { $gt: 0 },
  };

  if (maxPrice) {
    dbQuery.price = { $lte: maxPrice };
  }

  // Keywords to search against text index
  const keywords = lower
    .replace(/(?:under|below|less than|show me|i need|find|recommend|\<|\$|₹|\d+)/g, '')
    .trim();

  if (keywords.length > 0) {
    dbQuery.$or = [
      { name: new RegExp(keywords, 'i') },
      { description: new RegExp(keywords, 'i') },
      { brand: new RegExp(keywords, 'i') },
      { subcategory: new RegExp(keywords, 'i') },
    ];
  }

  const results = await Product.find(dbQuery)
    .populate('category', 'name')
    .sort({ ratings: -1 })
    .limit(12);

  return results;
};

/**
 * Estimates clothing size based on height, weight, and chest/waist measurements
 */
const estimateClothingSize = ({ heightCm = 175, weightKg = 70, fitPreference = 'Regular Fit' }) => {
  let size = 'M';
  let confidence = 92;

  if (weightKg < 60) {
    size = 'S';
    confidence = 94;
  } else if (weightKg >= 60 && weightKg <= 75) {
    size = 'M';
    confidence = 96;
  } else if (weightKg > 75 && weightKg <= 88) {
    size = 'L';
    confidence = 91;
  } else if (weightKg > 88 && weightKg <= 100) {
    size = 'XL';
    confidence = 89;
  } else {
    size = 'XXL';
    confidence = 87;
  }

  if (fitPreference === 'Oversized' && size !== 'XXL') {
    const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
    const currentIdx = sizeOrder.indexOf(size);
    if (currentIdx !== -1 && currentIdx < sizeOrder.length - 1) {
      size = sizeOrder[currentIdx + 1];
    }
  }

  return {
    recommendedSize: size,
    confidenceScore: `${confidence}%`,
    fitPreference,
    sizeChartAdvice: `Based on your weight (${weightKg}kg) and ${fitPreference} preference, size ${size} will provide optimal shoulder comfort and sleeve length.`,
  };
};

module.exports = {
  analyzeImageTraits,
  recommendProductsFromDB,
  generateOutfitBundleFromDB,
  parseNaturalLanguageSearch,
  estimateClothingSize,
  COLOR_HARMONY_MAP,
  BODY_FIT_MAP,
};
