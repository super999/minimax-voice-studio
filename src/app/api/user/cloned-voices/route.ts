import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/cloned-voices
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const clonedVoices = await prisma.clonedVoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        voiceId: true,
        name: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      clonedVoices: clonedVoices.map(v => ({
        id: v.id,
        voiceId: v.voiceId,
        name: v.name,
        createdAt: v.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Get cloned voices error:', error)
    return NextResponse.json({ error: 'Failed to get cloned voices' }, { status: 500 })
  }
}
