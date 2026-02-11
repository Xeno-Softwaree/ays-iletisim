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
      const category = searchParams.get('category')
      const brand = searchParams.get('brand')
      const status = searchParams.get('status')
      const search = searchParams.get('search')

      const skip = (page - 1) * limit

      // Filtreleri oluştur
      const where: any = {}
      if (category) {
        where.category = { slug: category }
      }
      if (brand) {
        where.brand = { slug: brand }
      }
      if (status) {
        where.status = status
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ]
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: true,
            brand: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.product.count({ where })
      ])

      const totalPages = Math.ceil(total / limit)

      return NextResponse.json({
        products,
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
      console.error('Get admin products error:', error)
      return NextResponse.json(
        { error: 'Ürünler getirilemedi' },
        { status: 500 }
      )
    }
  })
}

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
      const productData = await request.json()

      // SKU benzersizliğini kontrol et
      const existingProduct = await prisma.product.findUnique({
        where: { sku: productData.sku }
      })

      if (existingProduct) {
        return NextResponse.json(
          { error: 'Bu SKU zaten kullanılıyor' },
          { status: 400 }
        )
      }

      // Slug oluştur
      const slug = productData.slug || productData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')

      const product = await prisma.product.create({
        data: {
          ...productData,
          slug
        },
        include: {
          category: true,
          brand: true
        }
      })

      return NextResponse.json({
        message: 'Ürün oluşturuldu',
        product
      }, { status: 201 })

    } catch (error) {
      console.error('Create product error:', error)
      return NextResponse.json(
        { error: 'Ürün oluşturulamadı' },
        { status: 500 }
      )
    }
  })
}