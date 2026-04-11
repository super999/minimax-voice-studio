import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteClonedVoice } from '@/lib/minimax-upload'

// DELETE /api/user/cloned-voices/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const clonedVoiceId = parseInt(params.id)
    if (isNaN(clonedVoiceId)) {
      return NextResponse.json({ error: 'Invalid cloned voice ID' }, { status: 400 })
    }

    // Find the cloned voice
    const clonedVoice = await prisma.clonedVoice.findUnique({
      where: { id: clonedVoiceId },
    })

    if (!clonedVoice) {
      return NextResponse.json({ error: 'Cloned voice not found' }, { status: 404 })
    }

    if (clonedVoice.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete from MiniMax (ignore errors — local record should be deleted regardless)
    try {
      await deleteClonedVoice(clonedVoice.voiceId)
    } catch (miniError) {
      console.error('Failed to delete voice from MiniMax:', miniError)
    }

    // Delete local record
    await prisma.clonedVoice.delete({ where: { id: clonedVoiceId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete cloned voice error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete cloned voice' },
      { status: 500 }
    )
  }
}
