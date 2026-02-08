import { ArrowLeft, Bell, AlertTriangle, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  quantity: number;
  expiryDate?: string;
  image?: string;
  category: 'fridge' | 'pantry' | 'freezer';
  daysUntilExpiry?: number;
}

interface Notification {
  id: string;
  type: 'expiring_soon' | 'expired' | 'low_stock';
  product: Product;
  message: string;
  date: string;
  read: boolean;
}

interface NotificationsScreenProps {
  products: Product[];
  onBack: () => void;
  onNavigateToInventory: () => void;
}

export function NotificationsScreen({ products, onBack, onNavigateToInventory }: NotificationsScreenProps) {
  // Générer les notifications basées sur les produits
  const generateNotifications = (dismissed: string[] = []): Notification[] => {
    const notifications: Notification[] = [];
    
    products.forEach(product => {
      if (product.daysUntilExpiry !== undefined) {
        if (product.daysUntilExpiry < 0) {
          // Produit périmé
          notifications.push({
            id: `exp-${product.id}`,
            type: 'expired',
            product,
            message: `${product.name} est périmé depuis ${Math.abs(product.daysUntilExpiry)} jour(s)`,
            date: new Date().toISOString(),
            read: false,
          });
        } else if (product.daysUntilExpiry === 0) {
          // Expire aujourd'hui
          notifications.push({
            id: `today-${product.id}`,
            type: 'expiring_soon',
            product,
            message: `${product.name} expire aujourd'hui !`,
            date: new Date().toISOString(),
            read: false,
          });
        } else if (product.daysUntilExpiry <= 3) {
          // Expire bientôt
          notifications.push({
            id: `soon-${product.id}`,
            type: 'expiring_soon',
            product,
            message: `${product.name} expire dans ${product.daysUntilExpiry} jour(s)`,
            date: new Date().toISOString(),
            read: false,
          });
        }
      }
    });
    
    const sorted = notifications.sort((a, b) => {
      // Tri par priorité : périmés > aujourd'hui > bientôt
      const priorityOrder = { expired: 0, expiring_soon: 1, low_stock: 2 };
      return priorityOrder[a.type] - priorityOrder[b.type];
    });
    // Filtrer les notifications qui ont été supprimées par l'utilisateur
    return sorted.filter(n => !dismissed.includes(n.id));
  };

  // Charger les notifications ignorées (IDs supprimés) depuis localStorage
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('dismissedNotifications');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => generateNotifications(dismissedIds));

  // Regénérer les notifications si les produits changent ou si la liste des dismissed change
  useEffect(() => {
    setNotifications(generateNotifications(dismissedIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, dismissedIds]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    // Ajouter l'ID aux dismissedIds et le sauvegarder en localStorage
    setDismissedIds(prev => {
      const next = Array.from(new Set([...prev, id]));
      try {
        localStorage.setItem('dismissedNotifications', JSON.stringify(next));
      } catch (e) {
        console.error('Impossible de sauvegarder dismissedNotifications', e);
      }
      return next;
    });
    // Mettre à jour l'état local immédiatement
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'expiring_soon':
        return <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'low_stock':
        return <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'expired':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'expiring_soon':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'low_stock':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 px-6 py-4 shadow-sm flex-shrink-0 transition-colors">
        <div className="flex items-center justify-between max-w-md md:max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h1 className="text-gray-900 dark:text-white">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        <div className="max-w-md md:max-w-4xl mx-auto space-y-4">
          {/* Actions */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Tout marquer comme lu
              </button>
            </div>
          )}

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-2">
                Aucune notification
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Tous vos produits sont en bon état !
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-all ${
                    getNotificationColor(notification.type)
                  } ${notification.read ? 'opacity-60' : 'shadow-sm'}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToInventory();
                          }}
                          className="text-xs text-green-600 dark:text-green-400 hover:underline"
                        >
                          Voir dans l'inventaire
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notification.id);
                      }}
                      className="flex-shrink-0 p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          {notifications.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                  <svg className="w-full h-full text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-900 dark:text-blue-300">
                    <strong>Conseil :</strong> Consultez la section Recettes pour trouver des idées pour utiliser vos produits avant qu'ils ne périment !
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
