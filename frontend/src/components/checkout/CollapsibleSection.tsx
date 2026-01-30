interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const CollapsibleSection = ({ title, isOpen, onToggle, children }: CollapsibleSectionProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-200">
          <div className="pt-6">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
