const MINIMAX_API_HOST = process.env.MINIMAX_API_HOST!
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY!

interface GenerateTTSOptions {
  text: string
  voiceId: string
  speed?: number
}

interface CloneVoiceOptions {
  audioUrl: string
  name: string
}

interface Voice {
  voice_id: string
  name: string
  description?: string
}

export async function generateTTS({
  text,
  voiceId,
  speed = 1.0,
}: GenerateTTSOptions): Promise<{ audioHex: string }> {
  const response = await fetch(`${MINIMAX_API_HOST}/v1/t2a_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'speech-2.8-hd',
      text,
      voice_setting: {
        voice_id: voiceId,
        speed,
        vol: 1.0,
        pitch: 0,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
        channel: 1,
      },
      stream: false,
      output_format: 'hex',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`MiniMax TTS API error: ${response.status} ${error}`)
  }

  const data = await response.json()

  // Check for API-level errors
  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(`MiniMax API error: ${data.base_resp.status_msg}`)
  }

  const audioHex = data.data?.audio
  if (!audioHex) {
    throw new Error('No audio data returned from MiniMax API')
  }

  return { audioHex }
}

export async function cloneVoice({
  audioUrl,
  name,
}: CloneVoiceOptions): Promise<{ voiceId: string }> {
  const response = await fetch(`${MINIMAX_API_HOST}/v1/voice_clone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      name,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`MiniMax Voice Clone API error: ${response.status} ${error}`)
  }

  const data = await response.json()
  return { voiceId: data.voice_id }
}

export async function listVoices(): Promise<Voice[]> {
  const response = await fetch(`${MINIMAX_API_HOST}/v1/get_voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({ voice_type: 'system' }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`MiniMax List Voices API error: ${response.status} ${error}`)
  }

  const data = await response.json()
  return (data.system_voice || data.voices || []).map((v: { voice_id: string; voice_name?: string; description?: string }) => ({
    voice_id: v.voice_id,
    name: v.voice_name || v.voice_id,
    description: Array.isArray(v.description) ? v.description.join('') : v.description,
  }))
}
