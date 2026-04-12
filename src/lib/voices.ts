import { promises as fs } from 'fs'
import path from 'path'
import { VOICE_GROUPS, type Voice, type VoiceGroup } from '@/config/voices'

const DATA_VOICES_PATH = path.join(process.cwd(), 'data', 'voices.json')

interface DataVoice {
  voice_id: string
  name: string
  language?: string
  category?: string
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
 * 将 DataVoice 格式转换为 VoiceGroup 格式
 */
function convertToVoiceGroups(dataVoices: DataVoice[]): VoiceGroup[] {
  const languageMap = new Map<string, Voice[]>()

  for (const v of dataVoices) {
    const language = v.language || 'Other'
    if (!languageMap.has(language)) {
      languageMap.set(language, [])
    }
    languageMap.get(language)!.push({
      id: v.voice_id,
      name: v.name,
      language: v.language || 'Other',
      category: v.category || 'Official',
    })
  }

  return Array.from(languageMap.entries()).map(([language, voices]) => ({
    language,
    voices,
  }))
}

/**
 * 获取音色列表
 * 优先从 data/voices.json 读取（官方同步的）
 * 如果为空或失败，fallback 到 src/config/voices.ts
 */
export async function getVoices(): Promise<VoiceGroup[]> {
  const dataVoices = await getDataVoices()
  if (dataVoices.length > 0) {
    return convertToVoiceGroups(dataVoices)
  }
  return VOICE_GROUPS
}

/**
 * 获取单个音色（从任意来源）
 */
export async function getVoiceById(id: string): Promise<Voice | undefined> {
  const groups = await getVoices()
  for (const group of groups) {
    const voice = group.voices.find(v => v.id === id)
    if (voice) return voice
  }
  return undefined
}
