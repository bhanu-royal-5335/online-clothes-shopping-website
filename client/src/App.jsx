import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ProtectedRoute from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminAIDashboard = lazy(() => import('./pages/AdminAIDashboard'));
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b0f19] dark:text-slate-100 transition-colors duration-300">
      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-slate-800 dark:text-white dark:border dark:border-slate-700 font-medium text-xs',
          duration: 3000,
        }}
      />

      {/* Global Navigation */}
      <Navbar />

      {/* Main Pages Router with Code Splitting Suspense */}
      <main className="flex-grow">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Loading Experience...</p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Protected Routes */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            {/* Admin & Seller Restricted Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ai"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminAIDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor"
              element={
                <ProtectedRoute>
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback 404 handler page */}
            <Route
              path="*"
              element={
                <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
                  <h1 className="text-6xl font-extrabold text-slate-300 dark:text-slate-800">404</h1>
                  <h2 className="text-xl font-bold">Oops! Page not found.</h2>
                  <p className="text-sm text-slate-500">The link you followed may be broken, or the page may have been removed.</p>
                  <a href="/" className="inline-block bg-primary-600 text-white font-semibold text-xs px-6 py-2.5 rounded-xl">
                    Go Back Home
                  </a>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Floating WhatsApp Quick Contact */}
      <WhatsAppButton />
    </div>
  );
}

export default App;
