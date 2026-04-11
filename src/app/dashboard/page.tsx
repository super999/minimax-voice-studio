'use client'

import Link from 'next/link'
import { Header } from '@/components/Header'
import useSWR from 'swr'
import { VoiceAsset } from '@/types'

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

export default function DashboardPage() {
  const { data: voices } = useSWR<VoiceAsset[]>('/api/voices', fetcher)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
          <p className="text-gray-600 mt-1">欢迎使用 MiniMax Voice Studio</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-500 mb-1">我的声音</div>
            <div className="text-3xl font-bold text-gray-900">{voices?.length ?? 0}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-500 mb-1">API 调用次数</div>
            <div className="text-3xl font-bold text-gray-900">--</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-500 mb-1">账户状态</div>
            <div className="text-3xl font-bold text-green-600">活跃</div>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">快速开始</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/tts"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl font-bold">
                T
              </div>
              <div className="ml-4">
                <div className="font-medium text-gray-900">TTS 合成</div>
                <div className="text-sm text-gray-500">将文本转换为语音</div>
              </div>
            </Link>

            <Link
              href="/clone"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xl font-bold">
                C
              </div>
              <div className="ml-4">
                <div className="font-medium text-gray-900">声音克隆</div>
                <div className="text-sm text-gray-500">克隆您的声音</div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
