import type { Kv } from '@deno/kv'

async function listTodos(kv: Kv) {
    const records = await kv.list({
        prefix: ['todos']
    })

    const todos = [];
    for await (const res of records) {
        todos.push({
            id: res.key[1],
            value: res.value
        });
    }

    return todos

}

export default defineEventHandler(async (event) => {
    const kv: Kv = await useKv()

    if (getHeader(event, 'accept') === 'text/event-stream') {
        const stream = await kv.watch([['todos']]).getReader()

        const body = new ReadableStream({
            async start(controller) {
                while (true) {
                    try {
                        if ((await stream.read()).done) {
                            return
                        }

                        const todos = await listTodos(kv)
                        const chunk = `data: ${JSON.stringify(todos)}\n\n`
                        controller.enqueue(new TextEncoder().encode(chunk))
                    } catch (e) {
                        console.error(`Error refreshing list`, e)
                    }
                }
            },
            cancel() {
                stream.cancel()
            }
        })

        console.log('stream todos')

        return sendStream(event, body)

    } else {
        console.log('list todos')

        return await listTodos(kv)
    }


})