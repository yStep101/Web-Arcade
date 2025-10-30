<template>
  <main class="app" :class="theme">
    <div v-if="showScanlines" class="scanlines"></div>
    <RouterView />
  </main>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { ref, onMounted, watch } from 'vue'

// 🧠 Load settings
const theme = ref('multi')
const showScanlines = ref(true)

onMounted(() => {
  const saved = JSON.parse(localStorage.getItem('arcadeSettings'))
  if (saved) {
    theme.value = saved.theme ?? 'multi'
    showScanlines.value = saved.showScanlines ?? true
  }
  applyTheme()
})

watch(theme, applyTheme)

function applyTheme() {
  const root = document.documentElement
  switch (theme.value) {
    case 'blue':
      root.style.setProperty('--bg-gradient', 'radial-gradient(circle at 50% 20%, #001f3f 0%, #001122 80%)')
      root.style.setProperty('--accent', '#00aaff')
      root.style.setProperty('--text', '#aeeaff')
      break
    case 'red':
      root.style.setProperty('--bg-gradient', 'radial-gradient(circle at 50% 20%, #220000 0%, #000000 90%)')
      root.style.setProperty('--accent', '#ff0044')
      root.style.setProperty('--text', '#ff99aa')
      break
    case 'yellow':
      root.style.setProperty('--bg-gradient', 'radial-gradient(circle at 50% 20%, #332900 0%, #000000 90%)')
      root.style.setProperty('--accent', '#ffcc00')
      root.style.setProperty('--text', '#fff3b0')
      break
    default: // multi (formerly neon)
      root.style.setProperty('--bg-gradient', 'radial-gradient(circle at 50% 20%, #001a24 0%, #000a10 60%, #000000 100%)')
      root.style.setProperty('--accent', '#00ffcc')
      root.style.setProperty('--text', '#00ffcc')
  }
}
</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Orbitron', sans-serif;
  overflow-x: hidden;
  background: var(--bg-gradient, radial-gradient(circle at 50% 20%, #001a24 0%, #000a10 60%, #000000 100%));
  color: var(--text, #00ffcc);
}

/* Keeps main layout consistent */
.app {
  position: relative;
  min-height: 100vh;
  background: var(--bg-gradient);
  color: var(--text);
  transition: background 0.6s ease, color 0.3s ease;
}

/* Subtle CRT scanlines (non-flickering) */
.scanlines {
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.015),
    rgba(255, 255, 255, 0.015) 1px,
    transparent 3px,
    transparent 4px
  );
  z-index: 9999;
  mix-blend-mode: overlay;
  opacity: 0.08;
}

/* Global glow */
* {
  text-shadow: 0 0 6px var(--accent, #00ffcc55);
}
</style>
