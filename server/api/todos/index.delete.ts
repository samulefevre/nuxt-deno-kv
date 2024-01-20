export default defineEventHandler(async (event) => {
    const kv = await useKv()

    const iter = kv.list<string>({ prefix: ['todos'] })

    const op = kv.atomic()
    for await (const res of iter) {
        op.delete(res.key)
    };
    await op.commit()

    return { deleted: true }
})