import { promises as fs } from 'fs'
import path from 'path'
import { VOICE_GROUPS, type Voice, type VoiceGroup } from '@/config/voices'

const DATA_VOICES_PATH = path.join(process.cwd(), 'data', 'voices.json')

export interface DataVoice {
  voice_id: string
  voice_name: string
  description: string[]
  created_time: string
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
    languageMap.get(group)!.push({
      id: v.voice_id,
      name: v.voice_name,
      language: group,
      category: descStr,
      description: Array.isArray(v.description) ? v.description : [],
      created_time: v.created_time,
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
    return convertToVoiceGroups(dataVoices)
  }
  return VOICE_GROUPS as ExtendedVoiceGroup[]
}
