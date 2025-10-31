import { ref } from 'vue'
import { submitScore } from '@/utils/leaderboard'

// 🧠 global cached username (persisted in localStorage)
const username = ref(localStorage.getItem('arcadeUsername') || 'Player')

// 🕹️ composable: submit score per-game
export function useScoreSubmit(game) {
  const bestScore = ref(0)

  // 🧩 update username once and save it
  function setUsername(newName) {
    username.value = newName.trim() || 'Player'
    localStorage.setItem('arcadeUsername', username.value)
  }

  // 🏁 submit only if score beats previous best (per session)
  async function trySubmit(score) {
    if (score > bestScore.value) {
      bestScore.value = score
      try {
        // ✅ FIX: only pass (username, score)
        await submitScore(username.value, score)
        console.log(`✅ Submitted ${game} score: ${score} by ${username.value}`)
      } catch (err) {
        console.error('❌ Failed to submit score:', err)
      }
    }
  }

  // 🔄 reset when restarting game
  function resetBest() {
    bestScore.value = 0
  }

  return { trySubmit, resetBest, username, setUsername }
}
