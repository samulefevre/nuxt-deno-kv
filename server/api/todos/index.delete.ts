export default defineEventHandler(async (event) => {
    const kv = await useKv()

    const { id } = await readBody(event)

    const op = kv.atomic()
    op.delete(['todos', id])
    op.set(['todos_updated'], true)
    await op.commit()

    return { deleted: true }
})