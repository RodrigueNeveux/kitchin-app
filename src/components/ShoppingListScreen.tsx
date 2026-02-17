import { ArrowLeft, Plus, Trash2, ShoppingCart, Check, X, Sparkles, MoveRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Checkbox } from './ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  category?: string;
  listId?: string;
}

interface ShoppingLists {
  main: ShoppingItem[];
  'next-week': ShoppingItem[];
  pharmacy: ShoppingItem[];
}

interface ShoppingListScreenProps {
  lists: ShoppingLists;
  onBack: () => void;
  onToggleItem: (listId: string, id: string) => void;
  onDeleteItem: (listId: string, id: string) => void;
  onAddItem: (listId: string, name: string, quantity: string) => void;
  onMoveItem: (itemId: string, fromListId: string, toListId: string) => void;
}

// Catégories de produits
const CATEGORIES = {
  'fruits-legumes': { label: '🥕 Fruits & Légumes', emoji: '🥕' },
  'viande-poisson': { label: '🥩 Viande & Poisson', emoji: '🥩' },
  'produits-laitiers': { label: '🥛 Produits Laitiers', emoji: '🥛' },
  'epicerie': { label: '🍝 Épicerie', emoji: '🍝' },
  'boissons': { label: '🥤 Boissons', emoji: '🥤' },
  'surgeles': { label: '🧊 Surgelés', emoji: '🧊' },
  'autres': { label: '🛒 Autres', emoji: '🛒' },
};

// Suggestions de produits courants
const QUICK_ADD_SUGGESTIONS = [
  { name: 'Lait', category: 'produits-laitiers' },
  { name: 'Pain', category: 'epicerie' },
  { name: 'Œufs', category: 'produits-laitiers' },
  { name: 'Tomates', category: 'fruits-legumes' },
  { name: 'Poulet', category: 'viande-poisson' },
  { name: 'Pâtes', category: 'epicerie' },
  { name: 'Yaourt', category: 'produits-laitiers' },
  { name: 'Fromage', category: 'produits-laitiers' },
];

// Fonction pour détecter la catégorie
function detectCategory(productName: string): string {
  const name = productName.toLowerCase();
  
  if (/(tomate|carotte|pomme|banane|orange|salade|légume|fruit|oignon|ail|pomme de terre|courgette|aubergine)/i.test(name)) {
    return 'fruits-legumes';
  }
  if (/(poulet|viande|porc|bœuf|poisson|saumon|thon|jambon|steak)/i.test(name)) {
    return 'viande-poisson';
  }
  if (/(lait|yaourt|fromage|beurre|crème|œuf)/i.test(name)) {
    return 'produits-laitiers';
  }
  if (/(eau|jus|soda|café|thé|coca)/i.test(name)) {
    return 'boissons';
  }
  if (/(surgelé|glace|légumes surgelés)/i.test(name)) {
    return 'surgeles';
  }
  if (/(pâtes|riz|farine|sucre|sel|huile|sauce|conserve|pain)/i.test(name)) {
    return 'epicerie';
  }
  
  return 'autres';
}

