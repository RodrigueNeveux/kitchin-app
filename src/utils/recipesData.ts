// Base de données complète de recettes françaises
import type { Recipe } from '../components/RecipesScreen';
import { convertUnits, replaceWithWordBoundaries } from './translationHelpers';

export const frenchRecipes: Recipe[] = [
  {
    id: 'fr-1',
    name: 'Pâtes Carbonara',
    image: 'https://images.unsplash.com/photo-1588013273468-315fd88ea34c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGNhcmJvbmFyYXxlbnwxfHx8fDE3NjA4OTc2NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    difficulty: 'Facile',
    category: 'Plat principal',
    ingredients: [
      { item: 'Pâtes', quantity: '400g' },
      { item: 'Lardons', quantity: '200g' },
      { item: 'Œufs', quantity: '4' },
      { item: 'Parmesan', quantity: '100g' },
      { item: 'Poivre', quantity: 'Au goût' },
    ],
    steps: [
      'Faire cuire les pâtes dans de l\'eau salée bouillante selon les instructions du paquet.',
      'Pendant ce temps, faire revenir les lardons dans une poêle sans matière grasse.',
      'Battre les œufs avec le parmesan râpé dans un bol.',
      'Égoutter les pâtes et les remettre dans la casserole hors du feu.',
      'Ajouter les lardons et le mélange œufs-parmesan, mélanger rapidement.',
      'Servir immédiatement avec du poivre fraîchement moulu.',
    ],
  },
  {
    id: 'fr-2',
    name: 'Poulet Rôti aux Légumes',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2FzdCUyMGNoaWNrZW58ZW58MXx8fHwxNzYwOTI1NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 20,
    cookTime: 60,
    servings: 6,
    difficulty: 'Moyen',
    category: 'Plat principal',
    ingredients: [
      { item: 'Poulet entier', quantity: '1.5kg' },
      { item: 'Carottes', quantity: '4' },
      { item: 'Pommes de terre', quantity: '6' },
      { item: 'Oignon', quantity: '2' },
      { item: 'Huile d\'olive', quantity: '3 c. à soupe' },
      { item: 'Herbes de Provence', quantity: '2 c. à café' },
      { item: 'Sel et poivre', quantity: 'Au goût' },
    ],
    steps: [
      'Préchauffer le four à 200°C.',
      'Laver et couper les légumes en gros morceaux.',
      'Placer le poulet dans un plat à four et l\'entourer de légumes.',
      'Arroser d\'huile d\'olive, saler, poivrer et saupoudrer d\'herbes.',
      'Enfourner pour 60 minutes en arrosant régulièrement.',
      'Vérifier la cuisson : le jus doit être clair.',
      'Laisser reposer 10 minutes avant de découper.',
    ],
  },
  {
    id: 'fr-3',
    name: 'Quiche Lorraine',
    image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWljaGV8ZW58MXx8fHwxNzYwOTI1NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 15,
    cookTime: 35,
    servings: 6,
    difficulty: 'Facile',
    category: 'Plat principal',
    ingredients: [
      { item: 'Pâte brisée', quantity: '1' },
      { item: 'Lardons', quantity: '200g' },
      { item: 'Œufs', quantity: '3' },
      { item: 'Crème fraîche', quantity: '200ml' },
      { item: 'Lait', quantity: '100ml' },
      { item: 'Fromage râpé', quantity: '100g' },
      { item: 'Sel et poivre', quantity: 'Au goût' },
    ],
    steps: [
      'Préchauffer le four à 180°C.',
      'Étaler la pâte dans un moule à tarte et piquer le fond.',
      'Faire revenir les lardons dans une poêle.',
      'Battre les œufs avec la crème et le lait, saler et poivrer.',
      'Répartir les lardons sur la pâte.',
      'Verser le mélange œufs-crème et parsemer de fromage.',
      'Enfourner 35 minutes jusqu\'à ce que la quiche soit dorée.',
    ],
  },
  {
    id: 'fr-4',
    name: 'Ratatouille Provençale',
    image: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXRhdG91aWxsZXxlbnwxfHx8fDE3NjA5MjU1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 20,
    cookTime: 40,
    servings: 4,
    difficulty: 'Facile',
    category: 'Accompagnement',
    ingredients: [
      { item: 'Aubergines', quantity: '2' },
      { item: 'Courgettes', quantity: '2' },
      { item: 'Poivrons', quantity: '2' },
      { item: 'Tomates', quantity: '4' },
      { item: 'Oignon', quantity: '1' },
      { item: 'Ail', quantity: '3 gousses' },
      { item: 'Huile d\'olive', quantity: '4 c. à soupe' },
      { item: 'Herbes de Provence', quantity: '1 c. à café' },
    ],
    steps: [
      'Laver et couper tous les légumes en dés.',
      'Faire revenir l\'oignon et l\'ail dans l\'huile d\'olive.',
      'Ajouter les aubergines et faire cuire 5 minutes.',
      'Ajouter les courgettes et les poivrons, cuire 5 minutes.',
      'Incorporer les tomates et les herbes.',
      'Couvrir et laisser mijoter 30 minutes à feu doux.',
      'Ajuster l\'assaisonnement et servir chaud ou froid.',
    ],
  },
  {
    id: 'fr-5',
    name: 'Blanquette de Veau',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGV3fGVufDF8fHx8MTc2MDkyNTUzMnww&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 20,
    cookTime: 90,
    servings: 6,
    difficulty: 'Difficile',
    category: 'Plat principal',
    ingredients: [
      { item: 'Veau', quantity: '1kg' },
      { item: 'Carottes', quantity: '3' },
      { item: 'Champignons', quantity: '250g' },
      { item: 'Oignon', quantity: '2' },
      { item: 'Bouillon de volaille', quantity: '1L' },
      { item: 'Crème fraîche', quantity: '200ml' },
      { item: 'Œufs', quantity: '2' },
      { item: 'Citron', quantity: '1' },
    ],
    steps: [
      'Couper le veau en morceaux et blanchir 5 minutes.',
      'Dans une cocotte, mettre le veau, les carottes et l\'oignon.',
      'Couvrir de bouillon et cuire 1h30 à feu doux.',
      'Ajouter les champignons 15 minutes avant la fin.',
      'Mélanger les jaunes d\'œufs avec la crème et le jus de citron.',
      'Retirer la viande et les légumes, filtrer le bouillon.',
      'Incorporer le mélange œufs-crème hors du feu.',
      'Remettre viande et légumes, réchauffer sans bouillir.',
    ],
  },
  {
    id: 'fr-6',
    name: 'Gratin Dauphinois',
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c647?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3RhdG8lMjBncmF0aW58ZW58MXx8fHwxNzYwOTI1NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 20,
    cookTime: 60,
    servings: 6,
    difficulty: 'Facile',
    category: 'Accompagnement',
    ingredients: [
      { item: 'Pommes de terre', quantity: '1kg' },
      { item: 'Lait', quantity: '500ml' },
      { item: 'Crème fraîche', quantity: '200ml' },
      { item: 'Ail', quantity: '2 gousses' },
      { item: 'Beurre', quantity: '30g' },
      { item: 'Sel et poivre', quantity: 'Au goût' },
      { item: 'Noix de muscade', quantity: '1 pincée' },
    ],
    steps: [
      'Préchauffer le four à 160°C.',
      'Éplucher et couper les pommes de terre en fines rondelles.',
      'Frotter un plat à gratin avec l\'ail et le beurrer.',
      'Disposer les pommes de terre en couches.',
      'Mélanger le lait et la crème, saler, poivrer, ajouter la muscade.',
      'Verser sur les pommes de terre.',
      'Enfourner 60 minutes jusqu\'à obtenir une belle croûte dorée.',
    ],
  },
  {
    id: 'fr-7',
    name: 'Bœuf Bourguignon',
    image: 'https://images.unsplash.com/photo-1600659811958-1cb6f598b6f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWVmJTIwc3Rld3xlbnwxfHx8fDE3NjA5MjU1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 30,
    cookTime: 180,
    servings: 6,
    difficulty: 'Difficile',
    category: 'Plat principal',
    ingredients: [
      { item: 'Bœuf à braiser', quantity: '1.2kg' },
      { item: 'Vin rouge', quantity: '750ml' },
      { item: 'Lardons', quantity: '150g' },
      { item: 'Carottes', quantity: '4' },
      { item: 'Oignon', quantity: '2' },
      { item: 'Champignons', quantity: '250g' },
      { item: 'Bouquet garni', quantity: '1' },
      { item: 'Farine', quantity: '2 c. à soupe' },
    ],
    steps: [
      'Couper le bœuf en cubes et le faire mariner dans le vin rouge 2h.',
      'Faire revenir les lardons puis réserver.',
      'Faire dorer les morceaux de bœuf égouttés et farinés.',
      'Ajouter les carottes et oignons coupés.',
      'Verser la marinade et ajouter le bouquet garni.',
      'Couvrir et laisser mijoter 3h à feu très doux.',
      'Ajouter les champignons 30 minutes avant la fin.',
      'Servir avec des pommes de terre ou des pâtes fraîches.',
    ],
  },
  {
    id: 'fr-8',
    name: 'Soupe à l\'Oignon Gratinée',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmlvbiUyMHNvdXB8ZW58MXx8fHwxNzYwOTI1NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 15,
    cookTime: 45,
    servings: 4,
    difficulty: 'Moyen',
    category: 'Entrée',
    ingredients: [
      { item: 'Oignon', quantity: '6' },
      { item: 'Beurre', quantity: '50g' },
      { item: 'Bouillon de bœuf', quantity: '1.5L' },
      { item: 'Vin blanc', quantity: '100ml' },
      { item: 'Pain', quantity: '8 tranches' },
      { item: 'Fromage râpé', quantity: '200g' },
      { item: 'Sel et poivre', quantity: 'Au goût' },
    ],
    steps: [
      'Émincer finement les oignons.',
      'Faire fondre le beurre et y faire caraméliser les oignons 30 min.',
      'Ajouter le vin blanc et laisser réduire.',
      'Verser le bouillon, saler, poivrer et cuire 15 minutes.',
      'Préchauffer le grill du four.',
      'Répartir la soupe dans des bols allant au four.',
      'Déposer une tranche de pain et couvrir de fromage.',
      'Gratiner au four 5 minutes jusqu\'à ce que le fromage soit doré.',
    ],
  },
  {
    id: 'fr-9',
    name: 'Tartiflette',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXJ0aWZsZXR0ZXxlbnwxfHx8fDE3NjA5MjU1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    difficulty: 'Facile',
    category: 'Plat principal',
    ingredients: [
      { item: 'Pommes de terre', quantity: '1kg' },
      { item: 'Reblochon', quantity: '1' },
      { item: 'Lardons', quantity: '200g' },
      { item: 'Oignon', quantity: '2' },
      { item: 'Vin blanc', quantity: '10cl' },
      { item: 'Crème fraîche', quantity: '100ml' },
      { item: 'Sel et poivre', quantity: 'Au goût' },
    ],
    steps: [
      'Faire cuire les pommes de terre à l\'eau avec leur peau.',
      'Pendant ce temps, faire revenir les lardons et les oignons.',
      'Éplucher et couper les pommes de terre en rondelles.',
      'Dans un plat à gratin, alterner pommes de terre et lardons-oignons.',
      'Arroser de vin blanc et de crème.',
      'Couper le reblochon en deux et le poser sur le dessus.',
      'Enfourner à 200°C pendant 30 minutes.',
    ],
  },
  {
    id: 'fr-10',
    name: 'Crêpes Suzette',
    image: 'https://images.unsplash.com/photo-1519676867240-f9f3f182631c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVwZXN8ZW58MXx8fHwxNzYwOTI1NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 30,
    cookTime: 20,
    servings: 6,
    difficulty: 'Moyen',
    category: 'Dessert',
    ingredients: [
      { item: 'Farine', quantity: '250g' },
      { item: 'Œufs', quantity: '4' },
      { item: 'Lait', quantity: '500ml' },
      { item: 'Beurre', quantity: '100g' },
      { item: 'Sucre', quantity: '80g' },
      { item: 'Orange', quantity: '3' },
      { item: 'Grand Marnier', quantity: '50ml' },
    ],
    steps: [
      'Préparer la pâte à crêpes : mélanger farine, œufs et lait.',
      'Laisser reposer 30 minutes.',
      'Faire cuire les crêpes dans une poêle beurrée.',
      'Préparer le beurre d\'orange : mélanger beurre, sucre et zeste d\'orange.',
      'Dans une poêle, faire fondre le beurre d\'orange avec le jus d\'orange.',
      'Plier les crêpes en quatre et les passer dans la sauce.',
      'Flamber avec le Grand Marnier et servir immédiatement.',
    ],
  },
  {
    id: 'fr-11',
    name: 'Coq au Vin',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjaGlja2VuJTIwd2luZXxlbnwxfHx8fDE3NjA5MjU1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 30,
    cookTime: 120,
    servings: 6,
    difficulty: 'Difficile',
    category: 'Plat principal',
    ingredients: [
      { item: 'Poulet', quantity: '1.5kg' },
      { item: 'Vin rouge', quantity: '750ml' },
      { item: 'Lardons', quantity: '150g' },
      { item: 'Champignons', quantity: '250g' },
      { item: 'Oignon', quantity: '12 petits' },
      { item: 'Ail', quantity: '3 gousses' },
      { item: 'Bouquet garni', quantity: '1' },
      { item: 'Farine', quantity: '2 c. à soupe' },
    ],
    steps: [
      'Découper le poulet en morceaux.',
      'Faire revenir les lardons puis réserver.',
      'Faire dorer les morceaux de poulet et réserver.',
      'Faire revenir les oignons et l\'ail.',
      'Saupoudrer de farine et mélanger.',
      'Remettre le poulet, ajouter le vin et le bouquet garni.',
      'Couvrir et laisser mijoter 2h à feu doux.',
      'Ajouter les champignons 30 minutes avant la fin.',
    ],
  },
  {
    id: 'fr-12',
    name: 'Tarte Tatin',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcHBsZSUyMHRhcnR8ZW58MXx8fHwxNzYwOTI1NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 30,
    cookTime: 40,
    servings: 8,
    difficulty: 'Moyen',
    category: 'Dessert',
    ingredients: [
      { item: 'Pommes', quantity: '8' },
      { item: 'Pâte feuilletée', quantity: '1' },
      { item: 'Beurre', quantity: '100g' },
      { item: 'Sucre', quantity: '150g' },
      { item: 'Vanille', quantity: '1 gousse' },
    ],
    steps: [
      'Éplucher et couper les pommes en quartiers.',
      'Dans un moule, faire un caramel avec le beurre et le sucre.',
      'Disposer les pommes serrées sur le caramel.',
      'Ajouter les graines de vanille.',
      'Cuire 20 minutes à feu moyen.',
      'Couvrir avec la pâte feuilletée en rentrant les bords.',
      'Enfourner à 180°C pendant 20 minutes.',
      'Démouler sur un plat en retournant rapidement.',
    ],
  },
  {
    id: 'fr-13',
    name: 'Bouillabaisse',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXNoJTIwc291cHxlbnwxfHx8fDE3NjA5MjU1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 30,
    cookTime: 45,
    servings: 6,
    difficulty: 'Difficile',
    category: 'Plat principal',
    ingredients: [
      { item: 'Poisson', quantity: '2kg (variés)' },
      { item: 'Tomates', quantity: '4' },
      { item: 'Oignon', quantity: '2' },
      { item: 'Fenouil', quantity: '1 bulbe' },
      { item: 'Ail', quantity: '4 gousses' },
      { item: 'Safran', quantity: '1 pincée' },
      { item: 'Huile d\'olive', quantity: '6 c. à soupe' },
      { item: 'Pain', quantity: '12 tranches' },
    ],
    steps: [
      'Nettoyer et couper les poissons.',
      'Faire revenir oignon, fenouil et ail dans l\'huile.',
      'Ajouter les tomates et le safran.',
      'Couvrir d\'eau et cuire 20 minutes.',
      'Ajouter les poissons fermes et cuire 10 minutes.',
      'Ajouter les poissons fragiles et cuire 5 minutes.',
      'Servir le bouillon sur des tranches de pain grillées.',
      'Accompagner de rouille et de croûtons.',
    ],
  },
  {
    id: 'fr-14',
    name: 'Clafoutis aux Cerises',
    image: 'https://images.unsplash.com/photo-1565299543923-37dd37887442?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVycnklMjBkZXNzZXJ0fGVufDF8fHx8MTc2MDkyNTUzMnww&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 15,
    cookTime: 40,
    servings: 6,
    difficulty: 'Facile',
    category: 'Dessert',
    ingredients: [
      { item: 'Cerises', quantity: '500g' },
      { item: 'Œufs', quantity: '4' },
      { item: 'Farine', quantity: '100g' },
      { item: 'Sucre', quantity: '100g' },
      { item: 'Lait', quantity: '300ml' },
      { item: 'Beurre', quantity: '30g' },
      { item: 'Vanille', quantity: '1 c. à café' },
    ],
    steps: [
      'Préchauffer le four à 180°C.',
      'Laver et dénoyauter les cerises (ou garder les noyaux).',
      'Beurrer un plat à gratin et y disposer les cerises.',
      'Battre les œufs avec le sucre et la vanille.',
      'Ajouter la farine puis le lait progressivement.',
      'Verser la pâte sur les cerises.',
      'Enfourner 40 minutes jusqu\'à ce que le clafoutis soit doré.',
      'Saupoudrer de sucre glace avant de servir tiède.',
    ],
  },
  {
    id: 'fr-15',
    name: 'Pot-au-Feu',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxiZWVmJTIwc3Rld3xlbnwxfHx8fDE3NjA5MjU1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    prepTime: 20,
    cookTime: 180,
    servings: 8,
    difficulty: 'Moyen',
    category: 'Plat principal',
    ingredients: [
      { item: 'Bœuf', quantity: '1.5kg (différentes pièces)' },
      { item: 'Carottes', quantity: '6' },
      { item: 'Poireaux', quantity: '4' },
      { item: 'Navets', quantity: '4' },
      { item: 'Oignon', quantity: '2' },
      { item: 'Bouquet garni', quantity: '1' },
      { item: 'Sel et poivre', quantity: 'Au goût' },
    ],
    steps: [
      'Dans une grande marmite, mettre la viande et couvrir d\'eau froide.',
      'Porter à ébullition et écumer régulièrement.',
      'Ajouter le bouquet garni et les oignons piqués de clous de girofle.',
      'Laisser mijoter 2h à feu très doux.',
      'Ajouter tous les légumes épluchés et coupés.',
      'Poursuivre la cuisson 1h.',
      'Servir la viande et les légumes avec le bouillon à part.',
      'Accompagner de cornichons, moutarde et gros sel.',
    ],
  },
];

