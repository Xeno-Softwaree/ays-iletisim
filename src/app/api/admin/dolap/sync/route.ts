import { NextRequest, NextResponse } from 'next/server'
import { withAuth, requireAdmin } from '@/lib/middleware'
import { dolapService } from '@/services/dolap.service'

// Dolap senkronizasyon endpoint'i
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    // Admin kontrolü
    if (!requireAdmin(req.user)) {
      return NextResponse.json(
        { error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }

    try {
      const { action, direction } = await request.json()

      if (action === 'sync') {
        if (direction === 'to-dolap') {
          // Bizim veritabanımızdaki stokları Dolap'a senkronize et
          const { prisma } = await import('@/lib/prisma')
          
          const localProducts = await prisma.product.findMany({
            select: {
              id: true,
              sku: true,
              quantity: true,
              name: true
            }
          })

          await dolapService.syncStockToDolap(localProducts)
          
          return NextResponse.json({
            message: 'Stoklar Dolap\'a senkronize edildi',
            syncedProducts: localProducts.length
          })
        } else if (direction === 'from-dolap') {
          // Dolap'tan ürünleri çek
          const dolapProducts = await dolapService.importProductsFromDolap()
          
          return NextResponse.json({
            message: 'Dolap ürünleri getirildi',
            products: dolapProducts,
            count: dolapProducts.length
          })
        }
      } else if (action === 'import') {
        // Dolap'tan ürünleri bizim veritabanımıza aktar
        const dolapProducts = await dolapService.importProductsFromDolap()
        
        // Burada ürünleri veritabanına ekleyen logic olabilir
        // Şimdilik sadece döndürüyoruz
        
        return NextResponse.json({
          message: 'Dolap ürünleri içe aktarılmaya hazır',
          products: dolapProducts
        })
      }

      return NextResponse.json(
        { error: 'Geçersiz işlem' },
        { status: 400 }
      )

    } catch (error) {
      console.error('Dolap sync error:', error)
      return NextResponse.json(
        { error: 'Senkronizasyon başarısız' },
        { status: 500 }
      )
    }
  })
}

// Dolap ürünlerini getir
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
      const products = await dolapService.getProducts()
      
      return NextResponse.json({
        products,
        count: products.length
      })

    } catch (error) {
      console.error('Get Dolap products error:', error)
      return NextResponse.json(
        { error: 'Dolap ürünleri getirilemedi' },
        { status: 500 }
      )
    }
  })
}