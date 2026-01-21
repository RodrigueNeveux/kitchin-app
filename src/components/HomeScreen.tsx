import { memo } from 'react';
import { User, UserPlus, ChevronRight, Bell } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Product {
  id: string;
  name: string;
  expiryDate?: string;
  quantity?: number;
  image?: string;
  daysUntilExpiry?: number;
}

interface HomeScreenProps {
  expiringProducts: Product[];
  fridgeProducts: Product[];
  household?: { name: string };
  onProfileClick: () => void;
  onInviteClick: () => void;
  onViewAllExpiring?: () => void;
  onViewAllFridge?: () => void;
  onNotificationsClick?: () => void;
}

function HomeScreenComponent({ 
  expiringProducts, 
  fridgeProducts, 
  household,
  onProfileClick,
  onInviteClick,
  onViewAllExpiring,
  onViewAllFridge,
  onNotificationsClick
}: HomeScreenProps) {
  const notificationCount = expiringProducts.length;
  
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 px-6 py-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button 
            onClick={onNotificationsClick}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
          >
            <Bell className={`w-6 h-6 text-gray-600 dark:text-gray-300 ${notificationCount > 0 ? 'bell-ring' : ''}`} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
          <h1 className="text-green-700 dark:text-green-400">Kitch'In</h1>
          <button 
            onClick={onProfileClick}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* Household Info Banner */}
      <div className="bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 px-6 py-4 mx-4 mt-4 rounded-xl shadow-sm transition-colors">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Mon foyer
            </p>
            <h2 className="text-green-800 dark:text-green-100">
              {household?.name || 'Mon Foyer'}
            </h2>
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Bouton Ajouter (HomeScreen) cliqué');
              onInviteClick();
            }}
            className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-green-600 rounded-lg text-sm text-green-700 dark:text-white hover:bg-green-50 dark:hover:bg-green-700 transition-colors shadow-sm dark:shadow-md relative z-10 cursor-pointer active:scale-95 transform"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-green-700 dark:text-white" style={{ color: 'inherit', WebkitTextFillColor: 'inherit' }}>
              Ajouter
            </span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-32">
        <div className="max-w-md mx-auto space-y-6">
          {/* À Consommer Rapidement Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-gray-900 dark:text-white">
                  À Consommer Rapidement
                </h3>
                {notificationCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewAllExpiring?.();
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {expiringProducts.length === 0 ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-800 dark:text-green-300 mb-1">
                    Tout est en ordre !
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Aucun produit à consommer rapidement
                  </p>
                </div>
              ) : (
                expiringProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center gap-3 transition-colors"
                  >
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                          🥗
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Périme le {product.expiryDate}
                      </p>
                      {product.daysUntilExpiry !== undefined && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.daysUntilExpiry === 0
                            ? "Aujourd'hui"
                            : `Dans ${product.daysUntilExpiry} jour${product.daysUntilExpiry > 1 ? 's' : ''}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Inventaire du Frigo Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-900 dark:text-white">
                Inventaire du Frigo
              </h3>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewAllFridge?.();
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {fridgeProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                          🥛
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      {product.expiryDate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Périme le {product.expiryDate}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    x{product.quantity}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Memoization pour éviter les re-renders inutiles
export const HomeScreen = memo(HomeScreenComponent);
