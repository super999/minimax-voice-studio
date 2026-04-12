import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listVoices } from '@/lib/minimax'
import { logToFile } from '@/lib/logger'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const officialVoices = await listVoices()

    // Write to data/voices.json
    const dataPath = path.join(process.cwd(), 'data', 'voices.json')
    await fs.writeFile(dataPath, JSON.stringify(officialVoices, null, 2), 'utf-8')

    await logToFile(`[Voice Refresh] Saved ${officialVoices.length} voices to data/voices.json`)

    return NextResponse.json({
      success: true,
      officialCount: officialVoices.length,
      voices: officialVoices,
    })
  } catch (error) {
    console.error('Refresh voices error:', error)
    await logToFile(`[Voice Refresh] Error: ${error instanceof Error ? error.message : String(error)}`)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
