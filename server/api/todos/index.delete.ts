export default defineEventHandler(async (event) => {
    const kv = await useKv()

    const op = kv.atomic()
    op.delete(['todos'])
    op.delete(['todos_status'])

    await op.commit()

    return { deleted: true }
})