<template>
  <div class="settings">
    <Navbar />

    <div class="settings-content">
      <h1>⚙️ Settings</h1>

      <!-- 🎵 Audio Settings -->
      <section class="setting-group">
        <h2>🎵 Audio</h2>
        <div class="setting-item">
          <label>Background Music</label>
          <input type="range" min="0" max="100" v-model="musicVolume" />
          <span>{{ musicVolume }}%</span>
        </div>

        <div class="setting-item">
          <label>Sound Effects</label>
          <input type="range" min="0" max="100" v-model="sfxVolume" />
          <span>{{ sfxVolume }}%</span>
        </div>
      </section>

      <!-- 🌈 Theme Settings -->
      <section class="setting-group">
        <h2>🌈 Visuals</h2>
        <div class="setting-item">
          <label>Theme</label>
          <select v-model="theme" @change="applyTheme">
            <option value="multi">Multi</option>
            <option value="blue">Blue</option>
            <option value="red">Red</option>
            <option value="yellow">Yellow</option>
            <option value="green">Green</option>
            <option value="purple">Purple</option>
          </select>
        </div>

        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="showScanlines" />
            Enable CRT Scanlines
          </label>
        </div>
      </section>

      <button class="save-btn" @click="saveSettings">💾 Save Settings</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '../components/NavBar.vue'

const router = useRouter()

const musicVolume = ref(60)
const sfxVolume = ref(70)
const theme = ref('multi')
const showScanlines = ref(true)

/* 🧠 Load saved settings */
onMounted(() => {
  const saved = JSON.parse(localStorage.getItem('arcadeSettings'))
  if (saved) {
    musicVolume.value = saved.musicVolume ?? 60
    sfxVolume.value = saved.sfxVolume ?? 70
    theme.value = saved.theme ?? 'multi'
    showScanlines.value = saved.showScanlines ?? true
  }
  applyTheme()
})

/* 💾 Save and auto-redirect */
function saveSettings() {
  const data = {
    musicVolume: musicVolume.value,
    sfxVolume: sfxVolume.value,
    theme: theme.value,
    showScanlines: showScanlines.value
  }
  localStorage.setItem('arcadeSettings', JSON.stringify(data))
  applyTheme()
  router.push('/hub')
}

/* 🎨 Apply theme globally to <html> root */
function applyTheme() {
  const root = document.documentElement
  switch (theme.value) {
    case 'blue':
      root.style.setProperty('--bg-gradient', 'linear-gradient(180deg, #001a33, #000814)')
      root.style.setProperty('--accent', '#00b4ff')
      root.style.setProperty('--text', '#00eaff')
      break
    case 'red':
      root.style.setProperty('--bg-gradient', 'linear-gradient(180deg, #2b0000, #000)')
      root.style.setProperty('--accent', '#ff3333')
      root.style.setProperty('--text', '#ff7777')
      break
    case 'yellow':
      root.style.setProperty('--bg-gradient', 'linear-gradient(180deg, #332b00, #000)')
      root.style.setProperty('--accent', '#ffcc00')
      root.style.setProperty('--text', '#ffee66')
      break
    case 'green':
      root.style.setProperty('--bg-gradient', 'linear-gradient(180deg, #002b00, #000)')
      root.style.setProperty('--accent', '#00ff66')
      root.style.setProperty('--text', '#66ff99')
      break
    case 'purple':
      root.style.setProperty('--bg-gradient', 'linear-gradient(180deg, #1a0033, #000)')
      root.style.setProperty('--accent', '#cc66ff')
      root.style.setProperty('--text', '#e0b3ff')
      break
    default: // multi (formerly neon)
      root.style.setProperty('--bg-gradient', 'radial-gradient(circle at 50% 20%, #001a24 0%, #000a10 60%, #000000 100%)')
      root.style.setProperty('--accent', '#00ffcc')
      root.style.setProperty('--text', '#00ffcc')
  }

  // Apply globally so all views share it
  document.body.style.background = getComputedStyle(root).getPropertyValue('--bg-gradient')
  document.body.style.color = getComputedStyle(root).getPropertyValue('--text')
}

/* 🔄 Auto-update when theme changes */
watch(theme, applyTheme)
</script>

<style scoped>
.settings {
  min-height: 100vh;
  color: var(--text, #00ffcc);
  background: var(--bg-gradient);
  font-family: 'Orbitron', sans-serif;
  padding: 2rem;
  transition: background 0.6s ease, color 0.3s ease;
}

.settings-content {
  max-width: 700px;
  margin: 2rem auto;
  background: rgba(0, 255, 204, 0.05);
  border: 1px solid #00ffcc55;
  border-radius: 16px;
  box-shadow: 0 0 20px #00ffcc33;
  padding: 2rem 3rem;
}

h1 {
  text-align: center;
  color: var(--accent, #00ffcc);
  text-shadow: 0 0 10px var(--accent), 0 0 20px #009988;
  margin-bottom: 2rem;
}

h2 {
  color: var(--accent, #00ffcc);
  border-bottom: 1px solid #00ffcc44;
  padding-bottom: 0.3rem;
  margin-bottom: 1rem;
}

.setting-group {
  margin-bottom: 2rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
  gap: 1rem;
}

.setting-item label {
  flex: 1;
}

input[type="range"] {
  flex: 2;
  accent-color: var(--accent, #00ffcc);
}

select,
input[type="checkbox"] {
  background: #0a0a0a;
  color: var(--accent, #00ffcc);
  border: 1px solid var(--accent, #00ffcc);
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
  font-family: 'Orbitron', sans-serif;
}

.save-btn {
  display: block;
  margin: 0 auto;
  background: var(--accent, #00ffcc);
  color: #000;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  padding: 0.8rem 2rem;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 0 20px var(--accent);
  transition: transform 0.2s, box-shadow 0.3s;
}

.save-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px var(--accent);
}

@media (max-width: 600px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
