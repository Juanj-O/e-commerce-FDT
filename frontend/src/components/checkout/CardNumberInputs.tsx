import { useRef } from 'react';

interface CardNumberInputsProps {
  cardNumber: string;
  onCardNumberChange: (value: string) => void;
}

export const CardNumberInputs = ({ cardNumber, onCardNumberChange }: CardNumberInputsProps) => {
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleInputChange = (index: number, inputValue: string) => {
    const start = index * 4;
    const currentNumber = cardNumber.replace(/\s/g, '');

    const newValue = inputValue.replace(/\D/g, '').slice(0, 4);

    const newNumber =
      currentNumber.substring(0, start) +
      newValue +
      currentNumber.substring(start + 4);

    onCardNumberChange(newNumber.slice(0, 16));

    if (newValue.length === 4 && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value;

    if (e.key === 'Backspace' && value.length === 0 && index > 0) {
      e.preventDefault();
      inputRefs[index - 1].current?.focus();

      const start = (index - 1) * 4;
      const currentNumber = cardNumber.replace(/\s/g, '');
      const prevValue = currentNumber.substring(start, start + 4);

      if (prevValue.length > 0) {
        const newPrevValue = prevValue.slice(0, -1);
        const newNumber =
          currentNumber.substring(0, start) +
          newPrevValue +
          currentNumber.substring(start + 4);
        onCardNumberChange(newNumber);
      }
    }

    if (e.key === 'ArrowLeft' && input.selectionStart === 0 && index > 0) {
      e.preventDefault();
      inputRefs[index - 1].current?.focus();
      const prevInput = inputRefs[index - 1].current;
      if (prevInput) {
        prevInput.selectionStart = prevInput.value.length;
        prevInput.selectionEnd = prevInput.value.length;
      }
    }

    if (e.key === 'ArrowRight' && input.selectionStart === value.length && index < 3) {
      e.preventDefault();
      inputRefs[index + 1].current?.focus();
      const nextInput = inputRefs[index + 1].current;
      if (nextInput) {
        nextInput.selectionStart = 0;
        nextInput.selectionEnd = 0;
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 16);
    onCardNumberChange(pastedData);

    const lastFilledIndex = Math.min(Math.floor(pastedData.length / 4), 3);
    inputRefs[lastFilledIndex].current?.focus();
  };

  return (
    <div className="mb-6 flex gap-2 md:gap-3">
      {[0, 1, 2, 3].map((index) => {
        const start = index * 4;
        const value = cardNumber.replace(/\s/g, '').substring(start, start + 4);
        const shouldMask = (index === 0 || index === 3) && value.length > 0;

        return (
          <input
            key={index}
            ref={inputRefs[index]}
            type={shouldMask ? "password" : "text"}
            value={value}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            maxLength={4}
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-1/4 rounded-xl border border-gray-300 bg-gray-50 px-2 md:px-3 py-2 md:py-2 text-center text-sm md:text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="0000"
          />
        );
      })}
    </div>
  );
};
