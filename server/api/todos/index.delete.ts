export default defineEventHandler(async (event) => {
    const kv = await useKv()

    const { id } = await readBody(event)

    const todo = await kv.get(['todos', id])

    if (!todo) {
        throw createError({
            statusCode: 404,
            message: 'Todo not found'
        })
    }

    const op = kv.atomic()
    op.delete(['todos', id])
    op.set(['todos_updated'], true)
    // op.set(['todos_deleted'], todo.value)
    await op.commit()

    return { deleted: true }
})