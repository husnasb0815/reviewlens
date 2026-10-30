import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Plus,
  Upload,
  Star,
  Trash2,
  Edit,
  Eye,
  Smile,
  Meh,
  Frown,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  ZoomIn,
} from 'lucide-react';
import { Feedback, FeedbackImage, SentimentType } from '../../types/index.ts';
import { ImageLightbox } from '../ImageLightbox.tsx';

interface FeedbackManagementProps {
  onRefreshStats: () => void;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Artisanal Latte Art',
    url: '/src/assets/images/freshbite_latte_art_1793370751254.jpg',
    caption: 'Flat white with rosette latte art',
  },
  {
    name: 'Grilled Sourdough Panini',
    url: '/src/assets/images/freshbite_sandwich_1793370750499.jpg',
    caption: 'Crisp sourdough prosciutto and gruyere panini',
  },
  {
    name: 'Almond Croissant & Tart',
    url: '/src/assets/images/freshbite_pastry_1793370751050.jpg',
    caption: 'Flaky almond croissant and berry tart dessert',
  },
  {
    name: 'Compostable Packaging',
    url: '/src/assets/images/freshbite_packaging_1793370751609.jpg',
    caption: 'Eco-friendly kraft coffee cups and compostable boxes',
  },
  {
    name: 'Avocado Brunch Bowl',
    url: '/src/assets/images/freshbite_brunch_bowl_1793370751795.jpg',
    caption: 'Fresh roasted vegetable and quinoa bowl',
  },
];

