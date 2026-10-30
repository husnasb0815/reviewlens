import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Building2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  Clock,
  Shield,
  Save,
  LogOut,
  Globe,
  Share2,
  FileSpreadsheet,
} from 'lucide-react';
import { User, BusinessProfile, SyncSource, SyncLog, BusinessCategory } from '../../types/index.ts';

interface SettingsModuleProps {
  user: User | null;
  business: BusinessProfile | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onUpdateBusiness: (updated: BusinessProfile) => void;
  onLogout: () => void;
  onSyncNow: () => Promise<void>;
  isSyncing: boolean;
}

const CATEGORIES: BusinessCategory[] = [
  'Retail',
  'Food and Beverage',
  'Hospitality',
  'Fashion',
  'Healthcare',
  'E-commerce',
  'Education',
  'Technology',
  'Other',
];

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  user,
  business,
  isDark,
  onToggleTheme,
  onUpdateBusiness,
  onLogout,
  onSyncNow,
  isSyncing,
}) => {
  const [activeTab, setActiveTab] = useState<'business' | 'sources' | 'profile' | 'security'>('sources');

  // Business profile form with FreshBite Café defaults
  const [bizName, setBizName] = useState(business?.name || 'FreshBite Café');
  const [bizCategory, setBizCategory] = useState<BusinessCategory>(business?.category || 'Food and Beverage');
  const [bizDescription, setBizDescription] = useState(
    business?.description ||
      'A contemporary café serving coffee, beverages, sandwiches, desserts and freshly prepared food.'
  );
  const [bizLocation, setBizLocation] = useState(business?.location || '452 University Avenue, Palo Alto, CA');
  const [bizEmail, setBizEmail] = useState(business?.contactEmail || 'contact@freshbitecafe.com');
  const [bizPhone, setBizPhone] = useState(business?.contactPhone || '+1 (650) 321-4455');
  const [bizWebsite, setBizWebsite] = useState(business?.websiteUrl || 'https://freshbitecafe.com');
  const [savingBiz, setSavingBiz] = useState(false);
  const [bizMessage, setBizMessage] = useState<string | null>(null);

  useEffect(() => {
    if (business) {
      setBizName(business.name || 'FreshBite Café');
      setBizCategory(business.category || 'Food and Beverage');
      setBizDescription(business.description || '');
      setBizLocation(business.location || '');
      setBizEmail(business.contactEmail || '');
      setBizPhone(business.contactPhone || '');
      setBizWebsite(business.websiteUrl || '');
    }
  }, [business]);

  // Sync sources & history
  const [sources, setSources] = useState<SyncSource[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);

  const fetchSyncData = async () => {
    try {
      const [srcRes, logRes] = await Promise.all([
        fetch('/api/sync/sources'),
        fetch('/api/sync/logs'),
      ]);
      const srcData = await srcRes.json();
      const logData = await logRes.json();
      setSources(srcData || []);
      setSyncLogs(logData || []);
    } catch (err) {
      console.error('Failed to load sync data:', err);
    } finally {
      setLoadingSources(false);
    }
  };

  useEffect(() => {
    fetchSyncData();
  }, []);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBiz(true);
    setBizMessage(null);

    try {
      const res = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bizName,
          category: bizCategory,
          description: bizDescription,
          location: bizLocation,
          contactEmail: bizEmail,
          contactPhone: bizPhone,
          websiteUrl: bizWebsite,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onUpdateBusiness(data);
        setBizMessage('Business profile updated successfully.');
      }
    } catch (err: any) {
      setBizMessage('Failed to save: ' + err.message);
    } finally {
      setSavingBiz(false);
    }
  };

  const handleToggleAutoSync = async (src: SyncSource) => {
    try {
      const res = await fetch(`/api/sync/sources/${src.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoSync: !src.autoSync }),
      });
      if (res.ok) {
        setSources(prev =>
          prev.map(s => (s.id === src.id ? { ...s, autoSync: !s.autoSync } : s))
        );
      }
    } catch (err) {
      console.error('Failed to update sync frequency:', err);
    }
  };

  const handleChangeFrequency = async (srcId: string, minutes: number) => {
    try {
      const res = await fetch(`/api/sync/sources/${srcId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequencyMinutes: minutes }),
      });
      if (res.ok) {
        setSources(prev =>
          prev.map(s => (s.id === srcId ? { ...s, frequencyMinutes: minutes } : s))
        );
      }
    } catch (err) {
      console.error('Failed to update frequency:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
          Platform Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage business profile, feedback integrations, automated synchronization intervals, and appearance
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs max-w-xl">
        <button
          onClick={() => setActiveTab('sources')}
          className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
            activeTab === 'sources'
              ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Sources & Synchronization
        </button>
        <button
          onClick={() => setActiveTab('business')}
          className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
            activeTab === 'business'
              ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Business Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
            activeTab === 'security'
              ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Preferences & Security
        </button>
      </div>

      {/* ========================================================= */}
      {/* SOURCES & AUTOMATIC SYNCHRONIZATION TAB (SEC 15 & 22) */}
      {/* ========================================================= */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          {/* Synchronization Control Header */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
                Automated Feedback Synchronization
              </h3>
              <p className="text-xs text-slate-500">
                Scheduled background sync runs every 15 minutes for connected sources with verified API credentials.
              </p>
            </div>

            <button
              onClick={async () => {
                await onSyncNow();
                fetchSyncData();
              }}
              disabled={isSyncing}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing Channels...' : 'Refresh Now'}</span>
            </button>
          </div>

          {/* Feedback Sources List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map(src => (
              <div
                key={src.id}
                className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {src.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-bold ${
                        src.connected
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {src.connected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                  </div>

                  {src.connected ? (
                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-4">
                      {src.authIdentifier && (
                        <p className="font-mono text-[11px] truncate text-slate-500">
                          {src.authIdentifier}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Last Sync:</span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {src.lastSyncTime ? new Date(src.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Next Scheduled:</span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {src.nextSyncTime ? new Date(src.nextSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Manual Only'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Reviews Ingested:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {src.reviewsCollected}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 space-y-2">
                      <p className="text-rose-600 dark:text-rose-400 text-[11px]">
                        {src.errorMessage}
                      </p>
                      <p className="text-[11px]">
                        ReviewLens strictly enforces authentic OAuth & platform API verification. Disconnected channels will not pull fake reviews.
                      </p>
                    </div>
                  )}
                </div>

                {/* Configuration Controls */}
                {src.connected && src.frequencyMinutes > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Interval:</span>
                    <select
                      value={src.frequencyMinutes}
                      onChange={e => handleChangeFrequency(src.id, Number(e.target.value))}
                      className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-mono"
                    >
                      <option value={15}>Every 15 min</option>
                      <option value={30}>Every 30 min</option>
                      <option value={60}>Every 1 hour</option>
                      <option value={360}>Every 6 hours</option>
                      <option value={1440}>Every 24 hours</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Synchronization History Log Table */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display mb-1">
              Synchronization Audit History
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time audit log of automated and manual polling operations
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="py-2 font-medium">Timestamp</th>
                    <th className="py-2 font-medium">Source Platform</th>
                    <th className="py-2 font-medium">Collected</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {syncLogs.slice(0, 8).map(log => (
                    <tr key={log.id}>
                      <td className="py-2.5 font-mono tabular-nums text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 font-medium">{log.platform}</td>
                      <td className="py-2.5 font-mono tabular-nums font-semibold">
                        +{log.reviewsCollected}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                            log.status === 'success'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500 text-[11px] max-w-xs truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* BUSINESS PROFILE TAB */}
      {/* ========================================================= */}
      {activeTab === 'business' && (
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display mb-1">
            Business Details
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Configure your enterprise name, category, and operating parameters
          </p>

          {bizMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
              {bizMessage}
            </div>
          )}

          <form onSubmit={handleSaveBusiness} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={bizName}
                  onChange={e => setBizName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Business Category *
                </label>
                <select
                  value={bizCategory}
                  onChange={e => setBizCategory(e.target.value as BusinessCategory)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description & Brand Focus
              </label>
              <textarea
                rows={3}
                value={bizDescription}
                onChange={e => setBizDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Location / Address
                </label>
                <input
                  type="text"
                  value={bizLocation}
                  onChange={e => setBizLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={bizWebsite}
                  onChange={e => setBizWebsite(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={bizEmail}
                  onChange={e => setBizEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={bizPhone}
                  onChange={e => setBizPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingBiz}
                className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingBiz ? 'Saving...' : 'Save Business Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* PREFERENCES & SECURITY TAB */}
      {/* ========================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-2xl">
          {/* Theme Preferences */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display mb-1">
              Visual Theme Preferences
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Switch seamlessly between light and dark modes across all charts and dashboards
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (isDark) onToggleTheme();
                }}
                className={`flex-1 p-3 rounded-lg border text-left transition-colors flex items-center justify-between ${
                  !isDark
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-xs">Light Mode (#F8FAFC)</span>
                </div>
                {!isDark && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
              </button>

              <button
                onClick={() => {
                  if (!isDark) onToggleTheme();
                }}
                className={`flex-1 p-3 rounded-lg border text-left transition-colors flex items-center justify-between ${
                  isDark
                    ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs">Dark Mode (#0B1220)</span>
                </div>
                {isDark && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </button>
            </div>
          </div>

          {/* User Account Details */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display mb-1">
              User Profile & Role
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Authenticated credentials for this organization
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Account Owner</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'Elena Rostova'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Work Email</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Access Level</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Workspace Administrator</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-semibold hover:bg-rose-100 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out from Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
