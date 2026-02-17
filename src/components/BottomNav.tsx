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
    // Mobile: bottom bar avec safe area. Desktop (md+): barre latérale gauche
    <nav className="nav-bottom fixed bottom-0 left-0 right-0 md:top-0 md:bottom-0 md:left-0 md:w-24 md:pt-[env(safe-area-inset-top,0px)] md:pb-0 bg-stone-100 border-t border-stone-300 md:border-r md:border-t-0 z-50 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="nav-bottom-inner flex justify-around items-center px-2 sm:px-4 py-2 max-w-md mx-auto md:flex-col md:items-center md:py-6 md:gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          const showBadge = item.id === 'inventory' && notificationCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="nav-btn flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-colors min-w-[48px] min-h-[44px] sm:min-w-[56px] sm:min-h-[48px] py-1 relative md:w-full md:min-w-0 md:min-h-0 md:py-0"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${isActive ? 'text-green-600' : 'text-stone-500'}`}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </div>
              {/* Label: hidden on very small screens, visible on md and up (sidebar and larger screens) */}
              <span className={`text-xs hidden md:block transition-colors ${isActive ? 'text-green-600' : 'text-stone-500'}`}>
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
