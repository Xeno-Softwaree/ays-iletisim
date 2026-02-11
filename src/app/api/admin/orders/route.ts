import { NextRequest, NextResponse } from 'next/server'
import { withAuth, requireAdmin } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    // Admin kontrolü
    if (!requireAdmin(req.user)) {
      return NextResponse.json(
        { error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    try {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')
      const status = searchParams.get('status')
      const paymentStatus = searchParams.get('paymentStatus')

      const skip = (page - 1) * limit

      // Filtreleri oluştur
      const where: any = {}
      if (status) where.status = status
      if (paymentStatus) where.paymentStatus = paymentStatus

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            },
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    slug: true,
                    images: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.order.count({ where })
      ])

      const totalPages = Math.ceil(total / limit)

      return NextResponse.json({
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      })

    } catch (error) {
      console.error('Get admin orders error:', error)
      return NextResponse.json(
        { error: 'Siparişler getirilemedi' },
        { status: 500 }
      )
    }
  })
}