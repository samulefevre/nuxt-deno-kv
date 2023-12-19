<template>
  <div>
    <!-- <UButton @click="deleteTodo">Delete</UButton> -->
    <h1>My App</h1>
    <UInput v-model="state.todo" name="todo" />
    <pre>{{ state }}</pre>
    <UButton @click="addTodo">Add Todo</UButton>
    <div>
      <h2>Todos</h2>
      <div v-for="todo of todos" :key="todo.id">
        <div class="flex flex-row gap-4 mt-4">
          <div>
            {{ todo.text }} - {{ todo.createdAt }}
          </div>
          <div>
            <UToggle :model-value="Boolean(todo.completed)" @update:model-value="toggleTodo(todo)" />
          </div>
          <div>
            <UButton @click="deleteTodo(todo.id)">Delete</UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import type { Todos } from '~/server/types/db';

const state = reactive({
  todo: undefined,
})

const { data: todos } = await useFetch('/api/todos')

const addTodo = async () => {
  if (!state.todo) return

  await $fetch('/api/todos', {
    method: 'POST',
    body: { text: state.todo },
  })
}

const deleteTodo = async (id: string) => {
  await $fetch(`/api/todos/${id}`, {
    method: 'DELETE',
    body: { id },
  })
}

const toggleTodo = async (todo: Todos) => {
  await $fetch(`/api/todos/${todo.id}`, {
    method: 'PATCH',
    body: { completed: !todo.completed },
  })
}

onMounted(() => {
  new EventSource(`/api/todos`).addEventListener('message', (event) => {
    const data = JSON.parse(event.data)

    if (todos.value) {
      const newDatas = useEventSource(data, todos.value)
      todos.value = newDatas.value
    }
  })
})

</script>