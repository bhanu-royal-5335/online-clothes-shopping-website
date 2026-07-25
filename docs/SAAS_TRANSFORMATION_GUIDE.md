# SaaS Transformation Guide

## Objective: Transition Rainbow Fashions to Multi-Tenant Headless E-Commerce SaaS

---

## 1. Architectural Strategy
Rainbow Fashions supports **Hybrid Multi-Tenancy** using scoped tenant fields (`tenantId`). 

### Tenant Data Model Schema Definition:
```javascript
const tenantSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  customCss: { type: String },
  subscriptionTier: { type: String, enum: ['starter', 'pro', 'enterprise'], default: 'starter' },
  isActive: { type: Boolean, default: true }
});
```

---

## 2. Dynamic Domain Routing Logic
Incoming HTTP requests pass through tenant resolution middleware in `server/middleware/tenant.js`:
```javascript
const resolveTenant = async (req, res, next) => {
  const host = req.headers.host; // e.g., brand.rainbowfashions.com
  req.tenantId = host.split('.')[0] || 'default-tenant';
  next();
};
```
