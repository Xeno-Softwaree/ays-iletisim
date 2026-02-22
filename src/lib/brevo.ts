import * as Brevo from '@getbrevo/brevo';
import { logger } from './logger';

const apiInstance = new Brevo.TransactionalEmailsApi();

// Configure API key authorization: api-key
if (!process.env.BREVO_API_KEY) {
  console.error("CRITICAL: BREVO_API_KEY is missing from environment variables.");
} else {
  apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

interface SendVerificationEmailProps {
  email: string;
  token: string;
}

export const sendVerificationEmail = async ({ email, token }: SendVerificationEmailProps) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "Ays İletişim Doğrulama Kodu";
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Doğrulama</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #3b82f6; }
        .header h1 { margin: 0; color: #1e293b; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header h1 span { color: #3b82f6; }
        .content { padding: 40px 30px; text-align: center; color: #475569; }
        .code-box { background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 30px 0; }
        .code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #3b82f6; font-family: monospace; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AYS <span>İLETİŞİM</span></h1>
        </div>
        <div class="content">
          <p style="font-size: 16px; margin-bottom: 24px;">Merhaba,</p>
          <p style="line-height: 1.6;">Dükkanımıza hoş geldiniz! Hesabınızı doğrulamak ve güvenli alışverişe başlamak için aşağıdaki tek kullanımlık kodu kullanın.</p>
          
          <div class="code-box">
            <div class="code">${token}</div>
          </div>
          
          <p style="font-size: 14px; color: #64748b;">Bu kod 5 dakika boyunca geçerlidir.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Ays İletişim. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  sendSmtpEmail.sender = { name: "Ays İletişim", email: process.env.BREVO_SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: email }];

  try {
    if (!process.env.BREVO_API_KEY) {
      console.warn("BREVO_API_KEY eksik. Mail gönderimi simüle ediliyor.");
      logger.info(`[SIMULATION] To: ${email}, Code: ${token}`);
      return { success: true, simulated: true };
    }

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true };
  } catch (error) {
    console.error("Brevo Email Error:", error);
    return { success: false, error };
  }
};

interface SendShippingEmailProps {
  email: string;
  fullName: string;
  orderId: string;
  trackingNumber: string;
}

