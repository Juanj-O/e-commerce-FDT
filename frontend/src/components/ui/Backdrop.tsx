import { useEffect, useRef } from 'react';

interface BackdropProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  frontContent?: React.ReactNode;
}

/**
 * Backdrop component following Material Design guidelines
 * @see https://m2.material.io/components/backdrop
 */
export const Backdrop = ({
  isOpen,
  onClose,
  title,
  children,
  frontContent,
}: BackdropProps) => {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-gray-900">
      {/* Back layer - always visible */}
      <div
        ref={backdropRef}
        className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
          isOpen ? 'h-16' : 'h-full'
        }`}
      >
        {title && (
          <div className="flex items-center justify-between px-4 h-16">
            <h1 className="text-white text-lg font-medium">{title}</h1>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        {!isOpen && frontContent}
      </div>

      {/* Front layer - slides up when open */}
      <div
        className={`flex-1 bg-white rounded-t-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3" />
        <div className="p-4 h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/**
 * Simple backdrop overlay for summary/confirmation screens
 */
export const BackdropOverlay = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white rounded-t-3xl animate-slideUp max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-8">{children}</div>
      </div>
    </div>
  );
};
