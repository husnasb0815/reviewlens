import React from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Sun,
  Moon,
  ChevronRight,
  CheckCircle2,
  PieChart,
  MessageSquareQuote,
  Star,
} from 'lucide-react';
import { ReviewLensLogo } from './ReviewLensLogo.tsx';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onReplaySplash: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onLogin,
  isDark,
  onToggleTheme,
  onReplaySplash,
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* ========================================================= */}
      {/* TOP NAVIGATION BAR (Zone Contract: Brand - 4 Nav Links - 1 Action) */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#0B1220]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <ReviewLensLogo size="md" onClick={onReplaySplash} />
          </div>

          {/* Zone 2: 4-5 single-line clean nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors whitespace-nowrap shrink-0">
              Capabilities
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#aspect-analysis" className="hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors whitespace-nowrap shrink-0">
              Aspect AI
            </a>
            <a href="#about" className="hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors whitespace-nowrap shrink-0">
              About
            </a>
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={onLogin}
              className="hidden sm:inline-block px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </button>

            <button
              onClick={onGetStarted}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================= */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-10">
            {/* Ambient Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 text-xs font-medium text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-[#818CF8]" />
              <span>Multi-Source AI Feedback Intelligence Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-display text-balance leading-tight">
              Customer opinions, identified complaints, real recommendations.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              ReviewLens uses Google Gemini aspect-based AI to analyze reviews across Google, Web, and Social. It separates product praise from shipping bottlenecks, isolates root causes, and delivers prioritized business fixes.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <button
                onClick={onGetStarted}
                className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                Explore Live Platform
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onLogin}
                className="px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
              >
                Sign In With Demo Account
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Persistent Database
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-indigo-500" />
                Auto 15-Minute Sync
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Aspect-Based Gemini Analysis
              </span>
            </div>
          </div>

          {/* Hero Visual Preview: 1 dominant visual anchor */}
          <div className="relative max-w-5xl mx-auto mt-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden bg-white dark:bg-[#111827]">
            <img
              src="/src/assets/images/hero_analytics_preview_1793369607960.jpg"
              alt="ReviewLens SaaS Dashboard Preview"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover max-h-[540px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white text-xs backdrop-blur-md bg-slate-900/70 p-3 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Live Sync Active
                </span>
                <span>·</span>
                <span>Aspect analysis on 270+ verified multi-channel reviews</span>
              </div>
              <button
                onClick={onGetStarted}
                className="text-white hover:text-indigo-200 font-medium flex items-center gap-1 underline underline-offset-2"
              >
                Open Dashboard <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ASPECT-BASED AI DIFFERENTIATOR SHOWCASE */}
      {/* ========================================================= */}
      <section id="aspect-analysis" className="py-16 bg-white dark:bg-[#111827] border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">
              Why Aspect-Based AI Changes Everything
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Legacy tools assign one blanket sentiment to a whole paragraph. ReviewLens decomposes nuanced sentences into independent aspect sentiments so you know exactly what is working and what is broken.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Customer Review Example
            </div>
            <blockquote className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 italic mb-6">
              "The product craftsmanship and material quality are top-notch, but standard delivery was 9 days late without a tracking update."
            </blockquote>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Aspect 1: Product Quality
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                    Positive · 95/100
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Praised textile craftsmanship and build quality. No changes required.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                    Aspect 2: Shipping & Delivery
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200">
                    Negative · 20/100
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Customer experienced transit delay and silence. Generates automated SMS carrier webhook recommendation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MAJOR CAPABILITIES (4 Clean Pillars) */}
      {/* ========================================================= */}
      <section id="features" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">
              Built for Decision Makers & CX Leaders
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              General-purpose architecture supporting Retail, Healthcare, Food & Beverage, Hospitality, E-commerce, and Technology enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-[#818CF8] mb-4">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 font-display">
                Aspect Sentiment Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Evaluates distinct attributes per review—isolating customer likes, dislikes, suggestions, and customer expectations.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 font-display">
                Top Complaint Detector
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Aggregates friction points into recurring complaints with severity indicators and root cause analysis.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 font-display">
                Actionable Recommendations
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Connects problems to exact customer quotes, suggested operational fixes, and trackable status boards.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 font-display">
                Automatic 15-Min Sync
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Continuously pulls feedback from Google Reviews, web endpoints, and CSVs with duplicate prevention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3-STEP WORKFLOW */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-16 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">
              Simple 3-Step Workflow
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              From raw feedback to prioritized business execution in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 relative">
              <span className="text-xs font-bold text-indigo-600 dark:text-[#818CF8] uppercase tracking-wider">
                Step 01
              </span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-2 mb-2 font-display">
                Connect Feedback Channels
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Link Google Places, website feedback webhooks, or upload historical customer spreadsheets via CSV.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 relative">
              <span className="text-xs font-bold text-indigo-600 dark:text-[#818CF8] uppercase tracking-wider">
                Step 02
              </span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-2 mb-2 font-display">
                AI Analyzes Aspects & Root Causes
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Gemini processes sentiment by aspect, extracts customer expectations, and tallies top recurring complaints.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 relative">
              <span className="text-xs font-bold text-indigo-600 dark:text-[#818CF8] uppercase tracking-wider">
                Step 03
              </span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-2 mb-2 font-display">
                Deploy Prioritized Recommendations
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Execute prioritized improvements with tracked status (Pending, In Progress, Completed) and verify impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SOCIAL PROOF & EXECUTIVE TESTIMONIAL */}
      {/* ========================================================= */}
      <section id="about" className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-center gap-6">
            <img
              src="/src/assets/images/avatar_demo_user_1793369608950.jpg"
              alt="Elena Rostova, Operations Director"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-indigo-500"
            />
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 italic mb-3">
                "ReviewLens separated our specialty espresso ratings from our lunch rush feedback. We identified that midday counter queues were driving our 3-star reviews, introduced online order-ahead, and saw our customer satisfaction jump from 78% to 94% in 30 days."
              </p>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-slate-200">Maya Lin</span>
                <span> · General Manager at FreshBite Café</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* BOTTOM CTA */}
      {/* ========================================================= */}
      <section className="py-16 bg-indigo-600 dark:bg-indigo-900/60 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-3">
            Ready to understand what your customers really think?
          </h2>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto mb-8">
            Access the pre-loaded live dashboard or connect your business feedback sources in minutes.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-3.5 text-sm font-semibold text-indigo-600 bg-white hover:bg-indigo-50 rounded-lg shadow-lg transition-colors inline-flex items-center gap-2"
          >
            Launch ReviewLens Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}
      <footer className="py-10 bg-white dark:bg-[#0B1220] border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ReviewLensLogo size="sm" />
            <span>· AI Customer Feedback Analysis Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-slate-200">Capabilities</a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-slate-200">Workflow</a>
            <a href="#aspect-analysis" className="hover:text-slate-900 dark:hover:text-slate-200">Aspect AI</a>
            <button onClick={onReplaySplash} className="hover:text-indigo-600 dark:hover:text-[#818CF8] text-xs">
              Replay Intro
            </button>
          </div>

          <div>
            © {new Date().getFullYear()} ReviewLens. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
