<template>
  <div style="width: 100vw; margin: 0; padding: 0; overflow-x: hidden;">
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W7RHTHCQ"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    <!-- 全局导航栏 -->
    <AppHeader />

    <!-- 社交分享浮动按钮 -->
    <SocialShareButtons />

    <!-- 页面内容 -->
    <main style="width: 100vw; margin: 0; padding: 0;">
      <NuxtPage :key="$route.fullPath" />
    </main>

    <!-- 全局页脚 -->
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '~/components/AppHeader.vue'
import AppFooter from '~/components/AppFooter.vue'
import SocialShareButtons from '~/components/SocialShareButtons.vue'
</script> 