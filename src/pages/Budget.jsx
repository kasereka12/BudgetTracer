import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2, Calendar, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

const Budget = () => {
    const [budgets, setBudgets] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingBudget, setEditingBudget] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        period: 'monthly',
        category: '',
        start_date: '',
        end_date: ''
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBudgets()
    }, [])

    const fetchBudgets = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setBudgets(data || [])
        } catch (error) {
            toast.error('Erreur lors du chargement des budgets')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const budgetData = {
                ...formData,
                user_id: user.id,
                amount: parseFloat(formData.amount),
                start_date: formData.start_date || new Date().toISOString().slice(0, 10),
                end_date: formData.end_date || (formData.period === 'monthly'
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
                    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
                )
            }

            if (editingBudget) {
                const { error } = await supabase
                    .from('budgets')
                    .update(budgetData)
                    .eq('id', editingBudget.id)
                if (error) throw error
                toast.success('Budget mis à jour avec succès')
            } else {
                console.log("Budget à insérer:", budgetData)

                const { error } = await supabase
                    .from('budgets')
                    .insert([budgetData])
                if (error) throw error
                toast.success('Budget créé avec succès')
            }

            setShowForm(false)
            setEditingBudget(null)
            setFormData({
                name: '',
                amount: '',
                period: 'monthly',
                category: '',
                start_date: '',
                end_date: ''
            })
            fetchBudgets()
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde du budget')
        }
    }

    const handleEdit = (budget) => {
        setEditingBudget(budget)
        setFormData({
            name: budget.name,
            amount: budget.amount.toString(),
            period: budget.period,
            category: budget.category || '',
            start_date: budget.start_date,
            end_date: budget.end_date
        })
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')) return

        try {
            const { error } = await supabase
                .from('budgets')
                .delete()
                .eq('id', id)
            if (error) throw error
            toast.success('Budget supprimé avec succès')
            fetchBudgets()
        } catch (error) {
            toast.error('Erreur lors de la suppression du budget')
        }
    }

    const toggleBudgetStatus = async (budget) => {
        try {
            const { error } = await supabase
                .from('budgets')
                .update({ is_active: !budget.is_active })
                .eq('id', budget.id)
            if (error) throw error
            toast.success(`Budget ${budget.is_active ? 'désactivé' : 'activé'}`)
            fetchBudgets()
        } catch (error) {
            toast.error('Erreur lors de la mise à jour du budget')
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des budgets</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Nouveau budget
                </button>
            </div>

            {/* Formulaire d'ajout/modification */}
            {showForm && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {editingBudget ? 'Modifier le budget' : 'Nouveau budget'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom du budget
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="ex: Budget alimentaire"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Montant (€)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="input-field"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Période
                                </label>
                                <select
                                    value={formData.period}
                                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="monthly">Mensuel</option>
                                    <option value="yearly">Annuel</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Catégorie
                                </label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input-field"
                                    placeholder="ex: Alimentation, Transport..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date de début
                                </label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date de fin
                                </label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingBudget(null)
                                    setFormData({
                                        name: '',
                                        amount: '',
                                        period: 'monthly',
                                        category: '',
                                        start_date: '',
                                        end_date: ''
                                    })
                                }}
                                className="btn-secondary"
                            >
                                Annuler
                            </button>
                            <button type="submit" className="btn-primary">
                                {editingBudget ? 'Mettre à jour' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Liste des budgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((budget) => (
                    <div key={budget.id} className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
                                <p className="text-sm text-gray-500">{budget.category}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleEdit(budget)}
                                    className="text-gray-400 hover:text-primary-600"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(budget.id)}
                                    className="text-gray-400 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Montant</span>
                                <span className="font-semibold text-gray-900">{budget.amount.toFixed(2)} €</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Période</span>
                                <span className="text-sm text-gray-900 capitalize">
                                    {budget.period === 'monthly' ? 'Mensuel' : 'Annuel'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Statut</span>
                                <button
                                    onClick={() => toggleBudgetStatus(budget)}
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${budget.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {budget.is_active ? 'Actif' : 'Inactif'}
                                </button>
                            </div>

                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(budget.start_date).toLocaleDateString('fr-FR')} - {new Date(budget.end_date).toLocaleDateString('fr-FR')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {budgets.length === 0 && (
                <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun budget configuré</h3>
                    <p className="text-gray-500 mb-4">Créez votre premier budget pour commencer à suivre vos dépenses.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-primary"
                    >
                        Créer un budget
                    </button>
                </div>
            )}
        </div>
    )
}

export default Budget