export function ShoppingListScreen({
  lists,
  onBack,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onMoveItem,
}: ShoppingListScreenProps) {
  const [activeList, setActiveList] = useState<keyof ShoppingLists>('main');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const listConfigs = [
    { id: 'main' as keyof ShoppingLists, label: '🛒 Principale', color: 'green' },
    { id: 'next-week' as keyof ShoppingLists, label: '📅 Semaine Prochaine', color: 'blue' },
    { id: 'pharmacy' as keyof ShoppingLists, label: '⚕️ Pharmacie', color: 'red' },
  ];

  const currentItems = lists[activeList];
  const uncheckedItems = currentItems.filter((item) => !item.checked);
  const checkedItems = currentItems.filter((item) => item.checked);
  
  // Progrès
  const totalItems = currentItems.length;
  const checkedCount = checkedItems.length;
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  // Grouper par catégorie
  const itemsByCategory = uncheckedItems.reduce((acc, item) => {
    const category = item.category || detectCategory(item.name);
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const handleAddItem = (name?: string, qty?: string) => {
    const itemName = name || newItemName.trim();
    const quantity = qty || newItemQuantity.trim();
    
    if (itemName) {
      onAddItem(activeList, itemName, quantity || '1');
      setNewItemName('');
      setNewItemQuantity('1');
      setShowSuggestions(false);
    }
  };

  const handleQuickAdd = (productName: string) => {
    handleAddItem(productName, '1');
  };

  const handleClearChecked = () => {
    checkedItems.forEach(item => onDeleteItem(activeList, item.id));
  };

  const handleMoveToList = (itemId: string, toListId: keyof ShoppingLists) => {
    if (toListId !== activeList) {
      onMoveItem(itemId, activeList, toListId);
    }
  };

  // Scroller vers le bas quand un nouvel article est ajouté
  const listScrollRef = useRef<HTMLDivElement | null>(null);
  const prevLengthRef = useRef<number>(currentItems.length);

  useEffect(() => {
    const prev = prevLengthRef.current;
    const curr = currentItems.length;
    if (curr > prev) {
      // nouvel article ajouté -> scroller en bas
      try {
        listScrollRef.current?.scrollTo({ top: listScrollRef.current.scrollHeight, behavior: 'smooth' });
      } catch (e) {
        // ignore
      }
    }
    prevLengthRef.current = curr;
  }, [currentItems.length]);

  // Calculer le nombre total d'articles pour chaque liste
  const getListStats = (listId: keyof ShoppingLists) => {
    const items = lists[listId];
    const unchecked = items.filter(i => !i.checked).length;
    return { total: items.length, unchecked };
  };

  return (
    <div className="flex flex-col h-screen bg-stone-200">
      {/* Header */}
      <header className="bg-stone-100 px-4 sm:px-6 py-4 shadow-sm flex-shrink-0 transition-colors duration-300">
        <div className="flex items-center justify-between max-w-md md:max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-stone-300 transition-colors duration-300"
          >
            <ArrowLeft className="w-6 h-6 text-stone-600" />
          </button>
          <div className="text-center">
            <h1 className="text-stone-800">
              Mes Listes de Courses
            </h1>
            <p className="text-xs text-stone-500">
              {uncheckedItems.length} articles à acheter
            </p>
          </div>
          <button 
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`p-2 rounded-full transition-colors duration-300 ${
              showSuggestions 
                ? 'bg-green-200' 
                : 'hover:bg-stone-300'
            }`}
          >
            <Sparkles className={`w-6 h-6 ${
              showSuggestions 
                ? 'text-green-600' 
                : 'text-stone-600'
            }`} />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      {totalItems > 0 && (
        <div className="bg-stone-100 px-4 sm:px-6 py-3 border-b border-stone-300">
          <div className="max-w-md md:max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-600">
                Progression
              </span>
              <span className="text-sm font-medium text-green-600">
                {progress}% ({checkedCount}/{totalItems})
              </span>
            </div>
            <div className="h-2 bg-stone-300 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* List Tabs */}
      <div className="bg-stone-100/95 px-4 sm:px-6 py-3 border-b border-stone-300 flex-shrink-0 transition-colors duration-300">
        <div className="flex gap-2 max-w-md md:max-w-4xl mx-auto overflow-x-auto">
          {listConfigs.map((list) => {
            const stats = getListStats(list.id);
            return (
              <button
                key={list.id}
                onClick={() => setActiveList(list.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all relative ${
                  activeList === list.id
                    ? `bg-${list.color}-600 text-white shadow-md scale-105`
                    : 'bg-stone-300 text-stone-800 hover:bg-stone-400'
                }`}
                style={
                  activeList === list.id
                    ? {
                        backgroundColor: list.color === 'green' ? '#16a34a' : list.color === 'blue' ? '#2563eb' : '#dc2626'
                      }
                    : undefined
                }
              >
                {list.label}
                {stats.unchecked > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                    activeList === list.id 
                      ? 'bg-white/20' 
                      : 'bg-stone-400'
                  }`}>
                    {stats.unchecked}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Add Suggestions */}
      {showSuggestions && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 px-4 sm:px-6 py-4 border-b border-green-300">
          <div className="max-w-md md:max-w-4xl mx-auto">
            <p className="text-sm text-stone-700 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-600" />
              Suggestions rapides
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ADD_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAdd(suggestion.name)}
                  className="px-3 py-1.5 bg-stone-100 rounded-full text-sm text-stone-700 border border-stone-300 hover:border-green-500 hover:bg-green-100 transition-colors duration-300 shadow-sm"
                >
                  + {suggestion.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Shopping Items List */}
      <div ref={listScrollRef} className="content-with-nav flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4">
        <div className="max-w-md md:max-w-4xl mx-auto space-y-6">
          {/* Unchecked Items - Grouped by Category */}
          {Object.entries(itemsByCategory).map(([categoryKey, categoryItems]) => (
            <div key={categoryKey} className="space-y-2">
              <h3 className="text-sm font-medium text-stone-700 px-2 flex items-center gap-2">
                <span>{CATEGORIES[categoryKey as keyof typeof CATEGORIES]?.label || '🛒 Autres'}</span>
                <span className="text-xs text-stone-500">
                  ({categoryItems.length})
                </span>
              </h3>
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-100/90 rounded-xl p-4 shadow-sm border border-stone-300 flex items-center gap-3 transition-all hover:shadow-md group"
                >
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => onToggleItem(activeList, item.id)}
                    className="border-stone-300"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-stone-500">
                      Quantité : {item.quantity}
                    </p>
                  </div>
                  
                  {/* Move to other list button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-300 opacity-0 group-hover:opacity-100">
                        <MoveRight className="w-4 h-4 text-blue-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {listConfigs
                        .filter(list => list.id !== activeList)
                        .map(list => (
                          <DropdownMenuItem
                            key={list.id}
                            onClick={() => handleMoveToList(item.id, list.id)}
                          >
                            Déplacer vers {list.label}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <button
                    onClick={() => onDeleteItem(activeList, item.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          ))}

          {uncheckedItems.length === 0 && checkedItems.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-stone-500 mx-auto mb-4" />
              <p className="text-stone-500">
                Cette liste est vide
              </p>
              <p className="text-sm text-stone-500 mt-1">
                Ajoutez des articles ci-dessous
              </p>
            </div>
          )}

          {/* Checked Items */}
          {checkedItems.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-stone-300">
              <div className="flex items-center justify-between px-2 mb-3">
                <h3 className="text-sm font-medium text-stone-700 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Articles achetés ({checkedItems.length})
                </h3>
                <button
                  onClick={handleClearChecked}
                  className="text-xs text-red-600 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Tout effacer
                </button>
              </div>
              {checkedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-200 rounded-xl p-4 flex items-center gap-3 opacity-60 transition-all hover:opacity-80"
                >
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => onToggleItem(activeList, item.id)}
                    className="border-stone-300"
                  />
                  <div className="flex-1">
                    <p className="text-stone-600 line-through">
                      {item.name}
                    </p>
                    <p className="text-sm text-stone-500 line-through">
                      Quantité : {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteItem(activeList, item.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-300"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Item Section - fixé en bas sur mobile, intégré sur desktop */}
      <div
        className="flex-shrink-0 bg-stone-100 border-t border-stone-300 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]  sm:shadow-none transition-colors duration-300"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}
      >
        <div className="max-w-md md:max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-600" />
            Ajouter un article
          </p>
          {/* Mobile : champs empilés pour plus de confort tactile */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Nom du produit"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              onFocus={() => setShowSuggestions(true)}
              className="flex-1 min-w-0 px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-stone-100 text-stone-800 placeholder:text-stone-500"
            />
            <div className="flex gap-2 sm:gap-3">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Qté"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                className="w-16 sm:w-20 px-3 py-3 sm:py-2.5 text-base sm:text-sm text-center border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-stone-100 text-stone-800 placeholder:text-stone-500"
              />
              <button
                onClick={() => handleAddItem()}
                className="flex-1 sm:flex-none px-5 py-3 sm:py-2.5 min-h-[44px] min-w-[44px] bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl transition-colors duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 "
                aria-label="Ajouter l'article"
              >
                <Plus className="w-5 h-5 sm:w-5 sm:h-5" />
                <span className="sm:hidden">Ajouter</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
