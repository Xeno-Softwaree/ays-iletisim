import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
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

    return NextResponse.json(categories)

  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: 'Kategoriler getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const categoryData = await request.json()

    const category = await prisma.category.create({
      data: categoryData
    })

    return NextResponse.json(category, { status: 201 })

  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { error: 'Kategori oluşturulamadı' },
      { status: 500 }
    )
  }
}