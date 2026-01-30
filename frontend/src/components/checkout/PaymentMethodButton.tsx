interface PaymentMethodButtonProps {
  name: string;
  isSelected?: boolean;
  isDisabled: boolean;
  onClick?: () => void;
}

export const PaymentMethodButton = ({ name, isSelected, isDisabled, onClick }: PaymentMethodButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative p-4 rounded-xl border-2 transition-all min-h-[80px] flex items-center justify-center text-center
        ${isSelected
          ? 'border-teal-500 bg-teal-50'
          : isDisabled
          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
          : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
        }
      `}
    >
      <span className={`text-sm font-medium ${isSelected ? 'text-teal-700' : isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
        {name}
      </span>
      {isDisabled && (
        <span className="absolute top-2 right-2 text-xs text-gray-400">✕</span>
      )}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};
