<template>
  <div class="login">
    <h1>Welcome to Web Arcade</h1>

    <div class="form">
      <input v-model="username" placeholder="Username" />
      <input v-model="password" placeholder="Password" type="password" />

      <button @click="mode === 'login' ? handleLogin() : handleRegister()">
        {{ mode === 'login' ? 'Login' : 'Register' }}
      </button>

      <p class="toggle">
        <span v-if="mode === 'login'">Don’t have an account?</span>
        <span v-else>Already registered?</span>
        <a @click="toggleMode">{{ mode === 'login' ? 'Register' : 'Login' }}</a>
      </p>

      <p class="error" v-if="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser, loginUser } from '../utils/auth'

const router = useRouter()
const username = ref('')
const password = ref('')
const mode = ref('login')
const error = ref('')

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  error.value = ''
}

// ✅ Registration handler
function handleRegister() {
  if (!username.value.trim() || !password.value.trim()) {
    error.value = 'Please enter a username and password.'
    return
  }

  const success = registerUser(username.value.trim(), password.value)
  if (!success) {
    error.value = 'Username already exists.'
  } else {
    error.value = ''
    localStorage.setItem('currentUser', username.value.trim())
    router.push({ name: 'hub' })
  }
}

// ✅ Login handler
function handleLogin() {
  if (!username.value.trim() || !password.value.trim()) {
    error.value = 'Please enter a username and password.'
    return
  }

  const success = loginUser(username.value.trim(), password.value)
  if (!success) {
    error.value = 'Invalid username or password.'
  } else {
    error.value = ''
    localStorage.setItem('currentUser', username.value.trim()) // 🔑 store active user
    router.push({ name: 'hub' }) // ✅ route after login
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
  color: #00ffcc;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  width: 250px;
}

input {
  padding: 0.6rem;
  border: 2px solid #00ffcc;
  border-radius: 8px;
  background: #000;
  color: white;
}

button {
  padding: 0.5rem 1rem;
  background: #00ffcc;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  box-shadow: 0 0 15px #00ffcc;
}

.toggle {
  font-size: 0.9rem;
}

.toggle a {
  color: #00ffcc;
  cursor: pointer;
  margin-left: 4px;
}

.error {
  color: #ff5555;
  text-shadow: 0 0 6px #ff3333;
}
</style>
