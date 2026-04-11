'use client'

import { Play, Trash2 } from 'lucide-react'
import { VoiceAsset } from '@/types'

interface VoiceCardProps {
  voice: VoiceAsset
  onPlay: (audioUrl: string) => void
  onDelete: (voiceId: number) => void
}

export function VoiceCard({ voice, onPlay, onDelete }: VoiceCardProps) {
  const typeLabel: Record<VoiceAsset['type'], string> = {
    tts: 'TTS',
    clone: 'Clone',
    design: 'Design',
  }

  const handlePlay = () => {
    if (voice.audioUrl) {
      onPlay(voice.audioUrl)
    }
  }

  const handleDelete = () => {
    onDelete(voice.id)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{voice.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {typeLabel[voice.type]}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(voice.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={handlePlay}
            disabled={!voice.audioUrl}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Play"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