// Fonction de traduction complète pour les recettes Spoonacular
export function translateRecipeTitle(englishTitle: string): string {
  const translations: Record<string, string> = {
    'Roast Chicken': 'Poulet Rôti',
    'Chicken': 'Poulet',
    'Beef': 'Bœuf',
    'Pork': 'Porc',
    'Fish': 'Poisson',
    'Salmon': 'Saumon',
    'Pasta': 'Pâtes',
    'Salad': 'Salade',
    'Soup': 'Soupe',
    'Pie': 'Tarte',
    'Cake': 'Gâteau',
    'Burger': 'Burger',
    'Rice': 'Riz',
    'Vegetables': 'Légumes',
    'Grilled': 'Grillé',
    'Roasted': 'Rôti',
    'Fried': 'Frit',
    'Baked': 'Cuit au four',
    'with': 'aux',
    'and': 'et',
    'Homemade': 'Maison',
    'Classic': 'Classique',
    'Tomato': 'Tomate',
    'Caesar': 'César',
    'Apple': 'Pomme',
    'Lemon': 'Citron',
    'Carbonara': 'Carbonara',
  };

  let translated = englishTitle;
  Object.entries(translations).forEach(([eng, fr]) => {
    translated = translated.replace(new RegExp(eng, 'gi'), fr);
  });

  return translated;
}

