import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cloneVoice } from '@/lib/minimax'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { audioUrl, name } = body

    if (!audioUrl || typeof audioUrl !== 'string' || audioUrl.trim() === '') {
      return NextResponse.json({ error: 'audioUrl is required' }, { status: 400 })
    }

    // Validate URL scheme - only allow https://
    try {
      const urlObj = new URL(audioUrl.trim())
      if (urlObj.protocol !== 'https:') {
        return NextResponse.json({ error: 'Only HTTPS URLs are allowed' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // URL length limit (reasonable max)
    if (audioUrl.trim().length > 2048) {
      return NextResponse.json({ error: 'URL exceeds maximum allowed length' }, { status: 400 })
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const result = await cloneVoice({
      audioUrl: audioUrl.trim(),
      name: name.trim(),
    })

    const userId = parseInt(session.user.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 })
    }

    const voiceAsset = await prisma.voiceAsset.create({
      data: {
        userId,
        name: name.trim(),
        type: 'clone',
        voiceId: result.voiceId,
        sourceAudioUrl: audioUrl.trim(),
      },
    })

    return NextResponse.json({
      id: voiceAsset.id,
      voiceId: result.voiceId,
    })
  } catch (error) {
    console.error('Clone API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
