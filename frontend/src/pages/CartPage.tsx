import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { useCartViewModel } from '../hooks/useCartViewModel';
import { formatPrice } from '../utils/formatters';

const CartPage = () => {
  const navigate = useNavigate();
  const vm = useCartViewModel();

  if (vm.cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-12 md:py-20 px-4">
          <div className="text-center max-w-md">
            <svg
              className="w-20 h-20 md:w-24 md:h-24 mx-auto text-gray-300 mb-4 md:mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              Agrega productos para comenzar tu compra
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors text-sm md:text-base"
            >
              Explorar Productos
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-8 w-full">
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Ecommerce - W</h1>
          <p className="text-xs md:text-sm text-gray-600">Envío 19 mar. 2026 - 26 mar. 2026</p>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-4 mb-3 md:mb-4 flex items-center gap-2 text-xs md:text-sm">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <span className="text-gray-700 font-medium">DHL</span>
          <span className="px-2 py-0.5 md:py-1 bg-gray-100 text-gray-700 text-[10px] md:text-xs rounded">Empresa de envío</span>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-4 md:mb-6">
          {vm.cartItems.map((item, index) => (
            <div
              key={item.product.id}
              className={`p-4 md:p-6 ${index !== vm.cartItems.length - 1 ? 'border-b border-gray-200' : ''}`}
            >
              <div className="flex gap-3 md:gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="text-sm md:text-sm font-medium text-gray-900 flex-1">{item.product.name}</h3>
                    <button onClick={() => vm.handleRemove(item.product.id, item.product.name)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3">
                    <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-teal-100 text-teal-700 text-[10px] md:text-xs font-medium rounded">EXCLUSIVO</span>
                    <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-purple-100 text-purple-700 text-[10px] md:text-xs font-medium rounded">PREVENTA</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => vm.handleQuantityChange(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 md:w-8 md:h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => vm.handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                        className="w-10 md:w-12 h-7 md:h-8 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                        min="1"
                        max={item.product.stock}
                      />
                      <button
                        onClick={() => vm.handleQuantityChange(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-7 h-7 md:w-8 md:h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <span className="text-base md:text-lg font-bold text-gray-900">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">{formatPrice(vm.total)}</span>
            </div>
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-600">Costo estimado de envío</span>
              <span className="font-semibold text-gray-900">{formatPrice(vm.estimatedShipping)}</span>
            </div>
            <div className="pt-2 md:pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm md:text-base font-semibold text-gray-900">Costo estimado</span>
                <span className="text-lg md:text-xl font-bold text-gray-900">{formatPrice(vm.total + vm.estimatedShipping)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={vm.handleCheckout}
            className="w-full py-3 md:py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors text-sm md:text-base"
          >
            Comprar {vm.cartItems.length} producto{vm.cartItems.length > 1 ? 's' : ''}
          </button>

          <div className="mt-3 md:mt-4 flex items-start gap-2 text-[10px] md:text-xs text-gray-500">
            <svg className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="leading-tight">Los productos del carrito se eliminarán después de 90 días.</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
