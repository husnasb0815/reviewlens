import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Quote,
  Filter,
} from 'lucide-react';
import { Recommendation, RecommendationStatus, RecommendationPriority } from '../../types/index.ts';

export const RecommendationsModule: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | RecommendationStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | RecommendationPriority>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRecs = async () => {
    try {
      const res = await fetch('/api/ai/recommendations');
      const data = await res.json();
      setRecommendations(data || []);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handleStatusChange = async (id: string, newStatus: RecommendationStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/ai/recommendations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setRecommendations(prev =>
          prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = recommendations.filter(r => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && r.priority !== priorityFilter) return false;
    return true;
  });

  const getPriorityBadge = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded-xs text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
            HIGH PRIORITY
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded-xs text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
            MEDIUM PRIORITY
          </span>
        );
      case 'Low':
        return (
          <span className="px-2 py-0.5 rounded-xs text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            LOW PRIORITY
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
            Actionable Recommendations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Direct operational improvements derived from customer complaints and aspect scores
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Recommendations Cards */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No recommendations match your selected filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(rec => (
            <div
              key={rec.id}
              className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs"
            >
              {/* Header row: Priority + Status Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  {getPriorityBadge(rec.priority)}
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Expected Benefit: <strong className="text-slate-700 dark:text-slate-200">{rec.expectedBenefit}</strong>
                  </span>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                  {(['Pending', 'In Progress', 'Completed'] as RecommendationStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(rec.id, st)}
                      disabled={updatingId === rec.id}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        rec.status === st
                          ? st === 'Completed'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : st === 'In Progress'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Identified Problem & Suggested Improvement */}
              <div className="space-y-2 mb-3">
                <div>
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block mb-0.5">
                    Identified Operational Problem
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {rec.identifiedProblem}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                  <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 block mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Suggested Improvement & Immediate Action
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mb-1 leading-relaxed">
                    {rec.suggestedImprovement}
                  </p>
                  <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                    Action item: {rec.recommendedAction}
                  </p>
                </div>
              </div>

              {/* Supporting Customer Feedback Quote */}
              {rec.supportingCustomerFeedback && rec.supportingCustomerFeedback.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                    <Quote className="w-3 h-3" /> Supporting Customer Voice
                  </span>
                  {rec.supportingCustomerFeedback.map((quote, qIdx) => (
                    <blockquote
                      key={qIdx}
                      className="text-xs text-slate-600 dark:text-slate-400 italic pl-2.5 border-l-2 border-slate-300 dark:border-slate-700"
                    >
                      {quote}
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
