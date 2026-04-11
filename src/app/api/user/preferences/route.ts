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
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
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

    let favoritedVoiceIds: string[] = []
    try {
      favoritedVoiceIds = preference.favoritedVoiceIds
        ? JSON.parse(preference.favoritedVoiceIds)
        : []
    } catch {
      favoritedVoiceIds = []
    }

    return NextResponse.json({
      favoritedVoiceIds,
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
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const body = await req.json()
    const { favoritedVoiceIds, defaultVoiceId } = body

    // Validate favoritedVoiceIds is an array of strings (if provided)
    if (favoritedVoiceIds !== undefined) {
      if (!Array.isArray(favoritedVoiceIds) || !favoritedVoiceIds.every((id) => typeof id === 'string')) {
        return NextResponse.json({ error: 'favoritedVoiceIds must be an array of strings' }, { status: 400 })
      }
    }

    // Validate defaultVoiceId is a non-empty string (if provided)
    if (defaultVoiceId !== undefined) {
      if (typeof defaultVoiceId !== 'string' || defaultVoiceId.trim() === '') {
        return NextResponse.json({ error: 'defaultVoiceId must be a non-empty string' }, { status: 400 })
      }
    }

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

    let parsedFavoritedVoiceIds: string[] = []
    try {
      parsedFavoritedVoiceIds = preference.favoritedVoiceIds
        ? JSON.parse(preference.favoritedVoiceIds)
        : []
    } catch {
      parsedFavoritedVoiceIds = []
    }

    return NextResponse.json({
      favoritedVoiceIds: parsedFavoritedVoiceIds,
      defaultVoiceId: preference.defaultVoiceId,
    })
  } catch (error) {
    console.error('Update preferences error:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
