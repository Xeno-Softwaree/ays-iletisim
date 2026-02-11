import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const search = searchParams.get('search')
    const condition = searchParams.get('condition')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Filtreleri oluştur
    const where: any = {
      status: 'ACTIVE'
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (brand) {
      where.brand = {
        slug: brand
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (condition) {
      where.condition = condition
    }

    // Sıralama
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Ürünleri getir
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { name: true, slug: true }
          },
          brand: {
            select: { name: true, slug: true }
          }
        },
        orderBy,
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
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Ürünler getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()

    const product = await prisma.product.create({
      data: productData,
      include: {
        category: {
          select: { name: true, slug: true }
        },
        brand: {
          select: { name: true, slug: true }
        }
      }
    })

    return NextResponse.json(product, { status: 201 })

  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Ürün oluşturulamadı' },
      { status: 500 }
    )
  }
}