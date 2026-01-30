import { useCheckoutViewModel } from '../hooks/useCheckoutViewModel';
import { formatPrice } from '../utils/formatters';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { CollapsibleSection } from '../components/checkout/CollapsibleSection';
import { PaymentMethodButton } from '../components/checkout/PaymentMethodButton';
import { CardPaymentModal } from '../components/checkout/CardPaymentModal';

export const CheckoutPage = () => {
  const vm = useCheckoutViewModel();

  if (!vm.product) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Confirmar compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tu pedido */}
            <CollapsibleSection
              title="Tu pedido"
              isOpen={vm.isOrderOpen}
              onToggle={() => vm.setIsOrderOpen(!vm.isOrderOpen)}
            >
              <div className="space-y-4">
                <div className="text-sm text-blue-600 mb-4">
                  Fecha programada de inicio del envío: 19 mar. 2026 ~ 26 mar. 2026
                </div>

                {vm.cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {vm.cartItems.map((item) => (
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
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                      {vm.product.imageUrl ? (
                        <img src={vm.product.imageUrl} alt={vm.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          IMG
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{vm.product.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{vm.product.name} / {vm.quantity} artículo</p>
                      <p className="text-base font-bold text-gray-900 mt-2">
                        {formatPrice(vm.product.price * vm.quantity)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 flex justify-between items-center font-bold">
                  <span>Total ({vm.itemsCount} artículo{vm.itemsCount > 1 ? 's' : ''})</span>
                  <span>{formatPrice(vm.subtotal)}</span>
                </div>
              </div>
            </CollapsibleSection>

            {/* Cliente */}
            <CollapsibleSection
              title="Cliente"
              isOpen={vm.isCustomerOpen}
              onToggle={() => vm.setIsCustomerOpen(!vm.isCustomerOpen)}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                  <input
                    type="text"
                    value={vm.customerForm.fullName}
                    onChange={(e) => vm.setCustomerForm({ ...vm.customerForm, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Jhon Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    value={vm.customerForm.email}
                    onChange={(e) => vm.setCustomerForm({ ...vm.customerForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="jhondoe@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={vm.customerForm.phone}
                    onChange={(e) => vm.setCustomerForm({ ...vm.customerForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="+57 3523523523"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Dirección de envío */}
            <CollapsibleSection
              title="Dirección de envío"
              isOpen={vm.isDeliveryOpen}
              onToggle={() => vm.setIsDeliveryOpen(!vm.isDeliveryOpen)}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <input
                    type="text"
                    value={vm.deliveryForm.address}
                    onChange={(e) => vm.setDeliveryForm({ ...vm.deliveryForm, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Clle 24 s # 425"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                    <input
                      type="text"
                      value={vm.deliveryForm.city}
                      onChange={(e) => vm.setDeliveryForm({ ...vm.deliveryForm, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Bogotá"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                    <input
                      type="text"
                      value={vm.deliveryForm.department}
                      onChange={(e) => vm.setDeliveryForm({ ...vm.deliveryForm, department: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Cundinamarca"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                    <input
                      type="text"
                      value={vm.deliveryForm.zipCode || ''}
                      onChange={(e) => vm.setDeliveryForm({ ...vm.deliveryForm, zipCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="110111"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
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
              isOpen={vm.isShippingOpen}
              onToggle={() => vm.setIsShippingOpen(!vm.isShippingOpen)}
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
                    {formatPrice(vm.shippingFee)}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Método de pago */}
            <CollapsibleSection
              title="Método de pago"
              isOpen={vm.isPaymentOpen}
              onToggle={() => vm.setIsPaymentOpen(!vm.isPaymentOpen)}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <PaymentMethodButton
                    name="Tarjeta de débito/crédito"
                    isSelected={vm.selectedPaymentMethod === 'credit-card'}
                    isDisabled={false}
                    onClick={() => vm.handlePaymentMethodSelect('credit-card')}
                  />
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del pedido</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(vm.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tarifa de envío</span>
                  <span className="font-medium text-gray-900">{formatPrice(vm.shippingFee)}</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total general</span>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(vm.total)}</span>
                </div>
              </div>

              <div className="mb-4 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={vm.acceptedTerms}
                  onChange={(e) => vm.setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-teal-500 border-gray-300 rounded-lg focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer select-none">
                  Leí los <span className="text-teal-600 font-medium hover:underline">Términos de uso</span> y acepto la recopilación, el uso y el suministro de información personal (incluso al extranjero).
                </label>
              </div>

              <button
                onClick={vm.handlePaymentSubmit}
                disabled={!vm.isFormValid() || vm.transactionStatus === 'loading'}
                className="w-full bg-teal-500 text-white py-4 rounded-xl font-semibold hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
              >
                {vm.transactionStatus === 'loading' ? 'Procesando...' : `Aceptar y pagar ${formatPrice(vm.total)}`}
              </button>

              {!vm.acceptedTerms && vm.selectedPaymentMethod && (
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
      {vm.isCardModalOpen && (
        <CardPaymentModal
          isOpen={vm.isCardModalOpen}
          onClose={vm.handleCloseModal}
          cardNumber={vm.cardNumber}
          onCardNumberChange={vm.handleCardNumberChange}
          expiryDate={vm.expiryDate}
          onExpiryDateChange={vm.handleExpiryChange}
          cvc={vm.cardForm.cvc}
          onCvcChange={(value) => vm.setCardForm({ ...vm.cardForm, cvc: value })}
          email={vm.customerForm.email}
          onEmailChange={(value) => vm.setCustomerForm({ ...vm.customerForm, email: value })}
          installments={vm.installments}
          onInstallmentsChange={vm.setInstallments}
          totalAmount={vm.total}
          productName={vm.product.name}
          quantity={vm.quantity}
          cartItems={vm.cartItems}
          detectedCardBrand={vm.detectedCardBrand}
          isValid={vm.isCardFormValid()}
          customerForm={vm.customerForm}
          deliveryForm={vm.deliveryForm}
          cardForm={vm.cardForm}
          paymentFlow={vm.paymentFlow}
          currentTransaction={vm.currentTransaction}
          transactionError={vm.transactionError}
          onFinalPayment={vm.handleFinalPayment}
        />
      )}

      <Footer />
    </div>
  );
};

export default CheckoutPage;
