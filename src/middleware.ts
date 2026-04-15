export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tts/:path*',
    '/clone/:path*',
    '/voices/:path*',
    '/settings/:path*',
    '/developer/:path*',
  ],
}
