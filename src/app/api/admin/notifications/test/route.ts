import { NextRequest, NextResponse } from 'next/server'
import { withAuth, requireAdmin } from '@/lib/middleware'
import { notificationManager } from '@/services/notification.service'

// Test notification endpoint'i
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
      const { type, recipient, message } = await request.json()

      let result = false
      
      switch (type) {
        case 'email':
          const { emailService } = await import('@/services/notification.service')
          result = await emailService.send({
            type: 'email',
            to: recipient,
            subject: 'Test Email - PhoneShop',
            message: message || 'Bu bir test emailidir.',
            template: 'welcome',
            data: { customerName: 'Test User' }
          })
          break
          
        case 'sms':
          const { smsService } = await import('@/services/notification.service')
          result = await smsService.send({
            type: 'sms',
            to: recipient,
            subject: '',
            message: message || 'Bu bir test SMS\'idir.',
            template: 'order_confirmation',
            data: { orderId: 'TEST-123' }
          })
          break
          
        case 'order_notification':
          // Sipariş bildirimi test
          await notificationManager.sendOrderNotifications({
            id: 'TEST-ORDER-123',
            status: 'CONFIRMED',
            userEmail: recipient,
            customerName: 'Test Customer'
          })
          result = true
          break
          
        default:
          return NextResponse.json(
            { error: 'Geçersiz bildirim tipi' },
            { status: 400 }
          )
      }

      return NextResponse.json({
        message: 'Test bildirimi gönderildi',
        success: result,
        type,
        recipient
      })

    } catch (error) {
      console.error('Test notification error:', error)
      return NextResponse.json(
        { error: 'Bildirim gönderilemedi' },
        { status: 500 }
      )
    }
  })
}