'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { VoiceCard } from '@/components/VoiceCard'
import { AudioPlayer } from '@/components/AudioPlayer'
import { VoiceAsset } from '@/types'
import { Header } from '@/components/Header'
import { Search, Filter } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch voices')
  return res.json()
})

type VoiceType = 'all' | VoiceAsset['type']

export default function VoicesPage() {
  const { data: voices, error, isLoading, mutate } = useSWR<VoiceAsset[]>('/api/voices', fetcher)
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<VoiceType>('all')

  const handlePlay = (audioUrl: string) => {
    setPlayingUrl(audioUrl)
  }

  const handleClosePlayer = () => {
    setPlayingUrl(null)
  }

  const handleDelete = async (voiceId: number) => {
    if (!confirm('确定要删除这个声音吗？')) return
    try {
      const res = await fetch(`/api/voices?id=${voiceId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }
      mutate()
    } catch (error) {
      console.error('Delete error:', error)
      alert(error instanceof Error ? error.message : '删除失败')
    }
  }

  // 筛选逻辑
  const filteredVoices = useMemo(() => {
    if (!voices) return []
    return voices.filter(voice => {
      const matchesSearch = searchQuery === '' ||
        voice.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === 'all' || voice.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [voices, searchQuery, typeFilter])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">我的声音</h1>
          <p className="text-gray-600 mt-1">管理你的所有声音资产</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索声音名称..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as VoiceType)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[120px]"
            >
              <option value="all">全部类型</option>
              <option value="tts">TTS</option>
              <option value="clone">克隆</option>
              <option value="design">设计</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        {voices && (
          <div className="text-sm text-gray-500 mb-4">
            共 {filteredVoices.length} 个声音
            {filteredVoices.length !== voices.length && `（筛选自 ${voices.length} 个）`}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">加载中...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            加载失败，请刷新页面重试
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filteredVoices.length === 0 && (
          <div className="text-center py-12">
            {voices && voices.length > 0 ? (
              <p className="text-gray-500">没有匹配的声音，试试其他搜索词</p>
            ) : (
              <p className="text-gray-500">暂无声音资产，去 TTS 页面创建一个吧</p>
            )}
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && filteredVoices.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVoices.map((voice) => (
              <VoiceCard
                key={voice.id}
                voice={voice}
                onPlay={handlePlay}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Audio Player */}
        {playingUrl && (
          <AudioPlayer src={playingUrl} onClose={handleClosePlayer} />
        )}
      </div>
    </div>
  )
}
