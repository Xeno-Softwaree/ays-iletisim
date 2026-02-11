import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    })

    return NextResponse.json(brands)

  } catch (error) {
    console.error('Get brands error:', error)
    return NextResponse.json(
      { error: 'Markalar getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const brandData = await request.json()

    const brand = await prisma.brand.create({
      data: brandData
    })

    return NextResponse.json(brand, { status: 201 })

  } catch (error) {
    console.error('Create brand error:', error)
    return NextResponse.json(
      { error: 'Marka oluşturulamadı' },
      { status: 500 }
    )
  }
}