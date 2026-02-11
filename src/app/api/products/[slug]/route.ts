import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { name: true, slug: true }
        },
        brand: {
          select: { name: true, slug: true }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)

  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Ürün getirilemedi' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const productData = await request.json()

    const product = await prisma.product.update({
      where: { slug },
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

    return NextResponse.json(product)

  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Ürün güncellenemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    await prisma.product.delete({
      where: { slug }
    })

    return NextResponse.json(
      { message: 'Ürün silindi' }
    )

  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Ürün silinemedi' },
      { status: 500 }
    )
  }
}