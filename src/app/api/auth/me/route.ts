import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization') || undefined)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token) as any

    // Kullanıcı bilgilerini veritabanından güncel olarak al
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user,
      message: 'Kullanıcı bilgileri getirildi'
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Geçersiz token' },
      { status: 401 }
    )
  }
}