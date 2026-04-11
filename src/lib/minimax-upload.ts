const MINIMAX_API_HOST = process.env.MINIMAX_API_HOST!
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY!

interface UploadFileOptions {
  file: Buffer
  filename: string
  purpose: 'voice_clone' | 'prompt_audio'
}

interface UploadFileResult {
  fileId: string
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
  formData.append('file', new Blob([file], { type: 'audio/mpeg' }), filename)

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
    fileId: String(data.file.file_id),
    bytes: data.file.bytes,
    createdAt: data.file.created_at,
    filename: data.file.filename,
    purpose: data.file.purpose,
  }
}

interface CloneVoiceOptions {
  fileId: string
  voiceId: string
  clonePrompt?: {
    promptAudioFileId: string
    promptText: string
  }
  model?: string
  needNoiseReduction?: boolean
  needVolumeNormalization?: boolean
}

/**
 * Clone a voice using file_id
 * POST https://api.minimaxi.com/v1/voice_clone
 */
export async function cloneVoice({
  fileId,
  voiceId,
  clonePrompt,
  model = 'speech-2.8-hd',
  needNoiseReduction = false,
  needVolumeNormalization = false,
}: CloneVoiceOptions): Promise<{ demoAudio?: string }> {
  const body: Record<string, unknown> = {
    file_id: fileId,
    voice_id: voiceId,
    model,
    need_noise_reduction: needNoiseReduction,
    need_volume_normalization: needVolumeNormalization,
  }

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

  const data = await response.json()

  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(`MiniMax delete error: ${data.base_resp.status_msg}`)
  }
}
