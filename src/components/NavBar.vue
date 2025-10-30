<template>
  <nav class="navbar">
    <h1>Web Arcade</h1>
    <div class="links">
      <RouterLink to="/hub">Hub</RouterLink>
      <RouterLink to="/profile">Profile</RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #111;
  padding: 1rem 2rem;
  border-bottom: 2px solid #00ffcc;
}

h1 {
  color: #00ffcc;
  font-size: 1.5rem;
}

.links a {
  margin-left: 1.5rem;
}
</style>
