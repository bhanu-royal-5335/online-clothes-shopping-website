const mongoose = require('mongoose');
const dns = require('dns');

// Override DNS servers to Google DNS to bypass dead OS resolver
dns.setServers(['8.8.8.8', '8.8.4.4']);

const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

dotenv.config({ path: path.join(__dirname, '../.env') });

// High-resolution Unsplash fashion dress & apparel images
const FASHION_IMAGES = [
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
];

const DRESS_TYPES = [
  'Emerald Satin Evening Gown', 'Crimson Floral Maxi Dress', 'Royal Velvet Cocktail Dress', 'Golden Zardozi Anarkali Dress',
  'Deep Plum Chiffon Party Dress', 'Sapphire Blue Slip Dress', 'Pastel Pink Lehenga Dress', 'Midnight Black Bodycon Dress',
  'Ivory Silk Bridal Gown', 'Ruby Red Halter Dress', 'Champagne Sequin Party Dress', 'Olive Linen Summer Sundress',
  'Rose Gold Tiered Maxi Dress', 'Wine Velvet Wrap Dress', 'Turquoise Silk Kaftan Dress', 'Coral Floral Chiffon Dress',
  'Lavender A-Line Party Dress', 'Maroon Embroidered Ethnic Gown', 'Blush Pink Organza Dress', 'Forest Green Cutout Dress',
  'Pearl White Off-Shoulder Gown', 'Amber Metallic Pleated Dress', 'Dusty Rose Midi Cocktail Dress', 'Cobalt Blue High-Low Dress',
  'Tangerine Silk Bandhani Dress', 'Plum Layered Ruffle Gown', 'Peacock Green Brocade Dress', 'Silver Sequin Backless Dress',
  'Teal Crepe Mermaid Gown', 'Fuchsia Silk Sharara Set', 'Bronze Satin Bias-Cut Dress', 'Mauve Velvet Off-Shoulder Dress',
  'Mint Green Georgette Gown', 'Burgundy Corset Evening Dress', 'Gold Metallic Draped Maxi Dress', 'Jade Green Floral Midi Dress',
  'Scarlet Red One-Shoulder Dress', 'Navy Blue Chiffon Floor Gown', 'Lilac Embroidered Net Dress', 'Cream Silk Empire Waist Dress',
];

const SUIT_TYPES = [
  'Royal Velvet Tuxedo Blazer', 'Italian Merino Wool Suit', 'Classic Navy Double-Breasted Suit', 'Charcoal Grey Tailored Blazer',
  'Linen Summer Oxford Suit', 'Midnight Velvet Dinner Jacket', 'Emerald Green Slim Fit Blazer', 'Burgundy Satin Lapel Suit',
  'Beige Italian Wool Blazer', 'Prince of Wales Checked Suit', 'Black Tie Formal Tuxedo Set', 'Ivory Wedding Groom Blazer',
];

const ETHNIC_TYPES = [
  'Handcrafted Zardozi Silk Anarkali', 'Royal Kanjeevaram Silk Lehenga', 'Chikankari Georgette Kurta Set', 'Gold Threaded Brocade Suit',
  'Bandhani Silk Flare Lehenga', 'Maroon Velvet Bridal Lehenga', 'Organza Embroidered Dupatta Suit', 'Pastel Pink Mirror Work Anarkali',
];

