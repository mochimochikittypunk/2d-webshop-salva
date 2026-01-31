export interface Product {
    id: number;
    slug: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    stock_count: number;
    metadata?: Record<string, any>;
}

export interface CartItem {
    productId: number;
    quantity: number;
}
