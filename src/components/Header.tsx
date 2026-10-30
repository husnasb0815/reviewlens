import React, { useState } from 'react';
import {
  Sun,
  Moon,
  RefreshCw,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Building2,
  Menu,
  ExternalLink,
} from 'lucide-react';
import { ReviewLensLogo } from './ReviewLensLogo.tsx';
import { User, BusinessProfile } from '../types/index.ts';

interface HeaderProps {
  currentModule: string;
  user: User | null;
  business: BusinessProfile | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onSyncNow: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: string | null;
  newReviewsCount: number;
  onLogout: () => void;
  onReplaySplash: () => void;
  onViewLanding: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  user,
  business,
  isDark,
  onToggleTheme,
  onSyncNow,
  isSyncing,
  lastSyncTime,
  newReviewsCount,
  onLogout,
  onReplaySplash,
  onViewLanding,
  onToggleMobileSidebar,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const formatLastSync = (iso: string | null) => {
    if (!iso) return 'Not yet synced';
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between gap-6 px-4 sm:px-6 py-3">
        {/* Left: Mobile Toggle + Brand / Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-800"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block">
              <ReviewLensLogo size="sm" onClick={onViewLanding} />
            </div>
            <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
              {currentModule}
            </span>
          </div>
        </div>

        {/* Right: Sync Control, Theme Switch & Account Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* Sync Status & Action */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs">
            <span className="hidden lg:inline text-slate-500 dark:text-slate-400">
              Synced: <span className="font-mono tabular-nums text-slate-700 dark:text-slate-200">{formatLastSync(lastSyncTime)}</span>
            </span>

            {newReviewsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold tabular-nums">
                +{newReviewsCount} new
              </span>
            )}

            <button
              onClick={onSyncNow}
              disabled={isSyncing}
              className="p-1 text-indigo-600 dark:text-[#818CF8] hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-md transition-colors flex items-center gap-1 font-medium disabled:opacity-50"
              title="Trigger instant feedback synchronization across connected sources"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              aria-expanded={menuOpen}
            >
              <img
                src="/src/assets/images/avatar_demo_user_1793369608950.jpg"
                alt="Profile Avatar"
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"
              />
              <span className="hidden md:inline text-xs font-medium max-w-[120px] truncate">
                {user?.name || 'Maya Lin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 text-xs">
                <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {user?.name || 'Maya Lin'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 truncate">{user?.email || 'manager@freshbitecafe.com'}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-indigo-600 dark:text-[#818CF8]">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="font-medium truncate">{business?.name || 'FreshBite Café'}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onViewLanding();
                  }}
                  className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <span>Public Landing Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onReplaySplash();
                  }}
                  className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Replay Intro Screen
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3.5 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
