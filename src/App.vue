<template>
  <main>
    <RouterView />
  </main>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
body,
html,
#app {
  margin: 0;
  padding: 0;
  background: radial-gradient(circle at top, #0f0f0f, #000);
  color: #fff;
  font-family: 'Poppins', sans-serif;
}
</style>
