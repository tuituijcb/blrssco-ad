<template>
  <div class="contact-bg">
    <div class="contact-container">
      <p class="contact-text">
        If you have any questions or inquiries, please reach us via
        <a href="mailto:contact@blrssco.com" class="contact-mail">contact@blrssco.com</a>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { usePrefixLink } from '@/composables/usePrefixLink'

const route = useRoute()
const prefix = Array.isArray(route.params.prefix) ? route.params.prefix[0] : route.params.prefix
if (!/^\d{3}$/.test(prefix)) {
  if (process.client) {
    window.location.href = `/contact`
  }
}

usePrefixLink()

// Contact page, simple version
useHead({
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped>
.contact-bg {
  min-height: 60vh;
  background: #6bb6e9;
  display: flex;
  align-items: center;
  justify-content: center;
}
.contact-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.contact-text {
  color: #fff;
  font-size: 1.6rem;
  font-weight: bold;
  text-align: center;
  margin: 0;
}
.contact-mail {
  color: #fff;
  font-weight: bold;
  text-decoration: underline dotted;
  transition: color 0.2s;
}
.contact-mail:hover {
  color: #003c47;
}
</style> 