export const sendShippingEmail = async ({ email, fullName, orderId, trackingNumber }: SendShippingEmailProps) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `Siparişiniz Kargoya Verildi! #${orderId.slice(0, 8)}`;
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Siparişiniz Yola Çıktı</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #3b82f6; }
        .header h1 { margin: 0; color: #1e293b; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header h1 span { color: #3b82f6; }
        .content { padding: 40px 30px; text-align: center; color: #475569; }
        .tracking-box { background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 30px 0; }
        .tracking-label { font-size: 14px; color: #64748b; margin-bottom: 8px; display: block; }
        .tracking-number { font-size: 24px; font-weight: 700; color: #1e293b; font-family: monospace; letter-spacing: 2px; }
        .btn { display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 20px; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
        .info-text { margin-bottom: 24px; font-size: 16px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AYS <span>İLETİŞİM</span></h1>
        </div>
        <div class="content">
          <p class="info-text"><strong>Harika haber, ${fullName}!</strong></p>
          <p class="info-text">Siparişiniz özenle hazırlandı ve kargoya teslim edildi.</p>
          
          <div class="tracking-box">
            <span class="tracking-label">KARGO TAKİP NUMARASI</span>
            <div class="tracking-number">${trackingNumber}</div>
          </div>
          
          <p style="font-size: 14px; color: #64748b; margin-top: 24px;">Kargonuzun durumunu takip numarasını kullanarak kargo firmasının web sitesinden sorgulayabilirsiniz.</p>
        </div>
        <div class="footer">
          <p>Sipariş No: #${orderId}</p>
          <p>&copy; ${new Date().getFullYear()} Ays İletişim. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  sendSmtpEmail.sender = { name: "Ays İletişim", email: process.env.BREVO_SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: email }];

  try {
    if (!process.env.BREVO_API_KEY) {
      console.warn("BREVO_API_KEY eksik. Mail gönderimi simüle ediliyor.");
      logger.info(`[SIMULATION] Shipping Mail To: ${email}, Tracking: ${trackingNumber}`);
      return { success: true, simulated: true };
    }

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true };
  } catch (error) {
    console.error("Brevo Email Error:", error);
    return { success: false, error };
  }
};

interface SendStockAlertEmailProps {
  email: string;
  productName: string;
  productSlug: string;
}

export const sendStockAlertEmail = async ({ email, productName, productSlug }: SendStockAlertEmailProps) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  const productUrl = `${process.env.NEXTAUTH_URL || 'https://aysiletisim.com'}/urunler/${productSlug}`;

  sendSmtpEmail.subject = `✅ ${productName} — Tekrar Stokta!`;
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ürün Tekrar Stokta</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #3b82f6; }
        .header h1 { margin: 0; color: #1e293b; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header h1 span { color: #3b82f6; }
        .badge { display: inline-block; background-color: #ecfdf5; color: #059669; border: 1px solid #6ee7b7; border-radius: 999px; padding: 4px 14px; font-size: 13px; font-weight: 700; margin-bottom: 20px; }
        .content { padding: 40px 30px; text-align: center; color: #475569; }
        .product-name { font-size: 22px; font-weight: 800; color: #1e293b; margin: 16px 0 24px; }
        .btn { display: inline-block; background-color: #3b82f6; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; margin-top: 8px; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        .unsub { font-size: 11px; color: #cbd5e1; margin-top: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AYS <span>İLETİŞİM</span></h1>
        </div>
        <div class="content">
          <div class="badge">✅ Stok Bildirimi</div>
          <p style="font-size: 16px; margin: 0;">Takip ettiğiniz ürün tekrar stokta!</p>
          <div class="product-name">${productName}</div>
          <p style="font-size: 14px; color: #64748b; margin-bottom: 28px;">Bu ürünü daha önce bildirimi aldığınızda almak istediğinizi belirtmiştiniz. Hemen inceleyin, stoklar sınırlı olabilir!</p>
          <a href="${productUrl}" class="btn">Ürünü İncele →</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Ays İletişim. Tüm hakları saklıdır.</p>
          <p class="unsub">Bu bildirimi siz talep ettiniz.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  sendSmtpEmail.sender = { name: "Ays İletişim", email: process.env.BREVO_SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: email }];

  try {
    if (!process.env.BREVO_API_KEY) {
      console.warn("BREVO_API_KEY eksik. Stok bildirimi simüle ediliyor.");
      logger.info(`[SIMULATION] Stock Alert To: ${email}, Product: ${productName}`);
      return { success: true, simulated: true };
    }

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true };
  } catch (error: any) {
    console.error("Brevo Stock Alert Email Error:");
    if (error.response && error.response.body) {
      console.error(JSON.stringify(error.response.body, null, 2));
    } else {
      console.error(error);
    }
    return { success: false, error };
  }
};

interface SendResetPasswordEmailProps {
  email: string;
  token: string;
}

export const sendResetPasswordEmail = async ({ email, token }: SendResetPasswordEmailProps) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  sendSmtpEmail.subject = "Şifre Sıfırlama İsteği — Ays İletişim";
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Şifre Sıfırlama</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); margin-top: 40px; margin-bottom: 40px; border: 1px solid #e2e8f0; }
        .header { background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 1px solid #f1f5f9; }
        .header h1 { margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
        .header h1 span { color: #2563eb; }
        .content { padding: 50px 40px; text-align: center; color: #475569; }
        .btn-container { margin: 36px 0; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 16px 36px; border-radius: 12px; font-weight: 700; font-size: 16px; transition: all 0.2s ease; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        .warning { font-size: 13px; color: #94a3b8; margin-top: 24px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AYS <span>İLETİŞİM</span></h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Şifrenizi mi unuttunuz?</p>
          <p style="line-height: 1.7;">Sorun değil! Aşağıdaki butona tıklayarak güvenli bir şekilde yeni şifrenizi belirleyebilirsiniz. Bu bağlantı 30 dakika boyunca geçerlidir.</p>
          
          <div class="btn-container">
            <a href="${resetUrl}" class="btn">Şifremi Sıfırla</a>
          </div>
          
          <p class="warning">Eğer bu isteği siz yapmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz. Hesabınız güvende kalacaktır.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Ays İletişim. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  sendSmtpEmail.sender = { name: "Ays İletişim", email: process.env.BREVO_SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: email }];

  try {
    if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
      const missing = !process.env.BREVO_API_KEY ? 'BREVO_API_KEY' : 'BREVO_SENDER_EMAIL';
      console.error(`Brevo Reset Password Error: ${missing} is not configured.`);
      throw new Error("Email service configuration error");
    }

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true };
  } catch (error: any) {
    console.error("Brevo Reset Password Error Detail:", error?.response?.body || error.message);
    throw error;
  }
};

interface SendOrderStatusEmailProps {
  email: string;
  fullName: string;
  orderId: string;
  newStatus: string; // 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
  trackingNumber?: string | null;
}

export const sendOrderStatusEmail = async ({ email, fullName, orderId, newStatus, trackingNumber }: SendOrderStatusEmailProps) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  let statusText = "";
  let statusDescription = "";
  let subject = "";
  let showTracking = false;

  switch (newStatus) {
    case 'PREPARING':
      subject = `Siparişiniz Hazırlanıyor — #${orderId.slice(0, 8)}`;
      statusText = "Siparişiniz Hazırlanıyor";
      statusDescription = "Siparişinizi aldık ve arkadaşlarımız büyük bir özenle hazırlamaya başladı.";
      break;
    case 'SHIPPED':
      subject = `Siparişiniz Kargoya Verildi! — #${orderId.slice(0, 8)}`;
      statusText = "Siparişiniz Kargoda";
      statusDescription = "Harika haber! Siparişiniz kargoya teslim edildi ve size doğru yola çıktı.";
      showTracking = !!trackingNumber;
      break;
    case 'DELIVERED':
      subject = `Siparişiniz Teslim Edildi — #${orderId.slice(0, 8)}`;
      statusText = "Siparişiniz Teslim Edildi";
      statusDescription = "Umarız ürünlerinizi iyi günlerde kullanırsınız. Bizi tercih ettiğiniz için teşekkür ederiz!";
      break;
    case 'CANCELLED':
      subject = `Siparişiniz İptal Edildi — #${orderId.slice(0, 8)}`;
      statusText = "Siparişiniz İptal Edildi";
      statusDescription = "Siparişiniz maalesef iptal edilmiştir. İadeniz ödeme yönteminize göre kısa sürede yansıyacaktır.";
      break;
    default:
      return { success: false, error: "Unknown status" };
  }

  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://aysiletisim.com'}/hesabim/siparisler`;

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${statusText}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); margin-top: 40px; margin-bottom: 40px; border: 1px solid #e2e8f0; }
        .header { background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 1px solid #f1f5f9; }
        .header h1 { margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
        .header h1 span { color: #2563eb; }
        .content { padding: 50px 40px; text-align: center; color: #475569; }
        .status-badge { display: inline-block; background-color: #eff6ff; color: #2563eb; padding: 8px 16px; border-radius: 999px; font-weight: 700; font-size: 14px; margin-bottom: 24px; }
        .tracking-box { background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 24px; margin: 30px 0; }
        .tracking-label { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; display: block; }
        .tracking-number { font-size: 24px; font-weight: 800; color: #0f172a; font-family: monospace; letter-spacing: 2px; }
        .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; text-decoration: none; padding: 16px 36px; border-radius: 12px; font-weight: 700; font-size: 16px; transition: all 0.2s ease; margin-top: 24px; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AYS <span>İLETİŞİM</span></h1>
        </div>
        <div class="content">
          <div class="status-badge">${statusText}</div>
          <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Merhaba, ${fullName}</p>
          <p style="line-height: 1.7; font-size: 15px;">${statusDescription}</p>
          
          ${showTracking ? `
          <div class="tracking-box">
            <span class="tracking-label">KARGO TAKİP NUMARASI</span>
            <div class="tracking-number">${trackingNumber}</div>
          </div>
          ` : ''}
          
          <a href="${orderUrl}" class="btn">Sipariş Detaylarını Görüntüle</a>
        </div>
        <div class="footer">
          <p>Sipariş No: #${orderId}</p>
          <p>© ${new Date().getFullYear()} Ays İletişim. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  sendSmtpEmail.sender = { name: "Ays İletişim", email: process.env.BREVO_SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: email }];

  try {
    if (!process.env.BREVO_API_KEY) {
      console.warn("BREVO_API_KEY eksik. Mail gönderimi simüle ediliyor.");
      logger.info(`[SIMULATION] Order Status Mail To: ${email}, Status: ${newStatus}`);
      return { success: true, simulated: true };
    }
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true };
  } catch (error: any) {
    console.error("Brevo Order Status Email Error:", error?.response?.body || error.message);
    return { success: false, error };
  }
};

interface SendTradeInStatusEmailProps {
  email: string;
  fullName: string;
  deviceName: string;
  formId: string;
  newStatus: string; // 'REVIEWING', 'APPROVED', 'REJECTED'
  finalPrice?: number | null;
}

export const sendTradeInStatusEmail = async ({ email, fullName, deviceName, formId, newStatus, finalPrice }: SendTradeInStatusEmailProps) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  let statusText = "";
  let statusDescription = "";
  let subject = "";

  switch (newStatus) {
    case 'REVIEWING':
      subject = `Cihazınız İnceleniyor — ${deviceName}`;
      statusText = "Cihazınız İnceleniyor";
      statusDescription = "Cihazınız uzman ekibimiz tarafından detaylı bir şekilde incelenmeye başlandı. Yakında size nihai bir teklif ile döneceğiz.";
      break;
    case 'APPROVED':
      subject = `Cihazınız İçin Teklifimiz Onaylandı! — ${deviceName}`;
      statusText = "Teklif Onaylandı ✅";
      statusDescription = `Harika haber! <strong>${deviceName}</strong> cihazınız için incelememizi tamamladık ve son teklifimizi oluşturduk.`;
      break;
    case 'REJECTED':
      subject = `Cihaz Alım Talebiniz Hakkında — ${deviceName}`;
      statusText = "Talep Olumsuz Sonuçlandı";
      statusDescription = "Maalesef cihazınız beklediğimiz kriterleri tam olarak karşılamadığı için alım işlemini onaylayamadık. İlginiz için teşekkür ederiz.";
      break;
    default:
      return { success: false, error: "Unknown status" };
  }

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${statusText}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); margin-top: 40px; margin-bottom: 40px; border: 1px solid #e2e8f0; }
        .header { background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 1px solid #f1f5f9; }
        .header h1 { margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
        .header h1 span { color: #2563eb; }
        .content { padding: 50px 40px; text-align: center; color: #475569; }
        .status-badge { display: inline-block; background-color: #f1f5f9; color: #475569; padding: 8px 16px; border-radius: 999px; font-weight: 700; font-size: 14px; margin-bottom: 24px; }
        .status-badge.APPROVED { background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .price-box { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; padding: 30px; margin: 30px 0; }
        .price-label { font-size: 14px; font-weight: 600; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: block; }
        .price-amount { font-size: 36px; font-weight: 800; color: #1d4ed8; letter-spacing: -1px; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AYS <span>İLETİŞİM</span></h1>
        </div>
        <div class="content">
          <div class="status-badge ${newStatus === 'APPROVED' ? 'APPROVED' : ''}">${statusText}</div>
          <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Merhaba, ${fullName}</p>
          <p style="line-height: 1.7; font-size: 15px;">${statusDescription}</p>
          
          ${newStatus === 'APPROVED' && finalPrice ? `
          <div class="price-box">
            <span class="price-label">NİHAİ TEKLİFİMİZ</span>
            <div class="price-amount">₺${finalPrice.toLocaleString('tr-TR')}</div>
          </div>
          <p style="font-size: 14px; color: #64748b; margin-top: 24px;">Teklifimizi kabul ediyorsanız destek ekibimiz ödeme işlemleri için sizinle iletişime geçecektir.</p>
          ` : ''}
          
        </div>
        <div class="footer">
          <p>Talep No: #${formId.slice(0, 8)}</p>
          <p>© ${new Date().getFullYear()} Ays İletişim. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  sendSmtpEmail.sender = { name: "Ays İletişim", email: process.env.BREVO_SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: email }];

  try {
    if (!process.env.BREVO_API_KEY) {
      console.warn("BREVO_API_KEY eksik. Mail gönderimi simüle ediliyor.");
      logger.info(`[SIMULATION] TradeIn Status Mail To: ${email}, Status: ${newStatus}, Price: ${finalPrice}`);
      return { success: true, simulated: true };
    }
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true };
  } catch (error: any) {
    console.error("Brevo Trade-In Status Email Error:", error?.response?.body || error.message);
    return { success: false, error };
  }
};
