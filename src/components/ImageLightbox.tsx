import React, { useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, Camera, CheckCircle2 } from 'lucide-react';
import { FeedbackImage } from '../types/index.ts';

interface ImageLightboxProps {
  image: FeedbackImage | null;
  onClose: () => void;
  customerName?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  image,
  onClose,
  customerName,
}) => {
  const [scale, setScale] = React.useState(1);

  useEffect(() => {
    setScale(1);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image, onClose]);

  if (!image) return null;

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 2.5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.75));

  return (
    <div
      role="dialog"
      aria-label="Enlarged photo viewer"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[92vh] w-full flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Controls Bar */}
        <div className="w-full flex items-center justify-between text-white text-xs px-2 py-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-sm">
              {customerName ? `${customerName}'s Review Photo` : 'Review Photograph'}
            </span>
            <span className="text-slate-400">·</span>
            <span
              className={`px-2 py-0.5 rounded-xs text-[10px] font-bold ${
                image.isCustomerUpload
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
              }`}
            >
              {image.isCustomerUpload ? 'CUSTOMER ATTACHED PHOTO' : 'VERIFIED ITEM PHOTO'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-slate-400 tabular-nums">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 ml-2 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center max-h-[75vh] w-auto">
          <img
            src={image.url}
            alt={image.caption || 'Customer review photo'}
            referrerPolicy="no-referrer"
            style={{ transform: `scale(${scale})`, transition: 'transform 0.15s ease-out' }}
            className="max-h-[75vh] max-w-full object-contain cursor-grab"
          />
        </div>

        {/* Caption Bar */}
        {image.caption && (
          <div className="mt-3 text-center max-w-xl text-xs text-slate-300 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800">
            {image.caption}
          </div>
        )}
      </div>
    </div>
  );
};
