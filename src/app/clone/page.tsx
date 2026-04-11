'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'

interface CloneResult {
  id: number
  voiceId: string
}

export default function ClonePage() {
  const [name, setName] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, audioUrl }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to clone voice')
      }

      setSuccess(true)
      setName('')
      setAudioUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clone voice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">声音克隆</h1>
          <p className="text-gray-600 mt-1">通过音频样本克隆声音</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              名称 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="给克隆的声音起个名字"
            />
          </div>

          <div>
            <label htmlFor="audioUrl" className="block text-sm font-medium text-gray-700 mb-1">
              音频 URL <span className="text-red-500">*</span>
            </label>
            <input
              id="audioUrl"
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/audio.wav"
            />
            <p className="text-xs text-gray-500 mt-1">
              请提供音频样本的 HTTPS URL，支持 WAV、MP3 等格式
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              声音克隆成功！您可以在「我的声音」页面查看和管理克隆的声音。
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim() || !audioUrl.trim()}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '克隆中...' : '开始克隆'}
          </button>
        </form>
      </main>
    </div>
  )
}
