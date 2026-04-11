'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { AudioPlayer } from '@/components/AudioPlayer'
import useSWR from 'swr'
import { DEFAULT_VOICES, getVoiceDisplayName } from '@/config/voices'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface TTSResult {
  id: number
  audioUrl: string
}

export default function TTSPage() {
  const { data: prefs } = useSWR('/api/user/preferences', fetcher)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [voiceId, setVoiceId] = useState('female-shaonv')
  const [speed, setSpeed] = useState(1.0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TTSResult | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  // Set default voice from preferences
  useEffect(() => {
    if (prefs?.defaultVoiceId) {
      setVoiceId(prefs.defaultVoiceId)
    }
  }, [prefs])

  // Get available voices: favorited + default
  const availableVoices = (() => {
    const favorited: string[] = prefs?.favoritedVoiceIds || []
    const defaultIds = DEFAULT_VOICES.map(v => v.id)

    // Combine favorited + defaults, remove duplicates
    const all = [...new Set([...favorited, ...defaultIds])]

    return all.map(id => ({
      value: id,
      label: favorited.includes(id)
        ? `${getVoiceDisplayName(id)} ⭐`
        : `${getVoiceDisplayName(id)} ☆`,
    }))
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId, speed, name }),
      })

      const data = await res.json()
      if (res.ok) {
        setResult(data)
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
      <main className="container mx-auto px-4 py-8 max-w-2xl">
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
            <label className="block text-sm font-medium mb-2">文本内容</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="输入要转换的文本..."
              rows={6}
              className="w-full px-3 py-2 border rounded-lg resize-none"
              required
            />
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
            disabled={loading || !text}
            className="w-full py-3 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '生成中...' : '生成语音'}
          </button>
        </form>

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
