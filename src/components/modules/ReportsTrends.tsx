import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Calendar,
  TrendingUp,
  FileText,
  Star,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { DashboardStats, Feedback } from '../../types/index.ts';

interface ReportsTrendsProps {
  stats: DashboardStats | null;
}

export const ReportsTrends: React.FC<ReportsTrendsProps> = ({ stats }) => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch('/api/feedback?limit=100')
      .then(res => res.json())
      .then(data => setAllFeedback(data.data || []))
      .catch(err => console.error('Error loading reports feedback:', err));
  }, []);

  const ratingData = stats
    ? [
        { rating: '5 Stars', count: stats.ratingDistribution[5], fill: '#10B981' },
        { rating: '4 Stars', count: stats.ratingDistribution[4], fill: '#34D399' },
        { rating: '3 Stars', count: stats.ratingDistribution[3], fill: '#F59E0B' },
        { rating: '2 Stars', count: stats.ratingDistribution[2], fill: '#FB923C' },
        { rating: '1 Star', count: stats.ratingDistribution[1], fill: '#EF4444' },
      ]
    : [];

  const trendData = [
    { period: 'W1', positiveRate: 82, complaintCount: 4 },
    { period: 'W2', positiveRate: 78, complaintCount: 6 },
    { period: 'W3', positiveRate: 85, complaintCount: 3 },
    { period: 'W4', positiveRate: 89, complaintCount: 2 },
  ];

  // CSV Export
  const handleDownloadCSV = () => {
    setDownloading(true);
    try {
      const headers = ['ID', 'Customer Name', 'Rating', 'Sentiment', 'Source', 'Review Date', 'Content', 'Aspects'];
      const rows = allFeedback.map(f => [
        f.id,
        `"${f.customerName.replace(/"/g, '""')}"`,
        f.rating,
        f.sentiment,
        f.feedbackSource,
        f.reviewDate,
        `"${f.reviewContent.replace(/"/g, '""')}"`,
        `"${(f.aspectSentiment || []).map(a => `${a.aspect}:${a.sentiment}`).join('; ')}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ReviewLens_Report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('CSV download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  // PDF / Printable Report Generation
  const handlePrintPDFReport = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
            Reports & Sentiment Trends
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-period intelligence, rating distributions, and executive exports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date range selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'all', label: 'All Time' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDateRange(tab.id as any)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  dateRange === tab.id
                    ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Download CSV */}
          <button
            onClick={handleDownloadCSV}
            disabled={downloading}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          {/* Download / Print PDF Report */}
          <button
            onClick={handlePrintPDFReport}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Executive PDF</span>
          </button>
        </div>
      </div>

      {/* Rating Distribution & Complaint Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution Bar Chart */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
                Star Rating Breakdown
              </h3>
              <p className="text-xs text-slate-500">Distribution across verified reviews</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{stats?.averageRating || 0} / 5.0 Avg</span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis dataKey="rating" type="category" tick={{ fontSize: 11 }} stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {ratingData.map((entry, index) => (
                    <Bar key={`cell-${index}`} dataKey="count" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaint Trajectory Line Chart */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
                Weekly Quality & Complaint Trajectory
              </h3>
              <p className="text-xs text-slate-500">Positive satisfaction rate vs complaint frequency</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> % Satisfaction
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Complaints
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="positiveRate" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="complaintCount" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Executive Summary Table */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display mb-1">
          Executive Summary Report
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Audit metrics for period <span className="font-semibold">{dateRange.toUpperCase()}</span>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                <th className="py-2.5 font-medium">Metric</th>
                <th className="py-2.5 font-medium">Current Value</th>
                <th className="py-2.5 font-medium">Historical Benchmark</th>
                <th className="py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-2.5 font-medium">Overall Customer Rating</td>
                <td className="py-2.5 font-mono tabular-nums font-bold">{stats?.averageRating} / 5.0</td>
                <td className="py-2.5 font-mono tabular-nums text-slate-400">4.2 Target</td>
                <td className="py-2.5 text-emerald-600 font-semibold">Exceeding Target</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Positive Opinion Share</td>
                <td className="py-2.5 font-mono tabular-nums font-bold text-emerald-600">
                  {stats?.sentimentPercentages.positive}%
                </td>
                <td className="py-2.5 font-mono tabular-nums text-slate-400">75% Benchmark</td>
                <td className="py-2.5 text-emerald-600 font-semibold">Healthy</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Negative Friction Share</td>
                <td className="py-2.5 font-mono tabular-nums font-bold text-rose-600">
                  {stats?.sentimentPercentages.negative}%
                </td>
                <td className="py-2.5 font-mono tabular-nums text-slate-400">&lt; 15% Cap</td>
                <td className="py-2.5 text-amber-600 font-semibold">Monitored</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Top Operational Bottleneck</td>
                <td className="py-2.5 font-medium text-slate-900 dark:text-slate-100">
                  {stats?.topComplaints[0]?.issue || 'None'}
                </td>
                <td className="py-2.5 text-slate-400">SMS Webhooks in Progress</td>
                <td className="py-2.5 text-indigo-600 font-semibold">Recommendation Active</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
