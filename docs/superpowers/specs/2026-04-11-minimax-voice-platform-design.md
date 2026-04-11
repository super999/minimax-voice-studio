# MiniMax Voice Platform — 设计文档

**版本：** 1.0
**日期：** 2026-04-11
**项目路径：** `D:\claude-code-work\minimax-voice-studio`

---

## 一、项目概述

**项目名称：** MiniMax Voice Studio

**核心功能：**
- 文本转语音（TTS）合成
- 声音复刻（Voice Clone）
- 声音资产管理（创建、分类、删除、播放）
- 开发者 API Key 管理与用量统计

**目标用户：**
- 内容创作者（需要配音、配乐）
- 开发者（集成 TTS API 到自己的应用）

---

## 二、技术栈

| 模块 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router) |
| 样式 | Tailwind CSS |
| 认证 | NextAuth.js v5 (邮箱 + 微信/Google 第三方登录) |
| 数据库 | MySQL 8.0 |
| ORM | Prisma |
| 文件存储 | 本地文件系统 |
| 状态管理 | React Context + SWR |
| 表单验证 | Zod |
| UI组件 | shadcn/ui |

**MySQL 连接信息：**
```
mysql://super999:chenxiawen@192.168.9.101:3306/voice_studio
```
> 数据库 `voice_studio` 需在 MySQL 中创建。

---

## 三、系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      前端 (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │  TTS 页面 │  │ 克隆页面  │  │ 管理页面  │  │API管理│ │
│  └──────────┘  └──────────┘  └──────────┘  └───────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼────────────────────────────────┐
│                   后端 (Node.js API)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ 认证模块  │  │ TTS 模块  │  │ 克隆模块  │  │用户模块│ │
│  └──────────┘  └──────────┘  └──────────┘  └───────┘ │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │   MySQL   │  │MiniMax API│  │ 文件存储  │
    │  (用户/数据)│  │ (语音合成) │  │ (音频文件)│
    └──────────┘  └──────────┘  └──────────┘
```

---

## 四、数据库设计

### 用户表（users）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键自增 |
| email | VARCHAR(255) | 邮箱，唯一 |
| password_hash | VARCHAR(255) | 加密密码 |
| name | VARCHAR(100) | 显示名称 |
| avatar_url | VARCHAR(500) | 头像URL |
| created_at | DATETIME | 注册时间 |
| updated_at | DATETIME | 更新时间 |

### 语音资产表（voice_assets）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键自增 |
| user_id | INT | 关联用户 |
| name | VARCHAR(100) | 语音名称 |
| type | ENUM | 'tts' / 'clone' / 'design' |
| voice_id | VARCHAR(100) | MiniMax voice ID |
| audio_url | VARCHAR(500) | 音频文件URL |
| source_audio_url | VARCHAR(500) | 克隆源音频URL（可选） |
| metadata | JSON | 额外参数（音色、语速等） |
| created_at | DATETIME | 创建时间 |

### API Keys表（api_keys）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键自增 |
| user_id | INT | 关联用户 |
| key | VARCHAR(64) | API Key |
| name | VARCHAR(100) | Key 名称 |
| usage_count | INT | 调用次数 |
| created_at | DATETIME | 创建时间 |
| last_used_at | DATETIME | 最后使用时间 |

---

## 五、前端页面结构

```
/                    → 首页（介绍 + 快速开始）
/auth/login         → 登录页（邮箱 + 微信/Google）
/auth/register      → 注册页
/dashboard           → 用户仪表板（概览）
/tts                 → TTS 合成页面
/clone               → 声音克隆页面
/voices              → 我的声音列表
/voices/[id]         → 声音详情/编辑
/settings            → 账户设置
/developer           → 开发者中心
/developer/keys      → API Keys 管理
/developer/stats     → 用量统计
```

---

## 六、核心功能流程

### TTS 合成流程
1. 用户输入文本 → 选择声音 → 选择语速/音调
2. 点击生成 → 调用后端 API
3. 后端请求 MiniMax TTS API
4. 获得音频 → 保存到存储 → 记录到数据库
5. 返回音频 URL → 前端播放/下载

### 声音克隆流程
1. 用户上传音频文件（或提供 URL）
2. 系统验证音频格式和时长（10秒-5分钟）
3. 调用 MiniMax Clone API
4. 创建声音资产记录
5. 返回克隆的 voice_id

---

## 七、环境变量

```env
# Database
DATABASE_URL="mysql://super999:chenxiawen@192.168.9.101:3306/voice_studio"

# MiniMax API
MINIMAX_API_KEY="your-minimax-api-key"
MINIMAX_API_HOST="https://api.minimaxi.com"  # 中国大陆
# MINIMAX_API_HOST="https://api.minimax.io"  # 全球

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# 第三方登录（可选）
WECHAT_CLIENT_ID=""
WECHAT_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## 八、待创建数据库

```sql
CREATE DATABASE voice_studio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

执行 `npx prisma db push` 后 Prisma 会自动创建表结构。

---

## 九、成功标准

1. 用户可以注册、登录（邮箱 + 第三方）
2. 用户可以使用 TTS 合成语音
3. 用户可以克隆声音（上传音频或提供 URL）
4. 用户可以在声音管理页面查看、播放、删除资产
5. 开发者可以管理 API Keys 和查看用量
6. 所有 API 调用通过 MiniMax CodingPlan
