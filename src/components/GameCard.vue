<template>
  <div class="card" @click="$router.push(link)">
    <h2>{{ title }}</h2>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  link: String,
})
</script>

<style scoped>
.card {
  background: #111;
  border: 2px solid #00ffcc;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px #00ffcc;
}
</style>
