import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            {/* Nombre completo - oculto en mobile */}
            <div className="hidden md:flex flex-col">
              <span className="font-bold text-lg text-gray-900 leading-tight">e-commerce-FDT</span>
              <span className="text-xs text-gray-500">Tech Store</span>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <button className="text-sm font-medium text-gray-900 hover:text-teal-500 transition-colors">
              Productos ▼
            </button>
            <span className="text-gray-300">|</span>
            <button className="text-sm font-medium text-gray-600 hover:text-teal-500 transition-colors">
              Ofertas
            </button>
            <span className="text-gray-300">|</span>
            <button className="text-sm font-medium text-gray-600 hover:text-teal-500 transition-colors">
              Soporte
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Carrito */}
            <button className="p-2 text-gray-600 hover:text-gray-900 relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </button>

            {/* Menu Hamburguesa - Mobile */}
            <button 
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>CO</span>
              </button>

              <span className="text-gray-300">|</span>

              <button className="text-sm text-gray-600 hover:text-gray-900">
                Mi Cuenta ▼
              </button>

              <span className="text-gray-300">|</span>

              <button className="text-sm text-gray-600 hover:text-gray-900">
                Ayuda
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-3">
            <button className="block w-full text-left py-2 text-sm font-medium text-gray-900">
              Productos
            </button>
            <button className="block w-full text-left py-2 text-sm text-gray-600">
              Ofertas
            </button>
            <button className="block w-full text-left py-2 text-sm text-gray-600">
              Soporte
            </button>
            <button className="block w-full text-left py-2 text-sm text-gray-600">
              Mi Cuenta
            </button>
            <button className="block w-full text-left py-2 text-sm text-gray-600">
              Ayuda
            </button>
            <div className="pt-3 border-t border-gray-200">
              <button className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Envíos a Colombia</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
