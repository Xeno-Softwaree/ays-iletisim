import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json()

    // Validasyon
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanları doldurun' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalı' },
        { status: 400 }
      )
    }

    // Email'in kullanılıp kullanılmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kayıtlı' },
        { status: 409 }
      )
    }

    // Şifreyi hashle
    const hashedPassword = await hashPassword(password)

    // Yeni kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true
      }
    })

    // JWT token oluştur
    const token = generateToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    })

    return NextResponse.json({
      message: 'Kayıt başarılı',
      user,
      token
    }, { status: 201 })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}