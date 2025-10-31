// src/utils/leaderboard.js
import axios from 'axios'

const API_BASE = 'http://localhost:4000'

// 🏆 Fetch leaderboard data
export async function fetchLeaderboard() {
  const res = await axios.get(`${API_BASE}/leaderboard`)
  return res.data
}

// 📝 Submit score
export async function submitScore(username, score) {
  const res = await axios.post(`${API_BASE}/leaderboard`, { username, score })
  return res.data
}

// 👤 Register
export async function registerUser(username, password) {
  const res = await axios.post(`${API_BASE}/register`, { username, password })
  return res.data
}

// 🔐 Login
export async function loginUser(username, password) {
  const res = await axios.post(`${API_BASE}/login`, { username, password })
  return res.data
}

// ✅ Compatibility alias for older imports
export const getLeaderboard = fetchLeaderboard
