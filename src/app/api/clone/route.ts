import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFile, cloneVoice } from '@/lib/minimax-upload'
import { logToFile, logError } from '@/lib/logger'

const MAX_AUDIO_SIZE = 20 * 1024 * 1024 // 20MB
const VALID_EXTENSIONS = ['.mp3', '.m4a', '.wav']

function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot >= 0 ? filename.slice(lastDot).toLowerCase() : ''
}

function generateCloneVoiceId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 8)
  return `clone_${timestamp}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Parse multipart/form-data
    const formData = await request.formData()

    const name = formData.get('name') as string | null
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // Get audio source: file upload OR URL
    const audioFile = formData.get('audioFile') as File | null
    const audioUrl = formData.get('audioUrl') as string | null

    if (!audioFile && !audioUrl) {
      return NextResponse.json(
        { error: 'audioFile or audioUrl is required' },
        { status: 400 }
      )
    }

    let audioFileId: number

    if (audioFile) {
      // Upload local file to MiniMax
      const ext = getExtension(audioFile.name)
      if (!VALID_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `Invalid audio format. Supported: ${VALID_EXTENSIONS.join(', ')}` },
          { status: 400 }
        )
      }

      if (audioFile.size > MAX_AUDIO_SIZE) {
        return NextResponse.json(
          { error: `File too large. Maximum size is 20MB` },
          { status: 400 }
        )
      }

      const buffer = Buffer.from(await audioFile.arrayBuffer())
      const uploadResult = await uploadFile({
        file: buffer,
        filename: audioFile.name,
        purpose: 'voice_clone',
      })
      audioFileId = uploadResult.fileId
    } else {
      // Download URL content, then upload to MiniMax
      const urlStr = audioUrl!.trim()
      if (!urlStr.startsWith('https://')) {
        return NextResponse.json({ error: 'Only HTTPS URLs are allowed' }, { status: 400 })
      }

      // Download the file from URL
      let urlResponse: Response
      try {
        urlResponse = await fetch(urlStr)
      } catch {
        return NextResponse.json({ error: 'Failed to download audio from URL' }, { status: 400 })
      }

      if (!urlResponse.ok) {
        return NextResponse.json({ error: 'Failed to download audio from URL' }, { status: 400 })
      }

      const contentType = urlResponse.headers.get('content-type') || ''
      let filename = 'audio'
      if (contentType.includes('wav')) filename = 'audio.wav'
      else if (contentType.includes('mp3') || contentType.includes('mpeg')) filename = 'audio.mp3'
      else if (contentType.includes('m4a') || contentType.includes('mp4')) filename = 'audio.m4a'

      const urlBuffer = Buffer.from(await urlResponse.arrayBuffer())

      if (urlBuffer.length > MAX_AUDIO_SIZE) {
        return NextResponse.json({ error: 'File too large. Maximum size is 20MB' }, { status: 400 })
      }

      const uploadResult = await uploadFile({
        file: urlBuffer,
        filename,
        purpose: 'voice_clone',
      })
      audioFileId = uploadResult.fileId
    }

    // Optional: prompt audio
    const promptAudioFile = formData.get('promptAudioFile') as File | null
    const promptText = (formData.get('promptText') as string | null)?.trim() || undefined

    let clonePrompt: { promptAudioFileId: string; promptText: string } | undefined

    if (promptAudioFile) {
      const ext = getExtension(promptAudioFile.name)
      if (!VALID_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `Invalid prompt audio format. Supported: ${VALID_EXTENSIONS.join(', ')}` },
          { status: 400 }
        )
      }
      if (promptAudioFile.size > MAX_AUDIO_SIZE) {
        return NextResponse.json({ error: 'Prompt audio file too large' }, { status: 400 })
      }
      const buffer = Buffer.from(await promptAudioFile.arrayBuffer())
      const uploadResult = await uploadFile({
        file: buffer,
        filename: promptAudioFile.name,
        purpose: 'prompt_audio',
      })
      clonePrompt = {
        promptAudioFileId: String(uploadResult.fileId),
        promptText: promptText || '',
      }
    }

    // Validate promptText requires promptAudioFile
    if (promptText && !promptAudioFile) {
      return NextResponse.json(
        { error: 'promptText requires promptAudioFile to be provided' },
        { status: 400 }
      )
    }

    // Generate unique voice_id for this clone
    const voiceId = generateCloneVoiceId()

    console.log('[DEBUG] Clone request:', {
      fileId: audioFileId,
      voiceId,
      clonePrompt,
      audioFile: audioFile ? { name: audioFile.name, size: audioFile.size } : 'URL',
      promptAudioFile: promptAudioFile ? { name: promptAudioFile.name, size: promptAudioFile.size } : null,
    })
    await logToFile(`[DEBUG] Clone request: fileId=${audioFileId}, voiceId=${voiceId}, clonePrompt=${JSON.stringify(clonePrompt)}`)

    // Call MiniMax voice_clone API
    await cloneVoice({
      fileId: audioFileId,
      voiceId,
      clonePrompt,
    })

    // Save to ClonedVoice table
    const clonedVoice = await prisma.clonedVoice.create({
      data: {
        userId,
        voiceId,
        name: name.trim(),
        sourceUrl: audioUrl?.trim() || null,
      },
    })

    // Also save to VoiceAsset for consistency
    await prisma.voiceAsset.create({
      data: {
        userId,
        name: name.trim(),
        type: 'clone',
        voiceId,
        sourceAudioUrl: audioUrl?.trim() || null,
      },
    })

    return NextResponse.json({
      id: clonedVoice.id,
      voiceId,
      name: name.trim(),
    })
  } catch (error) {
    await logError('Clone API', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
