# Contributing Guidelines - Rainbow Fashions Enterprise SaaS

Thank you for considering contributing to Rainbow Fashions Enterprise SaaS Platform!

## Development Workflow

1. **Fork & Clone Repository**:
   ```bash
   git clone https://github.com/bhanu-royal-5335/online-clothes-shopping-website.git
   cd online-clothes-shopping-website
   ```

2. **Install Dependencies**:
   ```bash
   # Install server & client packages
   cd server && npm install
   cd ../client && npm install
   ```

3. **Environment Setup**:
   Copy `.env.example` in both `server/` and `client/` directories to `.env`.

4. **Code Quality Rules**:
   - Write clean, SOLID-compliant code following domain-driven service architecture.
   - Run `npm --prefix client run build` to verify clean production compilation before submitting a Pull Request.
   - Follow clean git commit conventions (e.g. `feat: add AI size recommender`, `fix: auth middleware route`).

5. **Submitting Pull Requests**:
   - Create a feature branch (`git checkout -b feature/amazing-feature`).
   - Push to your branch and open a PR against `main`.
