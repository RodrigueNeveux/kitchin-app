import { ArrowLeft, Users, Mail, Edit2, Check, Globe } from 'lucide-react';
import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from "sonner";

interface SettingsScreenProps {
  user: any;
  household: any;
  onBack: () => void;
  onUpdateHouseholdName?: (name: string) => Promise<void>;
  onUpdateEmail?: (email: string) => Promise<void>;
}

export function SettingsScreen({
  user,
  household,
  onBack,
  onUpdateHouseholdName,
  onUpdateEmail,
}: SettingsScreenProps) {
  // L'application est uniquement en français — suppression du contexte de langue
  // (les options de langue ont été retirées)
  const [isEditingHousehold, setIsEditingHousehold] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [householdName, setHouseholdName] = useState(household?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSaveHouseholdName = async () => {
    if (!householdName.trim()) {
      toast.error('Le nom du foyer ne peut pas être vide');
      return;
    }

    setLoading(true);
    try {
      if (onUpdateHouseholdName) {
        await onUpdateHouseholdName(householdName.trim());
        toast.success('Nom du foyer mis à jour');
      } else {
        toast.success('Nom du foyer mis à jour');
      }
      setIsEditingHousehold(false);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Email invalide');
      return;
    }

    setLoading(true);
    try {
      if (onUpdateEmail) {
        await onUpdateEmail(email.trim());
        toast.success('Email mis à jour');
      } else {
        toast.success('Email mis à jour');
      }
      setIsEditingEmail(false);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex flex-col h-screen bg-stone-200">
      {/* Header */}
      <header className="bg-stone-100 px-6 py-4 shadow-sm flex-shrink-0 border-b border-stone-300">
        <div className="flex items-center justify-between max-w-md md:max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-stone-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-600" />
          </button>
          <h1 className="text-stone-800">
            Paramètres
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        <div className="max-w-md md:max-w-4xl mx-auto space-y-6">
          {/* Language Section */}
          <section className="bg-stone-100 rounded-xl p-6 shadow-sm border border-stone-300 space-y-6">
            {/* Language Selection */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-green-600" />
                <h3 className="text-stone-800">
                  Langue
                </h3>
              </div>
              <div className="p-3 bg-stone-200 rounded-lg text-stone-700">
                L'application est disponible uniquement en français.
              </div>
            </div>
          </section>

          {/* Household Section */}
          <section className="bg-stone-100 rounded-xl p-6 shadow-sm border border-stone-300">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <h3 className="text-stone-800">
                Mon Foyer
              </h3>
            </div>

            {/* Household Name */}
            <div>
              <Label htmlFor="household-name" className="text-stone-700">
                Nom du foyer
              </Label>
              {isEditingHousehold ? (
                <div className="flex gap-2 mt-2">
                  <Input
                    id="household-name"
                    type="text"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    className="flex-1 bg-stone-50 text-stone-800 border-stone-300"
                    placeholder="Ex: Famille Dupont"
                  />
                  <button
                    onClick={handleSaveHouseholdName}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingHousehold(false);
                      setHouseholdName(household?.name || '');
                    }}
                    className="px-4 py-2 bg-stone-300 hover:bg-stone-400 text-stone-800 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-2 p-3 bg-stone-200 rounded-lg">
                  <p className="text-stone-800">
                    {household?.name || 'Aucun foyer'}
                  </p>
                  <button
                    onClick={() => setIsEditingHousehold(true)}
                    className="p-2 hover:bg-stone-300 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-stone-600" />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Account Section */}
          <section className="bg-stone-100 rounded-xl p-6 shadow-sm border border-stone-300">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="text-stone-800">
                Mon Compte
              </h3>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-stone-700">
                Adresse email
              </Label>
              {isEditingEmail ? (
                <div className="flex gap-2 mt-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-stone-50 text-stone-800 border-stone-300"
                    placeholder="exemple@email.com"
                  />
                  <button
                    onClick={handleSaveEmail}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingEmail(false);
                      setEmail(user?.email || '');
                    }}
                    className="px-4 py-2 bg-stone-300 hover:bg-stone-400 text-stone-800 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-2 p-3 bg-stone-200 rounded-lg">
                  <p className="text-stone-800">
                    {user?.email || 'Non défini'}
                  </p>
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="p-2 hover:bg-stone-300 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-stone-600" />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* App Info */}
          <section className="bg-stone-100 rounded-xl p-6 shadow-sm border border-stone-300">
            <h3 className="text-stone-800 mb-3">
              À propos
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Version</span>
                <span className="text-stone-800">1.0.0</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
