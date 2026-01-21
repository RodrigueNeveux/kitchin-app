import { memo } from 'react';
import { Home, Package, ShoppingCart, ChefHat } from 'lucide-react';

interface BottomNavProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
  notificationCount?: number;
}

function BottomNavComponent({ activeScreen, onNavigate, notificationCount = 0 }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'inventory', label: 'Inventaire', icon: Package },
    { id: 'lists', label: 'Courses', icon: ShoppingCart },
    { id: 'recipes', label: 'Recettes', icon: ChefHat },
  ];

  return (
    // Mobile: bottom bar. Desktop (md+): vertical left sidebar
    <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-0 md:left-0 md:w-24 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:border-r md:border-t-0 z-50 safe-area-inset-bottom transition-colors">
      <div className="flex justify-around items-center px-4 py-2 max-w-md mx-auto md:flex-col md:items-center md:py-6 md:gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          const showBadge = item.id === 'inventory' && notificationCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-1 transition-colors min-w-[48px] relative md:w-full md:justify-center"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </div>
              {/* Label: hidden on very small screens, visible on md and up (sidebar and larger screens) */}
              <span className={`text-xs hidden md:block ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Memoization pour éviter les re-renders inutiles
export const BottomNav = memo(BottomNavComponent);
