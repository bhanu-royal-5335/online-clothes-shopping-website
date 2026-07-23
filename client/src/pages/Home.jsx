import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck, Zap, Sparkles, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/SkeletonLoader';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, topRes, latestRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/products/top'),
          api.get('/api/products?pageSize=4'),
        ]);
        setCategories(catRes.data);
        setFeaturedProducts(topRes.data);
        setLatestProducts(latestRes.data.products || []);
      } catch (error) {
        console.error('Failed to load home page sections:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-16 transition-colors duration-300">
      
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-b-[40px] md:rounded-b-[60px] py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e293b,transparent)] opacity-60"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/30 rounded-full filter blur-[100px]"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/30 rounded-full px-3.5 py-1 text-primary-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4.5 w-4.5" />
              <span>Rainbow Fashions Couture</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
              Luxury Apparel. <br />
              <span className="bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">Premium Collection.</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-md mx-auto lg:mx-0">
              Upgrade your wardrobe with our handcrafted selection of Italian wool suits, cashmere trench coats, silk evening wear, and comfortable kids garments.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/shop"
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3.5 rounded-2xl shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 transition-all"
              >
                <span>Shop Catalogue</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#categories"
                className="w-full sm:w-auto border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold px-8 py-3.5 rounded-2xl flex items-center justify-center transition-all"
              >
                Explore Categories
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
              alt="Premium Rainbow Fashions Banner"
              className="rounded-3xl shadow-2xl border border-slate-800 object-cover w-full max-h-[480px]"
            />
          </motion.div>
        </div>
      </section>

      {/* 2. Featured Value Propositions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4 p-6 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="p-3 bg-primary-100 dark:bg-primary-950/40 rounded-2xl text-primary-600 dark:text-primary-400">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Ultra Fast Delivery</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Get local free shipping on all orders totaling over $100.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-6 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Secure Encrypted Checks</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Stripe-integrated processing guarantees complete safety.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-6 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/40 rounded-2xl text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Premium Quality Assurance</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">100% money-back satisfaction guarantees on items within 30 days.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Categories Grid */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Shop by Category</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Explore our dedicated collections for men, women, and children.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {loading
            ? [1, 2, 3].map((i) => (
                <div key={i} className="shimmer-bg h-36 rounded-2xl"></div>
              ))
            : categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${cat.slug}`}
                  className="group relative h-40 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 dark:border-slate-800"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
                    <h3 className="font-bold text-white text-sm sm:text-base leading-tight">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* 4. Featured Products (Top Rated) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Customer Favorites</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Our top-rated products based on customer feedback.</p>
          </div>
          <Link to="/shop?sort=rating" className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? [1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)
            : featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* 5. Latest Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Latest Arrivals</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Explore our latest inventory additions.</p>
          </div>
          <Link to="/shop" className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center space-x-1">
            <span>Shop All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? [1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)
            : latestProducts.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="bg-slate-100 dark:bg-slate-900 py-16 px-4 rounded-[40px] max-w-7xl mx-auto border border-slate-200/50 dark:border-slate-800/40">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Loved by Shoppers Worldwide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className="h-4.5 w-4.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                &quot;The user interface is exceptionally smooth. The checkout process took under a minute with Apple Pay/Stripe, and my cashmere trench coat arrived in 2 days. Quality is incredible!&quot;
              </p>
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-xs">SM</div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Sarah Miller</h4>
                  <p className="text-[10px] text-slate-400">Verified Buyer</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className="h-4.5 w-4.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                &quot;Highly recommend Rainbow Fashions. I had to cancel an order due to a wrong address, and their customer support had my funds returned and the order re-routed immediately. Premium service.&quot;
              </p>
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-primary-500 flex items-center justify-center font-bold text-white text-xs">DK</div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">David K.</h4>
                  <p className="text-[10px] text-slate-400">Verified Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
