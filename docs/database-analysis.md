# Supabase 数据库结构分析报告

**生成时间**: 2025/7/1 01:37:58

**数据库**: https://hsduzwtocjaqxwtlpkpd.supabase.co

## 概览

- 表总数: 3
- 字段总数: 36
- 数据行总数: 3585

## 表列表

| 表名 | 类型 | 字段数 | 数据行数 |
|------|------|--------|----------|
| appinfo | BASE TABLE | 18 | 546 |
| articles | BASE TABLE | 11 | 2 |
| images | BASE TABLE | 7 | 3037 |

## 详细表结构

### appinfo

**类型**: BASE TABLE  
**字段数**: 18  
**数据行数**: 546

| 字段名 | 数据类型 | 允许空值 | 默认值 |
|--------|----------|----------|--------|
| id | integer | 否 | - |
| package_name | text | 否 | - |
| app_name | text | 否 | - |
| summary | text | 否 | - |
| category | text | 否 | - |
| developer | text | 否 | - |
| developer_email | text | 否 | - |
| installs | text | 否 | - |
| rating | numeric | 否 | - |
| updated | integer | 否 | - |
| icon_url | text | 否 | - |
| created_at | text | 否 | - |
| version | text | 否 | - |
| privacy_policy | text | 否 | - |
| app_type | text | 否 | - |
| Google_link | text | 否 | - |
| apple_link | nullable | 是 | - |
| trailer_video_url | text | 否 | - |

---

### articles

**类型**: BASE TABLE  
**字段数**: 11  
**数据行数**: 2

| 字段名 | 数据类型 | 允许空值 | 默认值 |
|--------|----------|----------|--------|
| id | integer | 否 | - |
| package_name | text | 否 | - |
| editors_review | text | 否 | - |
| features | text | 否 | - |
| how_to_use | text | 否 | - |
| pros | text | 否 | - |
| cons | text | 否 | - |
| created_at | text | 否 | - |
| updated_at | text | 否 | - |
| faq | array | 否 | - |
| user_reviews | array | 否 | - |

---

### images

**类型**: BASE TABLE  
**字段数**: 7  
**数据行数**: 3037

| 字段名 | 数据类型 | 允许空值 | 默认值 |
|--------|----------|----------|--------|
| id | integer | 否 | - |
| filename | text | 否 | - |
| public_url | text | 否 | - |
| created_at | text | 否 | - |
| type | text | 否 | - |
| package_name | text | 否 | - |
| link | nullable | 是 | - |

---

