'use client'

import { signOut } from 'next-auth/react'

export function LogoutButton() {
  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
    >
      登出
    </button>
  )
}
