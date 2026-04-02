<template>
  <div style="width: 100vw; margin: 0; padding: 0; overflow-x: hidden;">
    <!-- 全局导航 -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// SEO 基础配置
useHead({
  titleTemplate: '%s | H5 Games Hub',
  meta: [
    { name: 'description', content: 'Discover and play amazing HTML5 games online. Free browser games for PC, mobile and tablet.' },
    { name: 'keywords', content: 'HTML5 games,browser games,free games,online games,mobile games' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'H5 Games Hub' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ],
  script: [
    {
      hid: 'gtm',
      children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W7RHTHCQ');`,
      type: 'text/javascript'
    }
  ],
  __dangerouslyDisableSanitizersByTagID: {
    gtm: ['children']
  }
})
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100vw;
  overflow-x: hidden;
}

#__nuxt {
  width: 100vw;
  margin: 0;
  padding: 0;
}
</style>
