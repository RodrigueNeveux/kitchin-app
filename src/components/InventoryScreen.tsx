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
}

export function InventoryScreen({
  products,
  onBack,
  onUpdateQuantity,
  onDeleteProduct,
  onAddProduct,
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
    <div className="flex flex-col h-screen bg-stone-200">
      {/* Header */}
      <header className="bg-stone-100 px-6 py-4 shadow-sm flex-shrink-0 transition-colors duration-300">
        <div className="flex items-center justify-between max-w-md md:max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-stone-300 transition-colors duration-300"
          >
            <ArrowLeft className="w-6 h-6 text-stone-600" />
          </button>
          <h1 className="text-stone-800">
            Mon Inventaire
          </h1>
          <button 
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) {
                setSearchQuery('');
              }
            }}
            className="p-2 rounded-full hover:bg-stone-300 transition-colors duration-300"
          >
            {showSearch ? (
              <X className="w-6 h-6 text-stone-600" />
            ) : (
              <Search className="w-6 h-6 text-stone-600" />
            )}
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="bg-stone-100 px-6 py-3 border-b border-stone-300 flex-shrink-0 transition-colors duration-300">
          <div className="max-w-md md:max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-stone-800 placeholder:text-stone-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-stone-300 rounded-full transition-colors duration-300"
                >
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className="bg-stone-100 px-6 py-3 border-b border-stone-300 flex-shrink-0 transition-colors duration-300">
        <div className="flex gap-2 max-w-md md:max-w-4xl mx-auto overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as any)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors duration-300 ${
                activeCategory === category.id
                  ? 'bg-green-600 text-white'
                  : 'bg-stone-300 text-stone-800 hover:bg-stone-400'
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
              <p className="text-stone-500">
                {searchQuery
                  ? `Aucun produit trouvé pour "${searchQuery}"`
                  : 'Aucun produit dans cette catégorie'}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-stone-100 rounded-xl p-4 shadow-sm border border-stone-300 transition-colors duration-300"
            >
              <div className="flex items-start gap-3">
                {/* Product Image */}
                <div className="w-16 h-16 bg-stone-200 rounded-lg overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-500 text-2xl">
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
                  <p className="text-stone-800">
                    {product.name}
                  </p>
                  <p className="text-sm text-stone-600">
                    x{product.quantity}
                  </p>
                  {product.expiryDate && (
                    <p
                      className={`text-sm ${
                        isExpiringSoon(product.daysUntilExpiry)
                          ? 'text-red-600'
                          : 'text-stone-500'
                      }`}
                    >
                      Périme le {product.expiryDate}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1 bg-stone-200 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQuantity(product.id, -1)}
                      className="p-1 hover:bg-stone-300 rounded transition-colors duration-300"
                      disabled={product.quantity <= 1}
                    >
                      <Minus className="w-4 h-4 text-stone-600" />
                    </button>
                    <button
                      onClick={() => onUpdateQuantity(product.id, 1)}
                      className="p-1 hover:bg-stone-300 rounded transition-colors duration-300"
                    >
                      <Plus className="w-4 h-4 text-stone-600" />
                    </button>
                  </div>
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="p-1 hover:bg-red-100 rounded transition-colors duration-300"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
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

    </div>
  );
}
