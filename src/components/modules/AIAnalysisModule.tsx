import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Smile,
  Meh,
  Frown,
  ArrowRight,
  RefreshCw,
  Sliders,
  Layers,
} from 'lucide-react';
import { AspectSentiment, SentimentType } from '../../types/index.ts';

interface AIAnalysisModuleProps {
  onRefreshAll: () => void;
}

export const AIAnalysisModule: React.FC<AIAnalysisModuleProps> = ({ onRefreshAll }) => {
  // Interactive aspect sandbox
  const [sandboxText, setSandboxText] = useState(
    'The product quality is excellent, but delivery was very slow and the package arrived crushed.'
  );
  const [sandboxRating, setSandboxRating] = useState(3);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    overallSentiment: SentimentType;
    sentimentScore: number;
    primaryAspect: string;
    aspects: AspectSentiment[];
    customerLikes: string[];
    customerDislikes: string[];
    customerExpectations: string[];
    suggestions: string[];
    complaints: string[];
    rootCauses: string[];
  } | null>({
    overallSentiment: 'neutral',
    sentimentScore: 54,
    primaryAspect: 'Product Quality & Delivery',
    aspects: [
      {
        aspect: 'Product Quality',
        sentiment: 'positive',
        score: 95,
        explanation: 'Customer highlighted that the product quality is excellent.',
      },
      {
        aspect: 'Delivery Speed',
        sentiment: 'negative',
        score: 20,
        explanation: 'Customer reported very slow delivery dispatch.',
      },
      {
        aspect: 'Packaging Condition',
        sentiment: 'negative',
        score: 15,
        explanation: 'Parcel arrived crushed during transit.',
      },
    ],
    customerLikes: ['Excellent product quality'],
    customerDislikes: ['Very slow delivery', 'Crushed box'],
    customerExpectations: ['Timely delivery with protective box cushioning'],
    suggestions: ['Upgrade to corrugated shipping cartons with reinforced corners'],
    complaints: ['Slow delivery turnaround', 'Damaged shipping parcel'],
    rootCauses: ['Carrier mishandling combined with inadequate box ply rating'],
  });

  // Batch synthesis state
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);

  const handleRunAspectAnalysis = async () => {
    if (!sandboxText.trim()) return;
    setAnalyzing(true);

    try {
      const res = await fetch('/api/ai/analyze-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewContent: sandboxText,
          rating: sandboxRating,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAnalysisResult(data);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSynthesizeAllReviews = async () => {
    setBatchLoading(true);
    setBatchMessage(null);
    try {
      const res = await fetch('/api/ai/analyze-all', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setBatchMessage(
          `Success: Gemini synthesized ${data.insightsCount} insights, ${data.recommendationsCount} recommendations, and ${data.ideasCount} business ideas.`
        );
        onRefreshAll();
      } else {
        setBatchMessage(data.error || 'Failed to synthesize.');
      }
    } catch (err: any) {
      setBatchMessage('Error running AI synthesis: ' + err.message);
    } finally {
      setBatchLoading(false);
    }
  };

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
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-[#818CF8]" />
            <span>Google Gemini Aspect Intelligence</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
            AI Aspect Sentiment Analysis
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deconstruct complex customer sentences into distinct aspect scores, expectations, and root causes.
          </p>
        </div>

        {/* Batch Re-Synthesis Trigger */}
        <div>
          <button
            onClick={handleSynthesizeAllReviews}
            disabled={batchLoading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${batchLoading ? 'animate-spin' : ''}`} />
            <span>{batchLoading ? 'Synthesizing All Reviews...' : 'Synthesize Stored Reviews'}</span>
          </button>
        </div>
      </div>

      {batchMessage && (
        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{batchMessage}</span>
        </div>
      )}

      {/* Interactive Sandbox Card */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-[#818CF8]" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
              Live Aspect Inspector Sandbox
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Test any mixed-opinion customer review text
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <textarea
              rows={3}
              value={sandboxText}
              onChange={e => setSandboxText(e.target.value)}
              placeholder="Paste customer review here..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col justify-between gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Customer Rating
              </label>
              <select
                value={sandboxRating}
                onChange={e => setSandboxRating(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value={5}>5 Stars (Positive)</option>
                <option value={4}>4 Stars (Mostly Positive)</option>
                <option value={3}>3 Stars (Mixed / Neutral)</option>
                <option value={2}>2 Stars (Mostly Negative)</option>
                <option value={1}>1 Star (Severe Complaint)</option>
              </select>
            </div>

            <button
              onClick={handleRunAspectAnalysis}
              disabled={analyzing}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deconstructing with Gemini...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Deconstruct Aspects
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick sample prompt buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <span>Preset tests:</span>
          <button
            onClick={() => {
              setSandboxText('The food quality was exquisite and the chef was friendly, but the acoustics made conversation impossible and prices are steep.');
              setSandboxRating(3);
            }}
            className="hover:text-indigo-600 dark:hover:text-[#818CF8] underline"
          >
            Restaurant (Food vs Noise)
          </button>
          <span>·</span>
          <button
            onClick={() => {
              setSandboxText('SaaS software has powerful automation features, yet customer onboarding documentation is confusing and support ticket took 3 days.');
              setSandboxRating(3);
            }}
            className="hover:text-indigo-600 dark:hover:text-[#818CF8] underline"
          >
            Technology (Features vs Docs)
          </button>
          <span>·</span>
          <button
            onClick={() => {
              setSandboxText('The clinic was sparkling clean and the physician was knowledgeable, but the front desk reception was cold and billing was overcharged.');
              setSandboxRating(2);
            }}
            className="hover:text-indigo-600 dark:hover:text-[#818CF8] underline"
          >
            Healthcare (Doctor vs Billing)
          </button>
        </div>
      </div>

      {/* Analysis Output Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Overview Banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                Primary Classified Aspect
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                {analysisResult.primaryAspect}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  Overall Sentiment
                </span>
                <div className="mt-0.5">{getSentimentBadge(analysisResult.overallSentiment)}</div>
              </div>

              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  Sentiment Score
                </span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {analysisResult.sentimentScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* Aspect Breakdown Grid */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
                Isolated Aspect Evaluations
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysisResult.aspects.map((asp, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border shadow-xs transition-colors ${
                    asp.sentiment === 'positive'
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80'
                      : asp.sentiment === 'negative'
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/80'
                      : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {asp.aspect}
                    </span>
                    <span className="font-mono text-xs font-semibold tabular-nums">
                      {asp.score}/100
                    </span>
                  </div>
                  <div className="mb-2">{getSentimentBadge(asp.sentiment)}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {asp.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Deep Qualitative Extractions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Likes vs Dislikes */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                  Customer Likes
                </h4>
                {analysisResult.customerLikes?.length ? (
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {analysisResult.customerLikes.map((l, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">None detected</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-2">
                  Customer Dislikes & Complaints
                </h4>
                {analysisResult.customerDislikes?.length || analysisResult.complaints?.length ? (
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {[...(analysisResult.customerDislikes || []), ...(analysisResult.complaints || [])].map(
                      (d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                          <span>{d}</span>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">None detected</p>
                )}
              </div>
            </div>

            {/* Expectations & Root Causes */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2">
                  Customer Expectations
                </h4>
                {analysisResult.customerExpectations?.length ? (
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {analysisResult.customerExpectations.map((exp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                        <span>{exp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">No explicit expectations recorded.</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
                  Inferred Root Causes
                </h4>
                {analysisResult.rootCauses?.length ? (
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {analysisResult.rootCauses.map((rc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{rc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">No operational root causes identified.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
