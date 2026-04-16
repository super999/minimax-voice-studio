'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { AudioPlayer } from '@/components/AudioPlayer'
import useSWR from 'swr'
import { Star, Search, ChevronDown, ChevronUp, Play, Volume2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface Voice {
  id: string
  name: string
  language?: string
  category?: string
  description?: string[]
  created_time?: string
}

interface VoiceGroup {
  language: string
  voices: Voice[]
}

interface ClonedVoice {
  id: number
  voiceId: string
  name: string
  createdAt: string
}

interface VoiceExample {
  filename: string
  title: string
  description?: string
  text?: string
}

interface VoiceWithExamples {
  voice_id: string
  name: string
  language: string
  description?: string
  examples: VoiceExample[]
}

interface VoiceExamplesGroup {
  language: string
  voices: VoiceWithExamples[]
}

interface VoiceExamplesResponse {
  groups: VoiceExamplesGroup[]
  total: number
}

export default function SettingsPage() {
  const { data, mutate } = useSWR('/api/user/preferences', fetcher)
  const { data: clonedVoicesData, mutate: mutateCloned } = useSWR('/api/user/cloned-voices', fetcher)
  const { data: voiceData } = useSWR<{ voices: VoiceGroup[] }>('/api/voices-config', fetcher)
  const { data: voiceExamplesData } = useSWR<VoiceExamplesResponse>('/api/voice-examples', fetcher)
  
  const [activeLanguage, setActiveLanguage] = useState('Mandarin')
  const [activeTab, setActiveTab] = useState<'favorites' | 'cloned' | 'examples'>('favorites')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshingVoices, setRefreshingVoices] = useState(false)
  const [voiceSyncInfo, setVoiceSyncInfo] = useState<{officialCount?: number, error?: string} | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedVoiceIds, setExpandedVoiceIds] = useState<Set<string>>(new Set())
  const [activeExampleLanguage, setActiveExampleLanguage] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  const voiceGroups: VoiceGroup[] = voiceData?.voices || []

  // Get display name for a voice ID from the fetched data
  const getVoiceDisplayName = (id: string) => {
    for (const group of voiceGroups) {
      const voice = group.voices.find(v => v.id === id)
      if (voice) return `${voice.name || voice.id} (${voice.language || 'Unknown'})`
    }
    return id
  }

  const DEFAULT_VOICE_IDS = ['female-shaonv', 'male-qn-jingying', 'female-tianmei']

  const handleRefreshVoices = async () => {
    setRefreshingVoices(true)
    setVoiceSyncInfo(null)
    try {
      const res = await fetch('/api/admin/refresh-voices')
      const data = await res.json()
      if (res.ok) {
        setVoiceSyncInfo({ officialCount: data.officialCount })
      } else {
        setVoiceSyncInfo({ error: data.error || '刷新失败' })
      }
    } catch {
      setVoiceSyncInfo({ error: '网络错误' })
    } finally {
      setRefreshingVoices(false)
    }
  }

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

    // 服务器端会过滤无效音色

    setSaving(true)
    setError(null)
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favoritedVoiceIds: newFavorites }),
      })
      await mutate()
    } catch (err) {
      console.error('Toggle favorite error:', err)
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
    } catch (err) {
      console.error('Set default voice error:', err)
      setError('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClonedVoice = async (id: number) => {
    setDeletingId(id)
    try {
      await fetch(`/api/user/cloned-voices/${id}`, { method: 'DELETE' })
      await mutateCloned()
    } catch (err) {
      console.error('Delete cloned voice error:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const currentGroup = voiceGroups.find(g => g.language === activeLanguage)
  const currentVoices = currentGroup?.voices || []

  const exampleGroups: VoiceExamplesGroup[] = voiceExamplesData?.groups || []

  const toggleExpand = (voiceId: string) => {
    const newExpanded = new Set(expandedVoiceIds)
    if (newExpanded.has(voiceId)) {
      newExpanded.delete(voiceId)
    } else {
      newExpanded.add(voiceId)
    }
    setExpandedVoiceIds(newExpanded)
  }

  const isExpanded = (voiceId: string) => expandedVoiceIds.has(voiceId)

  const playExample = (voiceId: string, filename: string) => {
    const audioUrl = `/api/voice-examples/${encodeURIComponent(voiceId)}/${encodeURIComponent(filename)}`
    setPlayingAudio(audioUrl)
  }

  const filteredExampleGroups = exampleGroups.map(group => ({
    ...group,
    voices: group.voices.filter(voice => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return (
        voice.name.toLowerCase().includes(query) ||
        voice.voice_id.toLowerCase().includes(query)
      )
    })
  })).filter(group => group.voices.length > 0)

  const displayGroups = activeExampleLanguage
    ? filteredExampleGroups.filter(g => g.language === activeExampleLanguage)
    : filteredExampleGroups

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">音色偏好设置</h1>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'favorites'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            收藏音色
          </button>
          <button
            onClick={() => setActiveTab('cloned')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'cloned'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            克隆音色
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'examples'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            音色预览
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {activeTab === 'favorites' && (
          <>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">浏览所有音色</h2>
                <button
                  onClick={handleRefreshVoices}
                  disabled={refreshingVoices}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
                >
                  {refreshingVoices ? '刷新中...' : '🔄 同步官方音色'}
                </button>
              </div>

              {voiceSyncInfo && (
                <div className={`text-sm mb-4 px-3 py-2 rounded-lg ${
                  voiceSyncInfo.error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {voiceSyncInfo.error || `官方音色数量: ${voiceSyncInfo.officialCount}`}
                </div>
              )}

              {/* Language Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {voiceGroups.map(group => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentVoices.map(voice => (
                  <div
                    key={voice.id}
                    onClick={() => toggleFavorite(voice.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isFavorited(voice.id) ? 'border-yellow-500 bg-yellow-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Star
                        className={`w-5 h-5 ${
                          isFavorited(voice.id)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-400'
                        }`}
                      />
                      {defaultVoiceId === voice.id && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">默认</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{voice.name}</p>
                    <p className="text-xs font-mono text-gray-500 mb-1 break-all">{voice.id}</p>
                    {voice.description && voice.description.length > 0 && (
                      <p className="text-xs text-gray-600 mb-1 line-clamp-2">{voice.description.join('')}</p>
                    )}
                    {voice.created_time && voice.created_time !== '1970-01-01' && (
                      <p className="text-xs text-gray-400">创建: {voice.created_time}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'cloned' && (
          <div>
            <h2 className="text-lg font-medium mb-4">🎙️ 我的克隆音色</h2>

            {!clonedVoicesData?.clonedVoices?.length ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                暂无克隆音色，去「声音克隆」页面创建一个
              </div>
            ) : (
              <div className="space-y-3">
                {clonedVoicesData.clonedVoices.map((voice: ClonedVoice) => (
                  <div key={voice.id} className="flex items-center justify-between p-4 border rounded-lg bg-amber-50 border-amber-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🎙️</span>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{voice.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{voice.voiceId}</div>
                      </div>
                    </div>
                    <button
                      disabled={deletingId === voice.id}
                      onClick={() => handleDeleteClonedVoice(voice.id)}
                      className="text-xs px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50"
                    >
                      {deletingId === voice.id ? '删除中...' : '删除'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 text-center mt-4">
              克隆音色暂不支持修改名称
            </p>
          </div>
        )}

        {activeTab === 'examples' && (
          <div>
            <h2 className="text-lg font-medium mb-4">🎵 音色预览</h2>
            <p className="text-sm text-gray-500 mb-4">
              浏览并试听各种音色的样例音频，帮助您选择最适合的音色
            </p>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索音色名称或 voice_id..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Language Tabs */}
            {filteredExampleGroups.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setActiveExampleLanguage(null)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    activeExampleLanguage === null
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  全部 ({voiceExamplesData?.total || 0})
                </button>
                {filteredExampleGroups.map((group) => (
                  <button
                    key={group.language}
                    onClick={() => setActiveExampleLanguage(group.language)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      activeExampleLanguage === group.language
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {group.language} ({group.voices.length})
                  </button>
                ))}
              </div>
            )}

            {/* Voice Examples List */}
            {displayGroups.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                {searchQuery ? '没有找到匹配的音色' : '暂无音色预览数据'}
              </div>
            ) : (
              <div className="space-y-4">
                {displayGroups.map((group) => (
                  <div key={group.language}>
                    <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      {group.language} 音色
                    </h3>
                    <div className="space-y-2">
                      {group.voices.map((voice) => (
                        <div
                          key={voice.voice_id}
                          className="bg-white rounded-lg border overflow-hidden"
                        >
                          {/* Voice Header */}
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleExpand(voice.voice_id)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {voice.name}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                  {voice.examples.length} 个样例
                                </span>
                              </div>
                              <p className="text-xs font-mono text-gray-500 mt-1">
                                {voice.voice_id}
                              </p>
                              {voice.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                  {voice.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {isExpanded(voice.voice_id) ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Examples List (Expanded) */}
                          {isExpanded(voice.voice_id) && (
                            <div className="border-t bg-gray-50 p-4">
                              <div className="space-y-3">
                                {voice.examples.map((example, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900">
                                          {example.title}
                                        </span>
                                      </div>
                                      {example.description && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {example.description}
                                        </p>
                                      )}
                                      {example.text && (
                                        <p className="text-xs text-gray-600 mt-1 italic line-clamp-2">
                                          "{example.text}"
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        playExample(voice.voice_id, example.filename)
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
                                    >
                                      <Play className="w-4 h-4" />
                                      播放
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Audio Player */}
      {playingAudio && (
        <AudioPlayer
          src={playingAudio}
          onClose={() => setPlayingAudio(null)}
        />
      )}
    </div>
  )
}
