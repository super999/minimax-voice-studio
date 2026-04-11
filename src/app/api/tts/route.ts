import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTTS } from '@/lib/minimax'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

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

    const { arrayBuffer, contentType, contentLength } = await generateTTS({
      text: text.trim(),
      voiceId,
      speed: speed ? Number(speed) : undefined,
    })

    // Validate Content-Type is audio
    if (!contentType.includes('audio') && !contentType.includes('mpeg') && !contentType.includes('mp3')) {
      throw new Error('Invalid response: expected audio content type')
    }

    // Validate file size (max 10MB)
    if (contentLength > MAX_FILE_SIZE) {
      throw new Error(`File size ${contentLength} exceeds maximum allowed size of ${MAX_FILE_SIZE}`)
    }

    const filename = `tts_${uuidv4()}.mp3`
    const audioDir = path.join(process.cwd(), 'public', 'audio')
    const filepath = path.join(audioDir, filename)

    await fs.writeFile(filepath, Buffer.from(arrayBuffer))

    const audioUrl = `/audio/${filename}`

    const userId = parseInt(session.user.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 })
    }

    const voiceAsset = await prisma.voiceAsset.create({
      data: {
        userId,
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
