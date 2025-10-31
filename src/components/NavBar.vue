<template>
  <nav class="navbar">
    <div class="logo" @click="goHub">🕹️ Web Arcade</div>

    <ul class="nav-links">
      <li><RouterLink to="/hub">Home</RouterLink></li>
      <li><RouterLink to="/profile">Profile</RouterLink></li>
      <li><RouterLink to="/settings">Settings</RouterLink></li>

      <!-- 👇 Smart button -->
      <li v-if="isLoggedIn" @click="logout" class="logout">Logout</li>
      <li v-else><RouterLink to="/login">Login</RouterLink></li>
    </ul>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted, watchEffect } from 'vue'

const router = useRouter()
const isLoggedIn = ref(false)

function goHub() {
  router.push('/hub')
}

function logout() {
  if (confirm('Are you sure you want to log out?')) {
    localStorage.removeItem('currentUser')
    isLoggedIn.value = false
    router.push('/login')
  }
}

// ✅ Reactively track login state
onMounted(() => {
  isLoggedIn.value = !!localStorage.getItem('currentUser')
})

// ✅ Also update live when user logs in/out in other tabs
window.addEventListener('storage', () => {
  isLoggedIn.value = !!localStorage.getItem('currentUser')
})

// ✅ Watch for route changes (optional, but keeps UI synced)
watchEffect(() => {
  isLoggedIn.value = !!localStorage.getItem('currentUser')
})
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 255, 204, 0.1);
  border-bottom: 1px solid #00ffcc55;
  padding: 1rem 2rem;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 0 10px #00ffcc33;
}

.logo {
  font-weight: bold;
  color: #00ffcc;
  cursor: pointer;
  font-size: 1.4rem;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: #00ffcc;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: white;
}

.logout {
  color: #ff5555;
  cursor: pointer;
}

.logout:hover {
  text-shadow: 0 0 10px #ff3333;
}
</style>
