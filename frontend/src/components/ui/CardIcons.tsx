import type { CardBrand } from '../../types';

interface CardIconProps {
  className?: string;
}

export const VisaIcon = ({ className = 'w-10 h-6' }: CardIconProps) => (
  <svg className={className} viewBox="0 0 48 32" fill="none">
    <rect width="48" height="32" rx="4" fill="#1A1F71" />
    <path
      d="M19.5 21.5L21.5 10.5H24.5L22.5 21.5H19.5Z"
      fill="white"
    />
    <path
      d="M32 10.7C31.3 10.4 30.2 10.1 28.9 10.1C25.8 10.1 23.6 11.8 23.6 14.1C23.6 15.9 25.2 16.8 26.5 17.4C27.8 18 28.2 18.4 28.2 18.9C28.2 19.7 27.2 20.1 26.3 20.1C25 20.1 24.3 19.9 23.2 19.4L22.8 19.2L22.3 22.2C23.1 22.6 24.6 22.9 26.1 22.9C29.4 22.9 31.5 21.2 31.5 18.7C31.5 17.3 30.6 16.2 28.7 15.3C27.5 14.7 26.8 14.3 26.8 13.7C26.8 13.2 27.4 12.6 28.6 12.6C29.6 12.6 30.4 12.8 31 13.1L31.3 13.2L32 10.7Z"
      fill="white"
    />
    <path
      d="M36.9 10.5H34.5C33.7 10.5 33.1 10.7 32.8 11.6L28.1 21.5H31.4L32 19.8H36C36.1 20.3 36.3 21.5 36.3 21.5H39.2L36.9 10.5ZM32.9 17.4C33.2 16.6 34.4 13.6 34.4 13.6C34.4 13.6 34.7 12.8 34.9 12.3L35.1 13.5C35.1 13.5 35.8 16.8 35.9 17.4H32.9Z"
      fill="white"
    />
    <path
      d="M17.7 10.5L14.7 18.2L14.4 16.8C13.8 15 12.1 13 10.2 12L13 21.5H16.4L21.1 10.5H17.7Z"
      fill="white"
    />
    <path
      d="M12.3 10.5H7.1L7 10.8C11 11.8 13.5 14.2 14.4 16.8L13.4 11.6C13.3 10.8 12.7 10.5 12.3 10.5Z"
      fill="#F9A51A"
    />
  </svg>
);

export const MastercardIcon = ({ className = 'w-10 h-6' }: CardIconProps) => (
  <svg className={className} viewBox="0 0 48 32" fill="none">
    <rect width="48" height="32" rx="4" fill="#000000" />
    <circle cx="18" cy="16" r="8" fill="#EB001B" />
    <circle cx="30" cy="16" r="8" fill="#F79E1B" />
    <path
      d="M24 10.5C25.9 12 27.1 14.4 27.1 17C27.1 19.6 25.9 22 24 23.5C22.1 22 20.9 19.6 20.9 17C20.9 14.4 22.1 12 24 10.5Z"
      fill="#FF5F00"
    />
  </svg>
);

export const AmexIcon = ({ className = 'w-10 h-6' }: CardIconProps) => (
  <svg className={className} viewBox="0 0 48 32" fill="none">
    <rect width="48" height="32" rx="4" fill="#006FCF" />
    <path
      d="M8 18H11L12 15.5L13 18H16L14 14L16 10H13L12 12.5L11 10H8L10 14L8 18Z"
      fill="white"
    />
    <path
      d="M17 18H20V16H22V18H25V10H22V12H20V10H17V18ZM20 14H22V16H20V14Z"
      fill="white"
    />
    <path
      d="M26 18H29V16H31V14H29V12H31V10H26V18Z"
      fill="white"
    />
    <path
      d="M32 18H35V16H37V14H35V12H37V10H32V18Z"
      fill="white"
    />
    <path
      d="M38 18H41V10H38V18ZM39 14H40V16H39V14Z"
      fill="white"
    />
  </svg>
);

export const UnknownCardIcon = ({ className = 'w-10 h-6' }: CardIconProps) => (
  <svg className={className} viewBox="0 0 48 32" fill="none">
    <rect width="48" height="32" rx="4" fill="#E5E7EB" />
    <rect x="8" y="10" width="12" height="8" rx="1" fill="#9CA3AF" />
    <rect x="24" y="14" width="16" height="2" rx="1" fill="#9CA3AF" />
    <rect x="24" y="18" width="10" height="2" rx="1" fill="#9CA3AF" />
  </svg>
);

export const CardBrandIcon = ({
  brand,
  className,
}: {
  brand: CardBrand;
  className?: string;
}) => {
  switch (brand) {
    case 'visa':
      return <VisaIcon className={className} />;
    case 'mastercard':
      return <MastercardIcon className={className} />;
    case 'amex':
      return <AmexIcon className={className} />;
    default:
      return <UnknownCardIcon className={className} />;
  }
};
