'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, X } from 'lucide-react'

interface AudioPlayerProps {
  src: string
  onClose: () => void
}

export function AudioPlayer({ src, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const endedHandlerRef = useRef<() => void>()
  const errorHandlerRef = useRef<() => void>()
  const timeupdateHandlerRef = useRef<() => void>()

  useEffect(() => {
    audioRef.current = new Audio(src)

    endedHandlerRef.current = () => setIsPlaying(false)
    errorHandlerRef.current = () => setIsPlaying(false)
    timeupdateHandlerRef.current = () => {
      if (audioRef.current && audioRef.current.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
      }
    }

    audioRef.current.addEventListener('ended', endedHandlerRef.current)
    audioRef.current.addEventListener('error', errorHandlerRef.current)
    audioRef.current.addEventListener('timeupdate', timeupdateHandlerRef.current)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        if (endedHandlerRef.current) {
          audioRef.current.removeEventListener('ended', endedHandlerRef.current)
        }
        if (errorHandlerRef.current) {
          audioRef.current.removeEventListener('error', errorHandlerRef.current)
        }
        if (timeupdateHandlerRef.current) {
          audioRef.current.removeEventListener('timeupdate', timeupdateHandlerRef.current)
        }
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
          style={{ width: `${progress}%` }}
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
