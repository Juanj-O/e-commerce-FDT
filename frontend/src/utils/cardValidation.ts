import type { CardBrand } from '../types';

/**
 * Luhn Algorithm - validates credit card numbers
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s|-/g, '');

  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Detect card brand from card number
 */
export const detectCardBrand = (cardNumber: string): CardBrand => {
  const cleanNumber = cardNumber.replace(/\s|-/g, '');

  // Visa: starts with 4
  if (/^4/.test(cleanNumber)) {
    return 'visa';
  }

  // Mastercard: starts with 51-55 or 2221-2720
  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
    return 'mastercard';
  }

  // American Express: starts with 34 or 37
  if (/^3[47]/.test(cleanNumber)) {
    return 'amex';
  }

  // Diners Club: starts with 36, 38, or 300-305
  if (/^3[68]/.test(cleanNumber) || /^30[0-5]/.test(cleanNumber)) {
    return 'diners';
  }

  return 'unknown';
};

/**
 * Format card number with spaces
 */
export const formatCardNumber = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  const brand = detectCardBrand(cleanValue);

  // Amex: 4-6-5 format
  if (brand === 'amex') {
    return cleanValue
      .replace(/(\d{4})/, '$1 ')
      .replace(/(\d{4}) (\d{6})/, '$1 $2 ')
      .trim()
      .substring(0, 17);
  }

  // Default: 4-4-4-4 format
  return cleanValue
    .replace(/(\d{4})/g, '$1 ')
    .trim()
    .substring(0, 19);
};

/**
 * Format expiry date as MM/YY
 */
export const formatExpiryDate = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');

  if (cleanValue.length >= 2) {
    return `${cleanValue.substring(0, 2)}/${cleanValue.substring(2, 4)}`;
  }

  return cleanValue;
};

/**
 * Validate expiry date
 */
export const validateExpiryDate = (expMonth: string, expYear: string): boolean => {
  const month = parseInt(expMonth, 10);
  const year = parseInt(expYear, 10);

  if (month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100; // Get last 2 digits
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) {
    return false;
  }

  if (year === currentYear && month < currentMonth) {
    return false;
  }

  return true;
};

/**
 * Validate CVC
 */
export const validateCVC = (cvc: string, cardBrand: CardBrand): boolean => {
  const cleanCVC = cvc.replace(/\D/g, '');

  // Amex has 4 digit CVC
  if (cardBrand === 'amex') {
    return /^\d{4}$/.test(cleanCVC);
  }

  // Other cards have 3 digit CVC
  return /^\d{3}$/.test(cleanCVC);
};

