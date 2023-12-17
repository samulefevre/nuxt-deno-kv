<template>
  <div>
    <UButton @click="deleteTodo">Delete</UButton>
    <h1>My App</h1>
    <UInput v-model="state.todo" name="todo" />
    <pre>{{ state }}</pre>
    <UButton @click="addTodo">Add Todo</UButton>
    <div>
      <h2>Todos</h2>
      {{ todos  }}
      <div v-for="todo in todos" :key="todo.id">
        <div class="flex flex-row gap-4 mt-4">
          <div>
            {{ todo.value }}
          </div>
          <div >
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

const addTodo = () => {
  console.log(state.todo)
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

const { data: todos} = await useFetch('/api/todos')

</script>
