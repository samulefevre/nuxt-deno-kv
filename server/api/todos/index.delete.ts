export default defineEventHandler(async (event) => {
    const kv = await useKv()

    const { id } = await readBody(event)

    const res = await kv.delete(['todos', id])

    if (!res) {
        throw createError({
            status: 404,
            message: 'Could not find todo'
        })
    }


    return {
        message: 'deleted'
    }
})