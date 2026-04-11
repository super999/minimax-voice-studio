# 音色偏好收藏系统 — 设计文档

**版本：** 1.0
**日期：** 2026-04-11
**项目路径：** `D:\claude-code-work\minimax-voice-studio\.worktrees\impl-minimax-voice`

---

## 一、功能概述

**目标：** 用户可以收藏偏好的音色，只有收藏的音色（或默认音色）才显示在 TTS 页面的下拉选择器中。

**核心逻辑：**
- 所有音色目录存储在前端配置文件（327个音色）
- 用户收藏的音色 IDs 存储在数据库
- TTS 页面只显示：`用户收藏的音色` + `默认音色集`
- 用户可以设置默认音色

---

## 二、技术方案

### 数据存储

**前端音色配置** — `src/config/voices.ts`
- 包含所有 327 个音色
- 按语言分组（Mandarin、Cantonese、English 等）
- 每个音色包含：id、name、language、category

**用户偏好** — 数据库 `UserPreference` 表

```prisma
model UserPreference {
  id                Int      @id @default(autoincrement())
  userId            Int      @unique
  favoritedVoiceIds String   @default("") // JSON array: ["female-shaonv","male-qn-qingse"]
  defaultVoiceId    String   @default("female-shaonv")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

### API 设计

**GET /api/user/preferences**
- 返回用户的偏好设置
- Response: `{ favoritedVoiceIds: string[], defaultVoiceId: string }`

**PUT /api/user/preferences**
- 更新用户的偏好设置
- Body: `{ favoritedVoiceIds?: string[], defaultVoiceId?: string }`

### TTS 页面变化

**当前行为：**
- 下拉显示 3 个固定音色

**新行为：**
- 获取用户偏好（收藏列表 + 默认音色）
- 下拉显示：`收藏音色`（标注⭐）+ `默认音色`（标注默认）
- 如果用户未收藏任何音色，显示默认音色集

### 默认音色集（8个）

| Voice ID | 名称 | 语言 |
|----------|------|------|
| female-shaonv | 少女 | Mandarin |
| female-tianmei | 甜妹 | Mandarin |
| female-yujie | 御姐 | Mandarin |
| male-qn-jingying | 精英青年 | Mandarin |
| male-qn-qingse | 青涩 | Mandarin |
| Chinese_Mandarin_News_Anchor | 新闻主播 | Mandarin |
| English_Graceful_Lady | 优雅女士 | English |
| Japanese_OptimisticYouth | 乐观青年 | Japanese |

---

## 三、页面结构

### 偏好设置页面 — `/settings`

```
┌─────────────────────────────────────────┐
│  音色偏好设置                              │
├─────────────────────────────────────────┤
│  默认音色：                               │
│  [下拉选择当前收藏的音色]                   │
├─────────────────────────────────────────┤
│  收藏的音色（共 X 个）：                    │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │⭐音色1│ │⭐音色2│ │⭐音色3│ │ + 添加 │       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
├─────────────────────────────────────────┤
│  浏览所有音色（按语言）：                    │
│  [普通话] [粤语] [英语] [日语] [韩语] ...  │
│  ┌─────┐ ┌─────┐ ┌─────┐                │
│  │音色1│ │音色2│ │音色3│ ...              │
│  └─────┘ └─────┘ └─────┘                │
└─────────────────────────────────────────┘
```

### TTS 页面下拉变化

**新布局：**
```
音色选择：
┌─────────────────────────┐
│ ⭐ 少女（已收藏）         │ ← 用户收藏的
├─────────────────────────┤
│ ⭐ 甜妹（已收藏）         │
├─────────────────────────┤
│ ☆ 御姐（默认）           │ ← 默认音色
├─────────────────────────┤
│ ☆ 精英青年（默认）        │
└─────────────────────────┘
```

---

## 四、文件变更

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/config/voices.ts` | 所有 327 个音色数据，按语言分组 |
| `src/app/settings/page.tsx` | 偏好设置页面 |
| `src/app/api/user/preferences/route.ts` | 用户偏好 API |

### 修改文件

| 文件 | 变更 |
|------|------|
| `prisma/schema.prisma` | 添加 UserPreference 模型 |
| `src/app/tts/page.tsx` | 下拉列表改为显示收藏+默认音色 |
| `src/components/Header.tsx` | 添加"偏好设置"导航链接 |

### API 路由

**GET /api/user/preferences**
```json
{
  "favoritedVoiceIds": ["female-shaonv", "male-qn-qingse"],
  "defaultVoiceId": "female-shaonv"
}
```

**PUT /api/user/preferences**
```json
{
  "favoritedVoiceIds": ["female-shaonv", "male-qn-qingse", "female-tianmei"],
  "defaultVoiceId": "female-tianmei"
}
```

---

## 五、实现步骤

1. 更新 Prisma schema，添加 UserPreference 模型
2. 创建 `src/config/voices.ts` 音色配置文件
3. 创建 `/api/user/preferences` API
4. 创建 `/settings` 偏好设置页面
5. 修改 TTS 页面，从 API 获取用户偏好，过滤下拉列表
6. 修改 Header 添加设置导航

---

## 六、成功标准

1. 用户可以在设置页面浏览所有 327 个音色
2. 用户可以收藏/取消收藏音色
3. 用户可以设置默认音色
4. TTS 页面的下拉只显示：收藏音色（⭐）+ 默认音色（☆）
5. 如果用户未收藏任何音色，只显示默认音色集
6. 偏好数据保存在数据库，跨设备同步
