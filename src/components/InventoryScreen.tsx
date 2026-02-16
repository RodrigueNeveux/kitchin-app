import { ArrowLeft, Search, Plus, Minus, Trash2, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  quantity: number;
  expiryDate?: string;
  image?: string;
  category: 'fridge' | 'pantry' | 'freezer';
  daysUntilExpiry?: number;
}

interface InventoryScreenProps {
  products: Product[];
  onBack: () => void;
  onUpdateQuantity: (id: string, change: number) => void;
  onDeleteProduct: (id: string) => void;
  onAddProduct: () => void;
  onAddSampleIngredients?: () => void;
}

export function InventoryScreen({
  products,
  onBack,
  onUpdateQuantity,
  onDeleteProduct,
  onAddProduct,
  onAddSampleIngredients,
}: InventoryScreenProps) {
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'fridge' | 'pantry' | 'freezer'
  >('fridge');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const categories = [
    { id: 'all', label: 'Tout' },
    { id: 'fridge', label: 'Frigo' },
    { id: 'pantry', label: 'Placard' },
    { id: 'freezer', label: 'Congélateur' },
  ];

  // Filter by category first
  const categoryFiltered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  // Then filter by search query
  const filteredProducts = categoryFiltered.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isExpiringSoon = (daysUntilExpiry?: number) => {
    return daysUntilExpiry !== undefined && daysUntilExpiry <= 3;
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-stone-900/95 px-6 py-4 shadow-sm flex-shrink-0 transition-colors duration-300">
        <div className="flex items-center justify-between max-w-md md:max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-gray-900 dark:text-white">
            Mon Inventaire
          </h1>
          <button 
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) {
                setSearchQuery('');
              }
            }}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            {showSearch ? (
              <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <Search className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="bg-white dark:bg-stone-900/95 px-6 py-3 border-b border-stone-200 dark:border-stone-700/50 flex-shrink-0 transition-colors duration-300">
          <div className="max-w-md md:max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors duration-300"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className="bg-white dark:bg-stone-900/95 px-6 py-3 border-b border-stone-200 dark:border-stone-700/50 flex-shrink-0 transition-colors duration-300">
        <div className="flex gap-2 max-w-md md:max-w-4xl mx-auto overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as any)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors duration-300 ${
                activeCategory === category.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-40">
        <div className="max-w-md md:max-w-4xl mx-auto space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? `Aucun produit trouvé pour "${searchQuery}"`
                  : 'Aucun produit dans cette catégorie'}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-stone-900/95 rounded-xl p-4 shadow-sm transition-colors duration-300"
            >
              <div className="flex items-start gap-3">
                {/* Product Image */}
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                      {product.category === 'fridge'
                        ? '🥗'
                        : product.category === 'freezer'
                        ? '🧊'
                        : '📦'}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-600" style={{ color: '#4b5563', WebkitTextFillColor: '#4b5563' }}>
                    x{product.quantity}
                  </p>
                  {product.expiryDate && (
                    <p
                      className={`text-sm ${
                        isExpiringSoon(product.daysUntilExpiry)
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      Périme le {product.expiryDate}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQuantity(product.id, -1)}
                      className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors duration-300"
                      disabled={product.quantity <= 1}
                    >
                      <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => onUpdateQuantity(product.id, 1)}
                      className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors duration-300"
                    >
                      <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors duration-300"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <button 
        onClick={onAddProduct}
        className="fixed bottom-24 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors duration-300"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Quick Add Ingredients Button (only show if inventory is empty) */}
      {products.length === 0 && onAddSampleIngredients && (
        <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={onAddSampleIngredients}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg transition-colors duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Ajouter des ingrédients de base
          </button>
        </div>
      )}
    </div>
  );
}
