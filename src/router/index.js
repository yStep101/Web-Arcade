import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HubView from '../views/HubView.vue'
import ProfileView from '../views/ProfileView.vue'
import PongGame from '../games/PongGame.vue'
import SnakeGame from '../games/SnakeGame.vue'
import RacerGame from '@/games/RacerGame.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'login', component: LoginView },
    { path: '/hub', name: 'hub', component: HubView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/game/pong', name: 'pong', component: PongGame },
    { path: '/game/snake', name: 'snake', component: SnakeGame },
    { path: '/game/racer', name: 'Racer', component: RacerGame },
    { path: '/settings', name: 'Settings', component: () => import('../views/SettingsView.vue') },
  ],
})

export default router
