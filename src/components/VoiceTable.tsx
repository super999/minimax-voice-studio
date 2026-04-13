'use client'

import { Play, Download, Trash2 } from 'lucide-react'
import { VoiceAsset } from '@/types'
import { getVoiceDisplayName } from '@/config/voices'
import { formatDuration, formatDate } from '@/utils/format'

interface VoiceTableProps {
  voices: VoiceAsset[]
  currentPage: number
  pageSize: number
  onPlay: (audioUrl: string) => void
  onDelete: (voiceId: number) => void
}

export function VoiceTable({ voices, currentPage, pageSize, onPlay, onDelete }: VoiceTableProps) {
  const handleDownload = (voice: VoiceAsset) => {
    if (!voice.audioUrl) return
    const a = document.createElement('a')
    a.href = voice.audioUrl
    a.download = `${voice.name}.mp3`
    a.click()
  }

  const typeLabels: Record<VoiceAsset['type'], string> = {
    tts: 'TTS',
    clone: '克隆',
    design: '设计',
  }

  const typeColors: Record<VoiceAsset['type'], string> = {
    tts: 'bg-blue-100 text-blue-800',
    clone: 'bg-amber-100 text-amber-800',
    design: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-3 py-3 text-left font-medium text-gray-600 w-12">#</th>
            <th className="px-3 py-3 text-left font-medium text-gray-600">语音文字</th>
            <th className="px-3 py-3 text-left font-medium text-gray-600">使用语音</th>
            <th className="px-3 py-3 text-left font-medium text-gray-600 w-20">时长</th>
            <th className="px-3 py-3 text-left font-medium text-gray-600">模型 ID</th>
            <th className="px-3 py-3 text-left font-medium text-gray-600">创建时间</th>
            <th className="px-3 py-3 text-center font-medium text-gray-600 w-28">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {voices.map((voice, index) => {
            const metadata = voice.metadata as Record<string, unknown> | null
            const textContent = metadata?.text as string | null
            const duration = metadata?.duration as number | null
            const globalIndex = (currentPage - 1) * pageSize + index + 1

            return (
              <tr key={voice.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 text-gray-500">{globalIndex}</td>
                <td className="px-3 py-3 max-w-xs">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${typeColors[voice.type]}`}>
                      {typeLabels[voice.type]}
                    </span>
                    <span className="truncate text-gray-900" title={textContent || '-'}>
                      {textContent ? (textContent.length > 50 ? `${textContent.slice(0, 50)}...` : textContent) : '-'}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-gray-700">
                  {voice.voiceId ? getVoiceDisplayName(voice.voiceId) : '-'}
                </td>
                <td className="px-3 py-3 text-gray-600 font-mono">
                  {duration ? formatDuration(duration) : '-'}
                </td>
                <td className="px-3 py-3 text-gray-500 text-xs">
                  {voice.voiceId ? (
                    <span title={voice.voiceId}>
                      {getVoiceDisplayName(voice.voiceId)}
                      <span className="text-gray-400 ml-1">({voice.voiceId})</span>
                    </span>
                  ) : '-'}
                </td>
                <td className="px-3 py-3 text-gray-500">
                  {formatDate(voice.createdAt)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => voice.audioUrl && onPlay(voice.audioUrl)}
                      disabled={!voice.audioUrl}
                      className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="播放"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(voice)}
                      disabled={!voice.audioUrl}
                      className="p-1.5 rounded hover:bg-green-50 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="下载"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(voice.id)}
                      className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
