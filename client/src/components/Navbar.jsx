import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

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
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-slate-600 dark:text-slate-300 hover:text-primary-500 flex items-center space-x-1.5 transition-colors">
                <Sliders className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
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

          {/* Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Wishlist Link */}
            <Link
              to="/profile"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors"
            >
              <Heart className="h-5 w-5" />
              {user?.wishlist?.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full"></span>
              )}
            </Link>

            {/* Shopping Cart Icon */}
            <Link
              to="/cart"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center border border-white dark:border-[#0f172a]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown Profile Menu */}
            <div ref={dropdownRef} className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-1.5 p-1 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {/* Dropdown Options */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-52 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-lg p-2 space-y-1">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/50 mb-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
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
                        <span>Order Tracking</span>
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

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 font-medium text-sm"
            >
              Admin Dashboard
            </Link>
          )}

          {!user && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 rounded-xl text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center bg-primary-600 hover:bg-primary-700 py-2 rounded-xl text-white font-semibold text-sm transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
