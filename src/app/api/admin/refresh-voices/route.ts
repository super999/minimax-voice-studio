import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listVoices } from '@/lib/minimax'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const officialVoices = await listVoices()

    return NextResponse.json({
      success: true,
      officialCount: officialVoices.length,
      voices: officialVoices,
    })
  } catch (error) {
    console.error('Refresh voices error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
