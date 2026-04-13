const MINIMAX_API_HOST = process.env.MINIMAX_API_HOST!
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY!
import { logToFile } from './logger'

interface UploadFileOptions {
  file: Buffer
  filename: string
  purpose: 'voice_clone' | 'prompt_audio'
}

interface UploadFileResult {
  fileId: number
  bytes: number
  createdAt: number
  filename: string
  purpose: string
}

/**
 * Upload a file to MiniMax and get file_id
 * POST https://api.minimaxi.com/v1/files/upload
 * Content-Type: multipart/form-data
 */
export async function uploadFile({
  file,
  filename,
  purpose,
}: UploadFileOptions): Promise<UploadFileResult> {
  const formData = new FormData()
  formData.append('purpose', purpose)
  formData.append('file', new Blob([file as unknown as BlobPart], { type: 'audio/mpeg' }), filename)

  const response = await fetch(`${MINIMAX_API_HOST}/v1/files/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`MiniMax file upload error: ${response.status} ${error}`)
  }

  const data = await response.json()

  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(`MiniMax upload error: ${data.base_resp.status_msg}`)
  }

  return {
    fileId: data.file.file_id, // Keep as number (MiniMax returns int64)
    bytes: data.file.bytes,
    createdAt: data.file.created_at,
    filename: data.file.filename,
    purpose: data.file.purpose,
  }
}

interface CloneVoiceOptions {
  fileId: number
  voiceId: string
  clonePrompt?: {
    promptAudioFileId: string
    promptText: string
  }
}

/**
 * Clone a voice using file_id
 * POST https://api.minimaxi.com/v1/voice_clone
 */
export async function cloneVoice({
  fileId,
  voiceId,
  clonePrompt,
}: CloneVoiceOptions): Promise<{ demoAudio?: string }> {
  const body: Record<string, unknown> = {
    file_id: fileId,
    voice_id: voiceId,
  }

  await logToFile('[DEBUG] MiniMax voice_clone body: ' + JSON.stringify(body))

  if (clonePrompt) {
    body.clone_prompt = {
      prompt_audio_file_id: clonePrompt.promptAudioFileId,
      prompt_text: clonePrompt.promptText,
    }
  }

  const response = await fetch(`${MINIMAX_API_HOST}/v1/voice_clone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`MiniMax voice clone error: ${response.status} ${error}`)
  }

  const data = await response.json()

  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(`MiniMax clone error: ${data.base_resp.status_msg}`)
  }

  return { demoAudio: data.demo_audio }
}

/**
 * Delete a cloned voice from MiniMax
 * DELETE https://api.minimaxi.com/v1/voice/[voice_id]
 */
export async function deleteClonedVoice(voiceId: string): Promise<void> {
  const response = await fetch(`${MINIMAX_API_HOST}/v1/voice/${voiceId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`MiniMax delete voice error: ${response.status} ${error}`)
  }

  const text = await response.text()
  if (text) {
    const data = JSON.parse(text)
    if (data.base_resp && data.base_resp.status_code !== 0) {
      throw new Error(`MiniMax delete error: ${data.base_resp.status_msg}`)
    }
  }
}
