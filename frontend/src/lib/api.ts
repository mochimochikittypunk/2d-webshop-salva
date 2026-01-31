export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export async function fetchProducts() {
    const res = await fetch(`${API_URL}/api/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
}

export async function sendChatMessage(userMessage: string, cartContext: any[]) {
    const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_message: userMessage, cart_context: cartContext }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
}
