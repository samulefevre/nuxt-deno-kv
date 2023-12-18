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
    op.set(['todos_status'], {
        status: 'added',
        value: todo2
    })

    const res = await op.commit()
    if (!res.ok) {
        throw createError({
            statusCode: 500,
            message: 'Could not add todo'
        })
    }


    await kv.set(['todos_status'], {
        status: null,
        value: null
    })

    return todo2

})