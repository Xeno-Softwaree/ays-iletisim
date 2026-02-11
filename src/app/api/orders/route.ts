import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

// Siparişleri getir
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const orders = await prisma.order.findMany({
        where: {
          userId: req.user!.id
        },
        include: {
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
        }
      })

      return NextResponse.json(orders)

    } catch (error) {
      console.error('Get orders error:', error)
      return NextResponse.json(
        { error: 'Siparişler getirilemedi' },
        { status: 500 }
      )
    }
  })
}

// Yeni sipariş oluştur
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const {
        items,
        shippingAddress,
        billingAddress,
        paymentMethod
      } = await request.json()

      if (!items || items.length === 0) {
        return NextResponse.json(
          { error: 'Sepet boş' },
          { status: 400 }
        )
      }

      // Stok kontrolü ve fiyat hesaplama
      let subtotal = 0
      const orderItems: Array<{
        productId: string
        quantity: number
        price: number
      }> = []

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { 
            id: true, 
            price: true, 
            quantity: true, 
            status: true,
            name: true
          }
        })

        if (!product) {
          return NextResponse.json(
            { error: `Ürün bulunamadı: ${item.productId}` },
            { status: 404 }
          )
        }

        if (product.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: `Ürün aktif değil: ${product.name}` },
            { status: 400 }
          )
        }

        if (product.quantity < item.quantity) {
          return NextResponse.json(
            { error: `Yeterli stok yok: ${product.name}. Maksimum: ${product.quantity}` },
            { status: 400 }
          )
        }

        subtotal += product.price * item.quantity
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price
        })
      }

      // Toplam tutarı hesapla
      const tax = subtotal * 0.18
      const shipping = subtotal > 500 ? 0 : 29.99
      const total = subtotal + tax + shipping

      // Benzersiz sipariş numarası oluştur
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Siparişi oluştur (transaction ile)
      const order = await prisma.$transaction(async (tx) => {
        // Siparişi oluştur
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId: req.user!.id,
            status: 'PENDING',
            subtotal,
            tax,
            shipping,
            total,
            currency: 'TRY',
            paymentStatus: 'PENDING',
            paymentMethod,
            shippingAddress,
            billingAddress,
            items: {
              create: orderItems
            }
          },
          include: {
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

        // Stokları düş
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          })
        }

        // Sepeti temizle
        await tx.cartItem.deleteMany({
          where: {
            userId: req.user!.id
          }
        })

        return newOrder
      })

      // Ödeme servisi simülasyonu (gerçek uygulamada Stripe/Shopify Payments entegrasyonu)
      // Bu sadece bir örnek - gerçek ödeme işlemi burada yapılır
      await processPayment(order.id, total, paymentMethod)

      return NextResponse.json({
        message: 'Sipariş başarıyla oluşturuldu',
        order
      }, { status: 201 })

    } catch (error) {
      console.error('Create order error:', error)
      return NextResponse.json(
        { error: 'Sipariş oluşturulamadı' },
        { status: 500 }
      )
    }
  })
}

// Ödeme işleme fonksiyonu (simülasyon)
async function processPayment(orderId: string, amount: number, method: string) {
  // Gerçek uygulamada burada Stripe, Shopify Payments veya diğer ödeme sağlayıcıları entegre edilir
  console.log(`Ödeme işleniyor - Sipariş: ${orderId}, Tutar: ${amount} TL, Method: ${method}`)
  
  // Simülasyon: 2 saniye bekletip başarılı say
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Ödeme durumunu güncelle
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'PAID',
      status: 'CONFIRMED'
    }
  })
  
  console.log(`Ödeme başarılı - Sipariş: ${orderId}`)
  
  // Burada email/SMS bildirim servisi çağrılabilir
  // await notificationService.sendOrderConfirmation(orderId)
}