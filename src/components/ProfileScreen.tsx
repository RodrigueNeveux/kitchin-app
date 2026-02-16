import { ArrowLeft, Users, Copy, LogOut, UserPlus, Check, UserX, Settings, QrCode, DoorOpen } from 'lucide-react';
import { useState } from 'react';
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
  email: string;
}

interface Household {
  id: string;
  name: string;
}

interface ProfileScreenProps {
  user: any;
  household: (Household & { createdBy?: string }) | null;
  members: Member[];
  onBack: () => void;
  onLogout: () => void;
  onCreateInvite: () => Promise<string>;
  onJoinHousehold: (code: string) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onCreateHousehold?: (name: string) => Promise<void>;
  onLeaveHousehold?: () => Promise<void>;
  onSettingsClick?: () => void;
}

// URL pour générer un QR code (API gratuite)
const getQRCodeUrl = (text: string, size = 200) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;

export function ProfileScreen({
  user,
  household,
  members,
  onBack,
  onLogout,
  onCreateInvite,
  onJoinHousehold,
  onRemoveMember,
  onCreateHousehold,
  onLeaveHousehold,
  onSettingsClick,
}: ProfileScreenProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check if current user is the household owner
  const isOwner = household?.createdBy === user?.id;
  const hasHousehold = !!household;

  const handleCreateInvite = async () => {
    setLoading(true);
    try {
      const code = await onCreateInvite();
      setInviteCode(code);
      setShowInvite(true);
    } catch (error) {
      console.error('Error creating invite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success('Code copié dans le presse-papiers !', { duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinHousehold = async () => {
    if (!joinCode.trim()) {
      toast.error('Veuillez entrer un code d\'invitation');
      return;
    }
    setLoading(true);
    try {
      // Nettoyer le code (supprimer les tirets et espaces)
      const cleanCode = joinCode.replace(/[-\s]/g, '').trim();
      await onJoinHousehold(cleanCode);
      setShowJoin(false);
      setJoinCode('');
      // Le toast de succès est géré dans App.tsx
    } catch (error: any) {
      console.error('Error joining household:', error);
      // L'erreur est déjà gérée dans App.tsx avec toast.error
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir retirer ${memberName} du foyer ?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await onRemoveMember(memberId);
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Erreur lors du retrait du membre');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHousehold = async () => {
    const name = newHouseholdName.trim() || `Foyer de ${user?.name || 'Utilisateur'}`;
    if (!onCreateHousehold) return;
    setLoading(true);
    try {
      await onCreateHousehold(name);
      setShowCreate(false);
      setNewHouseholdName('');
    } catch (error) {
      console.error('Error creating household:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveHousehold = async () => {
    if (!confirm('Êtes-vous sûr de vouloir quitter ce foyer ? Vous perdrez l\'accès à l\'inventaire et aux listes partagées.')) {
      return;
    }
    if (!onLeaveHousehold) return;
    setLoading(true);
    try {
      await onLeaveHousehold();
    } catch (error) {
      console.error('Error leaving household:', error);
    } finally {
      setLoading(false);
    }
  };

  const inviteLink = inviteCode ? `https://kitchin.app/join/${inviteCode}` : '';

  return (
    <div className="flex flex-col h-screen bg-stone-200">
      {/* Header */}
      <header className="bg-stone-100 px-6 py-4 shadow-sm border-b border-stone-300 flex-shrink-0 transition-colors duration-300">
        <div className="flex items-center justify-between max-w-md md:max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-stone-300 transition-colors duration-300"
          >
            <ArrowLeft className="w-6 h-6 text-stone-600" />
          </button>
          <h1 className="text-stone-800">
            Mon Profil
          </h1>
          <div className="flex items-center gap-2">
            {onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className="p-2 rounded-full hover:bg-stone-300 transition-colors duration-300"
                title="Paramètres"
              >
                <Settings className="w-6 h-6 text-stone-600" />
              </button>
            )}
            <button
              onClick={onLogout}
              className="p-2 rounded-full hover:bg-red-100 transition-colors duration-300"
              title="Se déconnecter"
            >
              <LogOut className="w-6 h-6 text-red-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-6">
        <div className="max-w-md md:max-w-4xl mx-auto space-y-6">
          {/* User Info */}
          <section className="bg-stone-100 rounded-xl p-6 shadow-sm border border-stone-300 transition-colors duration-300">
            <h3 className="text-stone-800 mb-4">
              Mes informations
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-stone-500">
                  Nom
                </p>
                <p className="text-stone-800">
                  {user.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-500">
                  Email
                </p>
                <p className="text-stone-800">
                  {user.email}
                </p>
              </div>
            </div>
          </section>

          {/* Household Info */}
          <section className="bg-stone-100 rounded-xl p-6 shadow-sm border border-stone-300 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-stone-800">
                Mon Foyer
              </h3>
              <Users className="w-5 h-5 text-green-600" />
            </div>
            
            {hasHousehold ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-stone-500">
                    Nom du foyer
                  </p>
                  <p className="text-stone-800">
                    {household?.name}
                  </p>
                </div>

                {/* Members List */}
                <div className="mb-4">
                  <p className="text-sm text-stone-500 mb-2">
                    Membres ({members.length})
                  </p>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-stone-200 rounded-lg transition-colors duration-300"
                      >
                        <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                          <span className="text-green-800">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-stone-800 text-sm">
                              {member.name}
                            </p>
                            {member.id === household?.createdBy && (
                              <span className="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded-full">
                                Propriétaire
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500">
                            {member.email}
                          </p>
                        </div>
                        {isOwner && member.id !== user?.id && (
                          <button
                            onClick={() => handleRemoveMember(member.id, member.name)}
                            disabled={loading}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-300 disabled:opacity-50"
                            title="Retirer ce membre"
                          >
                            <UserX className="w-5 h-5 text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invite Section - Only when in a household */}
                <div className="space-y-2">
                  <button
                    onClick={handleCreateInvite}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700  text-white rounded-lg transition-colors duration-300 disabled:opacity-50 cursor-pointer active:scale-95 transform"
                  >
                    <UserPlus className="w-5 h-5" />
                    Inviter un membre
                  </button>

                  {showInvite && inviteCode && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100  p-5 rounded-xl border border-green-300 shadow-sm transition-colors duration-300 relative">
                      <button
                        onClick={() => { setShowInvite(false); setShowQRCode(false); }}
                        className="absolute top-3 right-3 p-1 hover:bg-green-300 rounded-full transition-colors duration-300"
                        title="Fermer"
                      >
                        <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-stone-800 font-medium">Code d'invitation généré !</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-stone-100 px-4 py-3 rounded-lg border-2 border-green-400 text-green-800 text-lg tracking-wider text-center select-all font-mono">
                            {inviteCode.length > 9 ? `${inviteCode.slice(0, 9)}-${inviteCode.slice(9)}` : inviteCode}
                          </code>
                          <button onClick={handleCopyCode} className="p-3 bg-stone-100 hover:bg-green-200 rounded-lg border-2 border-green-400 transition-colors duration-300" title="Copier le code">
                            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-green-600" />}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(inviteLink);
                              toast.success('Lien copié !', { duration: 2000 });
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-stone-100 rounded-lg border border-green-300 hover:bg-green-100 transition-colors duration-300"
                          >
                            <Copy className="w-4 h-4 text-green-600" />
                            Copier le lien
                          </button>
                          <button
                            onClick={() => setShowQRCode(!showQRCode)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 rounded-lg border border-green-300 hover:bg-green-100 transition-colors duration-300"
                            title="Afficher le QR code"
                          >
                            <QrCode className="w-5 h-5 text-green-600" />
                            QR Code
                          </button>
                        </div>
                        {showQRCode && inviteLink && (
                          <div className="flex justify-center pt-2">
                            <img src={getQRCodeUrl(inviteLink, 180)} alt="QR Code invitation" className="rounded-lg border-2 border-green-300 bg-white p-2" />
                          </div>
                        )}
                        <p className="text-xs text-stone-600 flex items-start gap-2">
                          <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Partagez ce code ou ce lien. Le code expire dans 7 jours.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rejoindre un autre foyer - pour ceux qui veulent changer */}
                  <button
                    onClick={() => setShowJoin(!showJoin)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-300 hover:bg-stone-400 text-stone-700 rounded-lg transition-colors duration-300"
                  >
                    <Users className="w-5 h-5" />
                    Rejoindre un autre foyer
                  </button>
                  {showJoin && (
                    <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
                      <p className="text-sm text-stone-700 mb-2">Vous quitterez ce foyer en rejoignant un autre. Entrez le code :</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value.replace(/[^A-Z0-9]/g, '').toUpperCase())}
                          placeholder="Code d'invitation"
                          className="flex-1 px-4 py-2 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-stone-100 text-stone-800 uppercase"
                        />
                        <button onClick={handleJoinHousehold} disabled={loading || !joinCode.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50">Rejoindre</button>
                      </div>
                    </div>
                  )}

                  {/* Quitter le foyer - pour les membres non-propriétaires */}
                  {!isOwner && onLeaveHousehold && (
                    <button
                      onClick={handleLeaveHousehold}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-300"
                    >
                      <DoorOpen className="w-5 h-5" />
                      Quitter le foyer
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Pas de foyer - Créer ou Rejoindre */
              <div className="space-y-4">
                <div className="p-4 bg-amber-100 rounded-lg border border-amber-300">
                  <p className="text-amber-800 text-sm mb-2">
                    Vous n'êtes pas encore dans un foyer. Créez-en un ou rejoignez-en un avec un code d'invitation.
                  </p>
                </div>
                {onCreateHousehold && (
                  <>
                    <button onClick={() => setShowCreate(!showCreate)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-300">
                      <UserPlus className="w-5 h-5" />
                      Créer un foyer
                    </button>
                    {showCreate && (
                      <div className="bg-green-100 p-4 rounded-lg border border-green-300 space-y-2">
                        <input
                          type="text"
                          value={newHouseholdName}
                          onChange={(e) => setNewHouseholdName(e.target.value)}
                          placeholder="Nom du foyer (ex: Maison Dupont)"
                          className="w-full px-4 py-2 border border-green-300 rounded-lg bg-stone-100 text-stone-800"
                        />
                        <button onClick={handleCreateHousehold} disabled={loading} className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Créer</button>
                      </div>
                    )}
                  </>
                )}
                <button onClick={() => setShowJoin(!showJoin)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300">
                  <Users className="w-5 h-5" />
                  Rejoindre un foyer avec un code
                </button>
                {showJoin && (
                  <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
                    <p className="text-sm text-stone-700 mb-2">Entrez le code d'invitation :</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.replace(/[^A-Z0-9]/g, '').toUpperCase())}
                        placeholder="Code d'invitation"
                        className="flex-1 px-4 py-2 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-stone-100 text-stone-800 uppercase"
                      />
                      <button onClick={handleJoinHousehold} disabled={loading || !joinCode.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50">Rejoindre</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
