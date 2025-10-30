<template>
  <div class="hub">
    <Navbar />
    <h1>Choose Your Game</h1>
    <div class="games">
      <GameCard title="Pong (2 Player)" link="/game/pong" />
      <GameCard title="Snake" link="/game/snake" />
      <GameCard title="Pacman" link="/game/pacman" />
    </div>
    <Leaderboard />
  </div>
</template>

<script setup>
import Navbar from '../components/NavBar.vue'
import GameCard from '../components/GameCard.vue'
import Leaderboard from '../components/LeaderBoard.vue'
</script>

<style scoped>
.hub {
  text-align: center;
  padding: 2rem;
}

.games {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
}
</style>
