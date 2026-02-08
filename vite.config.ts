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
        // SOLUTION : Simplifier le code splitting pour éviter les problèmes de chargement React
        // Tous les composants qui utilisent React restent dans le chunk principal
        // Le lazy loading dans App.tsx gère déjà le code splitting au niveau applicatif
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React et react-dom dans le chunk principal (CRITIQUE)
            if (id.includes('react') || id.includes('react-dom') || id.includes('react/jsx-runtime') || id.includes('scheduler')) {
              return undefined; // Dans index.js
            }
            
            // Packages qui ne dépendent PAS de React
            if (id.includes('supabase') && !id.includes('react')) {
              return 'vendor-supabase';
            }
            if (id.includes('firebase') && !id.includes('react')) {
              return 'vendor-firebase';
            }
            if (id.includes('html5-qrcode')) {
              return 'vendor-qrcode';
            }
            if ((id.includes('clsx') || id.includes('tailwind-merge') || id.includes('date-fns')) && !id.includes('react')) {
              return 'vendor-utils';
            }
            
            // TOUS les packages qui utilisent React
            const reactDeps = [
              'react-hook-form',
              'embla-carousel-react',
              'embla-carousel',
              'class-variance-authority',
              'cmdk',
              'vaul',
              'input-otp',
              'next-themes',
              'react-day-picker',
              'react-resizable-panels',
              '@radix-ui',
              'lucide-react',
              'recharts',
              'sonner',
              '@hookform',
              'use-sidebar',
              'use-mobile',
            ];
            
            if (reactDeps.some(dep => id.includes(dep))) {
              return 'vendor-react-deps';
            }
            
            if (id.includes('/@') || (id.includes('@') && !id.includes('supabase'))) {
              return 'vendor-react-deps';
            }
            
            return 'vendor-react-deps';
          }
          
          // IMPORTANT : Tous les composants source restent dans le chunk principal
          // Cela garantit que React est toujours disponible
          // Le lazy loading dans App.tsx gère le code splitting au niveau applicatif
          return undefined;
        },
        // Optimiser les noms de chunks
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        // IMPORTANT : Le chunk principal (index.js) contient React et sera chargé en premier
        // vendor-react-deps dépendra du chunk principal, donc React sera disponible avant
        // Rollup gère automatiquement les dépendances entre chunks
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
      jsx: 'automatic', // Utiliser le nouveau JSX transform
    },
    // IMPORTANT : Désactiver le code splitting pour éviter les problèmes de chargement React
    // Les chunks dynamiques créés par lazy() peuvent se charger avant React
    // En désactivant le code splitting, tous les composants restent dans le chunk principal
    // Le lazy loading dans App.tsx gère déjà le code splitting au niveau applicatif
    // Cela garantit que React est toujours disponible
    // Note: Cela peut augmenter la taille du bundle initial, mais évite les erreurs de chargement
    // commonjsOptions: {
    //   transformMixedEsModules: true,
    // },
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
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
    ],
    exclude: ['html5-qrcode'], // Exclure les dépendances lourdes du pré-bundling
    // Pré-bundler les dépendances lourdes
    esbuildOptions: {
      target: 'esnext',
    },
  },
});
