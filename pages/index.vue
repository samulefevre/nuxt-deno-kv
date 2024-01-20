<template>
  <UContainer class="py-8">
    <h1 class="font-bold text-3xl">Todos</h1>
    <UButton @click="deleteAllTodos" icon="i-heroicons-trash-20-solid" color="red" variant="soft" size="xl"
      label="delete all" class="mt-4" />
    <form class="mt-6 flex gap-2" @submit.prevent="addTodo">
      <UInput v-model="state.todo" size="xl" required placeholder="Add a todo item" class="flex-1" />
      <UButton size="xl" type="submit" color="green" icon="i-heroicons-plus-20-solid" :loading="loading" />
    </form>
    <ul class="pt-6 divide-y divide-gray-200 dark:divide-gray-800">
      <li v-for="todo of todos" :key="todo.id" class="flex items-center gap-4 py-2">
        <div class="flex-1">
          <h3 class="text-lg font-medium" :class="[todo.completed ? 'line-through text-gray-500' : '']">
            {{ todo.text }}
          </h3>
          <span class="text-sm">
            <UseTimeAgo v-slot="{ timeAgo }" :time="todo.createdAt">Created {{ timeAgo }}</UseTimeAgo>
            <UseTimeAgo v-if="todo.createdAt !== todo.updatedAt" v-slot="{ timeAgo }" :time="todo.updatedAt">· Updated {{
              timeAgo }}</UseTimeAgo>
          </span>
        </div>

        <UToggle :model-value="Boolean(todo.completed)" @update:model-value="toggleTodo(todo)" />

        <UButton @click="deleteTodo(todo.id)" icon="i-heroicons-x-mark-20-solid" color="red" variant="soft" size="xl" />
      </li>
    </ul>
  </UContainer>
</template>
  
<script setup lang="ts">
import type { Todos } from '~/server/types/db';
import { UseTimeAgo } from '@vueuse/components'

import { useEventSource } from '@vueuse/core'

const state = reactive({
  todo: undefined,
})

const { data: todos } = await useFetch('/api/todos')

const loading = ref(false)

const addTodo = async () => {
  if (!state.todo) return

  loading.value = true

  await $fetch('/api/todos', {
    method: 'POST',
    body: { text: state.todo },
  })

  loading.value = false
  state.todo = undefined
}

const deleteTodo = async (id: string) => {
  await $fetch(`/api/todos/${id}`, {
    method: 'DELETE',
    body: { id },
  })
}

const deleteAllTodos = async (id: string) => {
  const res = await $fetch(`/api/todos`, {
    method: 'DELETE',
  })

  if (res) {
    todos.value = []
  }
}

const toggleTodo = async (todo: Todos) => {
  await $fetch(`/api/todos/${todo.id}`, {
    method: 'PATCH',
    body: { completed: !todo.completed },
  })
}

onMounted(() => {
  const { data } = useEventSource('/api/todos')

  watch(data, (newData) => {
    console.log('newData', newData)
    if (todos.value && newData) {
      const newDatas = useEventDataSource(JSON.parse(newData), todos.value)
      todos.value = newDatas.value
    }
  })
})

</script>