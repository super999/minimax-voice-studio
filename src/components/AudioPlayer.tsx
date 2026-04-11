'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, X } from 'lucide-react'

interface AudioPlayerProps {
  src: string
  onClose: () => void
}

export function AudioPlayer({ src, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio(src)
    audioRef.current.addEventListener('ended', () => setIsPlaying(false))
    audioRef.current.addEventListener('error', () => setIsPlaying(false))

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('ended', () => setIsPlaying(false))
        audioRef.current.removeEventListener('error', () => setIsPlaying(false))
      }
    }
  }, [src])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3 flex items-center gap-3 z-50">
      <button
        onClick={togglePlay}
        className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>
      <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-100"
          style={{ width: isPlaying ? '60%' : '0%' }}
        />
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded text-gray-500 hover:text-gray-700 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
