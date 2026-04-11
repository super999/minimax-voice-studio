# 声音克隆本地上传 + 克隆音色管理 — 设计文档

**版本：** 1.0
**日期：** 2026-04-12
**项目路径：** `D:\claude-code-work\minimax-voice-studio\.worktrees\impl-minimax-voice`

---

## 一、功能概述

**目标：**

1. 克隆页面支持**本地上传**音频文件（主方式），同时保留 **URL 输入**（备选）
2. 支持可选的**示例音频**（prompt_audio）辅助克隆
3. 克隆音色管理入口放在**偏好设置页面 Tab**

---

## 二、技术方案

### 2.1 MiniMax API 流程（正确方式）

```
第一步：上传复刻音频（multipart/form-data）
POST https://api.minimaxi.com/v1/files/upload
purpose: "voice_clone"
file: [二进制音频文件]
→ 返回 file_id

第二步：（可选）上传示例音频
POST https://api.minimaxi.com/v1/files/upload
purpose: "prompt_audio"
file: [二进制音频文件]
→ 返回 file_id

第三步：发起克隆
POST https://api.minimaxi.com/v1/voice_clone
file_id: [复刻音频的file_id]
voice_id: [自定义名称，如 clone_001]
clone_prompt: { prompt_audio_file_id: [示例音频file_id], prompt_text: [文本] } // 可选

第四步：（克隆音色管理）删除克隆音色
DELETE https://api.minimaxi.com/v1/voice/[voice_id]
```

### 2.2 数据模型变更

**prisma/schema.prisma — VoiceAsset 表无需变更**（clone 的 voice_id 已存储）

新增数据库表存储用户克隆音色列表（用于管理）：

```prisma
model ClonedVoice {
  id          Int      @id @default(autoincrement())
  userId      Int
  voiceId     String   @unique @map("voice_id") @db.VarChar(256) // MiniMax返回的sv_xxx
  name        String   @default("") @db.VarChar(100) // 暂时自动编号如"克隆音色 1"
  fileId      String?  @map("file_id") @db.VarChar(128) // MiniMax的file_id，暂存
  sourceUrl   String?  @map("source_url") @db.VarChar(500) // 来源URL（URL方式时）
  createdAt   DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("cloned_voices")
}
```

### 2.3 API 设计

**POST /api/clone** （重构）

Body (multipart/form-data):
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 克隆音色名称 |
| audioFile | file | 与 audioUrl 二选一 | 本地上传的复刻音频 |
| audioUrl | string | 与 audioFile 二选一 | 公开可访问的URL |
| promptAudioFile | file | 否 | 示例音频文件 |
| promptText | string | 否 | 示例音频对应的文本 |

响应：
```json
{
  "id": 123,
  "voiceId": "sv_8f3a2b1c9d4e",
  "name": "克隆音色 1"
}
```

**GET /api/user/cloned-voices** — 获取用户的克隆音色列表

响应：
```json
{
  "clonedVoices": [
    { "id": 1, "voiceId": "sv_xxx", "name": "克隆音色 1", "createdAt": "..." },
    { "id": 2, "voiceId": "sv_yyy", "name": "克隆音色 2", "createdAt": "..." }
  ]
}
```

**DELETE /api/user/cloned-voices/:id** — 删除克隆音色（同时调用MiniMax删除接口）

响应：
```json
{ "success": true }
```

---

## 三、页面结构

### 3.1 克隆页面 — `/clone`

```
┌─────────────────────────────────────┐
│  🎙️ 声音克隆                          │
├─────────────────────────────────────┤
│  名称: [________________]  *必填      │
├─────────────────────────────────────┤
│  复刻音频（主体）:                     │
│  ┌─────────────────────────────┐    │
│  │  🎵                        │    │
│  │  拖拽音频文件或点击选择文件   │    │
│  │  <small>支持 mp3/m4a/wav  │    │
│  │  10秒～5分钟，最大20MB      │    │
│  └─────────────────────────────┘    │
│           或                         │
│  音频 URL: [________________]       │
├─────────────────────────────────────┤
│  示例音频（辅助克隆）[可选]:           │
│  ┌─────────────────────────────┐    │
│  │  🎤 点击选择文件（可选）    │    │
│  └─────────────────────────────┘    │
│  示例音频文本: [________________]    │
├─────────────────────────────────────┤
│  [███████ 开始克隆 ███████]          │
└─────────────────────────────────────┘
```

### 3.2 偏好设置页面 — `/settings`

Tab 导航：`[收藏音色]` `[克隆音色]`

**克隆音色 Tab:**
```
┌─────────────────────────────────────┐
│  🎙️ 我的克隆音色                       │
│  [自动编号列表...]                     │
│  ┌─────────────────────────────┐    │
│  │ 🎙️ 克隆音色 1  sv_xxx  [删除]│    │
│  │ 🎙️ 克隆音色 2  sv_yyy  [删除]│    │
│  │ 🎙️ 克隆音色 3  sv_zzz  [删除]│    │
│  └─────────────────────────────┘    │
│  （空状态：暂无克隆音色）              │
└─────────────────────────────────────┘
```

---

## 四、文件变更

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/lib/minimax-upload.ts` | MiniMax 文件上传 API 封装 |
| `src/app/api/clone/route.ts` | 重构，支持 multipart 上传 |
| `src/app/api/user/cloned-voices/route.ts` | GET 用户克隆音色列表 |
| `src/app/api/user/cloned-voices/[id]/route.ts` | DELETE 删除克隆音色 |

### 修改文件

| 文件 | 变更 |
|------|------|
| `prisma/schema.prisma` | 添加 ClonedVoice 模型 |
| `src/app/clone/page.tsx` | UI 改为文件上传 + URL 备选 |
| `src/app/settings/page.tsx` | 增加克隆音色 Tab |

### 删除文件

| 文件 | 说明 |
|------|------|
| `src/lib/minimax.ts` 的 cloneVoice 函数 | 重构后不再需要 |

---

## 五、实现步骤

1. 更新 Prisma schema，添加 ClonedVoice 模型，执行 `npx prisma db push`
2. 创建 `src/lib/minimax-upload.ts`，封装文件上传 API
3. 重构 `/api/clone` 路由，支持 multipart/form-data
4. 创建 `/api/user/cloned-voices` GET 路由
5. 创建 `/api/user/cloned-voices/[id]` DELETE 路由（含 MiniMax 删除调用）
6. 重构克隆页面 UI，支持本地上传
7. 偏好设置页面增加克隆音色 Tab
8. 测试完整流程

---

## 六、成功标准

1. 用户可以在克隆页面**选择本地音频文件**上传（不需要公开 URL）
2. 用户可以**同时上传示例音频**辅助克隆（可选）
3. URL 输入方式**仍然保留**作为备选
4. 克隆成功的 voice_id 显示在**偏好设置 → 克隆音色 Tab**
5. 用户可以**删除克隆音色**（同时从 MiniMax 官方同步删除）
6. 文件格式/大小限制有明确提示
