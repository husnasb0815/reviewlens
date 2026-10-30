# ReviewLens – AI-Powered Customer Feedback Analysis Platform

ReviewLens is a complete, full-stack customer feedback intelligence platform that unifies customer feedback across Google Reviews, Website forms, Instagram, Facebook, and CSV spreadsheets. Using Google Gemini aspect-based AI, it deconstructs mixed customer opinions (e.g. praising product craftsmanship while complaining about shipping delays), isolates operational root causes, detects recurring complaints, and generates prioritized, actionable recommendations.

---

## Key Features

1. **Animated Splash Screen & Identity**:
   - High-fidelity animated magnifying-glass logo with sentiment spectrum bars (Red `#EF4444`, Amber `#F59E0B`, Emerald `#10B981`) and glowing circular ring.
   - Smooth transition into application with accessible skip option.

2. **Aspect-Based Sentiment Intelligence (Google Gemini 3.8 Flash)**:
   - Evaluates multi-faceted reviews by distinct aspects (e.g., Product Quality, Delivery Speed, Customer Service, Pricing, Ambiance, Packaging).
   - Extracts customer likes, dislikes, customer expectations, recurring complaints, customer suggestions, and inferred root causes.
   - Interactive live aspect deconstruction sandbox for instant review testing.

3. **Scheduled Feedback Collection & Auto-Update Engine**:
   - Configurable synchronization frequency (15 min, 30 min, 1 hr, 6 hr, 24 hr).
   - "Refresh Now" on-demand sync with duplicate prevention using source review IDs.
   - Automatically tags newly ingested reviews with a "New" badge.
   - Full synchronization audit history log tracking platforms, timestamps, and status.

4. **Multi-Module Enterprise Dashboard**:
   - **Overview**: Real-time calculated KPIs, Recharts sentiment distribution donut, sentiment timeline area chart, top complaints, and recent reviews.
   - **Feedback Management**: Full-featured search, source filters, rating filters, sentiment filters, sorting, pagination, review inspection modal, manual entry, and bulk CSV import.
   - **AI Analysis**: Aspect breakdown, batch review synthesis, likes vs dislikes matrix.
   - **Customer Insights**: Categorized insights (Strengths, Complaints, Weaknesses, Expectations, Preferences) with customer quotes.
   - **Recommendations**: Actionable cards with identified problem, customer quote proof, suggested improvement, priority badge, expected benefit, and status tracking (Pending, In Progress, Completed).
   - **Business Ideas**: Growth opportunities, feasibility levels, customer-expectation backing, and projected business impact.
   - **Reports & Trends**: Star rating breakdown, weekly complaint trajectory, 1-click CSV report export, and printable Executive PDF report.
   - **Settings**: Business profile configuration, feedback sources, sync intervals, and account management.

5. **Theme Switching**:
   - Seamless Light Mode (`#F8FAFC`) and Dark Mode (`#0B1220`).
   - Persisted in `localStorage` and respects system preferences on initial visit.
   - Zero-reload theme toggle.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts
- **Backend**: Node.js & Express.js with Vite middleware
- **AI Integration**: Google Gemini API (`@google/genai` SDK, `gemini-3.8-flash`)
- **Persistence**: File-backed persistent database (`data/database.json`) with atomic operations
- **Typography**: Sora, DM Sans, JetBrains Mono

---

## Local Development & Setup

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Environment Variables
Create a `.env` file in the project root (see `.env.example`):
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to access ReviewLens.

---

## Deployment to Vercel & Production

1. Build the production assets:
```bash
npm run build
```
2. Start the production server:
```bash
npm run start
```
3. When deploying to Vercel or Cloud Run, set the `GEMINI_API_KEY` in your deployment provider's Environment Secrets panel.
