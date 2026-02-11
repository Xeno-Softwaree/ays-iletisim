// Bildirim servisi - Email ve SMS gönderimi için
// Bu servis, sipariş onayı, kargo bilgisi vb. bildirimleri göndermek için kullanılır

export interface NotificationData {
  to: string
  subject: string
  message: string
  template?: string
  data?: Record<string, any>
}

export interface EmailNotification extends NotificationData {
  type: 'email'
  template?: 'order_confirmation' | 'shipping_update' | 'password_reset' | 'welcome'
}

export interface SMSNotification extends NotificationData {
  type: 'sms'
  template?: 'order_confirmation' | 'shipping_update' | 'verification'
}

export interface PushNotification extends NotificationData {
  type: 'push'
  title: string
  icon?: string
  url?: string
}

abstract class NotificationService {
  public abstract send(notification: EmailNotification | SMSNotification | PushNotification): Promise<boolean>

  // Sipariş onayı email'i gönder
  async sendOrderConfirmation(orderId: string, userEmail: string, customerName: string): Promise<boolean> {
    const notification: EmailNotification = {
      type: 'email',
      to: userEmail,
      subject: 'Siparişiniz Onaylandı - PhoneShop',
      message: '',
      template: 'order_confirmation',
      data: {
        orderId,
        customerName,
        // Diğer sipariş bilgileri veritabanından çekilebilir
      }
    }

    return this.send(notification)
  }

  // Kargo güncellemesi email'i gönder
  async sendShippingUpdate(orderId: string, userEmail: string, trackingNumber: string): Promise<boolean> {
    const notification: EmailNotification = {
      type: 'email',
      to: userEmail,
      subject: 'Siparişiniz Kargolandı - PhoneShop',
      message: '',
      template: 'shipping_update',
      data: {
        orderId,
        trackingNumber
      }
    }

    return this.send(notification)
  }

  // Hoş geldin email'i gönder
  async sendWelcomeEmail(userEmail: string, customerName: string): Promise<boolean> {
    const notification: EmailNotification = {
      type: 'email',
      to: userEmail,
      subject: 'PhoneShop\'a Hoş Geldiniz!',
      message: '',
      template: 'welcome',
      data: {
        customerName
      }
    }

    return this.send(notification)
  }

  // Şifre sıfırlama email'i gönder
  async sendPasswordReset(userEmail: string, resetToken: string): Promise<boolean> {
    const notification: EmailNotification = {
      type: 'email',
      to: userEmail,
      subject: 'Şifre Sıfırlama - PhoneShop',
      message: '',
      template: 'password_reset',
      data: {
        resetToken,
        resetLink: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
      }
    }

    return this.send(notification)
  }

  // SMS ile sipariş onayı gönder
  async sendOrderConfirmationSMS(phoneNumber: string, orderId: string): Promise<boolean> {
    const notification: SMSNotification = {
      type: 'sms',
      to: phoneNumber,
      subject: '',
      message: `PhoneShop siparişiniz onaylandı! Sipariş No: ${orderId}. Teşekkürler!`,
      template: 'order_confirmation',
      data: {
        orderId
      }
    }

    return this.send(notification)
  }

  // SMS ile kargo güncellemesi gönder
  async sendShippingUpdateSMS(phoneNumber: string, orderId: string, trackingNumber: string): Promise<boolean> {
    const notification: SMSNotification = {
      type: 'sms',
      to: phoneNumber,
      subject: '',
      message: `Siparişiniz ${orderId} kargolandı. Takip No: ${trackingNumber}`,
      template: 'shipping_update',
      data: {
        orderId,
        trackingNumber
      }
    }

    return this.send(notification)
  }

  // Toplu bildirim gönder
  async sendBulkNotifications(notifications: (EmailNotification | SMSNotification | PushNotification)[]): Promise<boolean[]> {
    return Promise.all(notifications.map(notification => this.send(notification)))
  }
}

