import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/SkeletonLoader';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Component states
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productCount, setProductCount] = useState(0);

  // Filters from searchParams/URL
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const inStock = searchParams.get('inStock') === 'true';
  const discount = searchParams.get('discount') === 'true';
  const sort = searchParams.get('sort') || '';
  const sizes = searchParams.get('sizes') || '';
  const colors = searchParams.get('colors') || '';
  const gender = searchParams.get('gender') || '';

  // Local filter states for input elements
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localBrand, setLocalBrand] = useState(brand);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load Categories on mount
  useEffect(() => {
    const loadCats = async () => {
      try {
        const { data } = await api.get('/api/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to load shop categories:', err.message);
      }
    };
    loadCats();
  }, []);

  // Sync URL filters with local inputs
  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
    setLocalBrand(brand);
  }, [minPrice, maxPrice, brand]);

  // Fetch products whenever params or page change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (keyword) queryParams.set('keyword', keyword);
        if (category) queryParams.set('category', category);
        if (brand) queryParams.set('brand', brand);
        if (minPrice) queryParams.set('minPrice', minPrice);
        if (maxPrice) queryParams.set('maxPrice', maxPrice);
        if (rating) queryParams.set('rating', rating);
        if (inStock) queryParams.set('inStock', 'true');
        if (discount) queryParams.set('discount', 'true');
        if (sort) queryParams.set('sort', sort);
        if (sizes) queryParams.set('sizes', sizes);
        if (colors) queryParams.set('colors', colors);
        if (gender) queryParams.set('gender', gender);
        queryParams.set('page', page);
        queryParams.set('pageSize', 6);

        const { data } = await api.get(`/api/products?${queryParams.toString()}`);
        setProducts(data.products || []);
        setTotalPages(data.pages || 1);
        setProductCount(data.count || 0);
      } catch (err) {
        console.error('Failed to load filtered catalog:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, category, brand, minPrice, maxPrice, rating, inStock, discount, sort, page]);

  // Helper to merge search parameters
  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.keys(newParams).forEach((key) => {
      if (newParams[key] === null || newParams[key] === '' || newParams[key] === false) {
        updated.delete(key);
      } else {
        updated.set(key, newParams[key]);
      }
    });
    // Reset page to 1 on filter alteration
    updated.delete('page');
    setPage(1);
    setSearchParams(updated);
  };

  const handleSizeToggle = (sz) => {
    const activeSizes = sizes ? sizes.split(',') : [];
    if (activeSizes.includes(sz)) {
      updateFilters({ sizes: activeSizes.filter((x) => x !== sz).join(',') || null });
    } else {
      updateFilters({ sizes: [...activeSizes, sz].join(',') });
    }
  };

  const handleColorToggle = (col) => {
    const activeColors = colors ? colors.split(',') : [];
    if (activeColors.includes(col)) {
      updateFilters({ colors: activeColors.filter((x) => x !== col).join(',') || null });
    } else {
      updateFilters({ colors: [...activeColors, col].join(',') });
    }
  };

  const handleGenderToggle = (gen) => {
    updateFilters({ gender: gender === gen ? null : gen });
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    updateFilters({ minPrice: localMinPrice, maxPrice: localMaxPrice });
  };

  const handleClearAll = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalBrand('');
    setSearchParams({});
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Search Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200/50 dark:border-slate-800/40 gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Shop Collection</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {keyword ? `Showing results for "${keyword}"` : 'Browse and filter our catalog items'} ({productCount} products found)
          </p>
        </div>

        {/* Top Control Bar */}
        <div className="flex items-center space-x-3 self-end md:self-auto">
          {/* Mobile Filter toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>

          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none cursor-pointer"
            >
              <option value="">Sort: Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* Reset Filters button */}
          <button
            onClick={handleClearAll}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Reset Filters"
          >
            <RefreshCw className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* SIDEBAR FILTERS - Desktop & Mobile overlay */}
        <aside
          className={`lg:block space-y-6 ${
            sidebarOpen
              ? 'fixed inset-0 z-40 bg-white dark:bg-slate-900 p-6 overflow-y-auto block'
              : 'hidden'
          } md:relative md:inset-auto md:z-auto md:bg-transparent md:p-0 md:overflow-visible`}
        >
          {/* Mobile close button */}
          {sidebarOpen && (
            <div className="flex justify-between items-center mb-6 lg:hidden">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filter Products</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                Close
              </button>
            </div>
          )}

          {/* Categories Filter */}
          <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => updateFilters({ category: '' })}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  category === ''
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateFilters({ category: cat.slug })}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors truncate ${
                    category === cat.slug
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Gender</h3>
            <div className="flex flex-wrap gap-2">
              {['Men', 'Women', 'Kids'].map((g) => (
                <button
                  key={g}
                  onClick={() => handleGenderToggle(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    gender === g
                      ? 'border-primary-600 bg-primary-500/10 text-primary-700 dark:text-primary-400 font-extrabold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes Filter */}
          <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Sizes</h3>
            <div className="flex flex-wrap gap-1.5">
              {['XS', 'S', 'M', 'L', 'XL', '30', '32', '34', '36'].map((sz) => {
                const isSelected = (sizes ? sizes.split(',') : []).includes(sz);
                return (
                  <button
                    key={sz}
                    onClick={() => handleSizeToggle(sz)}
                    className={`h-8 w-11 rounded-lg text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'border-primary-600 bg-primary-500/10 text-primary-700 dark:text-primary-400 font-extrabold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-805'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Colors</h3>
            <div className="flex flex-wrap gap-2">
              {['Camel', 'Beige', 'Black', 'Navy', 'Charcoal', 'Emerald', 'Ruby Red', 'Mustard Yellow', 'Forest Green', 'Ocean Blue', 'Khaki', 'Olive Green', 'White', 'Sky Blue', 'Sage Green'].map((col) => {
                const isSelected = (colors ? colors.split(',') : []).includes(col);
                return (
                  <button
                    key={col}
                    onClick={() => handleColorToggle(col)}
                    className={`h-6.5 w-6.5 rounded-full border shadow-sm relative flex items-center justify-center transition-all hover:scale-110 ${
                      isSelected
                        ? 'border-primary-600 ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-slate-900'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                    style={{ backgroundColor: col.toLowerCase().replace(/ /g, '') }}
                    title={col}
                  >
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white shadow mix-blend-difference"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Price Range</h3>
            <form onSubmit={handlePriceApply} className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold py-2 rounded-xl text-xs transition-colors"
              >
                Apply Price
              </button>
            </form>
          </div>

          {/* Brand Filter */}
          <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Brand</h3>
            <input
              type="text"
              placeholder="Search Brand..."
              value={localBrand}
              onChange={(e) => setLocalBrand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateFilters({ brand: localBrand })}
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {/* Toggle Switches: In Stock & Sales */}
          <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-pointer" htmlFor="inStockSwitch">
                In Stock Only
              </label>
              <input
                id="inStockSwitch"
                type="checkbox"
                checked={inStock}
                onChange={(e) => updateFilters({ inStock: e.target.checked })}
                className="h-4.5 w-4.5 text-primary-600 border-slate-300 rounded focus:ring-primary-500 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-pointer" htmlFor="discountSwitch">
                On Special Sale
              </label>
              <input
                id="discountSwitch"
                type="checkbox"
                checked={discount}
                onChange={(e) => updateFilters({ discount: e.target.checked })}
                className="h-4.5 w-4.5 text-primary-600 border-slate-300 rounded focus:ring-primary-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Ratings filter */}
          <div className="bg-white dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Average Rating</h3>
            <div className="space-y-1">
              {[4, 3, 2, 1].map((stars) => (
                <button
                  key={stars}
                  onClick={() => updateFilters({ rating: stars })}
                  className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    rating === stars.toString()
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="flex items-center text-amber-400">★ {stars}+ Stars</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* PRODUCTS GRID AREA */}
        <main className="lg:col-span-3 space-y-8">
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((i) => <ProductSkeleton key={i} />)
            ) : products.length > 0 ? (
              products.map((product) => <ProductCard key={product._id} product={product} />)
            ) : (
              <div className="col-span-full py-16 text-center bg-white dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
                <p className="text-slate-500 dark:text-slate-400 font-medium">No products found matching the filter criteria.</p>
                <button
                  onClick={handleClearAll}
                  className="mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl disabled:opacity-40 transition-opacity"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 px-4">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl disabled:opacity-40 transition-opacity"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default Shop;
