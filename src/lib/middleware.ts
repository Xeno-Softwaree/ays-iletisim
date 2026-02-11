import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from './auth'

// Middleware context tipi
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
}

// API route middleware for authentication
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  const token = extractTokenFromHeader(request.headers.get('authorization') || undefined)
  
  if (!token) {
    return NextResponse.json(
      { error: 'Yetkilendirme gerekli' },
      { status: 401 }
    )
  }

  try {
    const decoded = verifyToken(token) as any
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = decoded
    
    return handler(authenticatedRequest)
  } catch (error) {
    return NextResponse.json(
      { error: 'Geçersiz token' },
      { status: 401 }
    )
  }
}

// Admin yetkisi kontrolü
export function requireAdmin(user: any) {
  // Basit admin kontrolü - gerçekte veritabanında role field'ı olmalı
  // Şimdilik email ile kontrol edelim
  const adminEmails = ['admin@phoneshop.com']
  return adminEmails.includes(user.email)
}