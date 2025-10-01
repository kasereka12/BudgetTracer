-- Schéma de base de données pour l'application BudgetTracker

-- Table des utilisateurs (étend la table auth.users de Supabase)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users (id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Table des budgets
CREATE TABLE budgets (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    period TEXT NOT NULL CHECK (
        period IN ('monthly', 'yearly')
    ),
    category TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Table des catégories de dépenses
CREATE TABLE expense_categories (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT DEFAULT 'shopping-cart',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Table des dépenses
CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES expense_categories (id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Table des objectifs personnels
CREATE TABLE goals (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(10, 2),
    current_amount DECIMAL(10, 2) DEFAULT 0,
    target_date DATE,
    category TEXT NOT NULL CHECK (
        category IN (
            'savings',
            'expense_reduction',
            'income_increase',
            'debt_payment',
            'investment'
        )
    ),
    status TEXT DEFAULT 'active' CHECK (
        status IN (
            'active',
            'completed',
            'paused',
            'cancelled'
        )
    ),
    priority TEXT DEFAULT 'medium' CHECK (
        priority IN ('low', 'medium', 'high')
    ),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Table des repas
CREATE TABLE meals (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    meal_type TEXT NOT NULL CHECK (
        meal_type IN (
            'breakfast',
            'lunch',
            'dinner',
            'snack'
        )
    ),
    calories INTEGER,
    protein DECIMAL(5, 2),
    carbs DECIMAL(5, 2),
    fat DECIMAL(5, 2),
    fiber DECIMAL(5, 2),
    sugar DECIMAL(5, 2),
    sodium DECIMAL(5, 2),
    cost DECIMAL(8, 2),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Table des revenus
CREATE TABLE income (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    source TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency TEXT CHECK (
        recurring_frequency IN ('weekly', 'monthly', 'yearly')
    ),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Table des rappels et notifications
CREATE TABLE reminders (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reminder_type TEXT NOT NULL CHECK (
        reminder_type IN (
            'budget_alert',
            'goal_reminder',
            'expense_reminder',
            'meal_reminder'
        )
    ),
    scheduled_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_expenses_user_date ON expenses (user_id, date);

CREATE INDEX idx_expenses_category ON expenses (category_id);

CREATE INDEX idx_budgets_user_period ON budgets (user_id, period);

CREATE INDEX idx_goals_user_status ON goals (user_id, status);

CREATE INDEX idx_meals_user_date ON meals (user_id, date);

CREATE INDEX idx_income_user_date ON income (user_id, date);

-- Fonctions et triggers pour la mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

ALTER TABLE income ENABLE ROW LEVEL SECURITY;

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Policies pour permettre aux utilisateurs d'accéder uniquement à leurs propres données
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (auth.uid () = id);

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid () = id);

CREATE POLICY "Users can manage own budgets" ON budgets FOR ALL USING (auth.uid () = user_id);

CREATE POLICY "Users can manage own expense categories" ON expense_categories FOR ALL USING (auth.uid () = user_id);

CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL USING (auth.uid () = user_id);

CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (auth.uid () = user_id);

CREATE POLICY "Users can manage own meals" ON meals FOR ALL USING (auth.uid () = user_id);

CREATE POLICY "Users can manage own income" ON income FOR ALL USING (auth.uid () = user_id);

CREATE POLICY "Users can manage own reminders" ON reminders FOR ALL USING (auth.uid () = user_id);

-- Données de base pour les catégories de dépenses
INSERT INTO
    expense_categories (user_id, name, color, icon)
VALUES (
        NULL,
        'Alimentation',
        '#ef4444',
        'utensils'
    ),
    (
        NULL,
        'Transport',
        '#3b82f6',
        'car'
    ),
    (
        NULL,
        'Logement',
        '#10b981',
        'home'
    ),
    (
        NULL,
        'Santé',
        '#f59e0b',
        'heart'
    ),
    (
        NULL,
        'Divertissement',
        '#8b5cf6',
        'gamepad2'
    ),
    (
        NULL,
        'Shopping',
        '#ec4899',
        'shopping-bag'
    ),
    (
        NULL,
        'Éducation',
        '#06b6d4',
        'book-open'
    ),
    (
        NULL,
        'Autres',
        '#6b7280',
        'more-horizontal'
    );