// Dictionnaire de traduction des ingrédients (anglais -> français)
const ingredientDictionary: Record<string, string> = {
  // Viandes
  'chicken': 'poulet',
  'chicken breast': 'blanc de poulet',
  'chicken breasts': 'blancs de poulet',
  'chicken thighs': 'cuisses de poulet',
  'beef': 'bœuf',
  'pork': 'porc',
  'lamb': 'agneau',
  'turkey': 'dinde',
  'bacon': 'lardons',
  'ham': 'jambon',
  'sausage': 'saucisse',
  'ground beef': 'viande hachée',
  
  // Poissons
  'fish': 'poisson',
  'salmon': 'saumon',
  'tuna': 'thon',
  'cod': 'cabillaud',
  'shrimp': 'crevettes',
  'prawns': 'crevettes',
  
  // Légumes et conserves
  'tomato': 'tomate',
  'tomatoes': 'tomates',
  'canned tomatoes': 'tomates en conserve',
  'canned tomates': 'tomates en conserve',
  'diced tomatoes': 'tomates en dés',
  'crushed tomatoes': 'tomates concassées',
  'onion': 'oignon',
  'onions': 'oignons',
  'garlic': 'ail',
  'carrot': 'carotte',
  'carrots': 'carottes',
  'potato': 'pomme de terre',
  'potatoes': 'pommes de terre',
  'lettuce': 'laitue',
  'cucumber': 'concombre',
  'bell pepper': 'poivron',
  'mushroom': 'champignon',
  'mushrooms': 'champignons',
  'zucchini': 'courgette',
  'eggplant': 'aubergine',
  'spinach': 'épinards',
  'broccoli': 'brocoli',
  'cauliflower': 'chou-fleur',
  'cabbage': 'chou',
  'celery': 'céleri',
  'leek': 'poireau',
  'corn': 'maïs',
  'kernel corn': 'maïs en grains',
  'kernal corn': 'maïs en grains',
  'sweet corn': 'maïs doux',
  'peas': 'petits pois',
  'green beans': 'haricots verts',
  'black beans': 'haricots noirs',
  'kidney beans': 'haricots rouges',
  'chili beans': 'haricots chili',
  'white beans': 'haricots blancs',
  'beans': 'haricots',
  'chickpeas': 'pois chiches',
  'lentils': 'lentilles',
  
  // Fruits
  'apple': 'pomme',
  'apples': 'pommes',
  'banana': 'banane',
  'orange': 'orange',
  'lemon': 'citron',
  'lime': 'citron vert',
  'strawberry': 'fraise',
  'strawberries': 'fraises',
  'blueberry': 'myrtille',
  'blueberries': 'myrtilles',
  'raspberry': 'framboise',
  'raspberries': 'framboises',
  'cherry': 'cerise',
  'cherries': 'cerises',
  'peach': 'pêche',
  'pear': 'poire',
  'grape': 'raisin',
  'grapes': 'raisins',
  
  // Produits laitiers
  'milk': 'lait',
  'butter': 'beurre',
  'cheese': 'fromage',
  'cream': 'crème',
  'heavy cream': 'crème épaisse',
  'sour cream': 'crème aigre',
  'yogurt': 'yaourt',
  'parmesan': 'parmesan',
  'mozzarella': 'mozzarella',
  'cheddar': 'cheddar',
  'egg': 'œuf',
  'eggs': 'œufs',
  
  // Céréales et pâtes
  'rice': 'riz',
  'pasta': 'pâtes',
  'spaghetti': 'spaghetti',
  'noodles': 'nouilles',
  'flour': 'farine',
  'bread': 'pain',
  'breadcrumbs': 'chapelure',
  
  // Épices et condiments
  'salt': 'sel',
  'pepper': 'poivre',
  'black pepper': 'poivre noir',
  'paprika': 'paprika',
  'cumin': 'cumin',
  'curry': 'curry',
  'oregano': 'origan',
  'basil': 'basilic',
  'thyme': 'thym',
  'rosemary': 'romarin',
  'parsley': 'persil',
  'coriander': 'coriandre',
  'cilantro': 'coriandre',
  'bay leaf': 'feuille de laurier',
  'bay leaves': 'feuilles de laurier',
  'cinnamon': 'cannelle',
  'ginger': 'gingembre',
  'nutmeg': 'noix de muscade',
  'vanilla': 'vanille',
  
  // Huiles et sauces
  'olive oil': 'huile d\'olive',
  'oil': 'huile',
  'vegetable oil': 'huile végétale',
  'vinegar': 'vinaigre',
  'soy sauce': 'sauce soja',
  'tomato sauce': 'sauce tomate',
  'ketchup': 'ketchup',
  'mayonnaise': 'mayonnaise',
  'mustard': 'moutarde',
  
  // Sucres et desserts
  'sugar': 'sucre',
  'brown sugar': 'sucre roux',
  'honey': 'miel',
  'chocolate': 'chocolat',
  'cocoa': 'cacao',
  
  // Autres
  'water': 'eau',
  'broth': 'bouillon',
  'stock': 'bouillon',
  'chicken stock': 'bouillon de poulet',
  'vegetable stock': 'bouillon de légumes',
  'beef stock': 'bouillon de bœuf',
  'coconut milk': 'lait de coco',
  'wine': 'vin',
  'red wine': 'vin rouge',
  'white wine': 'vin blanc',
  'beer': 'bière',
  
  // Équipement et ustensiles
  'pan': 'poêle',
  'pot': 'casserole',
  'bowl': 'bol',
  'skillet': 'poêle',
  'saucepan': 'casserole',
  'baking sheet': 'plaque de cuisson',
  'baking dish': 'plat à four',
  'oven': 'four',
  'stove': 'cuisinière',
  'knife': 'couteau',
  'spoon': 'cuillère',
  'fork': 'fourchette',
  'spatula': 'spatule',
  'whisk': 'fouet',
  'cutting board': 'planche à découper',
  'plate': 'assiette',
  'dish': 'plat',
  
  // Termes de préparation
  'chopped': 'haché',
  'diced': 'coupé en dés',
  'sliced': 'tranché',
  'minced': 'haché finement',
  'grated': 'râpé',
  'shredded': 'râpé',
  'peeled': 'épluché',
  'crushed': 'écrasé',
  'beaten': 'battu',
  'whisked': 'fouetté',
  'melted': 'fondu',
  'boiled': 'bouilli',
  'fried': 'frit',
  'roasted': 'rôti',
  'grilled': 'grillé',
  'baked': 'cuit au four',
  'steamed': 'cuit à la vapeur',
  'sautéed': 'sauté',
  'cooked': 'cuit',
  'raw': 'cru',
  'fresh': 'frais',
  'dried': 'séché',
  'frozen': 'congelé',
  
  // Unités de mesure et tailles
  'cup': 'tasse',
  'cups': 'tasses',
  'tablespoon': 'c. à soupe',
  'tablespoons': 'c. à soupe',
  'teaspoon': 'c. à café',
  'teaspoons': 'c. à café',
  'ounce': 'once',
  'ounces': 'onces',
  'oz': 'oz',
  'pound': 'livre',
  'pounds': 'livres',
  'lb': 'lb',
  'lbs': 'lb',
  'gram': 'g',
  'grams': 'g',
  'kilogram': 'kg',
  'kilograms': 'kg',
  'milliliter': 'ml',
  'milliliters': 'ml',
  'liter': 'l',
  'liters': 'l',
  'clove': 'gousse',
  'cloves': 'gousses',
  'pinch': 'pincée',
  'handful': 'poignée',
  'piece': 'morceau',
  'pieces': 'morceaux',
  'slice': 'tranche',
  'slices': 'tranches',
  'strip': 'bande',
  'strips': 'bandes',
  'chunk': 'morceau',
  'chunks': 'morceaux',
  'half': 'moitié',
  'quarter': 'quart',
  'whole': 'entier',
  'to taste': 'au goût',
  'as needed': 'selon besoin',
  'large': 'gros',
  'medium': 'moyen',
  'small': 'petit',
  'can': 'boîte',
  'canned': 'en conserve',
  'jar': 'pot',
  'bottle': 'bouteille',
  'package': 'paquet',
  'bunch': 'botte',
};

