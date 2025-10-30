<template>
  <div class="login">
    <h1>Welcome to Web Arcade</h1>
    <input v-model="username" placeholder="Enter your name" />
    <button @click="login">Start Playing</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')

function login() {
  if (username.value.trim()) {
    localStorage.setItem('username', username.value)
    router.push('/hub')
  }
}
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1rem;
}

input {
  padding: 0.5rem;
  border: 2px solid #00ffcc;
  background: #000;
  color: white;
  border-radius: 8px;
}

button {
  padding: 0.5rem 1rem;
  background: #00ffcc;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

button:hover {
  box-shadow: 0 0 15px #00ffcc;
}
</style>
