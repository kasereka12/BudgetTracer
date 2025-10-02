import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2, Search, Filter, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const Expenses = () => {
    const [expenses, setExpenses] = useState([])
    const [categories, setCategories] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingExpense, setEditingExpense] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [dateFilter, setDateFilter] = useState('')
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category_id: '',
        date: new Date().toISOString().slice(0, 10),
        location: '',
        notes: ''
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchExpenses()
        fetchCategories()
    }, [])

    const fetchExpenses = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('expenses')
                .select(`
          *,
          expense_categories(name, color, icon)
        `)
                .eq('user_id', user.id)
                .order('date', { ascending: false })

            if (error) throw error
            setExpenses(data || [])
        } catch (error) {
            toast.error('Erreur lors du chargement des dépenses')
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('expense_categories')
                .select('*')
            //.eq('user_id', user.id)
            //.order('name')

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Erreur lors du chargement des catégories:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const expenseData = {
                ...formData,
                user_id: user.id,
                amount: parseFloat(formData.amount),
                category_id: formData.category_id || null
            }

            if (editingExpense) {
                const { error } = await supabase
                    .from('expenses')
                    .update(expenseData)
                    .eq('id', editingExpense.id)
                if (error) throw error
                toast.success('Dépense mise à jour avec succès')
            } else {
                const { error } = await supabase
                    .from('expenses')
                    .insert([expenseData])
                if (error) throw error
                toast.success('Dépense ajoutée avec succès')
            }

            setShowForm(false)
            setEditingExpense(null)
            setFormData({
                amount: '',
                description: '',
                category_id: '',
                date: new Date().toISOString().slice(0, 10),
                location: '',
                notes: ''
            })
            fetchExpenses()
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde de la dépense')
        }
    }

    const handleEdit = (expense) => {
        setEditingExpense(expense)
        setFormData({
            amount: expense.amount.toString(),
            description: expense.description || '',
            category_id: expense.category_id || '',
            date: expense.date,
            location: expense.location || '',
            notes: expense.notes || ''
        })
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return

        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id)
            if (error) throw error
            toast.success('Dépense supprimée avec succès')
            fetchExpenses()
        } catch (error) {
            toast.error('Erreur lors de la suppression de la dépense')
        }
    }

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.location?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = !selectedCategory || expense.category_id === selectedCategory
        const matchesDate = !dateFilter || expense.date === dateFilter

        return matchesSearch && matchesCategory && matchesDate
    })

    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)

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
                <h1 className="text-2xl font-bold text-gray-900">Suivi des dépenses</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Nouvelle dépense
                </button>
            </div>

            {/* Filtres et recherche */}
            <div className="card p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input-field"
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="input-field"
                    />

                    <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Total: {totalExpenses.toFixed(2)} €</span>
                    </div>
                </div>
            </div>

            {/* Formulaire d'ajout/modification */}
            {showForm && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {editingExpense ? 'Modifier la dépense' : 'Nouvelle dépense'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-field"
                                placeholder="ex: Courses au supermarché"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Catégorie
                                </label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lieu
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="input-field"
                                    placeholder="ex: Carrefour, Station-service..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="input-field"
                                rows="3"
                                placeholder="Notes supplémentaires..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingExpense(null)
                                    setFormData({
                                        amount: '',
                                        description: '',
                                        category_id: '',
                                        date: new Date().toISOString().slice(0, 10),
                                        location: '',
                                        notes: ''
                                    })
                                }}
                                className="btn-secondary"
                            >
                                Annuler
                            </button>
                            <button type="submit" className="btn-primary">
                                {editingExpense ? 'Mettre à jour' : 'Ajouter'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Liste des dépenses */}
            <div className="card">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Dépenses ({filteredExpenses.length})
                    </h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {filteredExpenses.length > 0 ? (
                        filteredExpenses.map((expense) => (
                            <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: expense.expense_categories?.color || '#6b7280' }}
                                        />
                                        <div>
                                            <h4 className="font-medium text-gray-900">{expense.description}</h4>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>{expense.expense_categories?.name || 'Non catégorisé'}</span>
                                                <span>•</span>
                                                <span>{new Date(expense.date).toLocaleDateString('fr-FR')}</span>
                                                {expense.location && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{expense.location}</span>
                                                    </>
                                                )}
                                            </div>
                                            {expense.notes && (
                                                <p className="text-sm text-gray-600 mt-1">{expense.notes}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <span className="text-lg font-semibold text-gray-900">
                                            -{parseFloat(expense.amount).toFixed(2)} €
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEdit(expense)}
                                                className="text-gray-400 hover:text-primary-600"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(expense.id)}
                                                className="text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <Calendar className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune dépense trouvée</h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || selectedCategory || dateFilter
                                    ? 'Aucune dépense ne correspond à vos critères de recherche.'
                                    : 'Commencez par ajouter votre première dépense.'
                                }
                            </p>
                            {!searchTerm && !selectedCategory && !dateFilter && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="btn-primary"
                                >
                                    Ajouter une dépense
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Expenses
