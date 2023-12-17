import type { Kv, KvListIterator } from '@deno/kv'

type Todos = {
    id: string
    text: string
    createdAt: string
}

async function listTodos(kv: Kv) {
    const records: KvListIterator<Todos> = kv.list({
        prefix: ['todos']
    }, { consistency: 'strong' })

    const todos: Todos[] = [];
    for await (const todo of records) {
        todos.push(todo.value);
    }

    todos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return todos

}

export default eventHandler(async (event) => {
    const kv: Kv = await useKv()

    console.log('accept', getHeader(event, 'accept'))
    // setHeader(event, 'content-type', 'text/event-stream')

    if (getHeader(event, 'accept') === 'text/event-stream') {
        setHeader(event, 'content-type', 'text/event-stream')

        const stream = kv.watch([['todos']]).getReader()

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

    }

    console.log('list todos')

    return await listTodos(kv)

})