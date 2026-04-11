import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 })
    }

    const voices = await prisma.voiceAsset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(voices)
  } catch (error) {
    console.error('Get voices error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')

    if (!idParam) {
      return NextResponse.json({ error: 'Voice ID is required' }, { status: 400 })
    }

    const voiceId = parseInt(idParam)
    if (isNaN(voiceId)) {
      return NextResponse.json({ error: 'Invalid voice ID' }, { status: 400 })
    }

    const userId = parseInt(session.user.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 })
    }

    const voice = await prisma.voiceAsset.findFirst({
      where: { id: voiceId, userId },
    })

    if (!voice) {
      return NextResponse.json({ error: 'Voice not found' }, { status: 404 })
    }

    await prisma.voiceAsset.delete({
      where: { id: voiceId },
    })

    return NextResponse.json({ message: 'Voice deleted successfully' })
  } catch (error) {
    console.error('Delete voice error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
