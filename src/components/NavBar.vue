<template>
  <nav class="navbar">
    <h1>🕹️ Web Arcade 🕹️</h1>
    <div class="links">
      <RouterLink to="/hub">Hub</RouterLink>
      <RouterLink to="/settings">Settings</RouterLink>
      <RouterLink to="/profile">Profile</RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0a0a0f;
  padding: 1rem 2rem;
  border-bottom: 2px solid #00fff7;
  box-shadow: 0 0 15px #00fff7;
}

h1 {
  color: #00fff7;
  font-size: 1.5rem;
  text-shadow: 0 0 10px #00fff7, 0 0 20px #ff00c8;
}

.links a {
  margin-left: 1.5rem;
  text-decoration: none;
  color: #fff;
  font-weight: bold;
  transition: 0.3s;
}

.links a:hover {
  color: #00fff7;
  text-shadow: 0 0 10px #00fff7;
}
</style>
