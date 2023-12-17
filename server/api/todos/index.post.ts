import { randomUUID } from 'uncrypto'

export default defineEventHandler(async (event) => {
    const kv = await useKv()

    const id = randomUUID()

    const { todo } = await readBody(event)

    const result = await kv.set(['todos', id], {
        id,
        text: todo,
        createdAt: new Date().toISOString()
    })

    return {
        result
    }
})