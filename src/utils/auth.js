// src/utils/auth.js

// --- Load users from localStorage ---
function loadUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}')
}

// --- Save users to localStorage ---
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users))
}

// --- Register a new user ---
export function registerUser(username, password) {
  const users = loadUsers()
  if (users[username]) return false // already exists

  users[username] = {
    password,
    stats: { gamesPlayed: 0, highScore: 0 },
  }
  saveUsers(users)
  return true
}

// --- Login existing user ---
export function loginUser(username, password) {
  const users = loadUsers()
  if (!users[username] || users[username].password !== password) return false
  return true
}

// --- Get current logged-in username ---
export function getCurrentUser() {
  return localStorage.getItem('currentUser')
}

// --- Get full user data for current user ---
export function getCurrentUserData() {
  const username = getCurrentUser()
  if (!username) return null
  const users = loadUsers()
  return users[username]
}

// --- Update user stats (e.g., after game ends) ---
export function updateUserStats({ gamesPlayed, highScore }) {
  const username = getCurrentUser()
  if (!username) return

  const users = loadUsers()
  const user = users[username]
  if (!user) return

  // safely update stats
  user.stats.gamesPlayed = gamesPlayed ?? user.stats.gamesPlayed
  user.stats.highScore = highScore > (user.stats.highScore || 0) ? highScore : user.stats.highScore

  saveUsers(users)
}

// --- Logout current user ---
export function logoutUser() {
  localStorage.removeItem('currentUser')
}
