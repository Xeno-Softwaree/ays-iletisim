import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// Sepeti getir
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const cartItems = await prisma.cartItem.findMany({
        where: {
          userId: req.user!.id
        },
        include: {
          product: {
            include: {
              category: {
                select: { name: true, slug: true }
              },
              brand: {
                select: { name: true, slug: true }
              }
            }
          }
        }
      })

      // Sepet özetini hesapla
      const subtotal = cartItems.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity)
      }, 0)

      const totalItems = cartItems.reduce((sum, item) => {
        return sum + item.quantity
      }, 0)

      return NextResponse.json({
        items: cartItems,
        summary: {
          subtotal,
          tax: subtotal * 0.18, // %18 KDV
          shipping: subtotal > 500 ? 0 : 29.99, // 500 TL üzeri ücretsiz kargo
          total: subtotal + (subtotal * 0.18) + (subtotal > 500 ? 0 : 29.99),
          totalItems
        }
      })

    } catch (error) {
      console.error('Get cart error:', error)
      return NextResponse.json(
        { error: 'Sepet getirilemedi' },
        { status: 500 }
      )
    }
  })
}

// Sepete ürün ekle
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { productId, quantity } = await request.json()

      if (!productId || !quantity || quantity < 1) {
        return NextResponse.json(
          { error: 'Geçersiz ürün veya adet' },
          { status: 400 }
        )
      }

      // Ürünü kontrol et ve stok var mı diye bak
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { 
          id: true, 
          quantity: true, 
          status: true 
        }
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Ürün bulunamadı' },
          { status: 404 }
        )
      }

      if (product.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Ürün aktif değil' },
          { status: 400 }
        )
      }

      if (product.quantity < quantity) {
        return NextResponse.json(
          { error: 'Yeterli stok yok' },
          { status: 400 }
        )
      }

      // Sepette zaten varsa güncelle, yoksa yeni oluştur
      const cartItem = await prisma.cartItem.upsert({
        where: {
          userId_productId: {
            userId: req.user!.id,
            productId
          }
        },
        update: {
          quantity: {
            increment: quantity
          }
        },
        create: {
          userId: req.user!.id,
          productId,
          quantity
        },
        include: {
          product: true
        }
      })

      // Stok kontrolü - sepetteki toplam adeti kontrol et
      if (cartItem.quantity > product.quantity) {
        return NextResponse.json(
          { error: 'Bu üründen sepete ekleyebileceğiniz maksimum adet: ' + product.quantity },
          { status: 400 }
        )
      }

      return NextResponse.json({
        message: 'Ürün sepete eklendi',
        cartItem
      })

    } catch (error) {
      console.error('Add to cart error:', error)
      return NextResponse.json(
        { error: 'Sepete eklenemedi' },
        { status: 500 }
      )
    }
  })
}