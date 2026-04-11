import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/preferences
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 })
    }

    let preference = await prisma.userPreference.findUnique({
      where: { userId },
    })

    // Create default preference if not exists
    if (!preference) {
      preference = await prisma.userPreference.create({
        data: {
          userId,
          favoritedVoiceIds: '',
          defaultVoiceId: 'female-shaonv',
        },
      })
    }

    return NextResponse.json({
      favoritedVoiceIds: preference.favoritedVoiceIds
        ? JSON.parse(preference.favoritedVoiceIds)
        : [],
      defaultVoiceId: preference.defaultVoiceId,
    })
  } catch (error) {
    console.error('Get preferences error:', error)
    return NextResponse.json({ error: 'Failed to get preferences' }, { status: 500 })
  }
}

// PUT /api/user/preferences
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 })
    }

    const body = await req.json()
    const { favoritedVoiceIds, defaultVoiceId } = body

    const data: any = {}
    if (favoritedVoiceIds !== undefined) {
      data.favoritedVoiceIds = JSON.stringify(favoritedVoiceIds)
    }
    if (defaultVoiceId !== undefined) {
      data.defaultVoiceId = defaultVoiceId
    }

    const preference = await prisma.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        favoritedVoiceIds: data.favoritedVoiceIds || '[]',
        defaultVoiceId: data.defaultVoiceId || 'female-shaonv',
      },
      update: data,
    })

    return NextResponse.json({
      favoritedVoiceIds: preference.favoritedVoiceIds
        ? JSON.parse(preference.favoritedVoiceIds)
        : [],
      defaultVoiceId: preference.defaultVoiceId,
    })
  } catch (error) {
    console.error('Update preferences error:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
