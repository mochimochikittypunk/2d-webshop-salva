import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ChatRequestSchema } from '@rpg-ecommerce/shared'

type Bindings = {
    DB: D1Database
    CART_SESSION: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

app.get('/', (c) => {
    return c.text('RPG E-commerce API is Running!')
})

// Products API
app.get('/api/products', async (c) => {
    try {
        const { results } = await c.env.DB.prepare('SELECT * FROM products').all()
        return c.json(results)
    } catch (e) {
        return c.json({ error: 'Failed to fetch products' }, 500)
    }
})

// Chat API (Stub)
app.post('/api/chat', async (c) => {
    try {
        const body = await c.req.json()
        // Validate with Zod (Optional but recommended)
        // const payload = ChatRequestSchema.parse(body) // Needs zod in runtime

        // Stub Response from Salva
        return c.json({
            role: 'salva',
            content: 'I see you are interested in our Ethiopia Bench Maji! It is truly exquisite.',
            emotion_tag: 'happy'
        })
    } catch (e) {
        console.error(e)
        return c.json({ error: 'Chat failed' }, 500)
    }
})

export default app
