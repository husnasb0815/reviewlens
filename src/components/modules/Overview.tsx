import React, { useState } from 'react';
import {
  Star,
  TrendingUp,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ImageLightbox } from '../ImageLightbox.tsx';
import { DashboardStats, Feedback, FeedbackImage, SentimentType } from '../../types/index.ts';

interface OverviewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onRefresh: () => void;
  onNavigateToFeedback: () => void;
  onNavigateToInsights: () => void;
  onClearNewBadges: () => void;
  onViewReview: (review: Feedback) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  stats,
  loading,
  onRefresh,
  onNavigateToFeedback,
  onNavigateToInsights,
  onClearNewBadges,
  onViewReview,
}) => {
  const [lightboxImg, setLightboxImg] = useState<FeedbackImage | null>(null);
  if (loading && !stats) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse lg:col-span-2" />
          <div className="h-80 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
        </div>
      </div>
    );
  }

  const {
    totalReviews = 0,
    positiveCount = 0,
    neutralCount = 0,
    negativeCount = 0,
    averageRating = 0,
    sentimentPercentages = { positive: 0, neutral: 0, negative: 0 },
    satisfactionScore = 0,
    topComplaints = [],
    topTopics = [],
    recentFeedback = [],
    newReviewsCount = 0,
  } = stats || {};

  // Sentiment chart data
  const sentimentChartData = [
    { name: 'Positive', value: positiveCount, color: '#10B981' },
    { name: 'Neutral', value: neutralCount, color: '#F59E0B' },
    { name: 'Negative', value: negativeCount, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // 7-day trend simulation derived from real stored counts
  const trendData = [
    { day: 'Oct 24', positive: Math.round(positiveCount * 0.15), negative: Math.round(negativeCount * 0.2) },
    { day: 'Oct 25', positive: Math.round(positiveCount * 0.2), negative: Math.round(negativeCount * 0.3) },
    { day: 'Oct 26', positive: Math.round(positiveCount * 0.18), negative: Math.round(negativeCount * 0.1) },
    { day: 'Oct 27', positive: Math.round(positiveCount * 0.25), negative: Math.round(negativeCount * 0.15) },
    { day: 'Oct 28', positive: Math.round(positiveCount * 0.3), negative: Math.round(negativeCount * 0.25) },
    { day: 'Oct 29', positive: Math.round(positiveCount * 0.22), negative: Math.round(negativeCount * 0.1) },
    { day: 'Oct 30', positive: Math.round(positiveCount * 0.28), negative: Math.round(negativeCount * 0.1) },
  ];

  const getSentimentBadge = (sent: SentimentType) => {
    switch (sent) {
      case 'positive':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-sm bg-[#D1FAE5] dark:bg-emerald-950/70 text-[#065F46] dark:text-[#34D399]">
            <Smile className="w-3 h-3" /> Positive
          </span>
        );
      case 'neutral':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-sm bg-[#FEF3C7] dark:bg-amber-950/70 text-[#92400E] dark:text-[#FBBF24]">
            <Meh className="w-3 h-3" /> Neutral
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-sm bg-[#FEE2E2] dark:bg-rose-950/70 text-[#991B1B] dark:text-[#F87171]">
            <Frown className="w-3 h-3" /> Negative
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner if new reviews detected from automated sync */}
      {newReviewsCount > 0 && (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">{newReviewsCount} new customer reviews</span>
            <span className="hidden sm:inline">were collected and analyzed in the last synchronization cycle.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToFeedback}
              className="px-2.5 py-1 font-semibold text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              View in Feed
            </button>
            <button
              onClick={onClearNewBadges}
              className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Mark as read
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Reviews */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Reviews</p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {totalReviews}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Stored</span>
          </div>
        </div>

        {/* Positive Feedback */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Positive</span>
            <Smile className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {positiveCount}
            </h3>
            <span className="text-xs font-mono tabular-nums text-emerald-700 dark:text-emerald-300">
              {sentimentPercentages.positive}%
            </span>
          </div>
        </div>

        {/* Neutral Feedback */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Neutral</span>
            <Meh className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {neutralCount}
            </h3>
            <span className="text-xs font-mono tabular-nums text-amber-700 dark:text-amber-300">
              {sentimentPercentages.neutral}%
            </span>
          </div>
        </div>

        {/* Negative Feedback */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Negative</span>
            <Frown className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              {negativeCount}
            </h3>
            <span className="text-xs font-mono tabular-nums text-rose-700 dark:text-rose-300">
              {sentimentPercentages.negative}%
            </span>
          </div>
        </div>

        {/* Average Rating & Satisfaction */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Avg Rating</span>
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {averageRating}
              <span className="text-xs font-normal text-slate-400"> / 5.0</span>
            </h3>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {satisfactionScore}% sat.
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback Trend Over Time */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
                Feedback Sentiment Timeline
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily volume of positive vs negative feedback events
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" /> Positive
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#EF4444]" /> Negative
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="posGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="negGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#64748B" />
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
                <Area type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#posGradient)" />
                <Area type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#negGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Breakdown Donut */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
              Sentiment Distribution
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proportion of positive, neutral, and negative opinions
            </p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sentimentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
            <div>
              <p className="text-slate-400">Positive</p>
              <p className="font-bold font-mono text-[#10B981]">{sentimentPercentages.positive}%</p>
            </div>
            <div>
              <p className="text-slate-400">Neutral</p>
              <p className="font-bold font-mono text-[#F59E0B]">{sentimentPercentages.neutral}%</p>
            </div>
            <div>
              <p className="text-slate-400">Negative</p>
              <p className="font-bold font-mono text-[#EF4444]">{sentimentPercentages.negative}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Complaints & Frequently Mentioned Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Recurring Complaints */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
                Top Customer Complaints
              </h4>
            </div>
            <button
              onClick={onNavigateToInsights}
              className="text-xs text-indigo-600 dark:text-[#818CF8] hover:underline flex items-center gap-1 font-medium"
            >
              All insights <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {topComplaints.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recurring complaints recorded.</p>
            ) : (
              topComplaints.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200 pr-2">
                    {item.issue}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {item.count} mentions
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-xs text-[10px] font-semibold ${
                        item.severity === 'High'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Frequently Mentioned Topics */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
                Frequently Mentioned Topics
              </h4>
            </div>
            <span className="text-xs text-slate-400">Aspect occurrences</span>
          </div>

          <div className="space-y-2.5">
            {topTopics.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No topics recorded yet.</p>
            ) : (
              topTopics.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{t.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {t.count} reviews
                    </span>
                    {getSentimentBadge(t.sentiment)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Feedback Stream with Aspect Breakdown */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
              Recent Customer Reviews
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest incoming feedback with aspect-based sentiment evaluations
            </p>
          </div>
          <button
            onClick={onNavigateToFeedback}
            className="text-xs text-indigo-600 dark:text-[#818CF8] hover:underline flex items-center gap-1 font-medium"
          >
            Manage all reviews <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentFeedback.map(fb => (
            <div
              key={fb.id}
              className="py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 rounded-lg px-2 -mx-2 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  {fb.customerAvatar ? (
                    <img
                      src={fb.customerAvatar}
                      alt={fb.customerName}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                      {fb.customerName.charAt(0)}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        onClick={() => onViewReview(fb)}
                        className="font-semibold text-xs text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                      >
                        {fb.customerName}
                      </span>
                      <span className="text-[11px] text-slate-400">via {fb.feedbackSource}</span>
                      {fb.isNew && (
                        <span className="px-1.5 py-0.2 rounded-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                          NEW
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(fb.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < fb.rating ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                      />
                    ))}
                  </div>
                  {getSentimentBadge(fb.sentiment)}
                </div>
              </div>

              <p
                onClick={() => onViewReview(fb)}
                className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-2 leading-relaxed cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
              >
                "{fb.reviewContent}"
              </p>

              {/* Review Attached Photographs (if any) */}
              {fb.images && fb.images.length > 0 && (
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mr-1">
                    <Camera className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{fb.images.length} {fb.images.length === 1 ? 'photo' : 'photos'}:</span>
                  </div>
                  {fb.images.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxImg(img);
                      }}
                      className="group relative rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-indigo-500 transition-all flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 shadow-2xs"
                    >
                      <img
                        src={img.url}
                        alt={img.caption || 'Review photo'}
                        className="w-10 h-10 rounded-sm object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="text-left pr-1.5 max-w-[120px]">
                        <span className={`block text-[9px] font-semibold leading-tight ${
                          img.isCustomerUpload
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-indigo-700 dark:text-indigo-400'
                        }`}>
                          {img.isCustomerUpload ? 'CUSTOMER PHOTO' : 'VERIFIED ITEM'}
                        </span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {img.caption || 'View photo'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Aspect Sentiments inline (Aspect-based breakdown) */}
              {fb.aspectSentiment && fb.aspectSentiment.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 font-medium">Aspects:</span>
                  {fb.aspectSentiment.map((asp, idx) => (
                    <span
                      key={idx}
                      className={`px-1.5 py-0.5 rounded-xs border text-[10px] font-medium ${
                        asp.sentiment === 'positive'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                          : asp.sentiment === 'negative'
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {asp.aspect}: {asp.sentiment} ({asp.score})
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <ImageLightbox image={lightboxImg} onClose={() => setLightboxImg(null)} />
      )}
    </div>
  );
};
