import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req) => {
    try {
      const { id } = await params
      const { quantity } = await request.json()

      if (!quantity || quantity < 1) {
        return NextResponse.json(
          { error: 'Geçersiz adet' },
          { status: 400 }
        )
      }

      // Sepet öğesini bul
      const cartItem = await prisma.cartItem.findFirst({
        where: {
          id,
          userId: req.user!.id
        },
        include: {
          product: {
            select: { quantity: true }
          }
        }
      })

      if (!cartItem) {
        return NextResponse.json(
          { error: 'Sepet öğesi bulunamadı' },
          { status: 404 }
        )
      }

      // Stok kontrolü
      if (quantity > cartItem.product.quantity) {
        return NextResponse.json(
          { error: 'Yeterli stok yok. Maksimum adet: ' + cartItem.product.quantity },
          { status: 400 }
        )
      }

      // Güncelle
      const updatedCartItem = await prisma.cartItem.update({
        where: { id },
        data: { quantity },
        include: {
          product: true
        }
      })

      return NextResponse.json({
        message: 'Sepet güncellendi',
        cartItem: updatedCartItem
      })

    } catch (error) {
      console.error('Update cart item error:', error)
      return NextResponse.json(
        { error: 'Sepet güncellenemedi' },
        { status: 500 }
      )
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req) => {
    try {
      const { id } = await params
      // Sepet öğesini sil
      await prisma.cartItem.deleteMany({
        where: {
          id,
          userId: req.user!.id
        }
      })

      return NextResponse.json({
        message: 'Ürün sepetten çıkarıldı'
      })

    } catch (error) {
      console.error('Delete cart item error:', error)
      return NextResponse.json(
        { error: 'Ürün sepetten çıkarılamadı' },
        { status: 500 }
      )
    }
  })
}