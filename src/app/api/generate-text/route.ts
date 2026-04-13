import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateText } from '@/lib/minimax'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, model } = await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const generatedText = await generateText(prompt.trim(), model)

    return NextResponse.json({ text: generatedText })
  } catch (error) {
    console.error('Generate text error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
