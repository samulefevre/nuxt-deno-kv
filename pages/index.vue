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
            <UButton @click="deleteTodo(todo.id)">Delete</UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup lang="ts">
const state = reactive({
  todo: undefined,
})

const { data: todos } = await useFetch('/api/todos')

const addTodo = () => {
  if (!state.todo) return

  $fetch('/api/todos', {
    method: 'POST',
    body: { todo: state.todo },
  })
}

const deleteTodo = (id: string) => {
  $fetch('/api/todos', {
    method: 'DELETE',
    body: { id },
  })
}

</script>