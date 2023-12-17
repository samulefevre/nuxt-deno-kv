import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
    const kv = await useKv()

    const id = randomUUID()

    const { todo } = await readBody(event)

    const result = await kv.set(['todos', id], todo)

    return {
        result
    }
})