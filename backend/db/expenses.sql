CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    expense_date DATE NOT NULL,
    description TEXT NOT NULL CHECK (btrim(description) <> ''),
    category TEXT NOT NULL CHECK (btrim(category) <> ''),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now() 
);

CREATE INDEX IF NOT EXISTS idx_expenses_expense_date
    ON expenses (expense_date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_category
    ON expenses (category);

CREATE INDEX IF NOT EXISTS idx_expenses_date_category
    ON expenses (expense_date, category);

CREATE UNIQUE INDEX IF NOT EXISTS expenses_unique_identity_idx
    ON expenses (expense_date, description, category, amount);