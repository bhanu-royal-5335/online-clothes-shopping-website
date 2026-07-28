import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CurrencySelector from './CurrencySelector';
import {
  Shirt,
  ShoppingCart,
  Heart,
  User,
  Sun,
  Moon,
  Search,
  Menu,
  X,
  LogOut,
  Sliders,
  PackageCheck,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AIFashionStylistModal from './AIFashionStylistModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Click outside handlers to close overlays
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete Search logic
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/products?keyword=${searchQuery}&pageSize=5`);
        setSearchResults(data.products || []);
      } catch (err) {
        console.error('Autocomplete query failed:', err.message);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200/50 dark:border-slate-800/40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xl flex-shrink-0">
            <Shirt className="h-6 w-6 text-primary-500" />
            <span className="hidden sm:inline">Rainbow <span className="text-primary-500">Fashions</span></span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link to="/shop" className="text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors">
              Shop
            </Link>
            <button
              onClick={() => setAiModalOpen(true)}
              className="bg-gradient-to-r from-amber-500/20 to-primary-600/20 border border-amber-500/40 text-amber-400 font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center space-x-1.5 hover:scale-105 transition-all shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>AI Stylist</span>
            </button>
            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className="text-slate-600 dark:text-slate-300 hover:text-primary-500 flex items-center space-x-1.5 transition-colors">
                  <Sliders className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
                <Link to="/admin/ai" className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 transition-colors text-xs font-bold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Stats</span>
                </Link>
              </>
            )}
          </div>

          {/* Autocomplete Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-md relative hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search products, brands, categories..."
                className="w-full bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            </form>

            {/* Autocomplete Overlay */}
            {searchFocused && (searchResults.length > 0 || searchQuery.trim().length >= 2) && (
              <div className="absolute top-12 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-lg p-2 max-h-80 overflow-y-auto space-y-1">
                {searchResults.length > 0 ? (
                  searchResults.map((p) => (
                    <Link
                      key={p._id}
                      to={`/product/${p._id}`}
                      onClick={() => {
                        setSearchQuery('');
                        setSearchFocused(false);
                      }}
                      className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <img src={p.images[0]} alt={p.name} className="h-10 w-10 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                        <p className="text-xs text-slate-400 truncate">{p.brand} in {p.category?.name}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        ${(p.discountPrice || p.price).toFixed(2)}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 p-3 text-center">No products found matching &quot;{searchQuery}&quot;</p>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3">
            {/* Live Multi-Currency Switcher */}
            <CurrencySelector />

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors"
              title="My Wishlist"
            >
              <Heart className="h-5 w-5" />
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
            </button>

            {/* Cart Icon & Counter Badge */}
            <Link
              to="/cart"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Profile Menu */}
            <div ref={dropdownRef} className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 text-slate-700 dark:text-slate-200 hover:text-primary-500 transition-colors p-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center font-bold text-sm text-primary-500 uppercase">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                    <span className="hidden lg:inline text-sm font-semibold truncate max-w-[100px]">{user.name}</span>
                    <ChevronDown className="h-4 w-4 hidden lg:block text-slate-400" />
                  </button>

                  {/* Profile Dropdown */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-14 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 px-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2.5 p-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2.5 p-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <PackageCheck className="h-4 w-4" />
                        <span>My Orders</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center space-x-2.5 p-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <LayoutGrid className="h-4 w-4" />
                          <span>Admin Control</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-4.5 py-2 rounded-2xl shadow-sm hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full md:hidden transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0b0f19] px-4 py-4 space-y-3 transition-colors duration-300 shadow-md">
          {/* Mobile AI Stylist Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setAiModalOpen(true);
            }}
            className="w-full bg-gradient-to-r from-amber-500 via-primary-600 to-amber-600 text-slate-950 font-extrabold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 shadow-md"
          >
            <Sparkles className="h-4 w-4" />
            <span>Open AI Stylist Pro</span>
          </button>

          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          </form>

          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 font-medium text-sm"
          >
            Shop
          </Link>
        </div>
      )}

      {/* Mobile Floating Action Button (FAB) for AI Stylist */}
      <button
        onClick={() => setAiModalOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 bg-gradient-to-r from-amber-500 via-primary-600 to-amber-600 text-slate-950 font-extrabold text-xs px-3.5 py-2.5 rounded-full shadow-2xl shadow-amber-500/30 border border-amber-400/40 flex items-center space-x-1.5 active:scale-95 transition-all"
      >
        <Sparkles className="h-4 w-4 animate-bounce text-slate-950" />
        <span>AI Stylist</span>
      </button>

      {/* AI Stylist Pro Multi-Modal Interface */}
      <AIFashionStylistModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </nav>
  );
};

export default Navbar;
