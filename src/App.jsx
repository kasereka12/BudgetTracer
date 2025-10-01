import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Auth from './components/Auth'
import Dashboard from './pages/Dashboard'
import Budget from './pages/Budget'
import Expenses from './pages/Expenses'
import Goals from './pages/Goals'
import Nutrition from './pages/Nutrition'
import Profile from './pages/Profile'

function App() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Récupérer la session actuelle
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })

        // Écouter les changements d'authentification
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
                <Auth />
                <Toaster position="top-right" />
            </div>
        )
    }

    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Layout>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/budget" element={<Budget />} />
                        <Route path="/expenses" element={<Expenses />} />
                        <Route path="/goals" element={<Goals />} />
                        <Route path="/nutrition" element={<Nutrition />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </Layout>
                <Toaster position="top-right" />
            </div>
        </Router>
    )
}

export default App
