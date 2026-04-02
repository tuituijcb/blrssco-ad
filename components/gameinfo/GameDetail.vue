<script setup lang="ts">
interface Props {
  version: string
  updated: number // unix timestamp (int8)
  developer: string
  category: string
  package_name: string
  installs: string
  developer_email?: string
  privacy_policy?: string
}

const props = defineProps<Props>()

// 日期格式化函数，将时间戳转为如 Feb 26, 2025
function formatDate(timestamp: number): string {
  if (!timestamp) return 'N/A'
  // 如果timestamp是毫秒级别的，直接使用；如果是秒级别的，乘以1000
  const dateValue = timestamp > 1000000000000 ? timestamp : timestamp * 1000
  const date = new Date(Number(dateValue))
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}


</script>

<template>
  <section class="app-detail-section">
    <div class="app-detail-grid">
      <div class="detail-item">
        <span class="label">Version</span>
        <span class="value">{{ version || 'N/A' }}</span>
      </div>
      
      <div class="detail-item">
        <span class="label">Update</span>
        <span class="value">{{ formatDate(updated) }}</span>
      </div>
      
      <div class="detail-item">
        <span class="label">Developer</span>
        <span class="value">{{ developer || 'N/A' }}</span>
      </div>
      
      <div class="detail-item">
        <span class="label">Category</span>
        <span class="value">{{ category || 'N/A' }}</span>
      </div>
      
      <div class="detail-item">
        <span class="label">Developer Email</span>
        <span class="value">{{ developer_email || 'N/A' }}</span>
      </div>
      
      <div class="detail-item">
        <span class="label">Privacy Policy</span>
        <a
          class="value link"
          href="/privacy-policy"
          rel="noopener noreferrer"
          target="_blank"
        >
          View Privacy Policy
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.app-detail-section {
  margin: 2rem 0 1.5rem 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
  letter-spacing: 1px;
  color: inherit;
}

.app-detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 1.2rem 2.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.label {
  color: #666;
  font-size: 0.98rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

html.dark-mode .label {
  color: #e5e7eb;
}

.value {
  color: #222;
  font-size: 1.05rem;
  word-break: break-all;
}

html.dark-mode .value {
  color: #fff;
}

.link {
  color: #1976d2;
  text-decoration: underline;
  transition: color 0.2s;
}

.link:hover {
  color: #0d47a1;
}

html.dark-mode .link {
  color: #90caf9;
}

html.dark-mode .link:hover {
  color: #42a5f5;
}

/* 平板端适配 */
@media (max-width: 1024px) {
  .app-detail-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem 2rem;
  }
}

@media (max-width: 768px) {
  .app-detail-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: none;
    gap: 1.2rem 1.5rem;
  }
  
  .detail-item {
    margin-bottom: 0.3rem;
  }
  
  .label {
    font-size: 0.9rem;
    margin-bottom: 0.15rem;
  }
  
  .value {
    font-size: 0.95rem;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .app-detail-grid {
    gap: 1rem 1rem;
  }
  
  .section-title {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
}
</style> 