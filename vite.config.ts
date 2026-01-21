import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig({
  // Configuration pour le déploiement : utilise '/' pour la plupart des hébergements
  // Changez en './' si vous déployez dans un sous-dossier
  base: process.env.VITE_BASE_URL || '/',
  
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      // Nettoyage et simplification de la gestion des alias
      // Remplacement de tous les alias longs par le chemin d'origine.
      // Le chemin '@' est conservé pour la clarté.
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    // Optimisation du code splitting améliorée
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Séparer les bibliothèques UI volumineuses
          if (id.includes('@radix-ui')) {
            // Grouper tous les composants Radix UI ensemble
            return 'radix-ui';
          }
          // Séparer les dépendances de base
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('sonner')) {
              return 'vendor-notifications';
            }
            if (id.includes('html5-qrcode')) {
              return 'vendor-qrcode';
            }
            // Autres dépendances node_modules
            return 'vendor-other';
          }
          // Chunks pour les composants volumineux
          if (id.includes('/components/RecipesScreen') || id.includes('/components/RecipeDetailScreen')) {
            return 'recipes';
          }
          if (id.includes('/utils/recipesData')) {
            return 'recipes-data';
          }
          // Grouper les composants UI
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
        },
        // Optimiser les noms de chunks
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Optimisations de build améliorées
    minify: 'esbuild', // esbuild est plus rapide que terser
    // Supprimer les console.log en production
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
      legalComments: 'none', // Supprimer les commentaires légaux
    },
    // Augmenter la taille des chunks pour de meilleures performances
    chunkSizeWarningLimit: 600, // Réduire pour détecter les chunks trop gros
    // Optimiser la mise en cache des assets (images < 4KB en inline base64)
    assetsInlineLimit: 4096,
    // Activer la compression CSS
    cssCodeSplit: true,
    // Source maps uniquement en développement
    sourcemap: process.env.NODE_ENV === 'development',
    // Compression Gzip/Brotli (via plugin séparé si nécessaire)
    reportCompressedSize: false, // Désactiver pour accélérer le build
    cssMinify: true, // Minifier le CSS
  },
  server: {
    port: 3000,
    open: true,
  },
  // Optimisations pour le développement
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
    ],
    exclude: ['html5-qrcode'], // Exclure les dépendances lourdes du pré-bundling
    // Pré-bundler les dépendances lourdes
    esbuildOptions: {
      target: 'esnext',
    },
  },
});
