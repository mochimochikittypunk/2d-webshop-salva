import { z } from 'zod';

export const ChatRequestSchema = z.object({
    user_message: z.string(),
    cart_context: z.array(z.object({
        productId: z.number(),
        quantity: z.number()
    }))
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export interface ChatResponse {
    role: 'salva';
    content: string;
    emotion_tag: string;
}
