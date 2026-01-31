-- Products: Items available in the shop
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Price in lowest currency unit (e.g., JPY)
    image_url TEXT,
    stock_count INTEGER DEFAULT 0,
    metadata JSON, -- For game-specific data (coordinates, audio cues)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders: Finalized purchases
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, -- UUID
    user_session_id TEXT NOT NULL,
    total_amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, paid, shipped
    items_json JSON NOT NULL, -- Snapshot of items bought: [{product_id, quantity, price_at_purchase}]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ChatHistory: Optional history
CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_session_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user' or 'salva'
    content TEXT NOT NULL,
    emotion_tag TEXT, -- For Salva's expressions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
