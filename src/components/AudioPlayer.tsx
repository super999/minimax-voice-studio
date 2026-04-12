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
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const endedHandlerRef = useRef<() => void>()
  const errorHandlerRef = useRef<() => void>()
  const timeupdateHandlerRef = useRef<() => void>()
  const loadedmetadataHandlerRef = useRef<() => void>()

  useEffect(() => {
    audioRef.current = new Audio(src)

    endedHandlerRef.current = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }
    errorHandlerRef.current = () => setIsPlaying(false)
    timeupdateHandlerRef.current = () => {
      if (audioRef.current && audioRef.current.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
        setCurrentTime(audioRef.current.currentTime)
      }
    }
    loadedmetadataHandlerRef.current = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration)
      }
    }

    audioRef.current.addEventListener('ended', endedHandlerRef.current)
    audioRef.current.addEventListener('error', errorHandlerRef.current)
    audioRef.current.addEventListener('timeupdate', timeupdateHandlerRef.current)
    audioRef.current.addEventListener('loadedmetadata', loadedmetadataHandlerRef.current)

    // Auto-play on mount
    audioRef.current.play().then(() => {
      setIsPlaying(true)
    }).catch(() => {
      setIsPlaying(false)
    })

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        if (endedHandlerRef.current) audioRef.current.removeEventListener('ended', endedHandlerRef.current)
        if (errorHandlerRef.current) audioRef.current.removeEventListener('error', errorHandlerRef.current)
        if (timeupdateHandlerRef.current) audioRef.current.removeEventListener('timeupdate', timeupdateHandlerRef.current)
        if (loadedmetadataHandlerRef.current) audioRef.current.removeEventListener('loadedmetadata', loadedmetadataHandlerRef.current)
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 cursor-pointer"
        onClick={(e) => {
          if (!audioRef.current || !duration) return
          const rect = e.currentTarget.getBoundingClientRect()
          const percent = (e.clientX - rect.left) / rect.width
          audioRef.current.currentTime = percent * duration
        }}
      >
        <div
          className="h-full bg-blue-600 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Play/Pause */}
        <button
          onClick={togglePlay}
          className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        {/* Center: Time */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 font-mono">{formatTime(currentTime)}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 font-mono">{formatTime(duration)}</span>
        </div>

        {/* Right: Close */}
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
