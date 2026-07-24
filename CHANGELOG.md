# Changelog - Rainbow Fashions Enterprise SaaS Platform

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-07-24

### Added
- **Rainbow AI Engine**:
  - AI Fashion Advisor Drawer (`AIFashionAdvisor.jsx`) providing interactive styling tips and outfit pairing suggestions.
  - AI Size & Fit Recommendation Modal (`AISizeGuideModal.jsx`) calculating exact tailoring fit based on user height, weight, and fit preference.
  - AI Review Summarizer and Inventory Demand Forecasting engine (`aiEngine.js`).
- **Multi-Vendor Marketplace & Seller Panel**:
  - Mongoose Vendor Schema (`Vendor.js`) with commission percentages, payout request history, and bank account settlement details.
  - Seller REST API Endpoints (`vendorController.js` & `vendorRoutes.js`) for store registration and payouts.
  - Luxury Seller Studio (`VendorDashboard.jsx`) for merchant analytics and balance withdrawals.
- **Live Multi-Currency Conversion Engine**:
  - Dynamic currency switcher (`CurrencySelector.jsx` & `CurrencyContext.jsx`) converting catalogue prices across **₹ INR (Rupees)**, **$ USD**, **€ EUR**, and **£ GBP**.
- **WhatsApp Direct Ordering (+91 9705227709)**:
  - 1-Click WhatsApp item checkout on Product Details page and itemized Cart summary.
  - Floating WhatsApp support widget (`WhatsAppButton.jsx`).
- **DevOps & Production Infra**:
  - Production `Dockerfile`, `docker-compose.yml`, and GitHub Actions CI/CD workflow (`deploy.yml`).
  - Technical SaaS Platform documentation package (`docs/SAAS_PLATFORM_DOCUMENTATION.md`).

### Fixed
- Fixed module resolution path in `vendorRoutes.js` (`require('../middleware/auth')`).
- Handled unauthenticated profile check in `AuthContext.jsx` silently without outputting 401 console errors.
- Resolved `/api/api` base URL duplication in `client/src/utils/api.js`.
