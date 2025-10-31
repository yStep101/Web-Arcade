<template>
  <div class="card" @click="$router.push(link)">
    <img :src="thumbnail" alt="Game Thumbnail" class="thumbnail" />
    <h2>{{ title }}</h2>
    <div class="scores">
      <p class="profile-score">Your High Score: {{ userHighScore }}</p>
      <p class="global-score">Global High Score: {{ globalHighScore }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  title: String,
  link: String,
  thumbnail: String,
})

const userHighScore = ref(0)
const globalHighScore = ref(0)

onMounted(() => {
  // Get the current user and all saved high scores
  const currentUser = localStorage.getItem('currentUser') || 'guest'
  const allKeys = Object.keys(localStorage)

  // Load user's own high score
  const userKey = `${currentUser}_${props.title}_highscore`
  const savedUserScore = localStorage.getItem(userKey)
  if (savedUserScore) userHighScore.value = parseInt(savedUserScore)

  // Find the highest global score for this game
  const gameScores = allKeys
    .filter((key) => key.endsWith(`_${props.title}_highscore`))
    .map((key) => parseInt(localStorage.getItem(key) || 0))

  if (gameScores.length > 0)
    globalHighScore.value = Math.max(...gameScores)
})
</script>

<style scoped>
.card {
  background: #0a0a0a;
  border: 2px solid #00ffcc;
  border-radius: 12px;
  padding: 1rem;
  width: 220px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 0 10px #00ffcc55;
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px #00ffcc;
}

.thumbnail {
  width: 100%;
  height: 130px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.8rem;
  border: 1px solid #00ffcc55;
  transition: box-shadow 0.3s ease;
}

.card:hover .thumbnail {
  box-shadow: 0 0 20px #00ffcc;
}

h2 {
  color: #00ffcc;
  font-size: 1.1rem;
  text-shadow: 0 0 10px #00ffcc;
}

.scores {
  margin-top: 0.5rem;
}

.profile-score,
.global-score {
  font-size: 0.8rem;
  color: #66ffe6;
  text-shadow: 0 0 6px #00ffcc;
  margin: 2px 0;
}

.global-score {
  color: #ff66cc;
  text-shadow: 0 0 6px #ff66cc;
}
</style>