// Email servisi implementasyonu
class EmailService extends NotificationService {
  private smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }

  async send(notification: EmailNotification): Promise<boolean> {
    try {
      if (!this.smtpConfig.host) {
        console.warn('SMTP konfigürasyonu bulunamadı, email gönderilemedi')
        return false
      }

      // Gerçek email gönderimi burada yapılır (Nodemailer, SendGrid, vb.)
      console.log('Email gönderiliyor:', {
        to: notification.to,
        subject: notification.subject,
        template: notification.template,
        data: notification.data
      })

      // Mock email gönderimi
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log(`Email başarıyla gönderildi: ${notification.to}`)
      
      return true
    } catch (error) {
      console.error('Email gönderme hatası:', error)
      return false
    }
  }

  // HTML email template'i oluştur
  private generateEmailTemplate(template: string, data: Record<string, any>, notification: EmailNotification): string {
    const templates = {
      order_confirmation: `
        <h1>Siparişiniz Onaylandı</h1>
        <p>Merhaba ${data.customerName},</p>
        <p>Siparişiniz başarıyla onaylandı. Sipariş No: ${data.orderId}</p>
        <p>Sipariş detayları için hesabınıza giriş yapabilirsiniz.</p>
        <p>Teşekkürler!</p>
      `,
      shipping_update: `
        <h1>Siparişiniz Kargolandı</h1>
        <p>Siparişiniz ${data.orderId} kargolandı.</p>
        <p>Takip Numarası: ${data.trackingNumber}</p>
      `,
      welcome: `
        <h1>Hoş Geldiniz!</h1>
        <p>Merhaba ${data.customerName},</p>
        <p>PhoneShop ailesine hoş geldiniz!</p>
      `,
      password_reset: `
        <h1>Şifre Sıfırlama</h1>
        <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
        <a href="${data.resetLink}">Şifre Sıfırla</a>
      `
    }

    return templates[template as keyof typeof templates] || notification.message
  }
}

// SMS servisi implementasyonu
class SMSService extends NotificationService {
  private smsConfig = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  }

  async send(notification: SMSNotification): Promise<boolean> {
    try {
      if (!this.smsConfig.accountSid) {
        console.warn('SMS konfigürasyonu bulunamadı, SMS gönderilemedi')
        return false
      }

      // Gerçek SMS gönderimi burada yapılır (Twilio, NetGSM, vb.)
      console.log('SMS gönderiliyor:', {
        to: notification.to,
        message: notification.message,
        template: notification.template
      })

      // Mock SMS gönderimi
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log(`SMS başarıyla gönderildi: ${notification.to}`)
      
      return true
    } catch (error) {
      console.error('SMS gönderme hatası:', error)
      return false
    }
  }
}

// Push notification servisi implementasyonu
class PushNotificationService extends NotificationService {
  async send(notification: PushNotification): Promise<boolean> {
    try {
      console.log('Push notification gönderiliyor:', {
        to: notification.to,
        title: notification.title,
        message: notification.message,
        url: notification.url
      })

      // Mock push notification gönderimi
      await new Promise(resolve => setTimeout(resolve, 200))
      console.log(`Push notification başarıyla gönderildi: ${notification.to}`)
      
      return true
    } catch (error) {
      console.error('Push notification gönderme hatası:', error)
      return false
    }
  }
}

// Servis factory
export class NotificationFactory {
  static createService(type: 'email' | 'sms' | 'push'): NotificationService {
    switch (type) {
      case 'email':
        return new EmailService()
      case 'sms':
        return new SMSService()
      case 'push':
        return new PushNotificationService()
      default:
        throw new Error('Geçersiz bildirim tipi')
    }
  }
}

// Singleton servisler
export const emailService = new EmailService()
export const smsService = new SMSService()
export const pushNotificationService = new PushNotificationService()

// Bildirim yöneticisi
export class NotificationManager {
  private services: NotificationService[]

  constructor() {
    this.services = [emailService, smsService, pushNotificationService]
  }

  // Tüm servisler üzerinden bildirim gönder
  async sendAll(notification: EmailNotification | SMSNotification | PushNotification): Promise<boolean[]> {
    const results: boolean[] = []
    
    for (const service of this.services) {
      try {
        const result = await service.send(notification)
        results.push(result)
      } catch (error) {
        console.error('Bildirim gönderme hatası:', error)
        results.push(false)
      }
    }
    
    return results
  }

  // Sipariş durumuna göre bildirim gönder
  async sendOrderNotifications(
    orderData: {
      id: string
      status: string
      userEmail: string
      userPhone?: string
      customerName: string
      trackingNumber?: string
    }
  ): Promise<void> {
    const { status, userEmail, userPhone, customerName, id: orderId, trackingNumber } = orderData

    switch (status) {
      case 'CONFIRMED':
        await emailService.sendOrderConfirmation(orderId, userEmail, customerName)
        if (userPhone) {
          await smsService.sendOrderConfirmationSMS(userPhone, orderId)
        }
        break
        
      case 'SHIPPED':
        if (trackingNumber) {
          await emailService.sendShippingUpdate(orderId, userEmail, trackingNumber)
          if (userPhone) {
            await smsService.sendShippingUpdateSMS(userPhone, orderId, trackingNumber)
          }
        }
        break
        
      case 'DELIVERED':
        // Teslimat bildirimi gönderilebilir
        break
        
      case 'CANCELLED':
        // İptal bildirimi gönderilebilir
        break
    }
  }
}

// Singleton notification manager
export const notificationManager = new NotificationManager()