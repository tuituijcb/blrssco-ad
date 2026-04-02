# Project Dependencies

## Core Dependencies
- nuxt: ^3.17.5 - The Nuxt.js framework
- vue: ^3.5.17 - Vue.js framework
- vue-router: ^4.5.1 - Vue Router

## Database Dependencies
- @supabase/supabase-js: ^2.39.0 - Supabase JavaScript client for database operations

## Cloud & Storage Dependencies
- @aws-sdk/client-s3: ^3.839.0 - AWS S3 client for file storage
- mime-types: ^3.0.1 - MIME type utilities

## Development Dependencies
- @nuxthq/studio: ^2.2.1 - Nuxt Studio integration
- @nuxtjs/tailwindcss: ^7.0.0-beta.0 - Tailwind CSS module for Nuxt
- @types/node: ^22.10.0 - TypeScript definitions for Node.js
- wrangler: ^4.22.0 - Cloudflare Workers CLI

## Database Schema Files
- database/schema.sql - Complete database schema for Supabase
- database/seed-data.sql - Initial data for categories and games

## Configuration Files
- config/supabase.ts - Supabase client configuration and database services
- composables/useSupabase.js - Vue composables for database operations
- utils/database-migration.js - Migration script for local data to Supabase

## Components
- components/GameGrid.vue - 游戏网格展示组件，支持分类筛选、悬停效果、无限滚动和固定个数模式
- components/AppHeader.vue - 应用头部组件
- components/AppFooter.vue - 应用底部组件

## Test Pages
- pages/test-game-grid.vue - GameGrid组件测试页面

## Installed Date
- Initial setup: 2024-12-19
- GameGrid component: 2024-12-19 