const BRANDS = ['Aurelia Lux', 'Sartoria Milano', 'Rainbow Couture', 'Vogue Luxe', 'Royal Threads', 'Zari & Silk'];
const COLORS = ['Emerald Green', 'Royal Blue', 'Ruby Red', 'Midnight Black', 'Pastel Pink', 'Amber Gold', 'Navy Blue', 'Wine Burgundy', 'Champagne', 'Ivory White'];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartcart');
    console.log('Connected to MongoDB for seeding 150+ dress catalog...');

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});

    // 1. Seed Users
    const adminUser = await User.create({
      name: 'Y Bhanu Prakash',
      email: 'bhanuroyal177@gmail.com',
      password: 'admin123password',
      role: 'admin',
      isVerified: true,
    });

    const customerUser = await User.create({
      name: 'Jane Doe',
      email: 'customer@rainbowfashions.com',
      password: 'customer123password',
      role: 'customer',
      isVerified: true,
    });

    // 2. Seed 8 High-Fashion Categories
    const categoriesToSeed = [
      { name: 'Dresses & Gowns', slug: 'dresses', description: 'Evening gowns, cocktail dresses, satin slips, and maxi dresses', image: FASHION_IMAGES[0] },
      { name: 'Ethnic Wear', slug: 'ethnic', description: 'Handcrafted Anarkalis, lehengas, sarees, and embroidered suits', image: FASHION_IMAGES[3] },
      { name: 'Suits & Formal', slug: 'suits', description: 'Bespoke tuxedos, velvet blazers, and Italian wool suit sets', image: FASHION_IMAGES[4] },
      { name: 'Party & Cocktail', slug: 'party', description: 'Sequin dresses, bodycon styles, metallic gowns, and partywear', image: FASHION_IMAGES[2] },
      { name: 'Smart Casual', slug: 'casual', description: 'Silk shirts, linen blouses, tailored oxford tops, and knits', image: FASHION_IMAGES[5] },
      { name: 'Bottomwear & Pants', slug: 'bottoms', description: 'Chinos, wide-leg trousers, denim jeans, and flared skirts', image: FASHION_IMAGES[7] },
      { name: 'Outerwear & Coats', slug: 'outerwear', description: 'Cashmere trench coats, leather jackets, and winter coats', image: FASHION_IMAGES[8] },
      { name: 'Luxury Accessories', slug: 'accessories', description: 'Designer handbags, silk scarves, heels, and jewelry', image: FASHION_IMAGES[9] },
    ];

    const seededCategories = await Category.insertMany(categoriesToSeed);
    const catMap = {};
    seededCategories.forEach((c) => { catMap[c.slug] = c._id; });

    // 3. Generate 160 High-Fashion Products
    const productsToSeed = [];
    let skuCounter = 1000;

    // Helper to generate catalog items
    const generateCategoryProducts = (typeArray, categorySlug, basePrice, gender, count) => {
      for (let i = 0; i < count; i++) {
        skuCounter++;
        const title = `${typeArray[i % typeArray.length]} - Edition ${Math.floor(i / typeArray.length) + 1}`;
        const imgUrl = FASHION_IMAGES[i % FASHION_IMAGES.length];
        const price = basePrice + (i * 150) % 2500;
        const discountPrice = Math.round(price * 0.85);
        const colorPrimary = COLORS[i % COLORS.length];

        productsToSeed.push({
          name: title,
          description: `Exquisite ${title} crafted from premium haute couture fabric. Tailored for flawless drape, breathability, and day-to-night elegance. Matches with AI Vision recommendations (>90% accuracy).`,
          category: catMap[categorySlug] || catMap['dresses'],
          subcategory: categorySlug.toUpperCase(),
          brand: BRANDS[i % BRANDS.length],
          price: price,
          discountPrice: discountPrice,
          sku: `RF-DRESS-${skuCounter}`,
          stockQuantity: 15 + (i % 20),
          sizes: ['XS', 'S', 'M', 'L', 'XL'],
          colors: [colorPrimary, COLORS[(i + 1) % COLORS.length], COLORS[(i + 2) % COLORS.length]],
          material: i % 2 === 0 ? 'Pure Silk Satin' : 'Organic Chiffon & Cotton',
          gender: gender,
          images: [imgUrl, FASHION_IMAGES[(i + 1) % FASHION_IMAGES.length]],
          thumbnail: imgUrl,
          ratings: parseFloat((4.5 + (i % 5) * 0.1).toFixed(1)),
          numOfReviews: 12 + (i * 7) % 80,
          featured: i % 4 === 0,
        });
      }
    };

    // 160 total products generated across categories
    generateCategoryProducts(DRESS_TYPES, 'dresses', 2499, 'Women', 50);   // 50 Dresses & Gowns
    generateCategoryProducts(ETHNIC_TYPES, 'ethnic', 3499, 'Women', 35);    // 35 Ethnic Wear
    generateCategoryProducts(SUIT_TYPES, 'suits', 4499, 'Men', 25);         // 25 Suits & Blazers
    generateCategoryProducts(DRESS_TYPES, 'party', 2999, 'Women', 25);      // 25 Party Dresses
    generateCategoryProducts(DRESS_TYPES, 'casual', 1899, 'Unisex', 15);     // 15 Smart Casual
    generateCategoryProducts(DRESS_TYPES, 'bottoms', 1499, 'Unisex', 10);    // 10 Bottomwear

    const seededProducts = await Product.insertMany(productsToSeed);
    console.log(`✅ SUCCESS: Seeded ${seededProducts.length} high-fashion dresses & products into database!`);

    // 4. Seed Demo Coupons
    await Coupon.create({
      code: 'WELCOME10',
      discountType: 'percent',
      discountValue: 10,
      minOrderValue: 500,
      expiryDate: new Date('2028-12-31'),
    });

    console.log('Seeded database successfully with 150+ dresses catalog!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding error:', error);
    process.exit(1);
  }
};

seedData();