export const FeedbackManagement: React.FC<FeedbackManagementProps> = ({ onRefreshStats }) => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals & Lightbox
  const [selectedReview, setSelectedReview] = useState<Feedback | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editReview, setEditReview] = useState<Feedback | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ image: FeedbackImage; customerName: string } | null>(null);

  // Add Review Form state
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newSource, setNewSource] = useState<'Google Reviews' | 'Website' | 'Instagram' | 'Facebook' | 'Manual Entry'>('Manual Entry');
  const [newImages, setNewImages] = useState<FeedbackImage[]>([]);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // CSV paste state
  const [csvRawText, setCsvRawText] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        source: sourceFilter,
        rating: ratingFilter,
        sentiment: sentimentFilter,
        sort: sortOrder,
        page: page.toString(),
        limit: '8',
      });
      const res = await fetch(`/api/feedback?${params.toString()}`);
      const data = await res.json();
      setFeedbackList(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [search, sourceFilter, ratingFilter, sentimentFilter, sortOrder, page]);

  // Handle local image upload in Add modal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
        const result = event.target?.result as string;
        if (result) {
          setNewImages(prev => [
            ...prev,
            {
              id: `upl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              url: result,
              caption: file.name.replace(/\.[^/.]+$/, ''),
              isCustomerUpload: true,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Submit New Review
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newContent) return;

    setSubmittingAdd(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newCustomerName,
          customerAvatar: newAvatar || undefined,
          reviewContent: newContent,
          rating: newRating,
          feedbackSource: newSource,
          reviewDate: new Date().toISOString(),
          images: newImages,
        }),
      });

      if (res.ok) {
        setAddModalOpen(false);
        setNewCustomerName('');
        setNewAvatar('');
        setNewContent('');
        setNewRating(5);
        setNewImages([]);
        fetchFeedback();
        onRefreshStats();
      }
    } catch (err) {
      console.error('Failed to create review:', err);
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Submit Edit Review
  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReview) return;

    try {
      const res = await fetch(`/api/feedback/${editReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editReview),
      });

      if (res.ok) {
        setEditReview(null);
        fetchFeedback();
        onRefreshStats();
      }
    } catch (err) {
      console.error('Failed to update review:', err);
    }
  };

  // Delete Review
  const handleDeleteReview = async (id: string) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirmId(null);
        if (selectedReview?.id === id) setSelectedReview(null);
        fetchFeedback();
        onRefreshStats();
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  // Bulk CSV Import
  const handleImportCsv = async () => {
    if (!csvRawText.trim()) return;
    setCsvLoading(true);

    try {
      const lines = csvRawText.trim().split('\n');
      const items: any[] = [];

      lines.forEach((line, index) => {
        if (index === 0 && (line.toLowerCase().includes('customer') || line.toLowerCase().includes('review'))) {
          return;
        }

        const parts = line.split(',');
        if (parts.length >= 2) {
          const cName = parts[0]?.replace(/^"|"$/g, '').trim() || 'Customer';
          const rText = parts[1]?.replace(/^"|"$/g, '').trim() || '';
          const rNum = parseInt(parts[2]?.trim(), 10) || 4;
          if (rText) {
            items.push({
              customerName: cName,
              reviewContent: rText,
              rating: rNum,
            });
          }
        }
      });

      if (items.length > 0) {
        const res = await fetch('/api/feedback/bulk-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });

        if (res.ok) {
          setCsvModalOpen(false);
          setCsvRawText('');
          fetchFeedback();
          onRefreshStats();
        }
      }
    } catch (err) {
      console.error('CSV import failed:', err);
    } finally {
      setCsvLoading(false);
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
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
            Feedback Management & Review Photos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total of <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">{totalItems}</span> reviews with verified customer photo attachments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCsvModalOpen(true)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Review & Photo</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search customer, coffee, food, aspect..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={e => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Sources</option>
              <option value="Google Reviews">Google Reviews</option>
              <option value="Website">Website Feedback</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="Manual Entry">Manual Entry</option>
              <option value="CSV Import">CSV Import</option>
            </select>
          </div>

          {/* Sentiment Filter */}
          <div>
            <select
              value={sentimentFilter}
              onChange={e => {
                setSentimentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <select
              value={ratingFilter}
              onChange={e => {
                setRatingFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Star Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Sorting options */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Sort order:</span>
          <div className="flex items-center gap-2">
            {[
              { id: 'date_desc', label: 'Newest First' },
              { id: 'date_asc', label: 'Oldest' },
              { id: 'rating_desc', label: 'Highest Rating' },
              { id: 'rating_asc', label: 'Lowest Rating' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSortOrder(s.id)}
                className={`px-2 py-1 rounded-md transition-colors ${
                  sortOrder === s.id
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-[#818CF8] font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Review Cards Grid / List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading customer reviews...</div>
        ) : feedbackList.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No customer reviews match your filters.
            </p>
            <p className="text-xs text-slate-400">
              Try adjusting your search criteria or add a new review with customer photos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbackList.map(item => {
              const initials = item.customerName
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div>
                    {/* Header: Avatar, Name, Source, Date & Stars */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.customerAvatar ? (
                          <img
                            src={item.customerAvatar}
                            alt={item.customerName}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                            {initials}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                              {item.customerName}
                            </span>
                            {item.isNew && (
                              <span className="px-1.5 py-0.2 rounded-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <span>via {item.feedbackSource}</span>
                            <span>·</span>
                            <span className="font-mono tabular-nums">
                              {new Date(item.reviewDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < item.rating ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                            />
                          ))}
                        </div>
                        {getSentimentBadge(item.sentiment)}
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                      "{item.reviewContent}"
                    </p>

                    {/* Attached Photographs Strip */}
                    {item.images && item.images.length > 0 && (
                      <div className="mb-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          <Camera className="w-3.5 h-3.5 text-indigo-500" />
                          <span>
                            Attached Photo{item.images.length > 1 ? 's' : ''} ({item.images.length})
                          </span>
                        </div>

                        <div className={`grid gap-2 ${item.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                          {item.images.map(img => (
                            <div
                              key={img.id}
                              onClick={() =>
                                setLightboxImage({ image: img, customerName: item.customerName })
                              }
                              className="group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 cursor-pointer aspect-4/3"
                            >
                              <img
                                src={img.url}
                                alt={img.caption || 'Review photo'}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/70 text-white rounded-md p-1.5 flex items-center gap-1 text-[11px]">
                                  <ZoomIn className="w-3.5 h-3.5" />
                                  <span>View Photo</span>
                                </div>
                              </div>
                              <span
                                className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-xs text-[9px] font-bold tracking-tight uppercase shadow-xs ${
                                  img.isCustomerUpload
                                    ? 'bg-emerald-600/90 text-white'
                                    : 'bg-indigo-600/90 text-white'
                                }`}
                              >
                                {img.isCustomerUpload ? 'Customer Photo' : 'Verified Item'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Aspect Breakdown Tags */}
                    {item.aspectSentiment && item.aspectSentiment.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-3">
                        {item.aspectSentiment.map((asp, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-xs border text-[10px] font-medium ${
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

                  {/* Card Actions Footer */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px] text-slate-400">
                      Score: <strong className="font-mono text-slate-700 dark:text-slate-300">{item.sentimentScore}/100</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReview(item)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-[#818CF8] rounded-md transition-colors"
                        title="View AI details & root causes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditReview(item)}
                        className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors"
                        title="Edit review"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page <span className="font-mono tabular-nums font-semibold">{page}</span> of{' '}
            <span className="font-mono tabular-nums font-semibold">{totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* IMAGE LIGHTBOX / ZOOM MODAL */}
      {/* ========================================================= */}
      {lightboxImage && (
        <ImageLightbox
          image={lightboxImage.image}
          customerName={lightboxImage.customerName}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {/* ========================================================= */}
      {/* REVIEW DETAILS MODAL */}
      {/* ========================================================= */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedReview(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-[#818CF8]" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                Aspect AI Review Breakdown
              </h3>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedReview.customerName}
                </span>
                <span className="text-slate-400">{selectedReview.feedbackSource}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic mb-3">
                "{selectedReview.reviewContent}"
              </p>

              {/* Photos inside details modal */}
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {selectedReview.images.map(img => (
                    <div
                      key={img.id}
                      onClick={() =>
                        setLightboxImage({ image: img, customerName: selectedReview.customerName })
                      }
                      className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video cursor-pointer"
                    >
                      <img
                        src={img.url}
                        alt={img.caption || 'Attached photo'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-slate-900/80 text-white">
                        {img.isCustomerUpload ? 'Customer Photo' : 'Verified Photo'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Aspect breakdown */}
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Evaluated Aspects
                </h4>
                <div className="space-y-2">
                  {selectedReview.aspectSentiment?.map((asp, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {asp.aspect}
                        </span>
                        <span className="font-mono text-slate-500">
                          {asp.sentiment.toUpperCase()} · {asp.score}/100
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                        {asp.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Likes & Dislikes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">
                    Customer Likes
                  </span>
                  {selectedReview.customerLikes?.length ? (
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                      {selectedReview.customerLikes.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-400 italic">None noted</span>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
                  <span className="font-semibold text-rose-800 dark:text-rose-300 block mb-1">
                    Customer Dislikes
                  </span>
                  {selectedReview.customerDislikes?.length ? (
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                      {selectedReview.customerDislikes.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-400 italic">None noted</span>
                  )}
                </div>
              </div>

              {/* Customer Expectations & Root Causes */}
              {selectedReview.customerExpectations?.length > 0 && (
                <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                  <span className="font-semibold text-indigo-900 dark:text-indigo-300 block mb-1">
                    Customer Expectations
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                    {selectedReview.customerExpectations.map((exp, i) => (
                      <li key={i}>{exp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedReview.rootCauses?.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                  <span className="font-semibold text-amber-900 dark:text-amber-300 block mb-1">
                    Inferred Root Causes
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                    {selectedReview.rootCauses.map((rc, i) => (
                      <li key={i}>{rc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD REVIEW MODAL WITH PHOTO ATTACHMENT */}
      {/* ========================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Camera className="w-4 h-4 text-indigo-600 dark:text-[#818CF8]" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                Add Review & Customer Photos
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Attach genuine customer photographs. Gemini aspect AI will evaluate coffee, food, service, and packaging.
            </p>

            <form onSubmit={handleCreateReview} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={e => setNewCustomerName(e.target.value)}
                    placeholder="e.g. Liam Davis"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Avatar URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newAvatar}
                    onChange={e => setNewAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Star Rating *
                  </label>
                  <select
                    value={newRating}
                    onChange={e => setNewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Poor</option>
                    <option value={1}>1 - Terrible</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Feedback Source *
                  </label>
                  <select
                    value={newSource}
                    onChange={e => setNewSource(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="Manual Entry">Manual Entry</option>
                    <option value="Google Reviews">Google Reviews</option>
                    <option value="Website">Website</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Customer Review Content *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="e.g. 'The flat white had wonderful latte art, but the sandwich took 15 minutes...'"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Photo Upload Section */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-indigo-500" />
                    Attach Customer Photographs
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-[#818CF8] hover:bg-indigo-100 font-medium text-[11px]"
                  >
                    + Upload From Device
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>

                {/* Preset quick test images */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Or attach sample café photo:</span>
                  {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewImages(prev => [
                          ...prev,
                          {
                            id: `sample-${Date.now()}-${idx}`,
                            url: preset.url,
                            caption: preset.caption,
                            isCustomerUpload: true,
                          },
                        ]);
                      }}
                      className="px-2 py-0.5 rounded-xs border border-slate-200 dark:border-slate-700 hover:border-indigo-400 bg-white dark:bg-slate-800 text-[10px]"
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>

                {/* Uploaded Thumbnails Preview */}
                {newImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {newImages.map((img, i) => (
                      <div key={img.id} className="relative rounded-md overflow-hidden border border-slate-300 dark:border-slate-700 aspect-video">
                        <img src={img.url} alt="Attached" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingAdd ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deconstructing with AI...
                    </>
                  ) : (
                    'Save Review & Photos'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT MODAL */}
      {/* ========================================================= */}
      {editReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
            <button
              onClick={() => setEditReview(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 font-display">
              Edit Feedback
            </h3>

            <form onSubmit={handleUpdateReview} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={editReview.customerName}
                  onChange={e => setEditReview({ ...editReview, customerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Rating
                </label>
                <select
                  value={editReview.rating}
                  onChange={e => setEditReview({ ...editReview, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Review Text
                </label>
                <textarea
                  rows={4}
                  value={editReview.reviewContent}
                  onChange={e => setEditReview({ ...editReview, reviewContent: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditReview(null)}
                  className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Delete Review?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to permanently delete this customer feedback record and attached photographs?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteReview(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CSV IMPORT MODAL */}
      {/* ========================================================= */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
            <button
              onClick={() => setCsvModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 font-display">
              Bulk CSV Review Import
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Paste lines in CSV format: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded-xs font-mono">Customer Name, Review Content, Star Rating</code>
            </p>

            <textarea
              rows={8}
              value={csvRawText}
              onChange={e => setCsvRawText(e.target.value)}
              placeholder={`Customer Name,Review Content,Rating\nSarah Jenkins,Loved the rapid checkout but wished shipping was faster,4\nTom Bradley,The coffee was cold and staff seemed overwhelmed,2\nChloe Rivera,Exceptional build quality and sustainable packaging,5`}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setCsvRawText(
                    `Customer Name,Review Content,Rating\nLiam Davis,The avocado toast and pour over coffee are top notch,5\nNadia Vance,Waited 18 minutes for a panini during lunch rush,3\nOliver Smith,Staff was extremely friendly and gave great recommendations,5`
                  )
                }
                className="text-xs text-indigo-600 dark:text-[#818CF8] hover:underline"
              >
                Insert Sample Data
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCsvModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportCsv}
                  disabled={csvLoading || !csvRawText.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  {csvLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing & Analyzing...
                    </>
                  ) : (
                    'Import & Run AI Analysis'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
