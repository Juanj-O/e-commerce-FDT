import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { HeroSlider } from '../components/HeroSlider';
import { ProductGrid } from '../components/ProductGrid';
import { fetchProducts } from '../features/products/productsSlice';

const CATEGORIES = ['Todo', 'Electrónicos', 'Computadoras', 'Audio', 'Wearables', 'Accesorios'];

const ANNOUNCEMENTS = [
  {
    id: 1,
    tag: 'NUEVO',
    title: '🎉 [Oferta Especial] Preventa: Nuevos productos con hasta 30% de descuento',
    date: '28 ene. 2026',
  },
  {
    id: 2,
    tag: 'PROMO',
    title: '🎁 [Ecommerce - W] Regalo especial en compras superiores a $500.000',
    date: '25 ene. 2026',
  },
  {
    id: 3,
    tag: 'INFO',
    title: '📦 [Envío Gratis] Entregas sin costo en Bogotá y área metropolitana',
    date: '20 ene. 2026',
  },
  {
    id: 4,
    tag: 'TECH',
    title: '⚡ Llegan los últimos modelos de smartphones y laptops',
    date: '15 ene. 2026',
  },
];

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.products);
  const [activeCategory, setActiveCategory] = useState('Merch');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero Slider */}
      <HeroSlider />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Products Section */}
          <div className="flex-1">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              {/* Section Title */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Productos</h2>
              </div>

              {/* Category Tabs */}
              <div className="mb-6 -mx-5 px-5 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 min-w-max pb-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                        activeCategory === category
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                  <button className="px-4 py-2 rounded-full text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 whitespace-nowrap">
                    ⋮
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              <ProductGrid
                products={items}
                loading={loading}
                error={error}
                onRetry={() => dispatch(fetchProducts())}
              />
            </div>
          </div>

          {/* Announcements Sidebar */}
          <aside className="lg:w-80 xl:w-96">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm sticky top-20">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 text-lg">Novedades</h3>
                <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                  Ver todo ›
                </button>
              </div>
              <div className="space-y-4">
                {ANNOUNCEMENTS.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="group cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded font-semibold shrink-0">
                        {announcement.tag}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 mb-1.5 leading-snug">
                          {announcement.title}
                        </h4>
                        <p className="text-xs text-gray-500">{announcement.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DashboardPage;
