'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Header } from '@/components/Header'
import { Plus, Copy, Trash2 } from 'lucide-react'

interface ApiKey {
  id: number
  name: string
  key: string
  usageCount: number
  createdAt: string
  lastUsedAt: string | null
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

export default function DeveloperKeysPage() {
  const { data: keys, error, isLoading, mutate } = useSWR<ApiKey[]>('/api/developer/keys', fetcher)
  const [newKeyName, setNewKeyName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newKeyName.trim()) return

    setIsCreating(true)
    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create key')
      }

      const newKey = await res.json()
      setCreatedKey(newKey.key)
      setNewKeyName('')
      mutate()
    } catch (error) {
      console.error('Create key error:', error)
      alert(error instanceof Error ? error.message : 'Failed to create key')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (keyId: number) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return
    }

    try {
      const res = await fetch(`/api/developer/keys?id=${keyId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete key')
      }

      mutate()
    } catch (error) {
      console.error('Delete key error:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete key')
    }
  }

  const handleCopy = async (key: string, keyId: number) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopyFeedback(keyId)
      setTimeout(() => setCopyFeedback(null), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
      alert('Failed to copy to clipboard')
    }
  }

  const formatKey = (key: string) => {
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">API 密钥</h1>
          <p className="text-gray-600 mt-1">管理您的 API 密钥</p>
        </div>

        {/* Create New Key Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">创建新密钥</h2>
          <form onSubmit={handleCreate} className="flex gap-4">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="输入密钥名称"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
            />
            <button
              type="submit"
              disabled={isCreating || !newKeyName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={18} />
              {isCreating ? '创建中...' : '创建'}
            </button>
          </form>

          {createdKey && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-700 mb-2">密钥创建成功！请妥善保管，以下内容仅显示一次：</div>
              <div className="font-mono text-sm bg-white px-3 py-2 rounded border border-green-200 break-all">
                {createdKey}
              </div>
              <button
                onClick={() => setCreatedKey(null)}
                className="mt-2 text-sm text-green-600 hover:text-green-800"
              >
                关闭
              </button>
            </div>
          )}
        </div>

        {/* Keys List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">已有密钥</h2>
          </div>

          {isLoading && (
            <div className="p-6 text-center text-gray-500">加载中...</div>
          )}

          {error && (
            <div className="p-6 text-center text-red-500">加载失败，请重试</div>
          )}

          {!isLoading && !error && keys && keys.length === 0 && (
            <div className="p-6 text-center text-gray-500">暂无 API 密钥</div>
          )}

          {!isLoading && !error && keys && keys.length > 0 && (
            <div className="divide-y divide-gray-100">
              {keys.map((keyItem) => (
                <div key={keyItem.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{keyItem.name}</div>
                    <div className="text-sm text-gray-500 font-mono mt-1">
                      {formatKey(keyItem.key)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      使用次数: {keyItem.usageCount} | 创建于: {formatDate(keyItem.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(keyItem.key, keyItem.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="复制密钥"
                    >
                      {copyFeedback === keyItem.id ? (
                        <span className="text-green-600 text-sm">已复制</span>
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(keyItem.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除密钥"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
