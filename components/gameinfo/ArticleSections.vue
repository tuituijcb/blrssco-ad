<script setup lang="ts">
import { useSupabase } from '@/composables/useSupabase.js'
import { ref } from 'vue'

interface Props {
  packageName: string
  appName: string
  appType?: string
}

const props = defineProps<Props>()

// 使用统一的 useSupabase composable
const { supabase } = useSupabase()

// 获取文章内容
const packageKey = String(props.packageName || '').trim()
const typeKey = String(props.appType || '').trim()

let article = null

if (packageKey) {
  const { data } = await supabase
    .from('articles')
    .select('editors_review, features, how_to_use, faq, user_reviews')
    .eq('package_name', packageKey)
    .maybeSingle()

  article = data || null
}

let isDefault = false
// 如果按 package_name 查不到，再按 app_type 匹配模板
if (!article && typeKey) {
  const { data: fallback } = await supabase
    .from('articles')
    .select('editors_review, features, how_to_use, faq, user_reviews')
    .eq('app_type', typeKey)
    .maybeSingle()
  article = fallback || null
  isDefault = true
}

// 如果用默认模板，动态替换{APP_NAME}
function replaceAppName(str?: string) {
  if (!str) return ''
  return isDefault ? str.replace(/\{APP_NAME\}/g, props.appName) : str
}

// 生成星级评分
function generateStars(rating: number) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    const full = i <= Math.floor(rating)
    const half = !full && i - 0.5 === rating
    stars.push({ full, half, empty: !full && !half })
  }
  return stars
}

// FAQ 折叠状态管理
const expandedFaqs = ref<Set<number>>(new Set())

const toggleFaq = (index: number) => {
  if (expandedFaqs.value.has(index)) {
    expandedFaqs.value.delete(index)
  } else {
    expandedFaqs.value.add(index)
  }
}
</script>

<template>
  <section v-if="article" class="article-sections">
    <!-- Editor's Review -->
    <div v-if="article.editors_review" class="article-section">
      <h2 class="section-title">Editor's Review</h2>
      <div class="section-content" v-html="replaceAppName(article.editors_review)"></div>
    </div>

    <!-- How to Use -->
    <div v-if="article.how_to_use" class="article-section">
    <h2 class="section-title">How to Play</h2>
    <div class="section-content" v-html="replaceAppName(article.how_to_use)"></div>
    </div>

    <!-- Features -->
    <div v-if="article.features" class="article-section">
      <h2 class="section-title">Description</h2>
      <div class="section-content" v-html="replaceAppName(article.features)"></div>
    </div>



    <!-- FAQ Section -->
    <div 
      v-if="Array.isArray(article.faq) && article.faq.length > 0" 
      class="article-faq-section"
    >
      <h2 class="faq-title">Frequently Asked Questions</h2>
      <ul class="faq-list">
        <li 
          v-for="(item, idx) in article.faq" 
          :key="idx" 
          class="faq-item"
          :class="{ 'last-item': idx === article.faq.length - 1 }"
        >
          <div class="faq-question-row" @click="toggleFaq(idx)">
            <span class="faq-icon">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="12" fill="#f3f4f6"/>
                <text x="12" y="17" text-anchor="middle" font-size="16" font-weight="bold" fill="#6366f1">?</text>
              </svg>
            </span>
            <div class="faq-question">Q: {{ replaceAppName(item.question) }}</div>
            <span class="faq-arrow" :class="{ 'expanded': expandedFaqs.has(idx) }">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
          <transition name="faq-collapse">
            <div v-if="expandedFaqs.has(idx)" class="faq-answer-wrapper">
              <div class="faq-answer">A: {{ replaceAppName(item.answer) }}</div>
            </div>
          </transition>
        </li>
      </ul>
    </div>

    <!-- User Reviews Section -->
    <div 
      v-if="Array.isArray(article.user_reviews) && article.user_reviews.length > 0" 
      class="article-reviews-section"
    >
      <h2 class="reviews-title">User Reviews</h2>
      <ul class="reviews-list">
        <li 
          v-for="(item, idx) in article.user_reviews" 
          :key="idx" 
          class="review-item"
          :class="{ 'last-item': idx === article.user_reviews.length - 1 }"
        >
          <span class="review-avatar">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <defs>
                <linearGradient id="userAvatarGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#6366f1" />
                  <stop offset="100%" stop-color="#f472b6" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#a5b4fc" flood-opacity="0.5" />
                </filter>
              </defs>
              <circle cx="20" cy="20" r="18" fill="url(#userAvatarGradient)" filter="url(#shadow)" />
              <text 
                x="20" 
                y="26" 
                text-anchor="middle" 
                font-size="16" 
                font-weight="bold" 
                fill="#fff" 
                font-family="Arial, Helvetica, sans-serif"
              >
                {{ item.username.slice(0,2).toUpperCase() }}
              </text>
            </svg>
          </span>
          <div class="review-content">
            <div class="review-header">
              <span class="review-username">{{ replaceAppName(item.username) }}</span>
              <span class="review-date">{{ new Date(item.date).toLocaleDateString('en-US') }}</span>
            </div>
            <div class="review-rating">
              <span 
                v-for="(star, i) in generateStars(item.rating)" 
                :key="i" 
                class="star"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  :fill="star.full || star.half ? '#facc15' : '#e5e7eb'"
                  stroke="#facc15"
                  stroke-width="1"
                >
                  <polygon
                    points="12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9"
                    :fill="star.full ? '#facc15' : star.half ? 'url(#half)' : '#e5e7eb'"
                  />
                  <defs v-if="star.half">
                    <linearGradient id="half">
                      <stop offset="50%" stop-color="#facc15" />
                      <stop offset="50%" stop-color="#e5e7eb" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <span class="rating-number">{{ item.rating.toFixed(1) }}</span>
            </div>
            <div class="review-comment">{{ replaceAppName(item.comment) }}</div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.article-sections {
  margin: 32px 0;
}

