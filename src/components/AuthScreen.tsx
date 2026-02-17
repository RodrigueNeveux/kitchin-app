import { useState } from 'react';
import { LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onAuth: (email: string, password: string, name?: string, isSignup?: boolean) => Promise<void>;
  onForgotPassword?: (email: string) => Promise<void>;
}

export function AuthScreen({ onAuth, onForgotPassword }: AuthScreenProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotSuccess(false);
    if (!onForgotPassword) return;
    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }
    setLoading(true);
    try {
      await onForgotPassword(email);
      setForgotSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation basique côté client
      if (!email || !email.includes('@')) {
        setError('Veuillez entrer une adresse email valide');
        setLoading(false);
        return;
      }
      
      if (!password) {
        setError('Veuillez entrer votre mot de passe');
        setLoading(false);
        return;
      }
      
      if (isSignup && (!name || name.trim().length === 0)) {
        setError('Veuillez entrer votre nom complet');
        setLoading(false);
        return;
      }
      
      await onAuth(email, password, name, isSignup);
    } catch (err: any) {
      // Afficher le message d'erreur détaillé
      const errorMessage = err.message || 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  // Écran "Mot de passe oublié"
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="bg-stone-100 rounded-2xl shadow-xl border border-stone-300 p-8">
            <button
              onClick={() => { setShowForgotPassword(false); setError(''); setForgotSuccess(false); }}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
            <h2 className="text-stone-800 text-center mb-2">Mot de passe oublié</h2>
            <p className="text-stone-600 text-sm text-center mb-6">
              Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            {forgotSuccess ? (
              <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg text-sm text-center">
                Un email a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte de réception (et les spams).
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-stone-50 text-stone-800 placeholder:text-stone-500"
                    placeholder="email@exemple.com"
                    autoComplete="email"
                    required
                  />
                </div>
                {error && (
                  <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-green-700 mb-2">Kitch'In</h1>
          <p className="text-stone-600">Gérez votre cuisine en famille</p>
        </div>

        {/* Auth Form */}
        <div className="bg-stone-100 rounded-2xl shadow-xl border border-stone-300 p-8">
          <h2 className="text-stone-800 text-center mb-6">
            {isSignup ? 'Créer un compte' : 'Se connecter'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm text-stone-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-stone-50 text-stone-800 placeholder:text-stone-500"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-stone-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-stone-50 text-stone-800 placeholder:text-stone-500"
                placeholder="email@exemple.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-stone-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-stone-50 text-stone-800 placeholder:text-stone-500"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-700"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg text-sm space-y-2 border border-red-300">
                <p>{error}</p>
                {error.includes('CORS') && (
                  <div className="mt-2 pt-2 border-t border-red-300">
                    <p className="text-xs font-semibold mb-1">Solution :</p>
                    <ol className="text-xs list-decimal list-inside space-y-1">
                      <li>Allez sur <a href="https://supabase.com/dashboard/project/bguatwhgsgduclyacxqz/auth/url-configuration" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
                      <li>Dans <strong>Site URL</strong>, ajoutez votre URL Vercel</li>
                      <li>Dans <strong>Redirect URLs</strong>, ajoutez <code className="bg-red-200 px-1 rounded">https://*.vercel.app/**</code></li>
                      <li>Sauvegardez et réessayez</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              {loading
                ? 'Chargement...'
                : isSignup
                ? 'Créer mon compte'
                : 'Se connecter'}
            </button>

          </form>

          <div className="mt-6 text-center space-y-3">
            {!isSignup && onForgotPassword && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="block w-full text-sm text-blue-600 hover:text-blue-700 mb-2"
              >
                Mot de passe oublié ?
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {isSignup
                ? 'Déjà un compte ? Se connecter'
                : 'Pas encore de compte ? S\'inscrire'}
            </button>
            
            {!isSignup && error.includes('incorrect') && (
              <div className="pt-2">
                <p className="text-xs text-stone-500 mb-2">Première visite ?</p>
                <button
                  onClick={() => {
                    setIsSignup(true);
                    setError('');
                  }}
                  className="text-sm px-4 py-2 bg-stone-300 text-stone-800 rounded-lg hover:bg-stone-400 transition-colors"
                >
                  Créer un nouveau compte
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-stone-500 mt-6">
          En vous inscrivant, vous acceptez de partager vos données avec votre foyer
        </p>
      </div>
    </div>
  );
}
