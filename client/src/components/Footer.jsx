import { Link } from 'react-router-dom';
import { Shirt, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Footer = () => {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const email = e.target.elements.newsletterEmail.value;
    if (email) {
      toast.success('Thank you for subscribing to our newsletter!');
      e.target.reset();
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 dark:bg-slate-950 border-t border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-white font-bold text-xl">
              <Shirt className="h-6 w-6 text-primary-500" />
              <span>Rainbow <span className="text-primary-500">Fashions</span></span>
            </Link>
            <p className="text-sm text-slate-400">
              Discover high-quality premium apparel designed to elevate your style. Handcrafted suits, elegant evening gowns, and sustainable organic cottons.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-500 transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary-500 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary-500 transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/shop" className="hover:text-white transition-colors">Browse Shop</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">User Profile</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Details</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <span>123 E-Commerce Way, NY 10001</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <span>+1 (555) 019-2834</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <span>support@rainbowfashions.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Join Our Newsletter</h3>
            <p className="text-sm text-slate-400 mb-4">
              Get notified of monthly clearance discounts, flash sales, and new design arrivals.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex">
              <input
                type="email"
                name="newsletterEmail"
                placeholder="Enter email address"
                required
                className="w-full px-3 py-2 text-slate-900 bg-white border border-slate-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-md text-sm transition-colors duration-200"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Rainbow Fashions. All rights reserved. Developed for production environments.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
