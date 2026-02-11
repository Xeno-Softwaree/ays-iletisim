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
      const productData = await request.json()

      // SKU değişiyorsa benzersizliğini kontrol et
      if (productData.sku) {
        const existingProduct = await prisma.product.findFirst({
          where: {
            sku: productData.sku,
            id: { not: id }
          }
        })

        if (existingProduct) {
          return NextResponse.json(
            { error: 'Bu SKU zaten kullanılıyor' },
            { status: 400 }
          )
        }
      }

      const product = await prisma.product.update({
        where: { id },
        data: productData,
        include: {
          category: true,
          brand: true
        }
      })

      return NextResponse.json({
        message: 'Ürün güncellendi',
        product
      })

    } catch (error) {
      console.error('Update product error:', error)
      return NextResponse.json(
        { error: 'Ürün güncellenemedi' },
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
    // Admin kontrolü
    if (!requireAdmin(req.user)) {
      return NextResponse.json(
        { error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    try {
      const { id } = await params
      // Önce ürünü pasif hale getirmeliyiz (soft delete)
      await prisma.product.update({
        where: { id },
        data: {
          status: 'INACTIVE'
        }
      })

      return NextResponse.json({
        message: 'Ürün pasif hale getirildi'
      })

    } catch (error) {
      console.error('Delete product error:', error)
      return NextResponse.json(
        { error: 'Ürün silinemedi' },
        { status: 500 }
      )
    }
  })
}