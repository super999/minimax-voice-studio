import Link from 'next/link'
import { Header } from '@/components/Header'

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">开发者中心</h1>
          <p className="text-gray-600 mt-1">管理您的开发者资源和 API 访问</p>
        </div>

        {/* Developer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/developer/keys"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="font-medium text-gray-900 text-lg mb-2">API 密钥管理</div>
            <div className="text-sm text-gray-500">创建、管理和撤销 API 密钥</div>
          </Link>
        </div>
      </main>
    </div>
  )
}
