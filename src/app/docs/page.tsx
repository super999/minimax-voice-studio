import Link from 'next/link'
import { Header } from '@/components/Header'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">文档中心</h1>
          <p className="text-gray-600 mt-1">了解 MiniMax Voice Studio 的使用方法和最佳实践</p>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/docs/guide"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="font-medium text-gray-900 text-lg mb-2">开发指南</div>
            <div className="text-sm text-gray-500">查看使用指南、常见问题和最佳实践</div>
          </Link>
        </div>
      </main>
    </div>
  )
}
