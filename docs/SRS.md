# Software Requirements Specification (SRS)

## System Identifier: Rainbow Fashions E-Commerce API & Client
**Standard:** IEEE 830 / ISO/IEC 25010  
**Version:** 1.0.0  

---

## 1. System Architecture & Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│   React 18 + Vite + Tailwind CSS + Axios + React-Query      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST
┌──────────────────────────────▼──────────────────────────────┐
│                    API Gateway / Middleware                 │
│      Helmet Security / Rate Limiter / Express Validator      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                   Server Application Layer                   │
│   Node.js + Express.js Controller-Service-Repository Engine  │
└──────┬───────────────────────┬──────────────────────┬───────┘
       │                       │                      │
┌──────▼──────────┐   ┌────────▼─────────┐  ┌─────────▼─────────┐
│ MongoDB Atlas   │   │  Redis Cache     │  │ Cloudinary / AI  │
│ Primary DB      │   │  Session/Catalog │  │ Asset/Styling   │
└─────────────────┘   └──────────────────┘  └──────────────────┘
```

---

## 2. Functional Requirements

### FR-01: Authentication & Authorization
- **FR-01.1:** System shall issue HTTP-Only JWT cookies upon valid user login (`/api/auth/login`).
- **FR-01.2:** System shall allow token refresh without logging out the user via `/api/auth/refresh`.
- **FR-01.3:** Middleware shall enforce role boundaries (`admin`, `vendor`, `customer`).

### FR-02: Product Catalog & Multi-Vendor Management
- **FR-02.1:** Vendors shall upload multi-image products stored on Cloudinary with fallback local storage.
- **FR-02.2:** Search engine shall support keyword, category, price range, and sorting (`newest`, `price-asc`, `price-desc`, `rating`).

### FR-03: Checkout & Payments
- **FR-03.1:** Integration with Stripe Payment Intents for card payments.
- **FR-03.2:** Automatic stock deduction upon successful payment payload verification.

---

## 3. External Interface Requirements
- **Database:** MongoDB URI connection string with connection pool max 100.
- **Cache:** Redis URL with TLS encryption for production clusters.
- **Payments:** Stripe API Key `sk_live_...` / `sk_test_...`.
