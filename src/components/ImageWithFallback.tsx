import { useState, useEffect } from 'react';

type ImageWithFallbackProps = {
  model: string;
  promptNumber: number;
  displayPos: number;
  className?: string;
};

export default function ImageWithFallback({
  model,
  promptNumber,
  displayPos,
  className = '',
}: ImageWithFallbackProps) {
  const formats = ['png', 'jpg', 'jpeg'];
  const [formatIndex, setFormatIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const currentSrc = `/images/${model}/p${promptNumber}.${formats[formatIndex]}`;

  useEffect(() => {
    // Reset state when prompt or model changes
    setFormatIndex(0);
    setLoading(true);
    setError(false);
  }, [model, promptNumber]);

  const handleError = () => {
    if (formatIndex < formats.length - 1) {
      setFormatIndex((prev) => prev + 1);
    } else {
      setLoading(false);
      setError(true);
    }
  };

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      {/* Skeleton loader */}
      {loading && (
        <div className="absolute inset-0 bg-slate-50 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }} />
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
          <svg
            className="w-8 h-8 text-[#9CA3AF] mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs font-medium text-[#6B7280]">Image not available</span>
          <span className="text-[10px] text-[#9CA3AF] mt-0.5">Poster {displayPos}</span>
        </div>
      ) : (
        <>
          <img
            src={currentSrc}
            alt={`Poster ${displayPos} evaluation`}
            onLoad={handleLoad}
            onError={handleError}
            className={`relative z-10 w-full h-full object-contain transition-opacity duration-300 ${
              loading ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </>
      )}
    </div>
  );
}
