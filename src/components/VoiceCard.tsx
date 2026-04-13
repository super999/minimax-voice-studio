'use client'

import { Play, Trash2, Download } from 'lucide-react'
import { VoiceAsset } from '@/types'
import { getVoiceDisplayName } from '@/config/voices'

interface VoiceCardProps {
  voice: VoiceAsset
  onPlay: (audioUrl: string) => void
  onDelete: (voiceId: number) => void
}

export function VoiceCard({ voice, onPlay, onDelete }: VoiceCardProps) {
  const typeColors: Record<VoiceAsset['type'], string> = {
    tts: 'bg-blue-100 text-blue-800',
    clone: 'bg-amber-100 text-amber-800',
    design: 'bg-purple-100 text-purple-800',
  }

  const typeLabels: Record<VoiceAsset['type'], string> = {
    tts: 'TTS',
    clone: '克隆',
    design: '设计',
  }

  const handlePlay = () => {
    if (voice.audioUrl) onPlay(voice.audioUrl)
  }

  const handleDownload = () => {
    if (!voice.audioUrl) return
    const a = document.createElement('a')
    a.href = voice.audioUrl
    a.download = `${voice.name}.mp3`
    a.click()
  }

  const handleDelete = () => {
    onDelete(voice.id)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 获取文本预览
  const metadata = voice.metadata as Record<string, unknown> | null
  const textContent = metadata?.text as string | null
  const textPreview = textContent ? textContent.slice(0, 50) : null

  // 获取音色显示名
  const voiceName = voice.voiceId ? getVoiceDisplayName(voice.voiceId) : null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{voice.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeColors[voice.type]}`}>
              {typeLabels[voice.type]}
            </span>
            {voiceName && (
              <span className="text-xs text-gray-500 truncate max-w-[120px]" title={voiceName}>
                🎵 {voiceName}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={handlePlay}
            disabled={!voice.audioUrl}
            className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="播放"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            disabled={!voice.audioUrl}
            className="p-2 rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="下载"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Text Preview */}
      {textPreview && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg text-xs text-gray-600 line-clamp-2">
          💬 {textPreview}{textPreview.length === 50 ? '...' : ''}
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-400">
        {formatDate(voice.createdAt)}
      </div>
    </div>
  )
}
