import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2, Target, Calendar, TrendingUp, CheckCircle, Pause, Play } from 'lucide-react'
import toast from 'react-hot-toast'

const Goals = () => {
    const [goals, setGoals] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingGoal, setEditingGoal] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target_amount: '',
        current_amount: '',
        target_date: '',
        category: 'savings',
        priority: 'medium'
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchGoals()
    }, [])

    const fetchGoals = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setGoals(data || [])
        } catch (error) {
            toast.error('Erreur lors du chargement des objectifs')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const goalData = {
                ...formData,
                user_id: user.id,
                target_amount: formData.target_amount ? parseFloat(formData.target_amount) : null,
                current_amount: formData.current_amount ? parseFloat(formData.current_amount) : 0
            }

            if (editingGoal) {
                const { error } = await supabase
                    .from('goals')
                    .update(goalData)
                    .eq('id', editingGoal.id)
                if (error) throw error
                toast.success('Objectif mis à jour avec succès')
            } else {
                const { error } = await supabase
                    .from('goals')
                    .insert([goalData])
                if (error) throw error
                toast.success('Objectif créé avec succès')
            }

            setShowForm(false)
            setEditingGoal(null)
            setFormData({
                title: '',
                description: '',
                target_amount: '',
                current_amount: '',
                target_date: '',
                category: 'savings',
                priority: 'medium'
            })
            fetchGoals()
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde de l\'objectif')
        }
    }

    const handleEdit = (goal) => {
        setEditingGoal(goal)
        setFormData({
            title: goal.title,
            description: goal.description || '',
            target_amount: goal.target_amount?.toString() || '',
            current_amount: goal.current_amount?.toString() || '',
            target_date: goal.target_date || '',
            category: goal.category,
            priority: goal.priority
        })
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) return

        try {
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', id)
            if (error) throw error
            toast.success('Objectif supprimé avec succès')
            fetchGoals()
        } catch (error) {
            toast.error('Erreur lors de la suppression de l\'objectif')
        }
    }

    const updateGoalStatus = async (goal, newStatus) => {
        try {
            const { error } = await supabase
                .from('goals')
                .update({ status: newStatus })
                .eq('id', goal.id)
            if (error) throw error
            toast.success(`Objectif ${newStatus === 'completed' ? 'marqué comme terminé' : 'mis en pause'}`)
            fetchGoals()
        } catch (error) {
            toast.error('Erreur lors de la mise à jour de l\'objectif')
        }
    }

    const updateProgress = async (goal, newAmount) => {
        try {
            const { error } = await supabase
                .from('goals')
                .update({ current_amount: parseFloat(newAmount) })
                .eq('id', goal.id)
            if (error) throw error
            toast.success('Progression mise à jour')
            fetchGoals()
        } catch (error) {
            toast.error('Erreur lors de la mise à jour de la progression')
        }
    }

    const getCategoryLabel = (category) => {
        const labels = {
            savings: 'Épargne',
            expense_reduction: 'Réduction des dépenses',
            income_increase: 'Augmentation des revenus',
            debt_payment: 'Remboursement de dette',
            investment: 'Investissement'
        }
        return labels[category] || category
    }

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-red-100 text-red-800'
        }
        return colors[priority] || colors.medium
    }

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            paused: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-gray-100 text-gray-800'
        }
        return colors[status] || colors.active
    }

    const getProgressPercentage = (goal) => {
        if (!goal.target_amount || goal.target_amount === 0) return 0
        return Math.min((goal.current_amount / goal.target_amount) * 100, 100)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Objectifs personnels</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Nouvel objectif
                </button>
            </div>

            {/* Formulaire d'ajout/modification */}
            {showForm && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {editingGoal ? 'Modifier l\'objectif' : 'Nouvel objectif'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Titre de l'objectif
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input-field"
                                placeholder="ex: Épargner pour les vacances"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-field"
                                rows="3"
                                placeholder="Décrivez votre objectif..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Montant cible (€)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.target_amount}
                                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                                    className="input-field"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Montant actuel (€)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.current_amount}
                                    onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                                    className="input-field"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date cible
                                </label>
                                <input
                                    type="date"
                                    value={formData.target_date}
                                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priorité
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="low">Faible</option>
                                    <option value="medium">Moyenne</option>
                                    <option value="high">Élevée</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Catégorie
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="input-field"
                            >
                                <option value="savings">Épargne</option>
                                <option value="expense_reduction">Réduction des dépenses</option>
                                <option value="income_increase">Augmentation des revenus</option>
                                <option value="debt_payment">Remboursement de dette</option>
                                <option value="investment">Investissement</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingGoal(null)
                                    setFormData({
                                        title: '',
                                        description: '',
                                        target_amount: '',
                                        current_amount: '',
                                        target_date: '',
                                        category: 'savings',
                                        priority: 'medium'
                                    })
                                }}
                                className="btn-secondary"
                            >
                                Annuler
                            </button>
                            <button type="submit" className="btn-primary">
                                {editingGoal ? 'Mettre à jour' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Liste des objectifs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {goals.map((goal) => (
                    <div key={goal.id} className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                                <div className="flex items-center space-x-2 mb-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryLabel(goal.category)}`}>
                                        {getCategoryLabel(goal.category)}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                                        {goal.priority === 'low' ? 'Faible' : goal.priority === 'medium' ? 'Moyenne' : 'Élevée'}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                                        {goal.status === 'active' ? 'Actif' :
                                            goal.status === 'completed' ? 'Terminé' :
                                                goal.status === 'paused' ? 'En pause' : 'Annulé'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleEdit(goal)}
                                    className="text-gray-400 hover:text-primary-600"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(goal.id)}
                                    className="text-gray-400 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Progression */}
                        {goal.target_amount && (
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Progression</span>
                                    <span>{goal.current_amount.toFixed(2)} € / {goal.target_amount.toFixed(2)} €</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${getProgressPercentage(goal)}%` }}
                                    />
                                </div>
                                <div className="text-right text-sm text-gray-500 mt-1">
                                    {getProgressPercentage(goal).toFixed(1)}%
                                </div>
                            </div>
                        )}

                        {/* Date cible */}
                        {goal.target_date && (
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <Calendar className="h-4 w-4 mr-1" />
                                Date cible: {new Date(goal.target_date).toLocaleDateString('fr-FR')}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {goal.status === 'active' && (
                                    <>
                                        <button
                                            onClick={() => updateGoalStatus(goal, 'completed')}
                                            className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Terminer
                                        </button>
                                        <button
                                            onClick={() => updateGoalStatus(goal, 'paused')}
                                            className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
                                        >
                                            <Pause className="h-4 w-4 mr-1" />
                                            Pause
                                        </button>
                                    </>
                                )}
                                {goal.status === 'paused' && (
                                    <button
                                        onClick={() => updateGoalStatus(goal, 'active')}
                                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                                    >
                                        <Play className="h-4 w-4 mr-1" />
                                        Reprendre
                                    </button>
                                )}
                            </div>

                            {goal.target_amount && goal.status === 'active' && (
                                <button
                                    onClick={() => {
                                        const newAmount = prompt('Nouveau montant actuel:', goal.current_amount.toString())
                                        if (newAmount && !isNaN(newAmount)) {
                                            updateProgress(goal, newAmount)
                                        }
                                    }}
                                    className="flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm hover:bg-primary-200 transition-colors"
                                >
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    Mettre à jour
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {goals.length === 0 && (
                <div className="text-center py-12">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun objectif défini</h3>
                    <p className="text-gray-500 mb-4">Créez votre premier objectif pour commencer à planifier votre avenir financier.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-primary"
                    >
                        Créer un objectif
                    </button>
                </div>
            )}
        </div>
    )
}

export default Goals
