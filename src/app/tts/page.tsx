'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { AudioPlayer } from '@/components/AudioPlayer'

const VOICE_OPTIONS = [
  { value: 'female-shaonv', label: '少女' },
  { value: 'male-qn-qingse', label: '青涩' },
  { value: 'female-tianmei', label: '甜妹' },
]

interface TTSResult {
  id: number
  audioUrl: string
}

export default function TTSPage() {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [voiceId, setVoiceId] = useState('female-shaonv')
  const [speed, setSpeed] = useState(1.0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TTSResult | null>(null)

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

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate TTS')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate TTS')
    } finally {
      setLoading(false)
    }
  }

  const handleClosePlayer = () => {
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">TTS 合成</h1>
          <p className="text-gray-600 mt-1">将文本转换为语音</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              名称（可选）
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="给本次合成起个名字"
            />
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
              文本内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="请输入要转换的文本内容"
            />
          </div>

          <div>
            <label htmlFor="voiceId" className="block text-sm font-medium text-gray-700 mb-1">
              音色
            </label>
            <select
              id="voiceId"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {VOICE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="speed" className="block text-sm font-medium text-gray-700 mb-1">
              语速：{speed.toFixed(1)}
            </label>
            <input
              id="speed"
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5x</span>
              <span>2.0x</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '合成中...' : '开始合成'}
          </button>
        </form>

        {result && (
          <AudioPlayer src={result.audioUrl} onClose={handleClosePlayer} />
        )}
      </main>
    </div>
  )
}
