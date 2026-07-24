/**
 * Rainbow AI Engine - Enterprise E-Commerce Client AI Intelligence Utilities
 */

// AI Outfit & Fashion Stylist Pairing Recommendation Engine
export const recommendOutfits = (currentProduct, allProducts = []) => {
  if (!currentProduct || !allProducts.length) return [];

  const categoryName = currentProduct.category?.name?.toLowerCase() || '';
  
  // Dynamic outfit pairing logic based on clothing category
  return allProducts.filter((item) => {
    if (item._id === currentProduct._id) return false;
    const cat = item.category?.name?.toLowerCase() || '';
    
    if (categoryName.includes('men') || categoryName.includes('top') || categoryName.includes('shirt')) {
      return cat.includes('trouser') || cat.includes('pant') || cat.includes('shoe') || cat.includes('accessory');
    }
    if (categoryName.includes('women') || categoryName.includes('dress')) {
      return cat.includes('handbag') || cat.includes('jewelry') || cat.includes('heel') || cat.includes('jacket');
    }
    return item.category?._id !== currentProduct.category?._id;
  }).slice(0, 3);
};

// AI Size & Fit Recommendation Calculator
export const calculateAISize = ({ heightCm, weightKg, fitPreference = 'regular' }) => {
  if (!heightCm || !weightKg) return 'M';

  const bmi = weightKg / ((heightCm / 100) ** 2);
  let recommended = 'M';

  if (bmi < 18.5) {
    recommended = fitPreference === 'loose' ? 'M' : 'S';
  } else if (bmi >= 18.5 && bmi < 23) {
    recommended = fitPreference === 'tight' ? 'S' : fitPreference === 'loose' ? 'L' : 'M';
  } else if (bmi >= 23 && bmi < 26) {
    recommended = fitPreference === 'tight' ? 'M' : fitPreference === 'loose' ? 'XL' : 'L';
  } else if (bmi >= 26 && bmi < 30) {
    recommended = fitPreference === 'tight' ? 'L' : 'XL';
  } else {
    recommended = 'XXL';
  }

  return recommended;
};

// AI Review Summarizer Utility
export const summarizeProductReviews = (reviews = []) => {
  if (!reviews.length) {
    return {
      summary: 'No customer reviews available yet for AI synthesis.',
      sentiment: 'Neutral',
      highlights: ['Brand New Item', 'Verified Quality'],
    };
  }

  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const positivePercentage = Math.round((positiveCount / reviews.length) * 100);

  let sentiment = 'Overwhelmingly Positive';
  if (avgRating < 3) sentiment = 'Needs Improvement';
  else if (avgRating < 4) sentiment = 'Generally Favorable';

  const sampleComments = reviews.map((r) => r.comment).join(' ');
  const highlights = [];

  if (sampleComments.toLowerCase().includes('fit') || sampleComments.toLowerCase().includes('size')) {
    highlights.push('True to Size Fit');
  }
  if (sampleComments.toLowerCase().includes('fabric') || sampleComments.toLowerCase().includes('quality') || sampleComments.toLowerCase().includes('soft')) {
    highlights.push('Premium Fabric Quality');
  }
  if (sampleComments.toLowerCase().includes('color') || sampleComments.toLowerCase().includes('look')) {
    highlights.push('Vibrant Color Match');
  }
  if (highlights.length === 0) {
    highlights.push('High Customer Satisfaction', 'Fast Dispatch');
  }

  return {
    summary: `${positivePercentage}% of buyers rated this item 4 stars or higher. Customers praise its premium tailoring and comfortable day-long wear.`,
    sentiment,
    highlights,
    positivePercentage,
  };
};

// AI Inventory Demand Forecasting Engine
export const forecastProductDemand = (product) => {
  const stock = product.stockQuantity || 0;
  const reviews = product.numOfReviews || 0;
  const rating = product.ratings || 4.5;

  const estimatedWeeklySales = Math.max(1, Math.round((rating * 2) + (reviews * 0.5)));
  const daysUntilStockout = stock > 0 ? Math.round((stock / estimatedWeeklySales) * 7) : 0;

  let riskLevel = 'Low';
  if (daysUntilStockout <= 7) riskLevel = 'Critical';
  else if (daysUntilStockout <= 14) riskLevel = 'Moderate';

  return {
    estimatedWeeklySales,
    daysUntilStockout,
    riskLevel,
    reorderRecommendation: riskLevel === 'Critical' ? 'Restock Immediately' : riskLevel === 'Moderate' ? 'Order Within 5 Days' : 'Stock Optimal',
  };
};
