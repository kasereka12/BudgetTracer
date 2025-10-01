import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { User, Mail, Save, Camera, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

const Profile = () => {
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        avatar_url: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Récupérer le profil depuis la table profiles
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw error
            }

            setProfile({
                full_name: profileData?.full_name || user.user_metadata?.full_name || '',
                email: user.email || '',
                avatar_url: profileData?.avatar_url || ''
            })
        } catch (error) {
            console.error('Erreur lors du chargement du profil:', error)
            toast.error('Erreur lors du chargement du profil')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Mettre à jour le profil dans la table profiles
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: profile.full_name,
                    avatar_url: profile.avatar_url,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error

            toast.success('Profil mis à jour avec succès')
        } catch (error) {
            toast.error('Erreur lors de la mise à jour du profil')
        } finally {
            setSaving(false)
        }
    }

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut()
            toast.success('Déconnexion réussie')
        } catch (error) {
            toast.error('Erreur lors de la déconnexion')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
            </div>

            <div className="card p-6">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Photo de profil */}
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Photo de profil"
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="h-12 w-12 text-primary-600" />
                                )}
                            </div>
                            <button
                                type="button"
                                className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{profile.full_name || 'Utilisateur'}</h3>
                            <p className="text-gray-500">{profile.email}</p>
                        </div>
                    </div>

                    {/* Informations personnelles */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom complet
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    className="input-field pl-10"
                                    placeholder="Votre nom complet"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Adresse email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="input-field pl-10 bg-gray-50 text-gray-500"
                                    placeholder="votre@email.com"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                L'adresse email ne peut pas être modifiée
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL de l'avatar
                            </label>
                            <input
                                type="url"
                                value={profile.avatar_url}
                                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                                className="input-field"
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="h-5 w-5 mr-2" />
                            Se déconnecter
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary flex items-center"
                        >
                            {saving ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            ) : (
                                <Save className="h-5 w-5 mr-2" />
                            )}
                            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Statistiques du compte */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques du compte</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">0</div>
                        <div className="text-sm text-blue-600">Dépenses ce mois</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-sm text-green-600">Objectifs actifs</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">0</div>
                        <div className="text-sm text-purple-600">Repas enregistrés</div>
                    </div>
                </div>
            </div>

            {/* Informations sur l'application */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos de BudgetTracker</h3>
                <div className="space-y-3 text-sm text-gray-600">
                    <p>
                        BudgetTracker est une application de gestion financière personnelle qui vous aide à :
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Suivre vos dépenses quotidiennes</li>
                        <li>Gérer vos budgets mensuels et annuels</li>
                        <li>Définir et atteindre vos objectifs financiers</li>
                        <li>Surveiller votre alimentation et ses coûts</li>
                        <li>Visualiser vos données avec des graphiques</li>
                    </ul>
                    <p className="pt-2">
                        Version 1.0.0 - Développé avec React, Tailwind CSS et Supabase
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Profile
