<template>
  <div class="profile">
    <Navbar />
    <div class="profile-content">
      <h1>{{ username }}’s Profile</h1>
      <p>🎮 Games Played: {{ stats.gamesPlayed }}</p>
      <p>🏆 High Score: {{ stats.highScore }}</p>
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/NavBar.vue'
import { ref, onMounted } from 'vue'
import { getCurrentUserData, getCurrentUser } from '../utils/auth'

const username = ref('')
const stats = ref({ gamesPlayed: 0, highScore: 0 })

onMounted(() => {
  username.value = getCurrentUser()
  const userData = getCurrentUserData()
  if (userData && userData.stats) {
    stats.value = userData.stats
  }
})
</script>

<style scoped>
.profile {
  text-align: center;
  padding: 2rem;
}
.profile-content {
  background: rgba(0, 255, 204, 0.05);
  border: 1px solid #00ffcc55;
  border-radius: 12px;
  padding: 2rem;
  display: inline-block;
  margin-top: 2rem;
  box-shadow: 0 0 15px #00ffcc33;
}
</style>
