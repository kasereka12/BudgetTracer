import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2, Apple, Calendar, Utensils } from 'lucide-react'
import toast from 'react-hot-toast'

const Nutrition = () => {
    const [meals, setMeals] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editingMeal, setEditingMeal] = useState(null)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
    const [formData, setFormData] = useState({
        name: '',
        meal_type: 'breakfast',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        sugar: '',
        sodium: '',
        cost: '',
        notes: ''
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMeals()
    }, [selectedDate])

    const fetchMeals = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('meals')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', selectedDate)
                .order('created_at', { ascending: true })

            if (error) throw error
            setMeals(data || [])
        } catch (error) {
            toast.error('Erreur lors du chargement des repas')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const mealData = {
                ...formData,
                user_id: user.id,
                date: selectedDate,
                calories: formData.calories ? parseInt(formData.calories) : null,
                protein: formData.protein ? parseFloat(formData.protein) : null,
                carbs: formData.carbs ? parseFloat(formData.carbs) : null,
                fat: formData.fat ? parseFloat(formData.fat) : null,
                fiber: formData.fiber ? parseFloat(formData.fiber) : null,
                sugar: formData.sugar ? parseFloat(formData.sugar) : null,
                sodium: formData.sodium ? parseFloat(formData.sodium) : null,
                cost: formData.cost ? parseFloat(formData.cost) : null
            }

            if (editingMeal) {
                const { error } = await supabase
                    .from('meals')
                    .update(mealData)
                    .eq('id', editingMeal.id)
                if (error) throw error
                toast.success('Repas mis à jour avec succès')
            } else {
                const { error } = await supabase
                    .from('meals')
                    .insert([mealData])
                if (error) throw error
                toast.success('Repas ajouté avec succès')
            }

            setShowForm(false)
            setEditingMeal(null)
            setFormData({
                name: '',
                meal_type: 'breakfast',
                calories: '',
                protein: '',
                carbs: '',
                fat: '',
                fiber: '',
                sugar: '',
                sodium: '',
                cost: '',
                notes: ''
            })
            fetchMeals()
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde du repas')
        }
    }

    const handleEdit = (meal) => {
        setEditingMeal(meal)
        setFormData({
            name: meal.name,
            meal_type: meal.meal_type,
            calories: meal.calories?.toString() || '',
            protein: meal.protein?.toString() || '',
            carbs: meal.carbs?.toString() || '',
            fat: meal.fat?.toString() || '',
            fiber: meal.fiber?.toString() || '',
            sugar: meal.sugar?.toString() || '',
            sodium: meal.sodium?.toString() || '',
            cost: meal.cost?.toString() || '',
            notes: meal.notes || ''
        })
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) return

        try {
            const { error } = await supabase
                .from('meals')
                .delete()
                .eq('id', id)
            if (error) throw error
            toast.success('Repas supprimé avec succès')
            fetchMeals()
        } catch (error) {
            toast.error('Erreur lors de la suppression du repas')
        }
    }

    const getMealTypeLabel = (type) => {
        const labels = {
            breakfast: 'Petit-déjeuner',
            lunch: 'Déjeuner',
            dinner: 'Dîner',
            snack: 'Collation'
        }
        return labels[type] || type
    }

    const getMealTypeIcon = (type) => {
        const icons = {
            breakfast: '🌅',
            lunch: '☀️',
            dinner: '🌙',
            snack: '🍎'
        }
        return icons[type] || '🍽️'
    }

    const getMealsByType = () => {
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']
        return mealTypes.map(type => ({
            type,
            meals: meals.filter(meal => meal.meal_type === type)
        }))
    }

    const getDailyTotals = () => {
        return meals.reduce((totals, meal) => ({
            calories: totals.calories + (meal.calories || 0),
            protein: totals.protein + (meal.protein || 0),
            carbs: totals.carbs + (meal.carbs || 0),
            fat: totals.fat + (meal.fat || 0),
            fiber: totals.fiber + (meal.fiber || 0),
            sugar: totals.sugar + (meal.sugar || 0),
            sodium: totals.sodium + (meal.sodium || 0),
            cost: totals.cost + (meal.cost || 0)
        }), {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            cost: 0
        })
    }

    const dailyTotals = getDailyTotals()

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
                <h1 className="text-2xl font-bold text-gray-900">Suivi alimentaire</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Ajouter un repas
                </button>
            </div>

            {/* Sélecteur de date */}
            <div className="card p-4">
                <div className="flex items-center space-x-4">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <label className="text-sm font-medium text-gray-700">Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input-field"
                    />
                </div>
            </div>

            {/* Résumé nutritionnel du jour */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé nutritionnel</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{dailyTotals.calories}</div>
                        <div className="text-sm text-gray-500">Calories</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{dailyTotals.protein.toFixed(1)}g</div>
                        <div className="text-sm text-gray-500">Protéines</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{dailyTotals.carbs.toFixed(1)}g</div>
                        <div className="text-sm text-gray-500">Glucides</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{dailyTotals.fat.toFixed(1)}g</div>
                        <div className="text-sm text-gray-500">Lipides</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{dailyTotals.fiber.toFixed(1)}g</div>
                        <div className="text-sm text-gray-500">Fibres</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{dailyTotals.sugar.toFixed(1)}g</div>
                        <div className="text-sm text-gray-500">Sucres</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{dailyTotals.sodium.toFixed(1)}mg</div>
                        <div className="text-sm text-gray-500">Sodium</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{dailyTotals.cost.toFixed(2)}€</div>
                        <div className="text-sm text-gray-500">Coût</div>
                    </div>
                </div>
            </div>

            {/* Formulaire d'ajout/modification */}
            {showForm && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {editingMeal ? 'Modifier le repas' : 'Nouveau repas'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom du repas
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="ex: Salade de quinoa"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type de repas
                                </label>
                                <select
                                    value={formData.meal_type}
                                    onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="breakfast">Petit-déjeuner</option>
                                    <option value="lunch">Déjeuner</option>
                                    <option value="dinner">Dîner</option>
                                    <option value="snack">Collation</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Calories
                                </label>
                                <input
                                    type="number"
                                    value={formData.calories}
                                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                                    className="input-field"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Protéines (g)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.protein}
                                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                                    className="input-field"
                                    placeholder="0.0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Glucides (g)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.carbs}
                                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                                    className="input-field"
                                    placeholder="0.0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lipides (g)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.fat}
                                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                                    className="input-field"
                                    placeholder="0.0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fibres (g)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.fiber}
                                    onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                                    className="input-field"
                                    placeholder="0.0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sucres (g)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.sugar}
                                    onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                                    className="input-field"
                                    placeholder="0.0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sodium (mg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.sodium}
                                    onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
                                    className="input-field"
                                    placeholder="0.0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Coût (€)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                    className="input-field"
                                    placeholder="0.00"
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
                                    setEditingMeal(null)
                                    setFormData({
                                        name: '',
                                        meal_type: 'breakfast',
                                        calories: '',
                                        protein: '',
                                        carbs: '',
                                        fat: '',
                                        fiber: '',
                                        sugar: '',
                                        sodium: '',
                                        cost: '',
                                        notes: ''
                                    })
                                }}
                                className="btn-secondary"
                            >
                                Annuler
                            </button>
                            <button type="submit" className="btn-primary">
                                {editingMeal ? 'Mettre à jour' : 'Ajouter'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Liste des repas par type */}
            <div className="space-y-6">
                {getMealsByType().map(({ type, meals: typeMeals }) => (
                    <div key={type} className="card p-6">
                        <div className="flex items-center mb-4">
                            <span className="text-2xl mr-3">{getMealTypeIcon(type)}</span>
                            <h3 className="text-lg font-semibold text-gray-900">{getMealTypeLabel(type)}</h3>
                            <span className="ml-auto text-sm text-gray-500">({typeMeals.length} repas)</span>
                        </div>

                        {typeMeals.length > 0 ? (
                            <div className="space-y-3">
                                {typeMeals.map((meal) => (
                                    <div key={meal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{meal.name}</h4>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                {meal.calories && <span>{meal.calories} cal</span>}
                                                {meal.protein && <span>{meal.protein}g protéines</span>}
                                                {meal.carbs && <span>{meal.carbs}g glucides</span>}
                                                {meal.fat && <span>{meal.fat}g lipides</span>}
                                                {meal.cost && <span>{meal.cost.toFixed(2)}€</span>}
                                            </div>
                                            {meal.notes && (
                                                <p className="text-sm text-gray-600 mt-1">{meal.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEdit(meal)}
                                                className="text-gray-400 hover:text-primary-600"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(meal.id)}
                                                className="text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Utensils className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p>Aucun repas enregistré pour ce type</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {meals.length === 0 && (
                <div className="text-center py-12">
                    <Apple className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun repas enregistré</h3>
                    <p className="text-gray-500 mb-4">Commencez à suivre votre alimentation en ajoutant votre premier repas.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-primary"
                    >
                        Ajouter un repas
                    </button>
                </div>
            )}
        </div>
    )
}

export default Nutrition
