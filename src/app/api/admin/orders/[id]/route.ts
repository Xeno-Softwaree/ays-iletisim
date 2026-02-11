import { NextRequest, NextResponse } from 'next/server'
import { withAuth, requireAdmin } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req) => {
    // Admin kontrolü
    if (!requireAdmin(req.user)) {
      return NextResponse.json(
        { error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    try {
      const { id } = await params
      const { status, paymentStatus, notes } = await request.json()

      const order = await prisma.order.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(paymentStatus && { paymentStatus }),
          ...(notes !== undefined && { notes })
        },
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
        }
      })

      return NextResponse.json({
        message: 'Sipariş güncellendi',
        order
      })

    } catch (error) {
      console.error('Update order error:', error)
      return NextResponse.json(
        { error: 'Sipariş güncellenemedi' },
        { status: 500 }
      )
    }
  })
}