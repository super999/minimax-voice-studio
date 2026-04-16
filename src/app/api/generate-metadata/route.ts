import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateMetadata } from '@/lib/minimax'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, voiceId, systemPromptTemplate, userPromptTemplate, model } = await request.json()

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    if (!voiceId || typeof voiceId !== 'string' || voiceId.trim() === '') {
      return NextResponse.json({ error: 'Voice ID is required' }, { status: 400 })
    }

    const metadata = await generateMetadata({
      text: text.trim(),
      voiceId: voiceId.trim(),
      systemPromptTemplate: systemPromptTemplate?.trim() || undefined,
      userPromptTemplate: userPromptTemplate?.trim() || undefined,
      model: model || 'MiniMax-M2.7',
    })

    return NextResponse.json(metadata)
  } catch (error) {
    console.error('Generate metadata error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
