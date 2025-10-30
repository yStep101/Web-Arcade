<template>
  <div class="card" @click="$router.push(link)">
    <img :src="thumbnail" alt="Game Thumbnail" class="thumbnail" />
    <h2>{{ title }}</h2>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  link: String,
  thumbnail: String,
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
</style>
