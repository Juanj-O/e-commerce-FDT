import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import {
  selectCheckoutTotal,
  setCreditCard,
  setCustomer,
  setDelivery,
} from '../features/checkout/checkoutSlice';
import { processPayment } from '../features/transaction/transactionSlice';
import type { CreditCardData, Customer, DeliveryInfo } from '../types';
import {
  detectCardBrand,
  formatCardNumber,
  formatExpiryDate,
  validateCardNumber,
  validateCVC,
  validateExpiryDate,
} from '../utils/cardValidation';

export const CheckoutPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { product, quantity, fees, customer, delivery, creditCard } = useAppSelector(
    (state) => state.checkout
  );
  const { status } = useAppSelector((state) => state.transaction);
  const totalAmount = useAppSelector(selectCheckoutTotal);

  // Sections collapse state
  const [isOrderOpen, setIsOrderOpen] = useState(true);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  
  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [detectedCardBrand, setDetectedCardBrand] = useState<string>('visa');

  // Form states
  const [customerForm, setCustomerForm] = useState<Customer>(
    customer || {
      fullName: '',
      email: '',
      phone: '',
    }
  );

  const [deliveryForm, setDeliveryForm] = useState<DeliveryInfo>(
    delivery || {
      address: '',
      city: '',
      department: '',
      zipCode: '',
    }
  );

  const [cardForm, setCardForm] = useState<CreditCardData>(
    creditCard || {
      number: '',
      cardHolder: '',
      expMonth: '',
      expYear: '',
      cvc: '',
    }
  );
  
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');

  // Redirect if no product
  useEffect(() => {
    if (!product) {
      navigate('/');
    }
  }, [product, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    const brand = detectCardBrand(value);
    setCardNumber(formatted);
    setDetectedCardBrand(brand);
    setCardForm({ ...cardForm, number: formatted.replace(/\s/g, '') });
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    setExpiryDate(formatted);
    const [month, year] = formatted.split('/');
    setCardForm({ ...cardForm, expMonth: month || '', expYear: year || '' });
  };

  const handleSubmit = async () => {
    if (!product) return;

    // Save forms to Redux
    dispatch(setCustomer(customerForm));
    dispatch(setDelivery(deliveryForm));
    dispatch(setCreditCard(cardForm));

    // Process payment
    await dispatch(
      processPayment({
        productId: product.id,
        quantity,
        customer: customerForm,
        delivery: deliveryForm,
        card: cardForm,
      })
    );
  };

  const isFormValid = () => {
    return (
      selectedPaymentMethod &&
      customerForm.fullName &&
      customerForm.email &&
      customerForm.phone &&
      deliveryForm.address &&
      deliveryForm.city
    );
  };

  const isCardFormValid = () => {
    return (
      validateCardNumber(cardNumber) &&
      validateExpiryDate(cardForm.expMonth, cardForm.expYear) &&
      validateCVC(cardForm.cvc, 'visa')
    );
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymentSubmit = () => {
    if (!isFormValid()) return;
    
    if (selectedPaymentMethod === 'credit-card') {
      setIsCardModalOpen(true);
    } else {
      handleSubmit();
    }
  };

  if (!product) return null;

  const subtotal = product.price * quantity;
  const shippingFee = fees.deliveryFee;
  const total = totalAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Confirmar compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tu pedido */}
            <CollapsibleSection
              title="Tu pedido"
              isOpen={isOrderOpen}
              onToggle={() => setIsOrderOpen(!isOrderOpen)}
            >
              <div className="space-y-4">
                <div className="text-sm text-blue-600 mb-4">
                  Fecha programada de inicio del envío: 19 mar. 2026 ~ 26 mar. 2026
                </div>
                
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        SET
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{quantity} artículo</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between items-center font-bold">
                  <span>Total ({quantity} artículo)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>
            </CollapsibleSection>

            {/* Cliente */}
            <CollapsibleSection
              title="Cliente"
              isOpen={isCustomerOpen}
              onToggle={() => setIsCustomerOpen(!isCustomerOpen)}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={customerForm.fullName}
                    onChange={(e) => setCustomerForm({ ...customerForm, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Jhon Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="jhondoe@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="+57 3523523523"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Dirección de envío */}
            <CollapsibleSection
              title="Dirección de envío"
              isOpen={isDeliveryOpen}
              onToggle={() => setIsDeliveryOpen(!isDeliveryOpen)}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={deliveryForm.address}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Clle 24 s # 425"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={deliveryForm.city}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Bogotá"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={deliveryForm.department}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, department: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Cundinamarca"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={deliveryForm.zipCode || ''}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, zipCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="110111"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      value="Colombia"
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Opción de envío */}
            <CollapsibleSection
              title="Opción de envío"
              isOpen={isShippingOpen}
              onToggle={() => setIsShippingOpen(!isShippingOpen)}
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  El cronograma de envío puede cambiar dependiendo de las circunstancias de la empresa de mensajería. Es posible que se apliquen costos de envío adicionales según su ubicación.
                </p>
                <div className="flex items-center justify-between p-4 border-2 border-teal-500 rounded-lg bg-teal-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">DHL</div>
                      <div className="text-sm text-gray-600">Shipping takes 5-8 business days on average.</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(shippingFee)}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Método de pago */}
            <CollapsibleSection
              title="Método de pago"
              isOpen={isPaymentOpen}
              onToggle={() => setIsPaymentOpen(!isPaymentOpen)}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Tarjeta de crédito - HABILITADA */}
                  <PaymentMethodButton
                    name="Tarjeta de débito/crédito"
                    isSelected={selectedPaymentMethod === 'credit-card'}
                    isDisabled={false}
                    onClick={() => handlePaymentMethodSelect('credit-card')}
                  />
                  
                  {/* Otros métodos - BLOQUEADOS */}
                  <PaymentMethodButton name="Toss" isDisabled={true} />
                  <PaymentMethodButton name="PAYCO" isDisabled={true} />
                  <PaymentMethodButton name="Pago Rápido" isDisabled={true} />
                  <PaymentMethodButton name="Samsung Pay" isDisabled={true} />
                  <PaymentMethodButton name="Naver Pay" isDisabled={true} />
                  <PaymentMethodButton name="Eximbay" isDisabled={true} />
                  <PaymentMethodButton name="Alipay+" isDisabled={true} />
                  <PaymentMethodButton name="WeChat Pay" isDisabled={true} />
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  Los métodos de pago pueden variar según el país de entrega y el tipo de moneda.
                </p>
              </div>
            </CollapsibleSection>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Resumen del pedido
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tarifa de envío</span>
                  <span className="font-medium text-gray-900">{formatPrice(shippingFee)}</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total general</span>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handlePaymentSubmit}
                disabled={!isFormValid() || status === 'loading'}
                className="w-full bg-teal-500 text-white py-4 rounded-lg font-semibold hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
              >
                {status === 'loading' ? 'Procesando...' : `Aceptar y pagar ${formatPrice(total)}`}
              </button>

              <div className="mt-4 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-xs text-gray-500">
                  Leí los Términos de uso y acepto la recopilación, el uso y el suministro de información personal (incluso al extranjero).
                </label>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Cuando realices pagos al extranjero o uses una tarjeta de crédito que no se haya emitido en Corea del Sur, ten en cuenta que las tasas de cambio y las cuotas de procesamiento pueden variar según el método de pago o emisor de la tarjeta y la carga final puede diferir del monto que se muestra.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Payment Modal */}
      {isCardModalOpen && (
        <CardPaymentModal
          isOpen={isCardModalOpen}
          onClose={() => setIsCardModalOpen(false)}
          onSubmit={handleSubmit}
          cardNumber={cardNumber}
          onCardNumberChange={handleCardNumberChange}
          cardHolder={cardForm.cardHolder}
          onCardHolderChange={(value) => setCardForm({ ...cardForm, cardHolder: value })}
          expiryDate={expiryDate}
          onExpiryDateChange={handleExpiryChange}
          cvc={cardForm.cvc}
          onCvcChange={(value) => setCardForm({ ...cardForm, cvc: value })}
          email={customerForm.email}
          onEmailChange={(value) => setCustomerForm({ ...customerForm, email: value })}
          totalAmount={total}
          productName={product.name}
          detectedCardBrand={detectedCardBrand}
          isValid={isCardFormValid()}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection = ({ title, isOpen, onToggle, children }: CollapsibleSectionProps) => {
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

// Payment Method Button Component
interface PaymentMethodButtonProps {
  name: string;
  isSelected?: boolean;
  isDisabled: boolean;
  onClick?: () => void;
}

const PaymentMethodButton = ({ name, isSelected, isDisabled, onClick }: PaymentMethodButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative p-4 rounded-lg border-2 transition-all min-h-[80px] flex items-center justify-center text-center
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

// Card Payment Modal Component
interface CardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  cardNumber: string;
  onCardNumberChange: (value: string) => void;
  cardHolder: string;
  onCardHolderChange: (value: string) => void;
  expiryDate: string;
  onExpiryDateChange: (value: string) => void;
  cvc: string;
  onCvcChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  totalAmount: number;
  productName: string;
  detectedCardBrand: string;
  isValid: boolean;
}

const CardPaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  cardNumber,
  onCardNumberChange,
  cardHolder,
  onCardHolderChange,
  expiryDate,
  onExpiryDateChange,
  cvc,
  onCvcChange,
  email,
  onEmailChange,
  totalAmount,
  productName,
  detectedCardBrand,
  isValid,
}: CardPaymentModalProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCardBrandName = (brand: string) => {
    const names: { [key: string]: string } = {
      visa: 'VISA internacional',
      mastercard: 'Mastercard internacional',
      amex: 'American Express',
      unknown: 'Tarjeta bancaria',
    };
    return names[brand] || 'Tarjeta bancaria';
  };

  const getCardIcon = (brand: string) => {
    switch (brand) {
      case 'visa':
        return (
          <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#1434CB"/>
            <path d="M20.5 11.5h-3.2l-2 9h2l2-9zM14.3 11.5l-2 6.2-.2-1.2-.7-3.5s-.1-.5-.6-.5h-3l-.1.1s.8.2 1.6.7l1.4 5.2h2.1l3.2-7h-1.7zm19.8 0h-1.7c-.4 0-.6.2-.7.5l-3 6.5h2.1l.4-1.1h2.5l.2 1.1h1.9l-1.7-7zm-2.3 4.7l1-2.8.6 2.8h-1.6zm-5.6-3.4l.3-1.7s-.9-.3-1.9-.3c-1 0-3.4.5-3.4 2.8 0 2.2 3 2.2 3 3.4 0 1.1-2.7.9-3.6.2l-.3 1.7s1 .5 2.4.5c1.5 0 3.6-.8 3.6-2.9 0-2.2-3.1-2.4-3.1-3.4 0-.9 2.1-.8 3-.3z" fill="white"/>
          </svg>
        );
      case 'mastercard':
        return (
          <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#EB001B"/>
            <circle cx="18" cy="16" r="10" fill="#FF5F00"/>
            <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
            <path d="M24 8.5a9.96 9.96 0 00-3.8 7.5c0 2.9 1.2 5.5 3.2 7.4a9.96 9.96 0 003.2-7.4c0-2.9-1.2-5.5-3.2-7.5z" fill="#FF5F00"/>
          </svg>
        );
      case 'amex':
        return (
          <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#006FCF"/>
            <path d="M10 12l-2 8h3l.3-1h1l.3 1h3.5v-.8l.3.8h2l.3-.8v.8h8.5l1-1.1 1 1.1h4.5l-2.8-4 2.8-4h-4.4l-1 1.1-.9-1.1H17v.7l-.3-.7h-2.5l-.4 1-.4-1H10zm1.4 1.5h1.7l1.3 3 1.3-3h1.7v5h-1.1v-3.8l-1.5 3.8h-.9l-1.5-3.8v3.8h-1V13.5zm8.1 0h4v1h-2.9v.8h2.8v1h-2.8v.9h2.9v1h-4v-4.7zm5.2 0h1.8l1.1 1.7 1.1-1.7h1.8l-2 2.4 2 2.3h-1.8l-1.1-1.7-1.1 1.7h-1.8l2-2.3-2-2.4zm7.8 0h1.8l1.7 2.7v-2.7h1.1v4.7h-1.7l-1.8-2.8v2.8h-1.1v-4.7z" fill="white"/>
          </svg>
        );
      default:
        return (
          <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#9CA3AF"/>
            <rect x="4" y="12" width="40" height="3" fill="white" opacity="0.8"/>
            <rect x="4" y="20" width="12" height="6" rx="1" fill="white" opacity="0.6"/>
          </svg>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#666666]/80">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl flex overflow-hidden">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-2xl text-gray-400 hover:text-gray-600 z-10 cursor-pointer"
        >
          ×
        </button>

        {/* Columna izquierda: formulario */}
        <div className="flex-1 px-10 py-8">
          <button 
            onClick={onClose}
            className="mb-6 flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <span className="mr-2 text-lg cursor-pointer">{"<"}</span>
            Crédito
          </button>

          <div className="mb-4 flex items-center justify-between">
            <label className="text-sm text-gray-700">Tipo de tarjeta</label>
          </div>
          <div className="mb-6">
            <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 flex items-center gap-3">
              {getCardIcon(detectedCardBrand)}
              <span>{getCardBrandName(detectedCardBrand)}</span>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Las tarjetas emitidas en el extranjero no permiten pago a plazos.
            </p>
          </div>

          {/* Número de tarjeta */}
          <label className="mb-2 block text-sm text-gray-700">Número de tarjeta</label>
          <div className="mb-6 flex gap-3">
            {[0, 1, 2, 3].map((index) => {
              const start = index * 4;
              const value = cardNumber.replace(/\s/g, '').substring(start, start + 4);
              const shouldMask = (index === 0 || index === 3) && value.length > 0;
              
              return (
                <input
                  key={index}
                  type={shouldMask ? "password" : "text"}
                  value={value}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Permitir borrar todo
                    if (inputValue === '') {
                      const currentNumber = cardNumber.replace(/\s/g, '');
                      const newNumber = 
                        currentNumber.substring(0, start) + 
                        currentNumber.substring(start + 4);
                      onCardNumberChange(newNumber);
                      return;
                    }
                    
                    const newValue = inputValue.replace(/\D/g, '').slice(0, 4);
                    const currentNumber = cardNumber.replace(/\s/g, '');
                    const newNumber = 
                      currentNumber.substring(0, start) + 
                      newValue + 
                      currentNumber.substring(start + newValue.length);
                    onCardNumberChange(newNumber.slice(0, 16));
                  }}
                  maxLength={4}
                  className="w-1/4 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-center text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0000"
                />
              );
            })}
          </div>

          {/* Fecha de expiración & CVV */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="mb-2 block text-sm text-gray-700">Fecha de vencimiento</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => onExpiryDateChange(e.target.value)}
                maxLength={5}
                placeholder="MM/AA"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-700">CVV/CVC</label>
              <input
                type="text"
                value={cvc}
                onChange={(e) => onCvcChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                placeholder="123"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email */}
          <label className="mb-2 block text-sm text-gray-700">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="john.doe@gmail.com"
            className="mb-6 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {/* Términos */}
          <div className="mb-6 flex items-center text-xs text-gray-600">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              [Obligatorio] Acepto las condiciones del servicio y el tratamiento de datos personales.
            </span>
          </div>

          {/* Botón siguiente */}
          <button 
            onClick={() => {
              if (isValid) {
                onSubmit();
                onClose();
              }
            }}
            disabled={!isValid}
            className="mt-2 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>

          <div className="mt-4 text-center text-[11px] text-gray-400">
            powered by toss payments
          </div>
        </div>

        {/* Columna derecha: resumen */}
        <div className="w-64 border-l border-gray-200 px-8 py-8 bg-gray-50">
          <div className="mb-6 text-xs font-semibold text-gray-400">Producto</div>
          <div className="mb-10 text-sm text-gray-800 leading-snug">
            {productName}
          </div>

          <div className="mb-2 text-xs font-semibold text-gray-400">Monto a pagar</div>
          <div className="mb-6 text-2xl font-semibold text-gray-900">
            {formatPrice(totalAmount)}
          </div>

          <button className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-600 hover:bg-blue-100 w-full">
            Obtener descuento inmediato
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
