import { atom } from 'nanostores';

export type GameState = 'idle' | 'browsing' | 'chatting';

interface Product {
    id: number;
    slug: string;
    name: string;
    price: number;
    description: string;
    image_url: string;
    metadata: string | object; // D1 might return string or object
}

export interface ChatOption {
    label: string;
    value: string; // The text to send as user
    action?: string; // Internal action ID
    note?: string; // Optional metadata for logging (e.g. End Type)
}

export interface ChatMessage {
    role: 'user' | 'salva';
    content: string;
    options?: ChatOption[];
}

export const $gameState = atom<GameState>('idle');
export const $allProducts = atom<Product[]>([]);
export const $selectedProduct = atom<Product | null>(null);
export const $isChatOpen = atom<boolean>(true); // Default open for now
export const INITIAL_CHAT_HISTORY: ChatMessage[] = [
    {
        role: 'salva',
        content: 'こんにちは〜',
        options: [
            { label: '1. おすすめのコーヒーを聞きたい', value: 'おすすめのコーヒーは？', action: 'recommend' },
            { label: '2. オリジナルブレンドを一緒に作りたい', value: 'オリジナルブレンドを作りたい', action: 'blend' },
            { label: '3. その他のことについて聞きたい', value: 'ちょっと聞きたいことがあります', action: 'chat' },
            { label: '4. ときめき…', value: '…', action: 'dating_start' }
        ]
    }
];

export const $chatHistory = atom<ChatMessage[]>(INITIAL_CHAT_HISTORY);

// ハイライトする商品ID（棚で点滅させる）
export const $highlightedProductId = atom<number | null>(null);

export function selectProduct(product: Product | null) {
    $selectedProduct.set(product);
    if (product) {
        $gameState.set('browsing');
    } else {
        $gameState.set('idle');
    }
}

export function addChatMessage(role: 'user' | 'salva', content: string) {
    $chatHistory.set([...$chatHistory.get(), { role, content }]);
}
