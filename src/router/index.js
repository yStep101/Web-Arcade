import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HubView from '../views/HubView.vue'
import ProfileView from '../views/ProfileView.vue'
import PongGame from '../games/PongGame.vue'
import SnakeGame from '../games/SnakeGame.vue'
import RacerGame from '../games/RacerGame.vue'
import TetrisGame from '../games/TetrisGame.vue' // ✅ Add this line
import SettingsView from '../views/SettingsView.vue'
import { getCurrentUser } from '@/utils/auth' // ✅ centralized auth import

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/hub', name: 'hub', component: HubView, meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { requiresAuth: true } },
    { path: '/game/pong', name: 'pong', component: PongGame, meta: { requiresAuth: true } },
    { path: '/game/snake', name: 'snake', component: SnakeGame, meta: { requiresAuth: true } },
    { path: '/game/racer', name: 'racer', component: RacerGame, meta: { requiresAuth: true } },
    { path: '/game/tetris', name: 'Tetris', component: TetrisGame, meta: { requiresAuth: true } },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: () => import('@/components/LeaderBoard.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 🧠 Route guard for authentication
router.beforeEach((to, from, next) => {
  const user = getCurrentUser()

  // If route requires auth and no user is logged in → redirect to login
  if (to.meta.requiresAuth && !user) {
    next({ name: 'login' })
  }
  // If user is logged in and tries to access /login → redirect to hub
  else if (to.name === 'login' && user) {
    next({ name: 'hub' })
  }
  // Otherwise allow navigation
  else {
    next()
  }
})

export default router
