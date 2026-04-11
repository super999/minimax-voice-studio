'use client'

import { useState, useRef } from 'react'
import { Header } from '@/components/Header'

interface CloneResult {
  id: number
  voiceId: string
  name: string
}

export default function ClonePage() {
  const [name, setName] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [promptAudioFile, setPromptAudioFile] = useState<File | null>(null)
  const [promptText, setPromptText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<CloneResult | null>(null)

  const audioInputRef = useRef<HTMLInputElement>(null)
  const promptInputRef = useRef<HTMLInputElement>(null)

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setAudioFile(file)
    if (file) setAudioUrl('')
  }

  const handlePromptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setPromptAudioFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!audioFile && !audioUrl.trim()) {
      setError('请选择音频文件或输入音频 URL')
      setLoading(false)
      return
    }

    if (promptAudioFile && !promptText.trim()) {
      setError('请填写示例音频对应的文本')
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', name.trim())

      if (audioFile) {
        formData.append('audioFile', audioFile)
      } else {
        formData.append('audioUrl', audioUrl.trim())
      }

      if (promptAudioFile) {
        formData.append('promptAudioFile', promptAudioFile)
      }
      if (promptText.trim()) {
        formData.append('promptText', promptText.trim())
      }

      const res = await fetch('/api/clone', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to clone voice')
      }

      setSuccess(data)
      setName('')
      setAudioFile(null)
      setAudioUrl('')
      setPromptAudioFile(null)
      setPromptText('')
      if (audioInputRef.current) audioInputRef.current.value = ''
      if (promptInputRef.current) promptInputRef.current.value = ''
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

          {/* Name */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="给克隆的声音起个名字"
            />
          </div>

          {/* Clone Audio — File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              复刻音频（主体）<span className="text-red-500">*</span>
            </label>

            {!audioFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                onClick={() => audioInputRef.current?.click()}
              >
                <div className="text-3xl mb-2">🎵</div>
                <div className="text-sm text-gray-600">
                  拖拽音频文件到这里，或 <span className="text-blue-600 font-medium">点击选择文件</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">支持 mp3/m4a/wav，时长 10秒～5分钟，最大 20MB</div>
              </div>
            ) : (
              <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎵</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{audioFile.name}</div>
                    <div className="text-xs text-gray-500">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-sm text-red-500 hover:text-red-700"
                  onClick={() => setAudioFile(null)}
                >
                  移除
                </button>
              </div>
            )}
            <input
              ref={audioInputRef}
              type="file"
              accept=".mp3,.m4a,.wav,audio/mpeg,audio/mp4,audio/wav"
              className="hidden"
              onChange={handleAudioFileChange}
            />
          </div>

          {/* URL Fallback */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400">或</span>
            </div>
          </div>

          <div>
            <label htmlFor="audioUrl" className="block text-sm font-medium text-gray-700 mb-1">
              音频 URL（备选）
            </label>
            <input
              id="audioUrl"
              type="url"
              value={audioUrl}
              onChange={(e) => {
                setAudioUrl(e.target.value)
                if (e.target.value) setAudioFile(null)
              }}
              disabled={!!audioFile}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="https://example.com/audio.wav"
            />
            <p className="text-xs text-gray-500 mt-1">支持 HTTPS URL，需可公开访问</p>
          </div>

          {/* Optional: Prompt Audio */}
          <div className="border-t border-gray-100 pt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              示例音频（辅助克隆）
              <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">可选</span>
            </label>

            {!promptAudioFile ? (
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors bg-gray-50/50"
                onClick={() => promptInputRef.current?.click()}
              >
                <div className="text-2xl mb-1">🎤</div>
                <div className="text-sm text-gray-500">
                  点击选择示例音频（可选）
                </div>
                <div className="text-xs text-gray-400 mt-1">支持 mp3/m4a/wav，&lt;8秒，最大 20MB</div>
              </div>
            ) : (
              <div className="border-2 border-green-200 bg-green-50 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎤</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{promptAudioFile.name}</div>
                    <div className="text-xs text-gray-500">{(promptAudioFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-sm text-red-500 hover:text-red-700"
                  onClick={() => setPromptAudioFile(null)}
                >
                  移除
                </button>
              </div>
            )}
            <input
              ref={promptInputRef}
              type="file"
              accept=".mp3,.m4a,.wav,audio/mpeg,audio/mp4,audio/wav"
              className="hidden"
              onChange={handlePromptFileChange}
            />
          </div>

          {/* Prompt Text */}
          {promptAudioFile && (
            <div>
              <label htmlFor="promptText" className="block text-sm font-medium text-gray-700 mb-1">
                示例音频文本
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">可选</span>
              </label>
              <input
                id="promptText"
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入示例音频对应的文本内容"
              />
              <p className="text-xs text-gray-500 mt-1">填写示例音频对应的文字，帮助模型更精准克隆</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              <div className="font-medium">✅ 克隆成功！</div>
              <div className="font-mono text-sm mt-1">voiceId: {success.voiceId}</div>
              <div className="text-sm mt-1">可在「偏好设置」→「克隆音色」中查看和管理</div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || (!audioFile && !audioUrl.trim())}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '克隆中...' : '开始克隆'}
          </button>

        </form>
      </main>
    </div>
  )
}
