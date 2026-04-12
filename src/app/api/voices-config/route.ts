import { NextResponse } from 'next/server'
import { getVoices } from '@/lib/voices'

export async function GET() {
  try {
    const voices = await getVoices()
    return NextResponse.json({ voices })
  } catch (error) {
    console.error('Get voices config error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
