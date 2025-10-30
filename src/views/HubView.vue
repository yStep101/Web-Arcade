<template>
  <div class="hub">
    <Navbar />

    <div class="content">
      <!-- 🎮 LEFT: Games -->
      <section class="left">
        <h1>🎮 Web Arcade</h1>

        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search games..."
          class="search-bar"
        />

        <div class="games">
          <GameCard
            v-for="(game, index) in filteredGames"
            :key="index"
            :title="game.title"
            :link="game.link"
            :thumbnail="game.thumbnail"
          />
        </div>
      </section>

      <!-- 🏆 RIGHT: Leaderboard -->
      <section class="right">
        <Leaderboard />
      </section>
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/NavBar.vue'
import GameCard from '../components/GameCard.vue'
import Leaderboard from '../components/LeaderBoard.vue'
import { ref, computed } from 'vue'

// ✅ Import images (Vite will process them)
import pongImg from '../assets/images/pong.png'
import snakeImg from '../assets/images/snake.png'
import pacmanImg from '../assets/images/pacman.png'

const games = [
  { title: 'Pong (2 Player)', link: '/game/pong', thumbnail: pongImg },
  { title: 'Snake', link: '/game/snake', thumbnail: snakeImg },
  { title: 'Pacman', link: '/game/pacman', thumbnail: pacmanImg },
]

const searchQuery = ref('')

const filteredGames = computed(() =>
  games.filter(game =>
    game.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)
</script>

<style scoped>
.hub {
  min-height: 100vh;
  padding: 2rem;
  color: #00ffcc;
}

.content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-top: 2rem;
}

/* 🎮 Left side: Games and search */
.left {
  flex: 2;
}

.right {
  flex: 1;
  background: rgba(0, 255, 204, 0.05);
  border: 1px solid #00ffcc55;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 0 15px #00ffcc33;
  height: fit-content;
  position: sticky;
  top: 80px; /* keeps leaderboard visible when scrolling */
}

h1 {
  color: #00ffcc;
  text-shadow: 0 0 12px #00ffcc, 0 0 24px #009988;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.search-bar {
  padding: 0.6rem 1rem;
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
  border: 2px solid #00ffcc;
  background: #0d0d0d;
  color: #00ffcc;
  font-size: 1rem;
  outline: none;
  transition: box-shadow 0.2s;
}

.search-bar:focus {
  box-shadow: 0 0 12px #00ffcc;
}

.games {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 1.5rem;
  margin-top: 2rem;
}

/* 📱 Responsive layout for smaller screens */
@media (max-width: 900px) {
  .content {
    flex-direction: column;
  }

  .right {
    position: relative;
    top: 0;
    width: 100%;
  }

  .games {
    justify-content: center;
  }
}
</style>
