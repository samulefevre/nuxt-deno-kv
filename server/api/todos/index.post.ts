import { randomUUID } from 'uncrypto'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
    const kv = await useKv()

    const todo = await readValidatedBody(event, z.object({
        id: z.string().optional().default(() => randomUUID()),
        text: z.string().trim().min(1),
        completed: z.boolean().default(false),
        createdAt: z.string().default(Date),
        updatedAt: z.string().default(Date),
    }).parse)

    const op = kv.atomic()
    op.set(['todos', todo.id], todo)
    op.set(['todos_status'], {
        status: 'added',
        value: todo
    })

    const res = await op.commit()
    if (!res.ok) {
        throw createError({
            statusCode: 500,
            message: 'Could not add todo'
        })
    }

    /* setTimeout(() => {
        kv.set(['todos_status'], {
            status: null,
            value: null
        })
    }, 3000); */


    return todo

})