<template>
  <footer class="footer">
    <div class="footer-main">
      <div class="footer-left">
        <img src="/icon.png" alt="BLRSSCO Icon" class="footer-icon" />
        <img src="/logo.png" alt="BLRSSCO Logo" class="footer-logo" />
      </div>
      <div class="footer-links">
        <a href="/contact" class="footer-link">Contact Us</a>
        <a href="/privacy-policy" class="footer-link">Privacy Policy</a>
        <a href="/terms-of-service" class="footer-link">Terms of Service</a>
      </div>
    </div>
    <div class="footer-about">
      <h2>About BLRSSCO</h2>
      <p>
        At BLRSSCO, we believe playing games should be simple, fun, and instant. That's why we built a platform where you can jump into great games right from your browser—no downloads, no sign-ups, no waiting. Just pick a title you like and start playing, whether you're on your phone, tablet, or laptop.<br>
        We've gathered a wide mix of games to suit all kinds of players. If you like solving problems, our Puzzle Games are perfect for stretching your brain. For fast-paced action and quick competition, check out our .io Games or Shooting Games. Into cars and speed? Our Car Games bring everything from racing to drifting challenges. And if you enjoy open-ended play, our Simulation Games let you run shops, build worlds, or live virtual lives—your way.<br>
        We're always adding fresh content to keep things interesting. The homepage highlights new and trending games, and it's easy to browse by genre or vibe. If you're in the mood to play with someone else, we've got plenty of quick multiplayer games too. Our goal is to make online gaming easy, exciting, and always worth your time.
      </p>
    </div>
  </footer>
</template>

<script setup>
// 页脚组件
</script>

<style scoped>
.footer {
  background: linear-gradient(90deg, #4b1fa7 0%, #7c2ae8 100%);
  color: #fff;
  padding: 32px 0 0 0;
  font-family: 'Montserrat', 'Arial', sans-serif;
  margin-top: auto;
}
.footer-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  flex-wrap: wrap;
}
.footer-left {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 64px;
}
.footer-icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: block;
}
.footer-logo {
  width: 120px;
  height: 40px;
  object-fit: contain;
  display: block;
  background: transparent;
}
.footer-links {
  display: flex;
  gap: 36px;
  font-size: 1.2rem;
}
.footer-link {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  position: relative;
}
.footer-link:hover {
  color: #ffb800;
  text-decoration: underline;
}
.footer-about {
  max-width: 1100px;
  margin: 32px auto 0 auto;
  padding: 0 24px 32px 24px;
  text-align: left;
}
.footer-about h2 {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #fff;
}
.footer-about p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #f3eaff;
}
.debug-border {
  border: 2px dashed #ff00cc;
}
@media (max-width: 800px) {
  .footer-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
  }
  .footer-links {
    gap: 18px;
    font-size: 1rem;
  }
  .footer-icon {
    width: 40px;
    height: 40px;
  }
  .footer-logo {
    width: 80px;
    height: 28px;
  }
  .footer-about {
    padding: 0 12px 24px 12px;
  }
}
</style> 