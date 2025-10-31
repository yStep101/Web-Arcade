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
import { registerUser, loginUser } from '@/utils/leaderboard' // ✅ use backend API
import { useScoreSubmit } from '@/composables/useScoreSubmit'

const router = useRouter()
const username = ref('')
const password = ref('')
const mode = ref('login')
const error = ref('')

// also update composable username cache
const { setUsername } = useScoreSubmit('Global')

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  error.value = ''
}

async function handleRegister() {
  if (!username.value.trim() || !password.value.trim()) {
    error.value = 'Please enter a username and password.'
    return
  }

  try {
    const res = await registerUser(username.value.trim(), password.value)
    if (res.success) {
      localStorage.setItem('currentUser', username.value.trim())
      setUsername(username.value.trim()) // sync with leaderboard
      router.push({ name: 'hub' })
    }
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.error || 'Registration failed.'
  }
}

async function handleLogin() {
  if (!username.value.trim() || !password.value.trim()) {
    error.value = 'Please enter a username and password.'
    return
  }

  try {
    const res = await loginUser(username.value.trim(), password.value)
    if (res.success) {
      localStorage.setItem('currentUser', username.value.trim())
      setUsername(username.value.trim()) // sync with leaderboard
      router.push({ name: 'hub' })
    }
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.error || 'Invalid username or password.'
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
