import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Target,
    Calendar,
    AlertCircle,
    CheckCircle
} from 'lucide-react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
)

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalExpenses: 0,
        totalIncome: 0,
        monthlyBudget: 0,
        activeGoals: 0,
        completedGoals: 0,
        budgetUsed: 0
    })
    const [recentExpenses, setRecentExpenses] = useState([])
    const [expenseChartData, setExpenseChartData] = useState(null)
    const [categoryChartData, setCategoryChartData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Récupérer les statistiques
            const currentMonth = new Date().toISOString().slice(0, 7)

            // Dépenses du mois
            const { data: expenses } = await supabase
                .from('expenses')
                .select('amount, date')
                .eq('user_id', user.id)
                .gte('date', `${currentMonth}-01`)
                .lte('date', `${currentMonth}-31`)

            // Revenus du mois
            const { data: income } = await supabase
                .from('income')
                .select('amount')
                .eq('user_id', user.id)
                .gte('date', `${currentMonth}-01`)
                .lte('date', `${currentMonth}-31`)

            // Budget mensuel
            const { data: budget } = await supabase
                .from('budgets')
                .select('amount')
                .eq('user_id', user.id)
                .eq('period', 'monthly')
                .eq('is_active', true)
                .single()

            // Objectifs
            const { data: goals } = await supabase
                .from('goals')
                .select('status')
                .eq('user_id', user.id)

            // Dépenses récentes
            const { data: recent } = await supabase
                .from('expenses')
                .select(`
          amount,
          description,
          date,
          expense_categories(name, color)
        `)
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(5)

            // Calculer les statistiques
            const totalExpenses = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0
            const totalIncome = income?.reduce((sum, inc) => sum + parseFloat(inc.amount), 0) || 0
            const monthlyBudget = budget?.amount || 0
            const activeGoals = goals?.filter(g => g.status === 'active').length || 0
            const completedGoals = goals?.filter(g => g.status === 'completed').length || 0

            setStats({
                totalExpenses,
                totalIncome,
                monthlyBudget,
                activeGoals,
                completedGoals,
                budgetUsed: monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0
            })

            setRecentExpenses(recent || [])

            // Préparer les données des graphiques
            prepareChartData(expenses || [])

        } catch (error) {
            console.error('Erreur lors du chargement des données:', error)
        } finally {
            setLoading(false)
        }
    }

    const prepareChartData = (expenses) => {
        // Graphique des dépenses par jour (7 derniers jours)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - i)
            return date.toISOString().slice(0, 10)
        }).reverse()

        const dailyExpenses = last7Days.map(date => {
            const dayExpenses = expenses.filter(exp => exp.date === date)
            return dayExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
        })

        setExpenseChartData({
            labels: last7Days.map(date => new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' })),
            datasets: [{
                label: 'Dépenses (€)',
                data: dailyExpenses,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
        })

        // Graphique des catégories (simulation pour l'instant)
        setCategoryChartData({
            labels: ['Alimentation', 'Transport', 'Logement', 'Divertissement', 'Autres'],
            datasets: [{
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                    '#ef4444',
                    '#3b82f6',
                    '#10b981',
                    '#8b5cf6',
                    '#6b7280'
                ]
            }]
        })
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
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <TrendingDown className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Dépenses ce mois</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalExpenses.toFixed(2)} €</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Revenus ce mois</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalIncome.toFixed(2)} €</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Budget mensuel</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.monthlyBudget.toFixed(2)} €</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Target className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Objectifs actifs</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeGoals}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerte budget */}
            {stats.budgetUsed > 80 && (
                <div className="card p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                        <p className="text-yellow-800">
                            Attention ! Vous avez utilisé {stats.budgetUsed.toFixed(1)}% de votre budget mensuel.
                        </p>
                    </div>
                </div>
            )}

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dépenses des 7 derniers jours</h3>
                    {expenseChartData && (
                        <Line
                            data={expenseChartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }}
                        />
                    )}
                </div>

                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par catégorie</h3>
                    {categoryChartData && (
                        <Doughnut
                            data={categoryChartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'bottom'
                                    }
                                }
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Dépenses récentes */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dépenses récentes</h3>
                <div className="space-y-3">
                    {recentExpenses.length > 0 ? (
                        recentExpenses.map((expense, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center">
                                    <div
                                        className="w-3 h-3 rounded-full mr-3"
                                        style={{ backgroundColor: expense.expense_categories?.color || '#6b7280' }}
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">{expense.description || 'Dépense'}</p>
                                        <p className="text-sm text-gray-500">
                                            {expense.expense_categories?.name || 'Non catégorisé'} • {new Date(expense.date).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                                <p className="font-semibold text-gray-900">-{parseFloat(expense.amount).toFixed(2)} €</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">Aucune dépense récente</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
