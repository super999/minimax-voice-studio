import { getVoiceById } from '@/config/voices'

/**
 * 检查 voiceId 是否为有效音色（存在于配置中）
 */
export function isValidVoiceId(voiceId: string): boolean {
  return getVoiceById(voiceId) !== undefined
}

/**
 * 从数组中过滤出只包含有效音色的数组
 */
export function filterValidVoiceIds(voiceIds: string[]): string[] {
  return voiceIds.filter(isValidVoiceId)
}
