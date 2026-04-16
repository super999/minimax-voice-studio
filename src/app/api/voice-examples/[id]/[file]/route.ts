import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const EXAMPLES_DIR = path.join(process.cwd(), 'data', 'example')

function isValidFilename(filename: string): boolean {
  if (!filename.endsWith('.mp3')) return false
  if (filename.includes('..')) return false
  if (filename.includes('/')) return false
  if (filename.includes('\\')) return false
  return true
}

function isValidVoiceId(voiceId: string): boolean {
  if (voiceId.includes('..')) return false
  if (voiceId.includes('/')) return false
  if (voiceId.includes('\\')) return false
  return true
}

export async function GET(
  request: Request,
  { params }: { params: { id: string; file: string } }
) {
  try {
    const voiceId = decodeURIComponent(params.id)
    const filename = decodeURIComponent(params.file)

    if (!isValidVoiceId(voiceId)) {
      return NextResponse.json({ error: 'Invalid voice ID' }, { status: 400 })
    }

    if (!isValidFilename(filename)) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const filePath = path.join(EXAMPLES_DIR, voiceId, filename)

    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileBuffer = await fs.readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
        'Accept-Ranges': 'bytes',
      },
    })
  } catch (error) {
    console.error('Get voice example file error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