/*
// Fonction pour traduire un ingrédient (DEPRECATED - Cette fonction a été commentée car elle contient des erreurs de regex)
// UTILISER translateIngredientFixed à la place
function translateIngredientOld(englishIngredient: string): string {
  let translated = englishIngredient.toLowerCase();
  
  // D'abord convertir les unités
  translated = convertUnits(translated);
  
  // Trier les entrées du dictionnaire par longueur (du plus long au plus court)
  // pour que "chicken breast" soit traduit avant "chicken"
  const sortedEntries = Object.entries(ingredientDictionary).sort(
    ([a], [b]) => b.length - a.length
  );
  
  // Remplacer chaque expression du dictionnaire
  sortedEntries.forEach(([eng, fr]) => {
    // Échapper les caractères spéciaux pour regex
    const escapedEng = eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Recherche avec limites de mots pour éviter les remplacements partiels
    const regex = new RegExp(`\\b${escapedEng}\\b`, 'gi');
    translated = translated.replace(regex, fr);
  });
  
  // Capitaliser la première lettre
  return translated.charAt(0).toUpperCase() + translated.slice(1);
}
*/

/*
// Fonction pour traduire une étape de recette (DEPRECATED - Cette fonction a été commentée car elle pourrait contenir des erreurs)
// UTILISER translateStepFixed à la place  
function translateStepOld(englishStep: string): string {
  let translated = englishStep;
  
  // D'abord convertir les températures Fahrenheit en Celsius
  translated = translated.replace(/(\d+)\s*°?\s*F\b/gi, (_match, temp) => {
    const celsius = Math.round((parseFloat(temp) - 32) * 5 / 9);
    return `${celsius}°C`;
  });
  
  // Convertir les unités dans les étapes
  translated = convertUnits(translated);
  
  const stepTranslations: Record<string, string> = {
    'Preheat': 'Préchauffer',
    'preheat': 'préchauffer',
    'Mix': 'Mélanger',
    'mix': 'mélanger',
    'Add': 'Ajouter',
    'add': 'ajouter',
    'Cook': 'Cuire',
    'cook': 'cuire',
    'Bake': 'Cuire au four',
    'bake': 'cuire au four',
    'Boil': 'Faire bouillir',
    'boil': 'faire bouillir',
    'Simmer': 'Laisser mijoter',
    'simmer': 'laisser mijoter',
    'Stir': 'Remuer',
    'stir': 'remuer',
    'Fry': 'Frire',
    'fry': 'frire',
    'Serve': 'Servir',
    'serve': 'servir',
    'Cut': 'Couper',
    'cut': 'couper',
    'Chop': 'Hacher',
    'chop': 'hacher',
    'Slice': 'Trancher',
    'slice': 'trancher',
    'Dice': 'Couper en dés',
    'dice': 'couper en dés',
    'Grill': 'Griller',
    'grill': 'griller',
    'Roast': 'Rôtir',
    'roast': 'rôtir',
    'Whisk': 'Fouetter',
    'whisk': 'fouetter',
    'Pour': 'Verser',
    'pour': 'verser',
    'Season': 'Assaisonner',
    'season': 'assaisonner',
    'Heat': 'Chauffer',
    'heat': 'chauffer',
    'Drain': 'Égoutter',
    'drain': 'égoutter',
    'Remove': 'Retirer',
    'remove': 'retirer',
    'the oven': 'le four',
    'to the': 'au',
    'in the': 'dans le',
    'on the': 'sur le',
    'with the': 'avec le',
    'until': 'jusqu\'à ce que',
    'for about': 'pendant environ',
    'about': 'environ',
    'minutes': 'minutes',
    'minute': 'minute',
    'hours': 'heures',
    'hour': 'heure',
    'seconds': 'secondes',
    'second': 'seconde',
    'and': 'et',
    'or': 'ou',
    'then': 'puis',
  };
  
  let translated = englishStep;
  Object.entries(stepTranslations).forEach(([eng, fr]) => {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    translated = translated.replace(regex, fr);
  });
  
  // Traduire aussi les ingrédients dans les étapes
  Object.entries(ingredientDictionary).forEach(([eng, fr]) => {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    translated = translated.replace(regex, fr);
  });
  
  return translated;
}
*/

