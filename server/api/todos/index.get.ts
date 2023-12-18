import type { Kv, KvListIterator } from '@deno/kv'

export type Todos = {
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

    console.log('Listed todos', todos)

    return todos

}

export default eventHandler(async (event) => {
    const kv = await useKv() as Kv

    if (getHeader(event, 'accept') === 'text/event-stream') {
        console.log('SSE request')

        setHeader(event, 'content-type', 'text/event-stream')

        const stream = kv.watch([['todos_updated']]).getReader()

        const body = new ReadableStream({
            async start(controller) {
                while (true) {
                    try {
                        console.log('Waiting for change')
                        if ((await stream.read()).done) {
                            return
                        }

                        const todos = await listTodos(kv)
                        console.log('Sending list', todos)
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



        return sendStream(event, body)

    }

    return listTodos(kv)

})