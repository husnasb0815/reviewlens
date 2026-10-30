import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sparkles,
  Target,
  Quote,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { BusinessIdea } from '../../types/index.ts';

export const BusinessIdeasModule: React.FC = () => {
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai/business-ideas')
      .then(res => res.json())
      .then(data => setIdeas(data || []))
      .catch(err => console.error('Failed to load business ideas:', err))
      .finally(() => setLoading(false));
  }, []);

  const getFeasibilityBadge = (feas: string) => {
    switch (feas) {
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            HIGH FEASIBILITY
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            MEDIUM FEASIBILITY
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            LOW FEASIBILITY
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-[#818CF8]" />
          <span>Customer-Backed Growth Pipeline</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
          AI Business Ideas & Opportunities
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          New products, service upgrades, and revenue extensions unlocked directly by customer expectations and unmet demand
        </p>
      </div>

      {/* Ideas Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No business ideas generated yet. Run batch synthesis in AI Analysis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ideas.map(idea => (
            <div
              key={idea.id}
              className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-[#818CF8]">
                    {idea.category}
                  </span>
                  {getFeasibilityBadge(idea.feasibility)}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display mb-2">
                  {idea.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {idea.rationale}
                </p>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Expected Business Impact
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {idea.expectedImpact}
                  </p>
                </div>
              </div>

              {/* Supporting Customer Feedback */}
              {idea.supportingFeedback && idea.supportingFeedback.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                    <Quote className="w-3 h-3" /> Voice of Customer
                  </span>
                  {idea.supportingFeedback.map((fb, idx) => (
                    <blockquote
                      key={idx}
                      className="text-xs text-slate-600 dark:text-slate-400 italic pl-2.5 border-l-2 border-indigo-400"
                    >
                      {fb}
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
