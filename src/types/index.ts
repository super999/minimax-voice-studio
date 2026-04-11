export interface VoiceAsset {
  id: number
  userId: number
  name: string
  type: 'tts' | 'clone' | 'design'
  voiceId: string | null
  audioUrl: string | null
  sourceAudioUrl: string | null
  metadata: Json | null
  createdAt: string
}

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json }
