'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import Link from 'next/link'

const tabs = [
  { id: 'usage', label: '使用指南' },
  { id: 'faq', label: '常见问题' },
]

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState('usage')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/docs" className="text-blue-600 hover:text-blue-700">
              文档中心
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">开发指南</span>
          </nav>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">开发指南</h1>
          <p className="text-gray-600 mt-1">详细了解 MiniMax Voice Studio 的使用方法</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {activeTab === 'usage' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">TTS 文本转语音</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">1. 进入 TTS 合成页面</h3>
                    <p className="text-gray-600">
                      在导航栏中点击 "TTS 合成"，或在仪表板的快速开始区域点击 "TTS 合成" 卡片。
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">2. 选择声音</h3>
                    <p className="text-gray-600">
                      在声音列表中选择您喜欢的声音。您可以点击每个声音卡片上的播放按钮预览声音效果。
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">3. 输入文本</h3>
                    <p className="text-gray-600">
                      在文本输入框中输入您想要转换的文本。支持中英文混合输入。
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">4. 调整参数（可选）</h3>
                    <p className="text-gray-600">
                      您可以根据需要调整语速、音量和音调等参数，以获得最佳效果。
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">5. 生成语音</h3>
                    <p className="text-gray-600">
                      点击 "生成语音" 按钮，系统将自动处理您的请求。生成完成后，您可以播放预览并下载音频文件。
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">声音克隆</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">1. 进入声音克隆页面</h3>
                    <p className="text-gray-600">
                      在导航栏中点击 "声音克隆"，或在仪表板的快速开始区域点击 "声音克隆" 卡片。
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">2. 上传音频样本</h3>
                    <p className="text-gray-600">
                      点击上传区域或拖拽音频文件到指定区域。支持常见的音频格式（如 MP3、WAV 等）。
                    </p>
                    <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>提示：</strong>为获得最佳克隆效果，建议上传 5-60 秒的清晰音频样本，避免背景噪音。
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">3. 填写声音信息</h3>
                    <p className="text-gray-600">
                      为您的克隆声音输入名称和描述，方便后续管理和使用。
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">4. 开始克隆</h3>
                    <p className="text-gray-600">
                      点击 "开始克隆" 按钮，系统将自动处理您的音频样本。克隆过程可能需要一些时间，请耐心等待。
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">5. 使用克隆声音</h3>
                    <p className="text-gray-600">
                      克隆完成后，您可以在 "我的声音" 页面查看和管理所有克隆的声音。这些声音可以直接用于 TTS 合成。
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">API 密钥管理</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">1. 获取 API 密钥</h3>
                    <p className="text-gray-600">
                      进入 "开发者中心" → "API 密钥管理"，您可以查看已有的 API 密钥或创建新的密钥。
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">2. 创建新密钥</h3>
                    <p className="text-gray-600">
                      点击 "创建新密钥" 按钮，系统将生成一个新的 API 密钥。请妥善保管此密钥，不要泄露给他人。
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">3. 撤销密钥</h3>
                    <p className="text-gray-600">
                      如果您的密钥丢失或需要停用，可以点击相应密钥的 "撤销" 按钮。撤销后该密钥将无法继续使用。
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Q: TTS 合成支持哪些语言？
                </h3>
                <p className="text-gray-600">
                  A: 目前我们的 TTS 合成主要支持中文（普通话）和英文。对于其他语言的支持正在开发中。
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Q: 声音克隆需要什么样的音频样本？
                </h3>
                <p className="text-gray-600">
                  A: 为了获得最佳的克隆效果，建议您提供以下条件的音频样本：
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                  <li>时长在 5-60 秒之间</li>
                  <li>音频清晰，无明显背景噪音</li>
                  <li>说话人声音稳定，语速适中</li>
                  <li>避免多人同时说话的情况</li>
                </ul>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Q: 声音克隆需要多长时间？
                </h3>
                <p className="text-gray-600">
                  A: 声音克隆的处理时间取决于您上传的音频样本长度，通常在 1-5 分钟之间。请耐心等待，克隆完成后您会在 "我的声音" 页面看到新添加的声音。
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Q: 如何提高 TTS 合成的质量？
                </h3>
                <p className="text-gray-600">
                  A: 您可以通过以下方式提高 TTS 合成的质量：
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                  <li>选择合适的声音模型</li>
                  <li>根据内容类型调整语速和音调</li>
                  <li>确保文本标点符号正确，这会影响语音的停顿和语调</li>
                  <li>对于专有名词，可以尝试使用拼音或音标标注</li>
                </ul>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Q: API 调用有什么限制？
                </h3>
                <p className="text-gray-600">
                  A: 为了保障服务的稳定性，我们对 API 调用有一定的频率限制。具体限制如下：
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                  <li>TTS 合成：每分钟最多 60 次调用</li>
                  <li>声音克隆：每小时最多 10 次调用</li>
                  <li>API 密钥管理：每分钟最多 10 次调用</li>
                </ul>
                <p className="text-gray-600 mt-2">
                  如果您需要更高的调用配额，请联系我们的客服团队。
                </p>
              </div>

              <div className="pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Q: 我的音频数据安全吗？
                </h3>
                <p className="text-gray-600">
                  A: 我们非常重视用户数据的安全和隐私。您上传的音频样本和生成的语音文件都会被加密存储，仅用于您的声音克隆和 TTS 合成服务。我们不会将您的音频数据用于任何其他目的，也不会向第三方披露。
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
