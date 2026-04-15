import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">MiniMax Voice</div>
          <div className="flex items-center gap-6">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">
                  {session?.user?.name || session?.user?.email}
                </span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  仪表板
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI 语音合成与克隆平台
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            探索最前沿的语音技术，轻松实现文本转语音、声音克隆等功能
          </p>
          <div className="flex justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                仪表板
              </Link>
            ) : (
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                立即开始
              </Link>
            )}
            <Link
              href="/tts"
              className="px-8 py-4 bg-white text-blue-600 text-lg font-medium rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              体验 TTS
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
