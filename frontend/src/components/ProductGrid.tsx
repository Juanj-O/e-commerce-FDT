import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const ProductGrid = ({ products, loading, error, onRetry }: ProductGridProps) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
        <p className="text-sm">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium underline"
          >
            Intentar de nuevo
          </button>
        )}
      </div>
    );
  }

  // Empty State
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="text-gray-500">No hay productos disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => handleProductClick(product)}
          formatPrice={formatPrice}
        />
      ))}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  formatPrice: (price: number) => string;
}

const ProductCard = ({ product, onClick, formatPrice }: ProductCardProps) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      className="bg-white rounded-xl overflow-hidden flex flex-col group cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200"
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Stock Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              AGOTADO
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4 flex flex-col flex-1">
        <h3 className="text-xs md:text-sm font-semibold text-gray-900 line-clamp-2 mb-2 md:mb-3 min-h-[2rem] md:min-h-[2.5rem] leading-snug">
          {product.name}
        </h3>
        <div className="mt-auto space-y-1.5 md:space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-base md:text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          </div>
          {product.stock > 0 && product.stock <= 5 ? (
            <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
              ¡ÚLTIMAS!
            </span>
          ) : product.stock > 0 && product.stock <= 10 ? (
            <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
              LIMITADO
            </span>
          ) : product.stock > 0 ? (
            <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold bg-green-100 text-green-700 rounded-full">
              DISPONIBLE
            </span>
          ) : null}
        </div>
        {product.stock > 0 && product.stock <= 5 && (
          <div className="hidden md:flex mt-3 pt-3 border-t border-gray-100 items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Envío rápido</span>
          </div>
        )}
      </div>
    </div>
  );
};
