import { promises as fs } from 'fs'
import path from 'path'
import { VOICE_GROUPS, type Voice, type VoiceGroup } from '@/config/voices'

const DATA_VOICES_PATH = path.join(process.cwd(), 'data', 'voices.json')

export interface DataVoice {
  voice_id: string
  name: string
  description: string | string[]
  created_time?: string
}

export interface ExtendedVoice extends Voice {
  description?: string[]
  created_time?: string
}

export interface ExtendedVoiceGroup {
  language: string
  voices: ExtendedVoice[]
}

/**
 * 从 data/voices.json 读取官方同步的音色列表
 */
async function getDataVoices(): Promise<DataVoice[]> {
  try {
    const content = await fs.readFile(DATA_VOICES_PATH, 'utf-8')
    const voices = JSON.parse(content)
    if (Array.isArray(voices) && voices.length > 0) {
      return voices
    }
    return []
  } catch {
    return []
  }
}

/**
 * 根据 voice_id 的前缀获取分组名称
 */
function getGroupFromVoiceId(voiceId: string): string {
  const underscoreIndex = voiceId.indexOf('_')
  if (underscoreIndex > 0) {
    return voiceId.substring(0, underscoreIndex)
  }
  return 'Default'
}

/**
 * 将 DataVoice 格式转换为 VoiceGroup 格式
 */
function convertToVoiceGroups(dataVoices: DataVoice[]): ExtendedVoiceGroup[] {
  const languageMap = new Map<string, ExtendedVoice[]>()

  for (const v of dataVoices) {
    const group = getGroupFromVoiceId(v.voice_id)
    if (!languageMap.has(group)) {
      languageMap.set(group, [])
    }
    // 确保 description 是字符串
    const descStr = Array.isArray(v.description)
      ? v.description.join('')
      : (typeof v.description === 'string' ? v.description : '')
    // description 也要保留为数组格式用于展示
    const descArr = Array.isArray(v.description)
      ? v.description
      : (typeof v.description === 'string' ? [v.description] : [])
    languageMap.get(group)!.push({
      id: v.voice_id,
      name: v.name || v.voice_id,
      language: group,
      category: descStr,
      description: descArr,
      created_time: v.created_time || '1970-01-01',
    })
  }

  return Array.from(languageMap.entries())
    .map(([language, voices]) => ({
      language,
      voices,
    }))
    .sort((a, b) => a.language.localeCompare(b.language))
}

/**
 * 获取音色列表
 * 优先从 data/voices.json 读取（官方同步的）
 * 如果为空或失败，fallback 到 src/config/voices.ts
 */
export async function getVoices(): Promise<ExtendedVoiceGroup[]> {
  const dataVoices = await getDataVoices()
  if (dataVoices.length > 0) {
    // 更新缓存
    voiceIdCache = new Set(dataVoices.map(v => v.voice_id))
    return convertToVoiceGroups(dataVoices)
  }
  // Fallback: 从硬编码配置加载时也更新缓存
  const fallbackVoices = VOICE_GROUPS as ExtendedVoiceGroup[]
  voiceIdCache = new Set(fallbackVoices.flatMap(g => g.voices.map(v => v.id)))
  return fallbackVoices
}

// 缓存 voice ID 集合，用于快速验证
let voiceIdCache: Set<string> = new Set()

/**
 * 检查 voiceId 是否为有效音色（存在于动态配置中）
 */
export function isValidVoiceId(voiceId: string): boolean {
  return voiceIdCache.has(voiceId)
}

/**
 * 获取有效的 voiceId 列表
 */
export function getValidVoiceIds(): string[] {
  return Array.from(voiceIdCache)
}
