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

/**
 * Generate text using MiniMax AI model
 */
export async function generateText(prompt: string, model: string = 'MiniMax-M2.7', useEmotionTags: boolean = false): Promise<string> {
  const emotionTagsInstruction = useEmotionTags
    ? `6. 在适当的位置插入语气词标签增加自然感，可用的标签有：
   - (laughs) 笑声 - 大笑时使用
   - (chuckle) 轻笑 - 微笑或轻笑时使用
   - (coughs) 咳嗽 - 咳嗽时使用
   - (clear-throat) 清嗓子 - 清嗓时使用
   - (groans) 呻吟 - 痛苦时使用
   - (breath) 正常换气 - 自然呼吸时使用
   - (pant) 喘气 - 跑步或累了时使用
   - (inhale) 吸气 - 深吸气时使用
   - (exhale) 呼气 - 呼气时使用
   - (gasps) 倒吸气 - 惊讶时使用
   - (sniffs) 吸鼻子 - 吸鼻时使用
   - (sighs) 叹气 - 叹气时使用
   - (snorts) 喷鼻息 - 哼鼻子时使用
   - (burps) 打嗝 - 打嗝时使用
   - (lip-smacking) 咂嘴 - 咂嘴时使用
   - (humming) 哼唱 - 哼歌时使用
   - (hissing) 嘶嘶声 - 害怕时使用
   - (emm) 嗯 - 思考或犹豫时使用
   - (sneezes) 喷嚏 - 打喷嚏时使用
7. 语气词标签使用要自然，每段话最多2-3个，不要过多`
    : ''

  const systemPrompt = `你是一个专业的语音脚本撰写助手。请根据用户的主题，生成一段适合文字转语音（TTS）的文本。生成的文本应该：
1. 语言自然流畅，口语化
2. 长度适中（100-300字）
3. 内容完整，有明确的主题
4. 不包含特殊格式或代码
5. 直接返回文本内容，不要加引号或前缀说明
${emotionTagsInstruction}`

  const response = await fetch(`${MINIMAX_API_HOST}/v1/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          name: 'MiniMax AI',
          content: systemPrompt,
        },
        {
          role: 'user',
          name: '用户',
          content: `请为以下主题生成一段适合TTS的语音文本：${prompt}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`MiniMax Text API error: ${response.status} ${error}`)
  }

  const data = await response.json()

  // Check for API-level errors
  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(`MiniMax API error: ${data.base_resp.status_msg}`)
  }

  // Extract the generated text from the response
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message?.content || ''
  }

  return ''
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

interface GenerateMetadataOptions {
  text: string
  voiceId: string
  systemPromptTemplate?: string
  userPromptTemplate?: string
  model?: string
}

interface GeneratedMetadata {
  filename: string
  title: string
  description: string
}

export async function generateMetadata({
  text,
  voiceId,
  systemPromptTemplate,
  userPromptTemplate,
  model = 'MiniMax-M2.7',
}: GenerateMetadataOptions): Promise<GeneratedMetadata> {
  const defaultSystemPrompt = `你是一个专业的元数据生成助手。请根据用户提供的语音文本内容和语音ID，生成适合的元数据信息。
你需要返回一个严格的 JSON 格式对象，包含以下三个字段：
1. filename: 英文文件名，使用下划线分隔，以 .mp3 结尾，例如 "funny_joke.mp3"
2. title: 中文标题，简洁明了，概括内容主题
3. description: 中文描述，说明这段语音适合什么场景或内容类型

重要规则：
- 只返回 JSON 对象，不要有任何其他文字说明
- filename 必须是英文，使用下划线分隔
- title 和 description 必须是中文
- 确保 JSON 格式正确，使用双引号`

  const defaultUserPrompt = `请根据以下信息生成元数据：
语音文本内容：
{text}

语音ID：{voiceId}`

  const systemPrompt = systemPromptTemplate || defaultSystemPrompt
  const userPrompt = userPromptTemplate
    ? userPromptTemplate.replace('{text}', text).replace('{voiceId}', voiceId)
    : defaultUserPrompt.replace('{text}', text).replace('{voiceId}', voiceId)

  const response = await fetch(`${MINIMAX_API_HOST}/v1/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          name: 'MiniMax AI',
          content: systemPrompt,
        },
        {
          role: 'user',
          name: '用户',
          content: userPrompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`MiniMax Text API error: ${response.status} ${error}`)
  }

  const data = await response.json()

  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(`MiniMax API error: ${data.base_resp.status_msg}`)
  }

  let content = ''
  if (data.choices && data.choices.length > 0) {
    content = data.choices[0].message?.content || ''
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        filename: parsed.filename || 'unknown.mp3',
        title: parsed.title || '未命名',
        description: parsed.description || '',
      }
    } catch {
      throw new Error('Failed to parse generated metadata as JSON')
    }
  }

  throw new Error('No valid JSON metadata found in response')
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
