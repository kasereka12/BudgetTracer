import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    Home,
    Wallet,
    CreditCard,
    Target,
    Apple,
    User,
    Menu,
    X,
    LogOut,
    Settings
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()

    const navigation = [
        { name: 'Tableau de bord', href: '/dashboard', icon: Home },
        { name: 'Budget', href: '/budget', icon: Wallet },
        { name: 'Dépenses', href: '/expenses', icon: CreditCard },
        { name: 'Objectifs', href: '/goals', icon: Target },
        { name: 'Alimentation', href: '/nutrition', icon: Apple },
        { name: 'Profil', href: '/profile', icon: User },
    ]

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut()
            toast.success('Déconnexion réussie')
        } catch (error) {
            toast.error('Erreur lors de la déconnexion')
        }
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar mobile */}
            <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
                    <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-primary-600">BudgetTracker</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-2">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                    <div className="border-t border-gray-200 p-4">
                        <button
                            onClick={handleSignOut}
                            className="flex w-full items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar desktop */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
                <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
                    <div className="flex h-16 items-center px-4 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-primary-600">BudgetTracker</h1>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-2">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                    <div className="border-t border-gray-200 p-4">
                        <button
                            onClick={handleSignOut}
                            className="flex w-full items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="lg:pl-64 flex flex-col flex-1">
                {/* Header mobile */}
                <div className="lg:hidden flex h-16 items-center justify-between px-4 bg-white border-b border-gray-200">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">BudgetTracker</h1>
                    <div className="w-6" />
                </div>

                {/* Contenu de la page */}
                <main className="flex-1 overflow-auto">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Layout
