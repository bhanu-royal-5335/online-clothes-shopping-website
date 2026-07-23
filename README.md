# SmartCart E-Commerce Platform

SmartCart is a full-featured, production-ready, premium online shopping platform built with a React SPA frontend and a Node/Express REST API backend. It features responsive light/dark design sheets, Stripe sandbox checkouts, and a comprehensive Admin dashboard.

---

## Technical Stack

- **Frontend**: Vite + React, Tailwind CSS, TanStack Query (React Query), Framer Motion, Axios, Recharts, React Hot Toast
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose schemas)
- **Authentication**: Access/Refresh tokens placed inside secure HTTP-Only, SameSite cookies with Bcrypt password hashes
- **Payments**: Integrated Stripe Elements + Cash On Delivery (COD)
- **Image Storage**: Cloudinary (with fallback to local static filesystem directory if variables are missing)

---

## Directory Folder Structure

```text
shop/
├── client/                     # Vite + React Client
│   ├── public/                 # Static asset folder
│   ├── src/
│   │   ├── components/         # Reusable layouts (Navbar, Footer, ProductCard, Skeletons)
│   │   ├── context/            # AuthContext.jsx, CartContext.jsx state management
│   │   ├── pages/              # Views (Home, Shop, Details, Cart, Checkout, Profile, Dashboard)
│   │   ├── utils/              # api.js Axios configuration
│   │   ├── App.jsx             # SPA routing mapping
│   │   └── main.jsx            # Context providers mounting
│   ├── index.html              # Main HTML entry
│   ├── tailwind.config.js      # Styling configuration
│   ├── vite.config.js          # Client dev server & reverse proxy
│   └── package.json
│
├── server/                     # Node + Express Backend
│   ├── config/                 # db.js Mongoose database helper
│   ├── controllers/            # Auth, Products, Categories, Orders, Coupons
│   ├── middleware/             # Route blockers, validators, error catchers, uploaders
│   ├── models/                 # Mongoose schemas (User, Product, Category, Order, Coupon)
│   ├── routes/                 # Express API endpoints mapping
│   ├── scripts/                # seed.js database initialiser script
│   ├── uploads/                # Local static fallback directory for uploads
│   ├── utils/                  # Cookie and token handlers
│   ├── app.js                  # Express middleware pipeline configurations
│   ├── server.js               # Entry script listener
│   ├── .env                    # Environment key file
│   └── package.json
│
└── README.md                   # Setup and Deployment guide
```

---

## Local Installation Guide

### Prerequisites
- Install **Node.js** (v18 or higher recommended)
- Install **MongoDB** locally, or set up a free cluster in **MongoDB Atlas**

### Step 1: Clone and Configure Backend env
1. Open the file `server/.env` inside the project.
2. The default variables are set to:
   - `PORT=5000`
   - `MONGODB_URI=mongodb://127.0.0.1:27017/smartcart`
   - If using a cloud database, swap `MONGODB_URI` for your Atlas connection string.
   - If using live Stripe, replace the `STRIPE_SECRET_KEY` with your test key.

### Step 2: Install Dependencies
Open a terminal in the root workspace and run the installer commands:

```bash
# Install backend server dependencies
cd server
npm install

# Install frontend client dependencies
cd ../client
npm install
```

### Step 3: Populate Database Seeding
Initialize the categories, sample products, administrator accounts, and coupons:

```bash
# Run seeder script inside server folder
cd ../server
npm run seed
```
*Successfully seeds the admin login credentials:*
- **Admin account**: `admin@smartcart.com` (password: `admin123password`)
- **Customer account**: `customer@smartcart.com` (password: `customer123password`)

### Step 4: Launch Dev Servers
Open two terminal windows to run both packages in concurrent mode:

**Terminal 1 (Backend Server):**
```bash
cd server
npm start
```
*Server runs on port 5000.*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*Vite compiles resources and hosts the client on port 5173 (reverse proxy maps `/api` requests automatically).*

---

## Production Deployment Guides

### 1. MongoDB Atlas Configuration
1. Register for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Shared cluster, configure the IP Whitelist to allow access (`0.0.0.0/0` or active instances), and generate an administrative user.
3. Retrieve your connection string, replacing `<password>` with your database user password:
   `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/smartcart?retryWrites=true&w=majority`
4. Supply this connection string to your server's production settings.

### 2. Backend Deployment (Render)
1. Register on [Render](https://render.com) and link your Git repository.
2. Select **New Web Service**:
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
3. Expand the **Advanced / Environment Variables** section and define:
   - `PORT=10000` (Render handles this automatically)
   - `MONGODB_URI` = *[Your Atlas connection string]*
   - `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET` = *[Long, random strings]*
   - `CLIENT_URL` = *[Your frontend Vercel URL]*
   - `NODE_ENV` = `production`
4. Click **Deploy Web Service**.

### 3. Frontend Deployment (Vercel)
1. Register on [Vercel](https://vercel.com) and link your repository.
2. Select **New Project**:
   - Set **Framework Preset** to `Vite`.
   - Set **Root Directory** to `client`.
3. Open the build overrides and input settings if customized.
4. Add the environment variables:
   - Set proxy configurations in Vercel settings if backend queries are relative, or replace backend URLs in `client/src/utils/api.js` with your Render service URL (e.g. `https://smartcart-api.onrender.com`).
5. Click **Deploy**.
