'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/dashboard', label: '仪表板' },
  { href: '/tts', label: 'TTS 合成' },
  { href: '/clone', label: '声音克隆' },
  { href: '/voices', label: '我的声音' },
  { href: '/settings', label: '偏好设置' },
  { href: '/developer', label: '开发者中心' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            MiniMax Voice
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
