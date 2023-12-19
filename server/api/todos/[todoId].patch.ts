import { z } from 'zod'

import type { KvEntry } from '@deno/kv'

import type { Todos } from '~/server/types/db'

export default defineEventHandler(async (event) => {
    const { todoId } = await getValidatedRouterParams(event, z.object({
        todoId: z.string().length(36)
    }).parse)

    const { completed } = await readValidatedBody(event, z.object({
        completed: z.boolean()
    }).parse)

    const kv = await useKv()

    const todo = await kv.get(['todos', todoId]) as KvEntry<Todos>

    if (!todo.value) {
        throw createError({
            statusCode: 404,
            message: 'Todo not found'
        })
    }

    const op = kv.atomic()
    const newTodo = {
        ...todo.value,
        updatedAt: new Date(),
        completed
    }

    op.set(['todos', todoId], newTodo)
    op.set(['todos_status'], {
        status: 'updated',
        value: newTodo
    })

    await op.commit()

    return { updated: true }
})