.article-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: inherit;
}

.section-content {
  white-space: pre-line;
  line-height: 1.7;
  color: inherit;
}

html.dark-mode .section-content {
  color: #d1d5db;
}

/* FAQ Section */
.article-faq-section {
  margin-bottom: 24px;
  padding: 16px 0;
}

.faq-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
  color: inherit;
}

.faq-list {
  padding-left: 0;
  list-style: none;
  margin: 0;
}

.faq-item {
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  transition: all 0.2s ease;
}

html.dark-mode .faq-item {
  border-color: #374151;
  background: #1f2937;
}

.faq-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

html.dark-mode .faq-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.faq-item.last-item {
  margin-bottom: 0;
}

.faq-question-row {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  gap: 12px;
  transition: background-color 0.2s ease;
}

.faq-question-row:hover {
  background: #f9fafb;
}

html.dark-mode .faq-question-row:hover {
  background: #374151;
}

.faq-icon {
  flex-shrink: 0;
}

.faq-question {
  flex: 1;
  font-weight: 700;
  font-size: 16px;
  color: inherit;
  margin: 0;
}

.faq-arrow {
  flex-shrink: 0;
  transition: transform 0.3s ease;
  color: #6b7280;
}

.faq-arrow.expanded {
  transform: rotate(180deg);
}

html.dark-mode .faq-arrow {
  color: #9ca3af;
}

.faq-answer-wrapper {
  padding: 0 16px 12px 16px;
}

.faq-answer {
  font-size: 14px;
  line-height: 1.6;
  color: inherit;
  padding-left: 36px;
  margin: 0;
}

html.dark-mode .faq-answer {
  color: #d1d5db;
}

/* FAQ 折叠动画 */
.faq-collapse-enter-active, .faq-collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.faq-collapse-enter-from, .faq-collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.faq-collapse-enter-to, .faq-collapse-leave-from {
  max-height: 200px;
  opacity: 1;
}

/* User Reviews Section */
.article-reviews-section {
  margin-bottom: 24px;
  padding: 16px 0;
}

.reviews-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
  color: inherit;
}

.reviews-list {
  padding-left: 0;
  list-style: none;
  margin: 0;
}

.review-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

html.dark-mode .review-item {
  border-bottom-color: #374151;
}

.review-item.last-item {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.review-avatar {
  flex-shrink: 0;
  margin-top: 4px;
}

.review-content {
  flex: 1;
}

.review-header {
  margin-bottom: 4px;
}

.review-username {
  font-weight: 700;
  font-size: 15px;
  color: inherit;
}

.review-date {
  font-weight: 400;
  font-size: 14px;
  color: #888;
  margin-left: 12px;
}

html.dark-mode .review-date {
  color: #9ca3af;
}

.review-rating {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  gap: 2px;
}

.star {
  display: inline-block;
}

.rating-number {
  font-size: 15px;
  color: #f59e42;
  margin-left: 6px;
}

.review-comment {
  font-size: 14px;
  line-height: 1.6;
  color: inherit;
}

html.dark-mode .review-comment {
  color: #d1d5db;
}



/* 移动端适配 */
@media (max-width: 768px) {
  .article-faq-section,
  .article-reviews-section {
    padding: 16px 0;
  }
  
  .faq-title,
  .reviews-title {
    font-size: 18px;
  }
  
  .faq-question {
    font-size: 15px;
  }
  
  .review-username {
    font-size: 14px;
  }
  
  .faq-question-row {
    padding: 10px 14px;
  }
  
  .faq-answer-wrapper {
    padding: 0 14px 10px 14px;
  }


}
</style> 