import { promises as fs from 'fs'
import path from 'path'

const LOG_FILE = path.join(process.cwd(), 'logs', 'api.log')

async function ensureLogDir() {
  try {
    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true })
  } catch {}
}

export async function logToFile(message: string): Promise<void> {
  try {
    await ensureLogDir()
    const timestamp = new Date().toISOString()
    await fs.appendFile(LOG_FILE, `[${timestamp}] ${message}\n`)
  } catch {}
}

export async function logError(context: string, error: unknown): Promise<void> {
  const message = error instanceof Error
    ? `[ERROR] ${context}: ${error.message}\n${error.stack}`
    : `[ERROR] ${context}: ${String(error)}`
  await logToFile(message)
}
