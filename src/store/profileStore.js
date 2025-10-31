import { reactive } from "vue";

const STORAGE_KEY = "arcade_profiles";

function loadProfiles() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveProfiles(profiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export const profileStore = reactive({
  profiles: loadProfiles(),
  currentUser: null,

  // 🧍 Create or login a user
  login(username) {
    if (!username) return;
    let user = this.profiles.find(u => u.username === username);
    if (!user) {
      user = { username, scores: {} };
      this.profiles.push(user);
      saveProfiles(this.profiles);
    }
    this.currentUser = user;
    localStorage.setItem("currentUser", username);
  },

  // 🚪 Logout
  logout() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
  },

  // 💾 Update high score for a game
  updateScore(gameTitle, score) {
    if (!this.currentUser) return;
    const user = this.currentUser;
    if (!user.scores[gameTitle] || score > user.scores[gameTitle]) {
      user.scores[gameTitle] = score;
      saveProfiles(this.profiles);
    }
  },

  // 📈 Get highest score among all users for a game
  getGlobalHighScore(gameTitle) {
    return Math.max(...this.profiles.map(u => u.scores[gameTitle] || 0), 0);
  },

  // 🧮 Get total score (sum of all games)
  getTotalScore(user) {
    return Object.values(user.scores || {}).reduce((a, b) => a + b, 0);
  },

  // 🏁 Auto-load last logged-in user
  init() {
    const lastUser = localStorage.getItem("currentUser");
    if (lastUser) this.login(lastUser);
  }
});

profileStore.init();
