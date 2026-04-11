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

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const result = await cloneVoice({
      audioUrl: audioUrl.trim(),
      name: name.trim(),
    })

    const voiceAsset = await prisma.voiceAsset.create({
      data: {
        userId: parseInt(session.user.id),
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
