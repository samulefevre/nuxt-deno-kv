import type { Kv, KvListIterator, KvEntry } from '@deno/kv'

import type { Todos, TodoStatus } from '~/server/types/db'

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
    const kv = await useKv() as Kv

    if (getHeader(event, 'accept') === 'text/event-stream') {
        setHeader(event, 'content-type', 'text/event-stream')

        const stream = kv.watch([['todos_status']]).getReader()

        const body = new ReadableStream({
            async start(controller) {
                while (true) {
                    try {
                        if ((await stream.read()).done) {
                            return
                        }

                        const todos = await kv.get(['todos_status']) as KvEntry<TodoStatus>

                        const chunk = `data: ${JSON.stringify(todos.value)}\n\n`
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