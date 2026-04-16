import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const EXAMPLES_PATH = path.join(process.cwd(), 'data', 'voice-examples.json')
const VOICES_PATH = path.join(process.cwd(), 'data', 'voices.json')

interface VoiceExample {
  voice_id: string
  examples: Example[]
}

interface Example {
  filename: string
  title: string
  description?: string
  text?: string
}

interface VoiceInfo {
  voice_id: string
  name: string
  description: string | string[]
}

interface VoiceWithExamples {
  voice_id: string
  name: string
  language: string
  description?: string
  examples: Example[]
}

interface GroupedVoices {
  language: string
  voices: VoiceWithExamples[]
}

function getLanguageFromVoiceId(voiceId: string, voiceInfoMap: Map<string, VoiceInfo>): string {
  const voiceInfo = voiceInfoMap.get(voiceId)
  if (!voiceInfo) {
    const underscoreIndex = voiceId.indexOf('_')
    if (underscoreIndex > 0) {
      return voiceId.substring(0, underscoreIndex)
    }
    return 'Default'
  }

  const name = voiceInfo.name
  if (name.includes('Mandarin') || name.includes('普通话') || 
      name.includes('Chinese') || name.includes('粤语') ||
      name.includes('Cantonese')) {
    if (name.includes('Cantonese') || name.includes('粤语')) {
      return 'Cantonese'
    }
    return 'Chinese'
  }
  if (name.includes('English')) return 'English'
  if (name.includes('Japanese')) return 'Japanese'
  if (name.includes('Korean')) return 'Korean'
  if (name.includes('Spanish')) return 'Spanish'
  if (name.includes('Portuguese')) return 'Portuguese'
  if (name.includes('French')) return 'French'
  if (name.includes('German')) return 'German'
  if (name.includes('Russian')) return 'Russian'
  if (name.includes('Italian')) return 'Italian'
  if (name.includes('Arabic')) return 'Arabic'
  if (name.includes('Turkish')) return 'Turkish'
  if (name.includes('Ukrainian')) return 'Ukrainian'
  if (name.includes('Indonesian')) return 'Indonesian'
  if (name.includes('Vietnamese')) return 'Vietnamese'
  if (name.includes('Dutch')) return 'Dutch'

  const underscoreIndex = voiceId.indexOf('_')
  if (underscoreIndex > 0) {
    return voiceId.substring(0, underscoreIndex)
  }
  return 'Default'
}

export async function GET() {
  try {
    const [examplesContent, voicesContent] = await Promise.all([
      fs.readFile(EXAMPLES_PATH, 'utf-8'),
      fs.readFile(VOICES_PATH, 'utf-8').catch(() => '[]')
    ])

    const examples: VoiceExample[] = JSON.parse(examplesContent)
    const voices: VoiceInfo[] = JSON.parse(voicesContent)

    const voiceInfoMap = new Map<string, VoiceInfo>()
    for (const voice of voices) {
      voiceInfoMap.set(voice.voice_id, voice)
    }

    const voicesWithExamples: VoiceWithExamples[] = examples.map(ex => {
      const voiceInfo = voiceInfoMap.get(ex.voice_id)
      const description = voiceInfo?.description
      const descriptionStr = Array.isArray(description)
        ? description.join('')
        : (typeof description === 'string' ? description : '')

      return {
        voice_id: ex.voice_id,
        name: voiceInfo?.name || ex.voice_id,
        language: getLanguageFromVoiceId(ex.voice_id, voiceInfoMap),
        description: descriptionStr || undefined,
        examples: ex.examples
      }
    })

    const languageMap = new Map<string, VoiceWithExamples[]>()
    for (const voice of voicesWithExamples) {
      if (!languageMap.has(voice.language)) {
        languageMap.set(voice.language, [])
      }
      languageMap.get(voice.language)!.push(voice)
    }

    const groupedVoices: GroupedVoices[] = Array.from(languageMap.entries())
      .map(([language, voices]) => ({
        language,
        voices: voices.sort((a, b) => a.name.localeCompare(b.name))
      }))
      .sort((a, b) => a.language.localeCompare(b.language))

    return NextResponse.json({ 
      groups: groupedVoices,
      total: voicesWithExamples.length
    })
  } catch (error) {
    console.error('Get voice examples error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
