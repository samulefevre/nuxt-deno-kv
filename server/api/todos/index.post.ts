import { randomUUID } from 'uncrypto'

export default defineEventHandler(async (event) => {
    const kv = await useKv()

    const id = randomUUID()

    const { todo } = await readBody(event)

    const todo2 = {
        id,
        text: todo,
        createdAt: new Date().toISOString()
    }

    const op = kv.atomic()
    op.set(['todos', todo2.id], todo2)
    op.set(['todos_updated'], true)
    await op.commit()



    return todo2

})