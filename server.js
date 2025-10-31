import express from 'express'
import cors from 'cors'
import fs from 'fs'

const app = express()
app.use(cors())
app.use(express.json())

// -------------------- FILE PATHS --------------------
const DATA_FILE = './leaderboard.json'
const USERS_FILE = './users.json' // 🆕 user accounts file

// -------------------- LEADERBOARD HELPERS --------------------
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return []
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

// -------------------- USER AUTH HELPERS 🧠 --------------------
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return {}
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

// -------------------- AUTH ROUTES 🔐 --------------------

// Register new user
app.post('/register', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' })
  }

  const users = loadUsers()
  if (users[username]) {
    return res.status(400).json({ error: 'Username already exists' })
  }

  // Create user with starter stats
  users[username] = {
    password,
    stats: { gamesPlayed: 0, highScore: 0 },
  }
  saveUsers(users)

  console.log(`🆕 Registered: ${username}`)
  res.json({ success: true, username })
})

// Login existing user
app.post('/login', (req, res) => {
  const { username, password } = req.body
  const users = loadUsers()

  if (!users[username] || users[username].password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }

  console.log(`✅ Login successful: ${username}`)
  res.json({ success: true, username })
})

// -------------------- LEADERBOARD ROUTES 🏆 --------------------
app.get('/leaderboard', (req, res) => {
  res.json(loadData())
})

app.post('/leaderboard', (req, res) => {
  const { username, score } = req.body
  if (!username || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid data' })
  }

  const data = loadData()
  const existing = data.find((p) => p.username === username)

  if (existing) {
    existing.score = Math.max(existing.score, score) // keep best score
  } else {
    data.push({ username, score })
  }

  data.sort((a, b) => b.score - a.score)
  saveData(data)

  // 🆙 Optional: update high score in users.json too
  const users = loadUsers()
  if (users[username]) {
    users[username].stats.highScore = Math.max(users[username].stats.highScore || 0, score)
    users[username].stats.gamesPlayed = (users[username].stats.gamesPlayed || 0) + 1
    saveUsers(users)
  }

  res.json({ success: true })
})

// -------------------- SERVER START --------------------
app.listen(4000, () => console.log('🏆 Server running on http://localhost:4000'))
