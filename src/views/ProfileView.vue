<template>
  <div class="profile">
    <Navbar />
    <h1>{{ username }}’s Profile</h1>
    <p>Games Played: 3</p>
    <p>High Score: 120</p>
  </div>
</template>

<script setup>
const username = localStorage.getItem('username') || 'Guest'
</script>

<style scoped>
.profile {
  text-align: center;
  padding: 2rem;
}
</style>