// Fonction pour traduire les catégories
export function translateCategory(category: string): string {
  const categories: Record<string, string> = {
    'main course': 'Plat principal',
    'side dish': 'Accompagnement',
    'dessert': 'Dessert',
    'appetizer': 'Entrée',
    'salad': 'Salade',
    'bread': 'Pain',
    'breakfast': 'Petit-déjeuner',
    'soup': 'Soupe',
    'beverage': 'Boisson',
    'sauce': 'Sauce',
    'drink': 'Boisson',
  };

  return categories[category.toLowerCase()] || category;
}

// Wrapper functions qui utilisent les bonnes implémentations
export function translateIngredientFixed(englishIngredient: string): string {
  let translated = englishIngredient.toLowerCase();
  translated = convertUnits(translated);
  
  const sortedEntries = Object.entries(ingredientDictionary).sort(
    ([a], [b]) => b.length - a.length
  );
  
  sortedEntries.forEach(([eng, fr]) => {
    translated = replaceWithWordBoundaries(translated, eng, fr);
  });
  
  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

export function translateStepFixed(englishStep: string): string {
  let translated = convertUnits(englishStep);
  
  const stepTranslations: Record<string, string> = {
    // Verbes de cuisine principaux
    'Preheat': 'Préchauffer', 'preheat': 'préchauffer',
    'Mix': 'Mélanger', 'mix': 'mélanger',
    'Add': 'Ajouter', 'add': 'ajouter',
    'Cook': 'Cuire', 'cook': 'cuire',
    'Bake': 'Cuire au four', 'bake': 'cuire au four',
    'Boil': 'Faire bouillir', 'boil': 'faire bouillir',
    'Simmer': 'Laisser mijoter', 'simmer': 'laisser mijoter',
    'Stir': 'Remuer', 'stir': 'remuer',
    'Fry': 'Frire', 'fry': 'frire',
    'Sauté': 'Faire revenir', 'sauté': 'faire revenir', 'saute': 'faire revenir',
    'Serve': 'Servir', 'serve': 'servir',
    'Cut': 'Couper', 'cut': 'couper',
    'Chop': 'Hacher', 'chop': 'hacher',
    'Slice': 'Trancher', 'slice': 'trancher',
    'Dice': 'Couper en dés', 'dice': 'couper en dés',
    'Mince': 'Hacher finement', 'mince': 'hacher finement',
    'Grill': 'Griller', 'grill': 'griller',
    'Roast': 'Rôtir', 'roast': 'rôtir',
    'Whisk': 'Fouetter', 'whisk': 'fouetter',
    'Beat': 'Battre', 'beat': 'battre',
    'Pour': 'Verser', 'pour': 'verser',
    'Season': 'Assaisonner', 'season': 'assaisonner',
    'Heat': 'Chauffer', 'heat': 'chauffer',
    'Drain': 'Égoutter', 'drain': 'égoutter',
    'Remove': 'Retirer', 'remove': 'retirer',
    'Blend': 'Mixer', 'blend': 'mixer',
    'Combine': 'Mélanger', 'combine': 'mélanger',
    'Transfer': 'Transférer', 'transfer': 'transférer',
    'Spread': 'Étaler', 'spread': 'étaler',
    'Sprinkle': 'Saupoudrer', 'sprinkle': 'saupoudrer',
    'Garnish': 'Garnir', 'garnish': 'garnir',
    'Toss': 'Mélanger', 'toss': 'mélanger',
    'Coat': 'Enrober', 'coat': 'enrober',
    'Brush': 'Badigeonner', 'brush': 'badigeonner',
    'Marinate': 'Faire mariner', 'marinate': 'faire mariner',
    'Steam': 'Cuire à la vapeur', 'steam': 'cuire à la vapeur',
    'Braise': 'Braiser', 'braise': 'braiser',
    'Brown': 'Faire dorer', 'brown': 'faire dorer',
    'Sear': 'Saisir', 'sear': 'saisir',
    'Reduce': 'Réduire', 'reduce': 'réduire',
    'Thicken': 'Épaissir', 'thicken': 'épaissir',
    'Dissolve': 'Dissoudre', 'dissolve': 'dissoudre',
    'Melt': 'Faire fondre', 'melt': 'faire fondre',
    'Chill': 'Réfrigérer', 'chill': 'réfrigérer',
    'Freeze': 'Congeler', 'freeze': 'congeler',
    'Defrost': 'Décongeler', 'defrost': 'décongeler',
    'Refrigerate': 'Réfrigérer', 'refrigerate': 'réfrigérer',
    'Let rest': 'Laisser reposer', 'let rest': 'laisser reposer',
    'Let stand': 'Laisser reposer', 'let stand': 'laisser reposer',
    'Set aside': 'Réserver', 'set aside': 'réserver',
    'Peel': 'Éplucher', 'peel': 'éplucher',
    'Wash': 'Laver', 'wash': 'laver',
    'Rinse': 'Rincer', 'rinse': 'rincer',
    'Dry': 'Sécher', 'dry': 'sécher',
    'Pat dry': 'Sécher', 'pat dry': 'sécher',
    'Roll out': 'Étaler', 'roll out': 'étaler',
    'Knead': 'Pétrir', 'knead': 'pétrir',
    'Shape': 'Façonner', 'shape': 'façonner',
    'Form': 'Former', 'form': 'former',
    'Divide': 'Diviser', 'divide': 'diviser',
    'Arrange': 'Disposer', 'arrange': 'disposer',
    'Place': 'Placer', 'place': 'placer',
    'Put': 'Mettre', 'put': 'mettre',
    'Bring': 'Porter', 'bring': 'porter',
    'Bring to a boil': 'Porter à ébullition', 'bring to a boil': 'porter à ébullition',
    'Come to a boil': 'Arriver à ébullition', 'come to a boil': 'arriver à ébullition',
    'Let cool': 'Laisser refroidir', 'let cool': 'laisser refroidir',
    'Allow to cool': 'Laisser refroidir', 'allow to cool': 'laisser refroidir',
    'Taste': 'Goûter', 'taste': 'goûter',
    'Adjust': 'Ajuster', 'adjust': 'ajuster',
    'Check': 'Vérifier', 'check': 'vérifier',
    'Cover': 'Couvrir', 'cover': 'couvrir',
    'Uncover': 'Découvrir', 'uncover': 'découvrir',
    'Wrap': 'Envelopper', 'wrap': 'envelopper',
    'Unwrap': 'Déballer', 'unwrap': 'déballer',
    
    // Expressions et prépositions
    'the oven': 'le four',
    'in a pan': 'dans une poêle',
    'in a pot': 'dans une casserole',
    'in a bowl': 'dans un bol',
    'in a large bowl': 'dans un grand bol',
    'in a medium bowl': 'dans un bol moyen',
    'in a small bowl': 'dans un petit bol',
    'to the': 'au', 'to a': 'à un',
    'in the': 'dans le', 'in a': 'dans un',
    'on the': 'sur le', 'on a': 'sur un',
    'with the': 'avec le', 'with a': 'avec un',
    'from the': 'du', 'from a': "d'un",
    'into the': 'dans le', 'into a': 'dans un',
    'over the': 'sur le', 'over a': 'sur un',
    'under the': 'sous le', 'under a': 'sous un',
    'until': "jusqu'à ce que",
    'until golden': "jusqu'à ce que doré",
    'until tender': "jusqu'à ce que tendre",
    'until cooked': "jusqu'à cuisson",
    'for about': 'pendant environ',
    'about': 'environ',
    'approximately': 'environ',
    
    // Temps
    'minutes': 'minutes', 'minute': 'minute',
    'hours': 'heures', 'hour': 'heure',
    'seconds': 'secondes', 'second': 'seconde',
    'days': 'jours', 'day': 'jour',
    
    // Connecteurs
    'and': 'et', 'or': 'ou', 'then': 'puis',
    'before': 'avant', 'after': 'après',
    'while': 'pendant que', 'during': 'pendant',
    'when': 'quand', 'if': 'si',
    'once': 'une fois',
    
    // Adjectifs et adverbes courants
    'hot': 'chaud', 'warm': 'tiède', 'cold': 'froid',
    'large': 'grand', 'medium': 'moyen', 'small': 'petit',
    'thick': 'épais', 'thin': 'fin',
    'fine': 'fin', 'finely': 'finement',
    'coarse': 'grossier', 'coarsely': 'grossièrement',
    'fresh': 'frais', 'freshly': 'fraîchement',
    'smooth': 'lisse', 'rough': 'rugueux',
    'golden': 'doré', 'brown color': 'brun',
    'tender': 'tendre', 'soft': 'mou',
    'crispy': 'croustillant', 'crunchy': 'croquant',
    'well': 'bien', 'carefully': 'soigneusement',
    'gently': 'doucement', 'slowly': 'lentement',
    'quickly': 'rapidement', 'constantly': 'constamment',
    'occasionally': 'de temps en temps',
    'frequently': 'fréquemment',
    
    // Expressions complètes
    'a pinch of': 'une pincée de',
    'a dash of': 'une pincée de',
    'to taste': 'au goût',
    'as needed': 'selon besoin',
    'if needed': 'si nécessaire',
    'as desired': 'au choix',
  };
  
  Object.entries(stepTranslations).forEach(([eng, fr]) => {
    translated = replaceWithWordBoundaries(translated, eng, fr);
  });
  
  Object.entries(ingredientDictionary).forEach(([eng, fr]) => {
    translated = replaceWithWordBoundaries(translated, eng, fr);
  });
  
  return translated;
}

// Exporter les versions fixes comme les versions standards
export { translateIngredientFixed as translateIngredient };
export { translateStepFixed as translateStep };
