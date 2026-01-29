import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import {
  setCreditCard,
  setCustomer,
  setDelivery,
} from '../features/checkout/checkoutSlice';
import { selectCartItems, selectCartItemsCount, selectCartTotal } from '../features/cart/cartSlice';
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
  
  // Cart items para mostrar en "Tu pedido"
  const cartItems = useAppSelector(selectCartItems);
  const cartItemsCount = useAppSelector(selectCartItemsCount);
  const cartTotal = useAppSelector(selectCartTotal);

  // Sections collapse state - TODOS ABIERTOS POR DEFECTO
  const [isOrderOpen, setIsOrderOpen] = useState(true);
  const [isCustomerOpen, setIsCustomerOpen] = useState(true);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(true);
  const [isShippingOpen, setIsShippingOpen] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(true);
  
  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [detectedCardBrand, setDetectedCardBrand] = useState<string>('visa');
  
  // Términos y condiciones
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Form states con DATA DUMMY PRE-LLENADA
  const [customerForm, setCustomerForm] = useState<Customer>(
    customer || {
      fullName: 'Juan Carlos Pérez',
      email: 'juancarlos@example.com',
      phone: '+57 312 456 7890',
    }
  );

  const [deliveryForm, setDeliveryForm] = useState<DeliveryInfo>(
    delivery || {
      address: 'Calle 100 #8A-55, Torre Colpatria, Oficina 1205',
      city: 'Bogotá',
      department: 'Cundinamarca',
      zipCode: '110111',
    }
  );

  // TARJETA DE CRÉDITO VACÍA (no pre-llenada)
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
  const [installments, setInstallments] = useState<number>(1);

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
      deliveryForm.city &&
      acceptedTerms // REQUIERE TÉRMINOS ACEPTADOS
    );
  };

  const isCardFormValid = () => {
    return (
      validateCardNumber(cardNumber) &&
      validateExpiryDate(cardForm.expMonth, cardForm.expYear) &&
      validateCVC(cardForm.cvc, 'visa') &&
      acceptedTerms // REQUIERE TÉRMINOS ACEPTADOS
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

  // Usar el total del carrito si hay items, sino usar el producto individual
  const subtotal = cartItems.length > 0 ? cartTotal : product.price * quantity;
  const shippingFee = fees.deliveryFee;
  const total = subtotal + shippingFee;
  const itemsCount = cartItems.length > 0 ? cartItemsCount : quantity;

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
                
                {/* Mostrar todos los productos del carrito */}
                {cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                          {item.product.imageUrl ? (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              IMG
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">{item.product.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.product.description || `${item.product.name} / ${item.quantity} artículo`}
                          </p>
                          <p className="text-base font-bold text-gray-900 mt-2">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Fallback: mostrar el producto individual si no hay carrito
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          IMG
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{product.name} / {quantity} artículo</p>
                      <p className="text-base font-bold text-gray-900 mt-2">
                        {formatPrice(product.price * quantity)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 flex justify-between items-center font-bold">
                  <span>Total ({itemsCount} artículo{itemsCount > 1 ? 's' : ''})</span>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50"
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
                <div className="flex items-center justify-between p-4 border-2 border-teal-500 rounded-xl bg-teal-50">
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

              <div className="mb-4 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-teal-500 border-gray-300 rounded-lg focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer select-none">
                  Leí los <span className="text-teal-600 font-medium hover:underline">Términos de uso</span> y acepto la recopilación, el uso y el suministro de información personal (incluso al extranjero).
                </label>
              </div>

              <button
                onClick={handlePaymentSubmit}
                disabled={!isFormValid() || status === 'loading'}
                className="w-full bg-teal-500 text-white py-4 rounded-xl font-semibold hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
              >
                {status === 'loading' ? 'Procesando...' : `Aceptar y pagar ${formatPrice(total)}`}
              </button>
              
              {!acceptedTerms && selectedPaymentMethod && (
                <p className="mt-2 text-xs text-red-600 text-center">
                  Debes aceptar los términos y condiciones para continuar
                </p>
              )}

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
          expiryDate={expiryDate}
          onExpiryDateChange={handleExpiryChange}
          cvc={cardForm.cvc}
          onCvcChange={(value) => setCardForm({ ...cardForm, cvc: value })}
          email={customerForm.email}
          onEmailChange={(value) => setCustomerForm({ ...customerForm, email: value })}
          installments={installments}
          onInstallmentsChange={setInstallments}
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

// Card Number Inputs Component con auto-avance
interface CardNumberInputsProps {
  cardNumber: string;
  onCardNumberChange: (value: string) => void;
}

const CardNumberInputs = ({ cardNumber, onCardNumberChange }: CardNumberInputsProps) => {
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleInputChange = (index: number, inputValue: string) => {
    const start = index * 4;
    const currentNumber = cardNumber.replace(/\s/g, '');
    
    // Solo permitir números
    const newValue = inputValue.replace(/\D/g, '').slice(0, 4);
    
    // Construir el nuevo número completo
    const newNumber = 
      currentNumber.substring(0, start) + 
      newValue + 
      currentNumber.substring(start + 4);
    
    onCardNumberChange(newNumber.slice(0, 16));
    
    // Auto-avanzar al siguiente input cuando se llenan 4 dígitos
    if (newValue.length === 4 && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value;
    
    // Si presiona Backspace y el input está vacío, ir al anterior
    if (e.key === 'Backspace' && value.length === 0 && index > 0) {
      e.preventDefault();
      inputRefs[index - 1].current?.focus();
      
      // Borrar el último dígito del input anterior
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
    
    // Si presiona flecha izquierda al inicio, ir al anterior
    if (e.key === 'ArrowLeft' && input.selectionStart === 0 && index > 0) {
      e.preventDefault();
      inputRefs[index - 1].current?.focus();
      const prevInput = inputRefs[index - 1].current;
      if (prevInput) {
        prevInput.selectionStart = prevInput.value.length;
        prevInput.selectionEnd = prevInput.value.length;
      }
    }
    
    // Si presiona flecha derecha al final, ir al siguiente
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
    
    // Enfocar el último input con contenido
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

// Card Payment Modal Component
interface CardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
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
  detectedCardBrand: string;
  isValid: boolean;
}

const CardPaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
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
      diners: 'Diners Club',
      unknown: 'Tarjeta bancaria',
    };
    return names[brand] || 'Tarjeta bancaria';
  };

  // Memorizar las opciones de cuotas para evitar recalcular en cada render
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

    // Icono por defecto si no se reconoce la tarjeta
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
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 md:right-6 md:top-6 text-2xl text-gray-400 hover:text-gray-600 z-10 cursor-pointer"
        >
          ×
        </button>

        {/* Columna izquierda: formulario */}
        <div className="flex-1 px-6 py-6 md:px-10 md:py-8 overflow-y-auto">
          <button 
            onClick={onClose}
            className="mb-4 md:mb-6 flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <span className="mr-2 text-lg cursor-pointer">{"<"}</span>
            Crédito
          </button>

          {/* Resumen mobile - Solo visible en mobile */}
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

          {/* Número de tarjeta con auto-avance */}
          <label className="mb-2 block text-sm text-gray-700">Número de tarjeta</label>
          <CardNumberInputs
            cardNumber={cardNumber}
            onCardNumberChange={onCardNumberChange}
          />

          {/* Fecha de expiración & CVV */}
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

          {/* Cuotas */}
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

          {/* Términos */}
          <div className="mb-4 md:mb-6 flex items-start text-xs text-gray-600">
            <input
              type="checkbox"
              className="mr-2 mt-0.5 h-4 w-4 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
            />
            <span className="leading-tight">
              Acepto las condiciones del servicio y el tratamiento de datos personales.
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
            className="w-full rounded-xl bg-blue-600 py-3 md:py-3 text-sm md:text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>

          <div className="mt-3 md:mt-4 text-center text-[10px] md:text-[11px] text-gray-400">
            powered by wompi payments
          </div>
        </div>

        {/* Columna derecha: resumen - Oculto en mobile */}
        <div className="hidden md:block w-64 border-l border-gray-200 px-8 py-8 bg-gray-50 overflow-y-auto">
          <div className="mb-6 text-xs font-semibold text-gray-400">Producto</div>
          <div className="mb-10 text-sm text-gray-800 leading-snug">
            {productName}
          </div>

          <div className="mb-2 text-xs font-semibold text-gray-400">Monto a pagar</div>
          <div className="mb-6 text-2xl font-semibold text-gray-900">
            {formatPrice(totalAmount)}
          </div>

          <button className="rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-600 hover:bg-blue-100 w-full">
            Obtener descuento inmediato
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
