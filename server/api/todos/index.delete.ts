

export default defineEventHandler(async (event) => {
    const kv = await useKv()

    const { id } = await readBody(event)

    await kv.delete(['todos', id])


    return {
        message: 'deleted'
    }
})