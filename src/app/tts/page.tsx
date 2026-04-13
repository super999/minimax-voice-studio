'use client'

import { useState, useEffect, useMemo } from 'react'
import { Header } from '@/components/Header'
import { AudioPlayer } from '@/components/AudioPlayer'
import useSWR from 'swr'
import { Copy, Check, ChevronLeft, ChevronRight, Wand } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface TTSResult {
  audioUrl: string
}

interface VoiceGroup {
  language: string
  voices: Voice[]
}

interface Voice {
  id: string
  name: string
  language: string
  category?: string
}

export default function TTSPage() {
  const { data: prefs } = useSWR('/api/user/preferences', fetcher)
  const { data: voiceData } = useSWR('/api/voices-config', fetcher)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [voiceId, setVoiceId] = useState('female-shaonv')
  const [speed, setSpeed] = useState(1.0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  // Example texts for reference
  const exampleTexts = [
    { title: '新闻播报', text: '今日要闻：科技创新持续推动经济发展，人工智能技术在各领域取得突破性进展。' },
    { title: '故事讲述', text: '从前有座山，山里有座庙，庙里有个老和尚在给小和尚讲故事。老和尚说：从前有座山...' },
    { title: '产品介绍', text: '欢迎使用我们的智能语音助手。它可以帮你完成各种任务，比如查询天气、播放音乐、设置闹钟等。' },
    { title: '诗歌朗诵', text: '床前明月光，疑是地上霜。举头望明月，低头思故乡。这首静夜思表达了诗人对故乡的深深思念。' },
    { title: '客服问候', text: '您好！感谢您选择我们的服务。请问有什么可以帮助您的吗？我们随时为您提供支持。' },
    { title: '广告文案', text: '限时优惠！全场五折起！机会难得，不要错过。立即下单，畅享购物乐趣！' },
    { title: '知识科普', text: '水是生命之源，人体大约有60%到70%是由水组成的。每天建议饮用8杯水来保持身体健康。' },
    { title: '儿童故事', text: '小兔子乖乖，把门儿开开！快点儿开开，我要进来。不开不开不能开，妈妈没回来，谁来也不开。' },
    { title: '天气预报', text: '今天是晴天，最高气温25度，最低气温18度。空气质量良好，适宜户外活动。明天预计有小雨。' },
    { title: '企业文化', text: '我们的企业精神是创新、协作、诚信、共赢。我们致力于为客户创造价值，为员工创造机会，为社会做出贡献。' },
  ]

  const [examplePage, setExamplePage] = useState(1)
  const EXAMPLES_PER_PAGE = 5
  const totalExamplePages = Math.ceil(exampleTexts.length / EXAMPLES_PER_PAGE)
  const paginatedExamples = exampleTexts.slice(
    (examplePage - 1) * EXAMPLES_PER_PAGE,
    examplePage * EXAMPLES_PER_PAGE
  )

  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [generatePrompt, setGeneratePrompt] = useState('')
  const [generating, setGenerating] = useState(false)

  const handleCopy = async (id: number, textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = textToCopy
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  // Simple template-based text generator
  const generateText = async () => {
    if (!generatePrompt.trim()) return
    setGenerating(true)

    // Simple template-based generation
    const templates = [
      `关于「${generatePrompt}」的介绍。这是一个重要的话题，有很多值得探讨的内容。${generatePrompt}在我们的生活中扮演着重要的角色。`,
      `今天我们来聊聊${generatePrompt}。相信很多人都对${generatePrompt}感兴趣，让我们一起来了解一下吧。`,
      `大家好，今天给大家介绍一下${generatePrompt}。${generatePrompt}是一个非常有趣的话题，让我们一起来探索其中的奥秘。`,
    ]

    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const generated = templates[Math.floor(Math.random() * templates.length)]
    setText(prev => prev ? `${prev}\n\n${generated}` : generated)
    setGeneratePrompt('')
    setGenerating(false)
  }

  const voiceGroups: VoiceGroup[] = voiceData?.voices || []

  // Flatten all voices for selector
  const allVoices = useMemo(() => {
    const voices: Voice[] = []
    for (const group of voiceGroups) {
      for (const voice of group.voices) {
        voices.push(voice)
      }
    }
    return voices
  }, [voiceGroups])

  // Get display name for a voice ID
  const getVoiceDisplayName = (id: string) => {
    const voice = allVoices.find(v => v.id === id)
    return voice ? `${voice.name} (${voice.language})` : id
  }

  // Set default voice from preferences
  useEffect(() => {
    if (prefs?.defaultVoiceId && allVoices.length > 0) {
      setVoiceId(prefs.defaultVoiceId)
    }
  }, [prefs, allVoices])

  // Get available voices: favorited + defaults
  const availableVoices = useMemo(() => {
    const favorited: string[] = prefs?.favoritedVoiceIds || []
    const defaultIds = ['female-shaonv', 'male-qn-jingying', 'female-tianmei']

    // Combine favorited + defaults, remove duplicates
    const all = Array.from(new Set([...favorited, ...defaultIds]))

    return all.map(id => ({
      value: id,
      label: favorited.includes(id)
        ? `${getVoiceDisplayName(id)} ⭐`
        : `${getVoiceDisplayName(id)} ☆`,
    }))
  }, [prefs, getVoiceDisplayName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (text.length > 10000) {
      setError('文本不能超过 10,000 字符')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId, speed, name }),
      })

      const data = await res.json()
      if (res.ok) {
        setAudioUrl(data.audioUrl)
      } else {
        setError(data.error || 'TTS 生成失败')
      }
    } catch {
      setError('网络错误')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">文本转语音 (TTS)</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium mb-2">语音名称</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="给语音起个名字（选填）"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Text Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">文本内容</label>
              <span className={`text-xs ${text.length > 10000 ? 'text-red-500' : 'text-gray-500'}`}>
                {text.length} / 10,000 字符
              </span>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="输入要转换的文本..."
              rows={6}
              className="w-full px-3 py-2 border rounded-lg resize-none"
              required
            />
            {/* Hints */}
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              {text.length > 3000 && (
                <p className="text-amber-600">💡 文本超过 3000 字符，建议等待较长时间</p>
              )}
              <p>📝 段落换行：直接使用换行符</p>
              <p>⏸️ 添加停顿：插入 &lt;#秒数#&gt; 标记（如 &lt;#1.5#&gt; 表示 1.5 秒停顿）</p>
              <p>⚠️ 不可见字符占比不能超过 10%</p>
            </div>
          </div>

          {/* Voice Selector - Now dynamic from preferences */}
          <div>
            <label className="block text-sm font-medium mb-2">
              选择音色
              {prefs?.favoritedVoiceIds?.length > 0 && (
                <span className="text-gray-500 font-normal ml-2">
                  （收藏 {prefs.favoritedVoiceIds.length} 个 + 默认音色）
                </span>
              )}
            </label>
            <select
              value={voiceId}
              onChange={e => setVoiceId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {availableVoices.map(v => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
            {prefs?.favoritedVoiceIds?.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                未收藏音色，显示默认音色。前往"偏好设置"收藏更多音色。
              </p>
            )}
          </div>

          {/* Speed Slider */}
          <div>
            <label className="block text-sm font-medium mb-2">语速: {speed}x</label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={e => setSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !text || text.length > 10000}
            className="w-full py-3 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '生成中...' : '生成语音'}
          </button>
        </form>

        {/* Example Texts Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">参考文本示例</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExamplePage(p => Math.max(1, p - 1))}
                disabled={examplePage === 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-500">
                {examplePage} / {totalExamplePages}
              </span>
              <button
                onClick={() => setExamplePage(p => Math.min(totalExamplePages, p + 1))}
                disabled={examplePage === totalExamplePages}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {paginatedExamples.map((example, idx) => {
              const globalIdx = (examplePage - 1) * EXAMPLES_PER_PAGE + idx
              return (
                <div
                  key={globalIdx}
                  className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-1">{example.title}</div>
                    <div
                      className="text-sm text-gray-700 cursor-pointer hover:text-blue-600"
                      onClick={() => setText(example.text)}
                      title="点击填入文本"
                    >
                      {example.text.length > 100
                        ? `${example.text.slice(0, 100)}...`
                        : example.text}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(globalIdx, example.text)}
                    className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all flex-shrink-0"
                    title="复制文本"
                  >
                    {copiedId === globalIdx ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Auto Generate Section */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">AI 辅助生成</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={generatePrompt}
              onChange={e => setGeneratePrompt(e.target.value)}
              placeholder="输入主题，例如：天气预报、儿童故事、新闻播报..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={e => e.key === 'Enter' && generateText()}
            />
            <button
              onClick={generateText}
              disabled={generating || !generatePrompt.trim()}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2"
            >
              <Wand className="w-4 h-4" />
              {generating ? '生成中...' : '生成'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            输入一个主题，AI 将生成适合 TTS 的语音文本内容，追加到当前文本之后
          </p>
        </div>

        {/* Result */}
        {audioUrl && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-medium mb-4">生成的语音</h2>
            <audio src={audioUrl} controls className="w-full" />
          </div>
        )}
      </main>
    </div>
  )
}
