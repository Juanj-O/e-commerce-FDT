import { useEffect, useMemo, useState } from 'react';
import type { CartItem } from '../../features/cart/cartSlice';
import type { PaymentFlowState } from '../../hooks/useCheckoutViewModel';
import type { CreditCardData, Customer, DeliveryInfo, Transaction } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { CardNumberInputs } from './CardNumberInputs';
import { PaymentStatusView } from './PaymentStatusView';

interface CardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardNumber: string;
  onCardNumberChange: (value: string) => void;
  expiryDate: string;
  onExpiryDateChange: (value: string) => void;
  cvc: string;
  onCvcChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  installments: number;
  onInstallmentsChange: (value: number) => void;
  totalAmount: number;
  productName: string;
  quantity: number;
  cartItems: CartItem[];
  detectedCardBrand: string;
  isValid: boolean;
  customerForm: Customer;
  deliveryForm: DeliveryInfo;
  cardForm: CreditCardData;
  paymentFlow: PaymentFlowState;
  currentTransaction: Transaction | null;
  transactionError: string | null;
  onFinalPayment: () => Promise<void>;
}

export const CardPaymentModal = ({
  isOpen,
  onClose,
  cardNumber,
  onCardNumberChange,
  expiryDate,
  onExpiryDateChange,
  cvc,
  onCvcChange,
  email,
  onEmailChange,
  installments,
  onInstallmentsChange,
  totalAmount,
  productName,
  quantity,
  cartItems,
  detectedCardBrand,
  isValid,
  customerForm,
  deliveryForm,
  cardForm,
  paymentFlow,
  currentTransaction,
  transactionError,
  onFinalPayment,
}: CardPaymentModalProps) => {
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowSummary(false);
    }
  }, [isOpen]);

  const getCardBrandName = (brand: string) => {
    const names: { [key: string]: string } = {
      visa: 'VISA internacional',
      mastercard: 'Mastercard internacional',
      amex: 'American Express',
      diners: 'Diners Club',
      unknown: 'Tarjeta bancaria',
    };
    return names[brand] || 'Tarjeta bancaria';
  };

  const installmentOptions = useMemo(() => {
    return Array.from({ length: 64 }, (_, i) => {
      const num = i + 1;
      const monthlyAmount = totalAmount / num;
      return {
        value: num,
        label: `${num} ${num === 1 ? 'cuota' : 'cuotas'} - ${formatPrice(monthlyAmount)} / mes`
      };
    });
  }, [totalAmount]);

  const handleNextToSummary = () => {
    if (isValid) {
      setShowSummary(true);
    }
  };

  const handleBackToForm = () => {
    setShowSummary(false);
  };

  const getCardIcon = (brand: string) => {
    const cardImages: { [key: string]: string } = {
      visa: 'https://booking.avianca.com/statics/applications/ssci/dynamicContent/1.0.5/assets/img/payment/visa.svg',
      mastercard: 'https://booking.avianca.com/statics/applications/ssci/dynamicContent/1.0.5/assets/img/payment/mastercard.svg',
      amex: 'https://booking.avianca.com/statics/applications/ssci/dynamicContent/1.0.5/assets/img/payment/amex.jpg',
      diners: 'https://booking.avianca.com/statics/applications/ssci/dynamicContent/1.0.5/assets/img/payment/diners.png',
    };

    const imageUrl = cardImages[brand];

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={brand}
          className="h-6 w-10 object-contain"
        />
      );
    }

    return (
      <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none">
        <rect width="40" height="24" rx="3" fill="#9CA3AF"/>
        <rect x="3" y="9" width="34" height="2" fill="white" opacity="0.8"/>
        <rect x="3" y="15" width="10" height="5" rx="1" fill="white" opacity="0.6"/>
      </svg>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#666666]/80 p-4">
      <div className="relative w-full max-w-4xl max-h-[95vh] rounded-2xl bg-white shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 md:right-6 md:top-6 text-2xl text-gray-400 hover:text-gray-600 z-10 cursor-pointer"
        >
          ×
        </button>

        {/* Left column */}
        <div className="flex-1 px-6 py-6 md:px-10 md:py-8 overflow-y-auto">
          {paymentFlow === 'idle' && (
            <button
              onClick={showSummary ? handleBackToForm : onClose}
              className="mb-4 md:mb-6 flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <span className="mr-2 text-lg cursor-pointer">{"<"}</span>
              {showSummary ? 'Volver' : 'Crédito'}
            </button>
          )}

          {paymentFlow !== 'idle' ? (
            <PaymentStatusView
              paymentFlow={paymentFlow}
              transaction={currentTransaction}
              transactionError={transactionError}
              onClose={onClose}
              formatPrice={formatPrice}
            />
          ) : !showSummary ? (
            <>
              {/* Mobile summary */}
              <div className="md:hidden mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Monto a pagar</div>
                    <div className="text-xl font-bold text-gray-900">{formatPrice(totalAmount)}</div>
                  </div>
                  <div className="text-xs text-gray-400 max-w-[120px] text-right">
                    {productName}
                  </div>
                </div>
              </div>

              <div className="mb-3 md:mb-4 flex items-center justify-between">
                <label className="text-sm text-gray-700">Tipo de tarjeta</label>
              </div>
              <div className="mb-4 md:mb-6">
                <div className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 flex items-center gap-3">
                  {getCardIcon(detectedCardBrand)}
                  <span className="text-sm md:text-sm">{getCardBrandName(detectedCardBrand)}</span>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Las tarjetas emitidas en el extranjero no permiten pago a plazos.
                </p>
              </div>

              <label className="mb-2 block text-sm text-gray-700">Número de tarjeta</label>
              <CardNumberInputs
                cardNumber={cardNumber}
                onCardNumberChange={onCardNumberChange}
              />

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                <div>
                  <label className="mb-2 block text-xs md:text-sm text-gray-700">Fecha de vencimiento</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => onExpiryDateChange(e.target.value)}
                    maxLength={5}
                    placeholder="MM/AA"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs md:text-sm text-gray-700">CVV/CVC</label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => onCvcChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    placeholder="123"
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <label className="mb-2 block text-xs md:text-sm text-gray-700">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="john.doe@gmail.com"
                className="mb-4 md:mb-6 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              {/* Installments */}
              <label className="mb-2 block text-xs md:text-sm text-gray-700">Número de cuotas</label>
              <select
                value={installments}
                onChange={(e) => onInstallmentsChange(Number(e.target.value))}
                className="mb-4 md:mb-6 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {installmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Terms */}
              <div className="mb-4 md:mb-6 flex items-start text-xs text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2 mt-0.5 h-4 w-4 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                />
                <span className="leading-tight">
                  Acepto las condiciones del servicio y el tratamiento de datos personales.
                </span>
              </div>

              {/* Next button */}
              <button
                onClick={handleNextToSummary}
                disabled={!isValid}
                className="w-full rounded-xl bg-blue-600 py-3 md:py-3 text-sm md:text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>

              <div className="mt-3 md:mt-4 text-center text-[10px] md:text-[11px] text-gray-400">
                powered by business payments
              </div>
            </>
          ) : (
            <>
              {/* TRANSACTION SUMMARY */}
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Resumen de tu compra</h2>

              {/* Customer Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Información del Cliente</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium text-gray-900">{customerForm.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{customerForm.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teléfono:</span>
                    <span className="font-medium text-gray-900">{customerForm.phone}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Dirección de Entrega</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dirección:</span>
                    <span className="font-medium text-gray-900 text-right">{deliveryForm.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ciudad:</span>
                    <span className="font-medium text-gray-900">{deliveryForm.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Departamento:</span>
                    <span className="font-medium text-gray-900">{deliveryForm.department}</span>
                  </div>
                  {deliveryForm.zipCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Código Postal:</span>
                      <span className="font-medium text-gray-900">{deliveryForm.zipCode}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Método de Pago</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {getCardIcon(detectedCardBrand)}
                    <span className="font-medium text-gray-900">{getCardBrandName(detectedCardBrand)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tarjeta:</span>
                    <span className="font-medium text-gray-900">**** **** **** {cardForm.number.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cuotas:</span>
                    <span className="font-medium text-gray-900">{installments} {installments === 1 ? 'cuota' : 'cuotas'}</span>
                  </div>
                  {installments > 1 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto mensual:</span>
                      <span className="font-medium text-gray-900">{formatPrice(totalAmount / installments)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {cartItems.length > 0 ? 'Productos' : 'Producto'}
                </h3>
                <div className="space-y-3 text-sm">
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-start gap-2 pb-2 border-b border-gray-200 last:border-b-0 last:pb-0">
                        <div>
                          <span className="font-medium text-gray-900">{item.product.name}</span>
                          <span className="text-gray-500 ml-2">× {item.quantity}</span>
                        </div>
                        <span className="font-medium text-gray-900 whitespace-nowrap">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Artículo:</span>
                        <span className="font-medium text-gray-900 text-right">{productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cantidad:</span>
                        <span className="font-medium text-gray-900">{quantity}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total a Pagar:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Pay button */}
              <button
                onClick={onFinalPayment}
                disabled={paymentFlow !== 'idle'}
                className="w-full rounded-xl bg-green-600 py-3 md:py-3 text-sm md:text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Pagar {formatPrice(totalAmount)}
              </button>

              <div className="mt-3 md:mt-4 text-center text-[10px] md:text-[11px] text-gray-400">
                powered by business payments
              </div>
            </>
          )}
        </div>

        {/* Right column - Desktop only */}
        {!showSummary && (
          <div className="hidden md:block w-64 border-l border-gray-200 px-8 py-8 bg-gray-50 overflow-y-auto">
            <div className="mb-6 text-xs font-semibold text-gray-400">
              {cartItems.length > 0 ? 'Productos' : 'Producto'}
            </div>
            <div className="mb-10 text-sm text-gray-800 leading-snug">
              {cartItems.length > 0 ? (
                <ul className="space-y-1">
                  {cartItems.map((item) => (
                    <li key={item.product.id}>
                      {item.product.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
              ) : (
                productName
              )}
            </div>

            <div className="mb-2 text-xs font-semibold text-gray-400">Monto a pagar</div>
            <div className="mb-6 text-2xl font-semibold text-gray-900">
              {formatPrice(totalAmount)}
            </div>

            <button className="rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-600 hover:bg-blue-100 w-full">
              Obtener descuento inmediato
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
