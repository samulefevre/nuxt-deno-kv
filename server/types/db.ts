export type Todos = {
    id: string
    text: string
    createdAt: string
    updatedAt: string
    completed: boolean
}

export type TodoStatus = {
    status: 'added' | 'deleted' | 'updated'
    value: Todos | null
}