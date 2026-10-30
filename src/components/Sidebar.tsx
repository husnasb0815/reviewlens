import React from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  Sparkles,
  Lightbulb,
  CheckSquare,
  TrendingUp,
  FileBarChart,
  Settings,
  Building2,
  X,
} from 'lucide-react';
import { ReviewLensLogo } from './ReviewLensLogo.tsx';
import { BusinessProfile } from '../types/index.ts';

export type SidebarTab =
  | 'overview'
  | 'feedback'
  | 'ai-analysis'
  | 'insights'
  | 'recommendations'
  | 'business-ideas'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  business: BusinessProfile | null;
  newReviewsCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onReplaySplash: () => void;
}

const NAV_ITEMS: Array<{ id: SidebarTab; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'feedback', label: 'Feedback Management', icon: MessageSquareText },
  { id: 'ai-analysis', label: 'AI Analysis', icon: Sparkles },
  { id: 'insights', label: 'Customer Insights', icon: Lightbulb },
  { id: 'recommendations', label: 'Recommendations', icon: CheckSquare },
  { id: 'business-ideas', label: 'Business Ideas', icon: TrendingUp },
  { id: 'reports', label: 'Reports & Trends', icon: FileBarChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  business,
  newReviewsCount,
  mobileOpen,
  onCloseMobile,
  onReplaySplash,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <ReviewLensLogo size="md" onClick={onReplaySplash} />
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Business Banner */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {business?.name || 'FreshBite Café'}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{business?.category || 'Food and Beverage'}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Verified Active</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const hasBadge = item.id === 'feedback' && newReviewsCount > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-[#818CF8] font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-[#818CF8]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {hasBadge && (
                    <span className="px-1.5 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold tabular-nums">
                      {newReviewsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / System Status */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-between">
            <span>Engine</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">Gemini 3.8 Aspect AI</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Persistence</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Sync Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
