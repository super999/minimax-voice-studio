'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import useSWR from 'swr'
import { VOICE_GROUPS, DEFAULT_VOICE_IDS, getVoiceDisplayName } from '@/config/voices'
import { Star } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function SettingsPage() {
  const { data, mutate } = useSWR('/api/user/preferences', fetcher)
  const [activeLanguage, setActiveLanguage] = useState('Mandarin')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const favoritedIds: string[] = data?.favoritedVoiceIds || []
  const defaultVoiceId: string = data?.defaultVoiceId || 'female-shaonv'

  const isFavorited = (id: string) => favoritedIds.includes(id)

  const toggleFavorite = async (id: string) => {
    let newFavorites: string[]
    if (isFavorited(id)) {
      newFavorites = favoritedIds.filter(fid => fid !== id)
    } else {
      newFavorites = [...favoritedIds, id]
    }

    setSaving(true)
    setError(null)
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favoritedVoiceIds: newFavorites }),
      })
      await mutate()
    } catch {
      setError('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const setDefault = async (id: string) => {
    setSaving(true)
    setError(null)
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultVoiceId: id }),
      })
      await mutate()
    } catch {
      setError('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const currentGroup = VOICE_GROUPS.find(g => g.language === activeLanguage)
  const currentVoices = currentGroup?.voices || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">音色偏好设置</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Default Voice */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">默认音色</h2>
          <p className="text-sm text-gray-500 mb-4">
            选择默认音色后，TTS 合成将默认使用此音色
          </p>
          <select
            className="w-full px-3 py-2 border rounded-lg"
            value={defaultVoiceId}
            onChange={e => setDefault(e.target.value)}
            disabled={saving}
          >
            {favoritedIds.length > 0 ? (
              <>
                <option value="" disabled>选择收藏的音色</option>
                {favoritedIds.map(id => (
                  <option key={id} value={id}>
                    {getVoiceDisplayName(id)} ⭐
                  </option>
                ))}
              </>
            ) : (
              <>
                <option value="" disabled>先收藏一些音色</option>
                {DEFAULT_VOICE_IDS.map(id => (
                  <option key={id} value={id}>
                    {getVoiceDisplayName(id)} (默认)
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Favorited Voices */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">
            已收藏的音色 ({favoritedIds.length})
          </h2>
          {favoritedIds.length === 0 ? (
            <p className="text-gray-500">还没有收藏任何音色，下方浏览所有音色后点击 ⭐ 收藏</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {favoritedIds.map(id => (
                <div
                  key={id}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    defaultVoiceId === id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setDefault(id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {defaultVoiceId === id && (
                      <span className="text-xs text-primary">默认</span>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">
                    {getVoiceDisplayName(id)}
                  </p>
                  <button
                    className="text-xs text-red-500 mt-1"
                    onClick={e => {
                      e.stopPropagation()
                      toggleFavorite(id)
                    }}
                  >
                    取消收藏
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Voice Browser */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">浏览所有音色</h2>

          {/* Language Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {VOICE_GROUPS.map(group => (
              <button
                key={group.language}
                className={`px-3 py-1 rounded-lg text-sm ${
                  activeLanguage === group.language
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setActiveLanguage(group.language)}
              >
                {group.language} ({group.voices.length})
              </button>
            ))}
          </div>

          {/* Voice Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {currentVoices.map(voice => (
              <div
                key={voice.id}
                className={`p-3 border rounded-lg ${
                  isFavorited(voice.id) ? 'border-yellow-500 bg-yellow-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => toggleFavorite(voice.id)}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        isFavorited(voice.id)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                  {defaultVoiceId === voice.id && (
                    <span className="text-xs text-primary">默认</span>
                  )}
                </div>
                <p className="text-sm font-medium">{voice.name}</p>
                <p className="text-xs text-gray-500">{voice.category}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
