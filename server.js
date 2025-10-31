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
  let { username, score, game } = req.body

  // ✅ Sanitize inputs
  username = (username || '').trim()
  game = (game || '').trim()

  // ❌ Reject if game is missing or invalid
  if (!game || game.toLowerCase() === 'unknown' || game.toLowerCase() === 'unknown game') {
    return res.status(400).json({ success: false, message: 'Invalid or missing game name.' })
  }

  // ❌ Reject invalid username
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required.' })
  }

  // ✅ Ensure score is a valid number
  score = Number(score)
  if (isNaN(score) || score < 0) {
    return res.status(400).json({ success: false, message: 'Invalid score.' })
  }

  // 🏁 Continue saving to leaderboard (example)
  // 🏁 Load current leaderboard
  const leaderboard = loadData()

  // ✅ Save or update user's best score per game
  const existing = leaderboard.find((entry) => entry.username === username && entry.game === game)

  if (existing) {
    // update only if the new score is higher
    if (score > existing.score) {
      existing.score = score
      console.log(`⬆️ Updated ${username}'s ${game} score to ${score}`)
    } else {
      console.log(
        `⚠️ ${username}'s ${game} score (${score}) not higher than existing (${existing.score})`,
      )
    }
  } else {
    leaderboard.push({ username, score, game })
    console.log(`✅ Added new score: ${username} - ${game} (${score})`)
  }

  // 💾 Persist to file
  saveData(leaderboard)

  res.json({ success: true })
})

// -------------------- SERVER START --------------------
app.listen(4000, () => console.log('🏆 Server running on http://localhost:4000'))
