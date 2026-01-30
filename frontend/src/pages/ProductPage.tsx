import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useProductViewModel } from '../hooks/useProductViewModel';
import { formatPrice } from '../utils/formatters';
import type { Product } from '../types';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vm = useProductViewModel(id);

  if (vm.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex items-center justify-center py-20 flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-emerald-500 border-t-transparent" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!vm.product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h2>
          <button
            onClick={() => navigate('/')}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            ← Volver al inicio
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
              {vm.product.imageUrl ? (
                <img
                  src={vm.product.imageUrl}
                  alt={vm.product.name}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate('/')}>
                Tecnología
              </span>
              <span>›</span>
            </div>

            <h1 className="text-xl md:text-2xl font-normal text-gray-900 mb-4">
              {vm.product.name}
            </h1>

            <div className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(vm.product.price)}
                </span>
              </div>
              <div className="text-sm text-blue-600 font-medium mt-1">
                Cash máximo {formatPrice(vm.product.price * 0.02)}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">Random</label>
            </div>

            {!vm.isOutOfStock && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => vm.handleQuantityChange(vm.quantity - 1)}
                    disabled={vm.quantity <= 1}
                    className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={vm.quantity}
                    onChange={(e) => vm.handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 h-10 text-center border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400"
                    min="1"
                    max={vm.product.stock}
                  />
                  <button
                    onClick={() => vm.handleQuantityChange(vm.quantity + 1)}
                    disabled={vm.quantity >= vm.product.stock}
                    className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <div className="ml-auto text-right">
                    <div className="text-sm text-gray-500">COP</div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(vm.product.price * vm.quantity)}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">{vm.quantity} unidad(es)</span>
                  <div className="text-gray-500 mt-1">
                    Puedes comprar hasta {vm.product.stock} unidad(es).
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={vm.handleAddToCart}
                disabled={vm.isOutOfStock}
                className="flex-1 px-6 py-3 border-2 border-teal-500 text-teal-600 font-semibold rounded-xl hover:bg-teal-50 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Agregar al Carrito
              </button>
              <button
                onClick={vm.handleBuyNow}
                disabled={vm.isOutOfStock}
                className="flex-1 px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {vm.isOutOfStock ? 'Agotado' : 'Comprar'}
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-start gap-2 text-sm">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Envío disponible</p>
                  <p className="text-gray-500 mt-1">
                    El método de envío y el costo de envío se pueden confirmar en la etapa de pago.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="border-t border-gray-200">
            <div className="border-b border-gray-200">
              <button
                onClick={() => vm.setIsInfoOpen(!vm.isInfoOpen)}
                className="w-full flex items-center justify-between py-5 text-left hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900">Información</h2>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${vm.isInfoOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {vm.isInfoOpen && (
                <div className="pb-6">
                  <ProductSpecifications product={vm.product} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

interface ProductSpecificationsProps {
  product: Product;
}

const ProductSpecifications = ({ product }: ProductSpecificationsProps) => {
  const specifications = [
    { label: 'Nombre del Producto', value: product.name },
    { label: 'Marca', value: 'Tech Store' },
    { label: 'Modelo', value: product.id.toUpperCase() },
    { label: 'Categoría', value: 'Electrónicos' },
    { label: 'Disponibilidad', value: product.stock > 0 ? `${product.stock} unidades` : 'Agotado' },
    { label: 'Garantía', value: '12 meses' },
    { label: 'País de origen', value: 'Colombia' },
    { label: 'Condición', value: 'Nuevo' },
    { label: 'Peso', value: '1.5 kg' },
    { label: 'Dimensiones', value: '30 x 20 x 10 cm' },
  ];

  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden">
      <table className="w-full">
        <tbody>
          {specifications.map((spec, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 text-sm font-medium text-gray-700 w-1/3">{spec.label}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductPage;
