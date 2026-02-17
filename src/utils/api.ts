import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;

function formatErrorMessage(error: any, endpoint: string): string {
  // Erreurs réseau
  if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('network'))) {
    return 'Erreur de connexion réseau. Vérifiez votre connexion internet et réessayez.';
  }
  
  if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
    return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
  }
  
  // Erreurs CORS
      if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
        return 'L\'API Edge Function n\'est pas accessible. Vérifiez que la fonction est déployée sur Supabase.';
      }
  
  // Erreurs de timeout
  if (error.message?.includes('timeout') || error.name === 'TimeoutError') {
    return 'La requête a pris trop de temps. Veuillez réessayer.';
  }
  
  // Si c'est déjà un message d'erreur formaté, le retourner tel quel
  if (error.message && typeof error.message === 'string' && error.message.length > 0) {
    return error.message;
  }
  
  // Message par défaut
  return `Erreur lors de la connexion au serveur (${endpoint}). Veuillez réessayer.`;
}

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/make-server-e298da7a/health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  private async request(endpoint: string, options: RequestInit = {}, retries = 2) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }

    let lastError: any;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const fullUrl = `${API_BASE_URL}${endpoint}`;
        
        const fetchOptions: RequestInit = {
          ...options,
          headers,
          mode: 'cors', // Explicitly enable CORS
          credentials: 'omit', // Don't send credentials
        };
        
        const response = await fetch(fullUrl, fetchOptions);

        // Vérifier si la réponse est OK avant de parser le JSON
        let data: any;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            data = await response.json();
          } catch (jsonError) {
            const text = await response.text();
            throw new Error(`Erreur serveur: réponse invalide (${response.status})`);
          }
        } else {
          // Si ce n'est pas du JSON, lire le texte
          const text = await response.text();
          data = { error: text || `Erreur serveur (${response.status})` };
        }

        if (!response.ok) {
          // Gérer différents types d'erreurs
          let errorMessage = 'Erreur lors de la requête';
          
          if (data.error) {
            errorMessage = data.error;
          } else if (data.message) {
            errorMessage = data.message;
          } else if (response.status === 401) {
            errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
          } else if (response.status === 403) {
            errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
          } else if (response.status === 404) {
            errorMessage = 'Ressource non trouvée.';
          } else if (response.status === 500) {
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          } else if (response.status >= 400) {
            errorMessage = `Erreur ${response.status}: ${data.error || 'Requête invalide'}`;
          }
          throw new Error(errorMessage);
        }

        return data;
      } catch (error: any) {
        lastError = error;
        
        // Détecter les erreurs réseau spécifiques
        if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
          // Vérifier si c'est une erreur CORS
          if (error.message.includes('CORS') || error.message.includes('cross-origin') || error.message.includes('Same Origin') || error.message.includes('multiorigine')) {
            const corsError = new Error('Erreur CORS : L\'Edge Function Supabase n\'est peut-être pas déployée. Veuillez déployer l\'Edge Function "server" sur Supabase.');
            corsError.name = 'CorsError';
            lastError = corsError;
          } else {
            const networkError = new Error('Erreur de connexion réseau. Vérifiez votre connexion internet et réessayez.');
            networkError.name = 'NetworkError';
            lastError = networkError;
          }
        } else if (error.name === 'NetworkError' || error.message.includes('NetworkError')) {
          // Vérifier si c'est une erreur CORS masquée
          if (error.message.includes('CORS') || error.message.includes('cross-origin') || error.message.includes('Same Origin')) {
            lastError = new Error('Erreur CORS : L\'Edge Function Supabase n\'est peut-être pas déployée. Veuillez déployer l\'Edge Function "server" sur Supabase.');
          } else {
            lastError = new Error('Erreur de connexion réseau. Vérifiez votre connexion internet et réessayez.');
          }
        } else if (error.message) {
          // Garder le message d'erreur original s'il existe
          lastError = error;
        }
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    // Créer un message d'erreur final plus clair
    const errorMessage = formatErrorMessage(lastError, endpoint);
    throw new Error(errorMessage);
  }

  // Auth
  async signup(email: string, password: string, name: string) {
    return this.request('/make-server-e298da7a/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/make-server-e298da7a/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request('/make-server-e298da7a/profile');
  }

  // Household
  async createInvite() {
    return this.request('/make-server-e298da7a/household/invite', {
      method: 'POST',
    });
  }

  async joinHousehold(inviteCode: string) {
    return this.request('/make-server-e298da7a/household/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  }

  async updateHousehold(name: string) {
    return this.request('/make-server-e298da7a/household', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async updateUserName(name: string) {
    return this.request('/make-server-e298da7a/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async removeMember(memberId: string) {
    return this.request(`/make-server-e298da7a/household/member/${memberId}`, {
      method: 'DELETE',
    });
  }

  // Products
  async getProducts() {
    return this.request('/make-server-e298da7a/products');
  }

  async addProduct(product: any) {
    return this.request('/make-server-e298da7a/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, updates: any) {
    return this.request(`/make-server-e298da7a/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/make-server-e298da7a/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Shopping Lists
  async getShoppingLists() {
    return this.request('/make-server-e298da7a/shopping-lists');
  }

  async addShoppingItem(item: any) {
    return this.request('/make-server-e298da7a/shopping-lists', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateShoppingItem(id: string, updates: any) {
    return this.request(`/make-server-e298da7a/shopping-lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteShoppingItem(id: string) {
    return this.request(`/make-server-e298da7a/shopping-lists/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

// Normalise le code-barres (certains scanners enlèvent le zéro initial des EAN-13)
function normalizeBarcode(barcode: string): string[] {
  const digits = barcode.replace(/\D/g, '');
  if (!digits) return [];
  const variants: string[] = [digits];
  // EAN-13 avec zéro initial : le scanner peut retourner 12 chiffres (UPC-A)
  if (digits.length === 12) {
    variants.unshift('0' + digits);
  } else if (digits.length === 13 && digits.startsWith('0')) {
    variants.push(digits.slice(1)); // Variante sans le zéro initial
  }
  return [...new Set(variants)];
}

// Open Food Facts API - utilise le proxy Supabase (User-Agent correct) ou fallback direct
export async function getProductByBarcode(barcode: string) {
  try {
    const variants = normalizeBarcode(barcode);
    if (variants.length === 0) return null;

    const apiBase = `https://${projectId}.supabase.co/functions/v1/server`;
    for (const normalized of variants) {
      const proxyRes = await fetch(`${apiBase}/make-server-e298da7a/product/barcode/${normalized}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      if (proxyRes.ok) {
        const { product } = await proxyRes.json();
        if (product) return product;
      }
    }

    // Fallback direct (peut échouer sans User-Agent - Open Food Facts l'exige)
    for (const normalized of variants) {
      try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${normalized}.json`);
        const data = await response.json();
        if (data.status === 1 && data.product) {
          const product = data.product;
          let category: 'fridge' | 'pantry' | 'freezer' = 'pantry';
          const categories = product.categories_tags || [];
          const categoryText = categories.join(' ').toLowerCase();
          if (categoryText.includes('dairy') || categoryText.includes('lait') ||
              categoryText.includes('yaourt') || categoryText.includes('fromage') ||
              categoryText.includes('viande') || categoryText.includes('meat') ||
              categoryText.includes('poisson') || categoryText.includes('fish') ||
              categoryText.includes('légume') || categoryText.includes('vegetable') ||
              categoryText.includes('fruit')) {
            category = 'fridge';
          } else if (categoryText.includes('surgelé') || categoryText.includes('frozen') ||
                     categoryText.includes('glace') || categoryText.includes('ice-cream')) {
            category = 'freezer';
          }
          return {
            name: product.product_name || product.product_name_fr || 'Produit inconnu',
            brand: product.brands || '',
            category,
            image: product.image_url || product.image_front_url || undefined,
          };
        }
      } catch {
        // Passer à la variante suivante
      }
    }

    return null;
  } catch {
    return null;
  }
}
