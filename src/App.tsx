import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { Header } from './components/Header.tsx';
import { Sidebar, SidebarTab } from './components/Sidebar.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { Overview } from './components/modules/Overview.tsx';
import { FeedbackManagement } from './components/modules/FeedbackManagement.tsx';
import { AIAnalysisModule } from './components/modules/AIAnalysisModule.tsx';
import { CustomerInsights } from './components/modules/CustomerInsights.tsx';
import { RecommendationsModule } from './components/modules/RecommendationsModule.tsx';
import { BusinessIdeasModule } from './components/modules/BusinessIdeasModule.tsx';
import { ReportsTrends } from './components/modules/ReportsTrends.tsx';
import { SettingsModule } from './components/modules/SettingsModule.tsx';
import { User, BusinessProfile, DashboardStats, Feedback } from './types/index.ts';

export default function App() {
  // Theme Management
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('reviewlens_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('reviewlens_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('reviewlens_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // App Navigation & Session
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<SidebarTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Auth & Business
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);

  // Dashboard Stats & Sync
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Modal review inspect
  const [inspectedReview, setInspectedReview] = useState<Feedback | null>(null);

  // Fetch initial session and stats
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setBusiness(data.business);
      }
    } catch (err) {
      console.warn('Could not load session:', err);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchStats();
  }, []);

  // Sync Now action
  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/refresh', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        fetchStats();
        setSyncToast(
          data.collectedCount > 0
            ? `Sync finished: ${data.collectedCount} new reviews collected and aspect-analyzed.`
            : 'Sync finished: All channels are up to date.'
        );
        setTimeout(() => setSyncToast(null), 4000);
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear new badges
  const handleClearNewBadges = async () => {
    try {
      await fetch('/api/feedback/clear-new', { method: 'POST' });
      fetchStats();
    } catch (err) {
      console.error('Failed to clear new badges:', err);
    }
  };

  // Auth success handler
  const handleAuthSuccess = (u: User, b?: BusinessProfile) => {
    setUser(u);
    if (b) setBusiness(b);
    setView('dashboard');
    setActiveTab('overview');
    fetchStats();
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  // Splash Screen finished callback
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Replay splash screen
  const handleReplaySplash = () => {
    setShowSplash(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* 1. Animated Splash Screen from Review Lens.html */}
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      {/* 2. Public Landing Page */}
      {view === 'landing' && (
        <LandingPage
          onGetStarted={() => {
            if (user) {
              setView('dashboard');
              setActiveTab('overview');
            } else {
              setAuthMode('login');
              setAuthModalOpen(true);
            }
          }}
          onLogin={() => {
            setAuthMode('login');
            setAuthModalOpen(true);
          }}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onReplaySplash={handleReplaySplash}
        />
      )}

      {/* 3. Full Authenticated Dashboard */}
      {view === 'dashboard' && (
        <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220]">
          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            business={business}
            newReviewsCount={stats?.newReviewsCount || 0}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            onReplaySplash={handleReplaySplash}
          />

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Navigation Bar */}
            <Header
              currentModule={
                activeTab === 'overview'
                  ? 'Overview Dashboard'
                  : activeTab === 'feedback'
                  ? 'Feedback Management'
                  : activeTab === 'ai-analysis'
                  ? 'AI Aspect Analysis'
                  : activeTab === 'insights'
                  ? 'Customer Insights'
                  : activeTab === 'recommendations'
                  ? 'Actionable Recommendations'
                  : activeTab === 'business-ideas'
                  ? 'AI Business Ideas'
                  : activeTab === 'reports'
                  ? 'Reports & Trends'
                  : 'Settings'
              }
              user={user}
              business={business}
              isDark={isDark}
              onToggleTheme={toggleTheme}
              onSyncNow={handleSyncNow}
              isSyncing={isSyncing}
              lastSyncTime={stats?.recentFeedback?.[0]?.createdAt || null}
              newReviewsCount={stats?.newReviewsCount || 0}
              onLogout={handleLogout}
              onReplaySplash={handleReplaySplash}
              onViewLanding={() => setView('landing')}
              onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            />

            {/* Notification Toast */}
            {syncToast && (
              <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs shadow-2xl flex items-center gap-2 border border-slate-700 dark:border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{syncToast}</span>
              </div>
            )}

            {/* Active Content Module */}
            <main className="flex-1 pb-16">
              {activeTab === 'overview' && (
                <Overview
                  stats={stats}
                  loading={loadingStats}
                  onRefresh={fetchStats}
                  onNavigateToFeedback={() => setActiveTab('feedback')}
                  onNavigateToInsights={() => setActiveTab('insights')}
                  onClearNewBadges={handleClearNewBadges}
                  onViewReview={r => {
                    setInspectedReview(r);
                    setActiveTab('feedback');
                  }}
                />
              )}

              {activeTab === 'feedback' && (
                <FeedbackManagement onRefreshStats={fetchStats} />
              )}

              {activeTab === 'ai-analysis' && (
                <AIAnalysisModule onRefreshAll={fetchStats} />
              )}

              {activeTab === 'insights' && <CustomerInsights />}

              {activeTab === 'recommendations' && <RecommendationsModule />}

              {activeTab === 'business-ideas' && <BusinessIdeasModule />}

              {activeTab === 'reports' && <ReportsTrends stats={stats} />}

              {activeTab === 'settings' && (
                <SettingsModule
                  user={user}
                  business={business}
                  isDark={isDark}
                  onToggleTheme={toggleTheme}
                  onUpdateBusiness={b => setBusiness(b)}
                  onLogout={handleLogout}
                  onSyncNow={handleSyncNow}
                  isSyncing={isSyncing}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
