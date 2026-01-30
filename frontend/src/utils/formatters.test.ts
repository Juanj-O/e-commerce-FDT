import { formatPrice } from './formatters';

describe('formatPrice', () => {
  it('should format a price in COP currency', () => {
    const result = formatPrice(50000);
    expect(result).toContain('50.000');
  });

  it('should format zero', () => {
    const result = formatPrice(0);
    expect(result).toContain('0');
  });

  it('should format large numbers', () => {
    const result = formatPrice(1500000);
    expect(result).toContain('1.500.000');
  });

  it('should return a string', () => {
    expect(typeof formatPrice(100)).toBe('string');
  });

  it('should include currency symbol', () => {
    const result = formatPrice(10000);
    // COP format includes $ sign
    expect(result).toMatch(/\$/);
  });

  it('should not have decimal places', () => {
    const result = formatPrice(10000);
    // minimumFractionDigits is 0, so no decimals
    expect(result).not.toMatch(/,\d{2}$/);
  });
});
