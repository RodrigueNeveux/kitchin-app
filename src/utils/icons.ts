/**
 * Fichier centralisé pour les imports d'icônes lucide-react
 * Cela améliore le tree-shaking et réduit la taille du bundle
 * en permettant à Vite de mieux optimiser les imports
 */

// Icônes communes
export {
  User,
  UserPlus,
  ChevronRight,
  Bell,
  Clock,
  Users,
  ChefHat,
  CheckCircle2,
  Search,
  Sparkles,
  AlertCircle,
  Loader2,
  Home,
  ShoppingCart,
  Utensils,
  Settings,
  Plus,
  Minus,
  Trash2,
  Edit,
  X,
  Check,
  Camera,
  Barcode,
  Image as ImageIcon,
  Calendar,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

// Export de type pour faciliter l'utilisation
import type { LucideIcon } from 'lucide-react';
export type { LucideIcon };
