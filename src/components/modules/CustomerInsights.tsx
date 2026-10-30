import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  Heart,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  Filter,
  Quote,
  MessageSquare,
} from 'lucide-react';
import { CustomerInsight, SentimentType } from '../../types/index.ts';

export const CustomerInsights: React.FC = () => {
  const [insights, setInsights] = useState<CustomerInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetch('/api/ai/insights')
      .then(res => res.json())
      .then(data => {
        setInsights(data || []);
      })
      .catch(err => console.error('Failed to load insights:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = insights.filter(ins => {
    if (activeCategory === 'all') return true;
    return ins.category === activeCategory;
  });

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

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'strength':
        return 'border-l-indigo-500';
      case 'complaint':
        return 'border-l-rose-500';
      case 'weakness':
        return 'border-l-amber-500';
      case 'expectation':
        return 'border-l-sky-500';
      case 'preference':
        return 'border-l-emerald-500';
      default:
        return 'border-l-slate-400';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
            Customer Insights
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Synthesized customer patterns, repeated friction points, and proven operational strengths
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          {[
            { id: 'all', label: 'All Insights' },
            { id: 'strength', label: 'Strengths' },
            { id: 'complaint', label: 'Complaints' },
            { id: 'weakness', label: 'Weaknesses' },
            { id: 'expectation', label: 'Expectations' },
            { id: 'preference', label: 'Preferences' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeCategory === tab.id
                  ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Insight Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800">
          <Lightbulb className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No insights in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(ins => (
            <div
              key={ins.id}
              className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {ins.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-xs text-slate-500">
                      {ins.frequency} reviews
                    </span>
                    {getSentimentBadge(ins.sentiment)}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display mb-2">
                  {ins.topic}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {ins.description}
                </p>
              </div>

              {/* Representative Quotes */}
              {ins.representativeQuotes && ins.representativeQuotes.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Quote className="w-3 h-3" /> Representative Customer Quotes
                  </span>
                  {ins.representativeQuotes.map((q, idx) => (
                    <blockquote
                      key={idx}
                      className="text-xs text-slate-600 dark:text-slate-300 italic pl-3 border-l-2 border-indigo-400 dark:border-indigo-500/60"
                    >
                      "{q}"
                    </blockquote>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
