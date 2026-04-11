import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTTS } from '@/lib/minimax'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { text, voiceId, speed } = body

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    if (!voiceId || typeof voiceId !== 'string') {
      return NextResponse.json({ error: 'voiceId is required' }, { status: 400 })
    }

    const audioBuffer = await generateTTS({
      text: text.trim(),
      voiceId,
      speed: speed ? Number(speed) : undefined,
    })

    const filename = `tts_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.mp3`
    const audioDir = path.join(process.cwd(), 'public', 'audio')
    const filepath = path.join(audioDir, filename)

    await fs.writeFile(filepath, Buffer.from(audioBuffer))

    const audioUrl = `/audio/${filename}`

    const voiceAsset = await prisma.voiceAsset.create({
      data: {
        userId: parseInt(session.user.id),
        name: `TTS ${new Date().toISOString()}`,
        type: 'tts',
        voiceId,
        audioUrl,
        metadata: { speed },
      },
    })

    return NextResponse.json({
      id: voiceAsset.id,
      audioUrl,
    })
  } catch (error) {
    console.error('TTS API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
