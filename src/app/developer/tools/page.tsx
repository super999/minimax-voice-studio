'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Wand2, RotateCcw, Copy, Check } from 'lucide-react'

const DEFAULT_SYSTEM_PROMPT = `你是一个专业的元数据生成助手。请根据用户提供的语音文本内容和语音ID，生成适合的元数据信息。
你需要返回一个严格的 JSON 格式对象，包含以下三个字段：
1. filename: 英文文件名，使用下划线分隔，以 .mp3 结尾，例如 "funny_joke.mp3"
2. title: 中文标题，简洁明了，概括内容主题
3. description: 中文描述，说明这段语音适合什么场景或内容类型

重要规则：
- 只返回 JSON 对象，不要有任何其他文字说明
- filename 必须是英文，使用下划线分隔
- title 和 description 必须是中文
- 确保 JSON 格式正确，使用双引号`

const DEFAULT_USER_PROMPT = `请根据以下信息生成元数据：
语音文本内容：
{text}

语音ID：{voiceId}`

interface GeneratedMetadata {
  filename: string
  title: string
  description: string
}

export default function DeveloperToolsPage() {
  const [text, setText] = useState('')
  const [voiceId, setVoiceId] = useState('')
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [userPrompt, setUserPrompt] = useState(DEFAULT_USER_PROMPT)
  const [selectedModel, setSelectedModel] = useState('MiniMax-M2.7')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GeneratedMetadata | null>(null)
  const [copied, setCopied] = useState(false)
  const [showPromptEditor, setShowPromptEditor] = useState(false)

  const handleGenerate = async () => {
    if (!text.trim() || !voiceId.trim()) return

    setGenerating(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voiceId: voiceId,
          systemPromptTemplate: systemPrompt !== DEFAULT_SYSTEM_PROMPT ? systemPrompt : undefined,
          userPromptTemplate: userPrompt !== DEFAULT_USER_PROMPT ? userPrompt : undefined,
          model: selectedModel,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setResult(data)
      } else {
        setError(data.error || '生成失败')
      }
    } catch {
      setError('网络错误')
    }
    setGenerating(false)
  }

  const handleResetPrompts = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT)
    setUserPrompt(DEFAULT_USER_PROMPT)
  }

  const handleCopyResult = async () => {
    if (!result) return
    try {
      const jsonStr = JSON.stringify(result, null, 2)
      await navigator.clipboard.writeText(jsonStr)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = JSON.stringify(result, null, 2)
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isPromptModified = systemPrompt !== DEFAULT_SYSTEM_PROMPT || userPrompt !== DEFAULT_USER_PROMPT

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">开发工具调试</h1>
          <p className="text-gray-600 mt-1">AI 元数据生成工具 - 根据语音文本和 Voice ID 生成 filename、title 和 description</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">输入参数</h2>
          
          <div className="space-y-4">
            {/* Voice ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice ID
              </label>
              <input
                type="text"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                placeholder="例如：cute_boy、Robot_Armor、Chinese (Mandarin)_Humorous_Elder"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Text Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  语音文本内容
                </label>
                <span className={`text-xs ${text.length > 10000 ? 'text-red-500' : 'text-gray-500'}`}>
                  {text.length} / 10,000 字符
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="输入语音脚本文本内容..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择模型
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MiniMax-M2.7">MiniMax-M2.7</option>
                <option value="MiniMax-M2.5">MiniMax-M2.5</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prompt Templates Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">提示词模板</h2>
              {isPromptModified && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                  已修改
                </span>
              )}
            </div>
            <button
              onClick={() => setShowPromptEditor(!showPromptEditor)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showPromptEditor ? '收起' : '展开编辑'}
            </button>
          </div>

          {showPromptEditor && (
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">可自定义提示词模板，发送给 AI 大模型时会使用您修改后的版本</span>
                <button
                  onClick={handleResetPrompts}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <RotateCcw size={14} />
                  恢复默认
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  系统提示词 (System Prompt)
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户提示词模板 (User Prompt Template)
                  <span className="text-xs text-gray-500 ml-2">
                    可用变量: {'{text}'} = 语音文本, {'{voiceId}'} = Voice ID
                  </span>
                </label>
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <div className="mb-6">
          <button
            onClick={handleGenerate}
            disabled={generating || !text.trim() || !voiceId.trim()}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Wand2 size={18} />
            {generating ? '生成中...' : '生成元数据'}
          </button>
        </div>

        {/* Result Section */}
        {result && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">生成结果</h2>
              <button
                onClick={handleCopyResult}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-green-600" />
                    <span className="text-green-600">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>复制 JSON</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600 font-medium mb-1">filename</div>
                <div className="font-mono text-sm text-gray-900">{result.filename}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-xs text-green-600 font-medium mb-1">title</div>
                <div className="text-sm text-gray-900">{result.title}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-xs text-purple-600 font-medium mb-1">description</div>
                <div className="text-sm text-gray-900">{result.description}</div>
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg">
              <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                💡 提示：确认生成结果正确后，您可以手动将此 JSON 填入 <code className="bg-yellow-100 px-1 rounded">voice-examples.json</code> 文件中对应的 voice 示例数组。
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
