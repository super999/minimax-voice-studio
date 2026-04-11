'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { VoiceCard } from '@/components/VoiceCard'
import { AudioPlayer } from '@/components/AudioPlayer'

interface VoiceAsset {
  id: number
  userId: number
  name: string
  type: 'tts' | 'clone' | 'design'
  voiceId: string | null
  audioUrl: string | null
  sourceAudioUrl: string | null
  metadata: Json | null
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error('Failed to fetch voices')
  }
  return res.json()
})

export default function VoicesPage() {
  const { data: voices, error, isLoading, mutate } = useSWR<VoiceAsset[]>('/api/voices', fetcher)
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)

  const handlePlay = (audioUrl: string) => {
    setPlayingUrl(audioUrl)
  }

  const handleClosePlayer = () => {
    setPlayingUrl(null)
  }

  const handleDelete = async (voiceId: number) => {
    if (!confirm('Are you sure you want to delete this voice?')) {
      return
    }

    try {
      const res = await fetch(`/api/voices?id=${voiceId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete voice')
      }

      mutate()
    } catch (error) {
      console.error('Delete voice error:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete voice')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Voice Assets</h1>
          <p className="text-gray-600 mt-1">Manage your voice assets</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Failed to load voices. Please try again.
          </div>
        )}

        {!isLoading && !error && voices && voices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无声音资产</p>
          </div>
        )}

        {!isLoading && !error && voices && voices.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {voices.map((voice) => (
              <VoiceCard
                key={voice.id}
                voice={voice}
                onPlay={handlePlay}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {playingUrl && (
          <AudioPlayer src={playingUrl} onClose={handleClosePlayer} />
        )}
      </div>
    </div>
  )
}
