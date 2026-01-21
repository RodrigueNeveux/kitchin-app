/**
 * Service de traduction automatique en utilisant l'API MyMemory
 * API gratuite sans clé requise : https://mymemory.translated.net/doc/spec.php
 * Limite : 10 000 caractères par jour (largement suffisant pour les recettes)
 */

import { convertUnits } from './translationHelpers';

// Cache des traductions pour éviter les appels répétés
// Utilise localStorage pour persister entre les sessions
const translationCache = new Map<string, string>();
const CACHE_KEY = 'kitchin-translations-cache';
const MAX_CACHE_SIZE = 1000; // Limiter la taille du cache

// Charger le cache depuis localStorage au démarrage
function loadCacheFromStorage(): void {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.entries(parsed).forEach(([key, value]) => {
        translationCache.set(key, value as string);
      });
      console.log(`📦 Cache de traduction chargé: ${translationCache.size} entrées`);
    }
  } catch (error) {
    console.warn('⚠️ Erreur lors du chargement du cache:', error);
  }
}

// Sauvegarder le cache dans localStorage
function saveCacheToStorage(): void {
  try {
    // Limiter la taille du cache avant sauvegarde
    if (translationCache.size > MAX_CACHE_SIZE) {
      const entries = Array.from(translationCache.entries());
      // Garder les entrées les plus récentes
      const toKeep = entries.slice(-MAX_CACHE_SIZE);
      translationCache.clear();
      toKeep.forEach(([key, value]) => translationCache.set(key, value));
    }
    
    const cacheObj = Object.fromEntries(translationCache);
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
  } catch (error) {
    // Si localStorage est plein ou indisponible, ignorer silencieusement
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('⚠️ Cache localStorage plein, nettoyage...');
      // Nettoyer les anciennes entrées
      const entries = Array.from(translationCache.entries());
      const toKeep = entries.slice(-Math.floor(MAX_CACHE_SIZE / 2));
      translationCache.clear();
      toKeep.forEach(([key, value]) => translationCache.set(key, value));
      try {
        const cacheObj = Object.fromEntries(translationCache);
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
      } catch (e) {
        // Si ça échoue encore, supprimer complètement
        localStorage.removeItem(CACHE_KEY);
      }
    }
  }
}

// Charger le cache au démarrage
if (typeof window !== 'undefined') {
  loadCacheFromStorage();
}

/**
 * Traduit un texte de l'anglais vers le français automatiquement
 * @param text - Texte en anglais à traduire
 * @returns Texte traduit en français
 */
export async function translateText(text: string): Promise<string> {
  // Vérifier si c'est déjà en cache
  const cacheKey = text.toLowerCase().trim();
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // Si le texte est vide, retourner tel quel
  if (!text || text.trim().length === 0) {
    return text;
  }

  try {
    // Encoder le texte pour l'URL
    const encodedText = encodeURIComponent(text);
    
    // Appeler l'API MyMemory (gratuite, pas de clé nécessaire)
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|fr`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('⚠️ Erreur API de traduction, utilisation du texte original');
      return text;
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      
      // Mettre en cache
      translationCache.set(cacheKey, translated);
      // Sauvegarder dans localStorage de manière asynchrone (ne pas bloquer)
      if (typeof window !== 'undefined') {
        // Debounce pour éviter trop d'écritures
        setTimeout(() => saveCacheToStorage(), 100);
      }
      
      console.log(`✅ Traduit: "${text}" → "${translated}"`);
      return translated;
    } else {
      console.warn('⚠️ Réponse API invalide, utilisation du texte original');
      return text;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la traduction:', error);
    return text;
  }
}

/**
 * Traduit un tableau de textes en parallèle
 * @param texts - Tableau de textes à traduire
 * @returns Tableau de textes traduits
 */
export async function translateTexts(texts: string[]): Promise<string[]> {
  // Pour éviter de surcharger l'API, on traduit par lots de 5
  const batchSize = 5;
  const results: string[] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map(text => translateText(text));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Petite pause entre les lots pour respecter les limites de l'API
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}

/**
 * Efface le cache de traduction
 */
export function clearTranslationCache(): void {
  translationCache.clear();
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY);
  }
  console.log('🗑️ Cache de traduction effacé');
}

/**
 * Obtient la taille du cache
 */
export function getTranslationCacheSize(): number {
  return translationCache.size;
}
