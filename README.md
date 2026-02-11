# PhoneShop - Telefon ve Aksesuar E-Ticaret Uygulaması

Modern, mobil uyumlu Next.js 14 tabanlı telefon ve aksesuar e-ticaret platformu.

## ✨ Özellikler

### 🛒 Temel E-Ticaret Özellikleri
- **Ürün Yönetimi**: Kategorilere ve markalara göre ürün listeleme, detay sayfaları
- **Arama ve Filtreleme**: Ürünlerde arama, kategori/marka/durum filtreleme, fiyat sıralama
- **Sepet Fonksiyonu**: Ürünleri sepete ekleme, miktar güncelleme, sepeti boşaltma
- **Ödeme Süreci**: Güvenli ödeme akışı, teslimat/fatura adresi, sipariş oluşturma
- **Kullanıcı Hesapları**: Kayıt ol, giriş yap, sipariş geçmişi

### 🔐 Güvenlik
- JWT tabanlı kimlik doğrulama
- Şifre hash'leme (bcrypt)
- Input validasyonu
- Admin yetki kontrolü

### 🛠️ Admin Paneli
- Ürün ekleme/güncelleme/silme
- Stok yönetimi
- Sipariş yönetimi ve durum güncelleme
- Kategori ve marka yönetimi

### 🔮 Gelecek Entegrasyonlar (Hazır Mimari)
- **Dolap API**: Ürün ve stok senkronizasyonu için servis katmanı
- **Ödeme Sağlayıcıları**: Stripe/Shopify Payments mimarisi
- **Bildirim Servisleri**: Email ve SMS gönderim altyapısı

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- PostgreSQL (Prisma ile birlikte)

### Adım 1: Projeyi Klonlayın
```bash
git clone <repository-url>
cd phone-shop
```

### Adım 2: Bağımlılıkları Yükleyin
```bash
npm install
```

### Adım 3: Ortam Değişkenlerini Ayarlayın
`.env` dosyasını oluşturun veya mevcut `.env` dosyasını düzenleyin:
```env
# Veritabanı bağlantısı (zaten mevcut)
DATABASE_URL="..."

# JWT gizli anahtarı (zaten mevcut)
JWT_SECRET="..."

# Ödeme sağlayıcıları (isteğe bağlı)
# STRIPE_SECRET_KEY="sk_test_..."
# STRIPE_PUBLISHABLE_KEY="pk_test_..."
# SHOPIFY_WEBHOOK_SECRET="..."

# Dolap API (isteğe bağlı)
# DOLAP_API_KEY="..."
# DOLAP_API_SECRET="..."
# DOLAP_SHOP_ID="..."

# Email/SMS servisleri (isteğe bağlı)
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="..."
# SMTP_PASS="..."
# TWILIO_ACCOUNT_SID="..."
# TWILIO_AUTH_TOKEN="..."
# TWILIO_PHONE_NUMBER="..."
```

### Adım 4: Veritabanını Başlatın
```bash
# Prisma veritabanını başlatın (eğer çalışmıyorsa)
npx prisma dev

# Prisma client'ı oluşturun
npx prisma generate
```

### Adım 5: Seed Verilerini Ekleyin
```bash
npx tsx prisma/seed.ts
```

### Adım 6: Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 📁 Proje Yapısı

```
phone-shop/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── products/          # Ürün sayfaları
│   │   ├── cart/              # Sepet sayfası
│   │   ├── checkout/          # Ödeme sayfası
│   │   ├── login/             # Giriş sayfası
│   │   ├── register/          # Kayıt sayfası
│   │   ├── admin/             # Admin paneli
│   │   └── api/               # API rotaları
│   ├── contexts/              # React Context'ler
│   ├── lib/                   # Yardımcı kütüphaneler
│   └── services/              # Servis katmanları
├── prisma/
│   ├── schema.prisma         # Veritabanı şeması
│   ├── seed.ts               # Seed verileri
│   └── migrations/           # Veritabanı migrasyonları
├── public/                   # Statik dosyalar
└── docs/                     # Dokümantasyon
```

## 🔧 Kullanım

### Admin Paneli
1. `http://localhost:3000/login` adresine gidin
2. Email: `admin@phoneshop.com`
3. Şifre: `admin123`
4. `http://localhost:3000/admin` adresinden admin paneline erişin

### Test Kullanıcısı
- Email: `user@example.com`
- Şifre: `user123`

## 📊 Veritabanı Şeması

### Ana Modeller
- **User**: Kullanıcı bilgileri
- **Product**: Ürün bilgileri (telefonlar, aksesuarlar)
- **Category**: Ürün kategorileri
- **Brand**: Ürün markaları
- **Order**: Sipariş bilgileri
- **CartItem**: Sepet öğeleri
- **OrderItem**: Sipariş öğeleri

### Özellikler
- Ürün durumu (Yeni/İkinci El/Yenilenmiş)
- Sipariş durumu takibi
- Stok yönetimi
- Çoklu resim desteği

## 🔄 Entegrasyonlar

### Dolap API Entegrasyonu
```typescript
import { dolapService } from '@/services/dolap.service'

// Dolap'tan ürünleri çek
const products = await dolapService.getProducts()

// Stok senkronizasyonu
await dolapService.syncStockToDolap(localProducts)
```

### Bildirim Servisleri
```typescript
import { notificationManager } from '@/services/notification.service'

// Sipariş onayı bildirimi
await notificationManager.sendOrderNotifications({
  id: 'ORDER-123',
  status: 'CONFIRMED',
  userEmail: 'customer@example.com',
  customerName: 'Mehmet Yılmaz'
})
```

## 🚀 Dağıtım

### Vercel'a Dağıtım
1. Projeyi GitHub'a pushlayın
2. Vercel hesabınızda "Import Project" seçin
3. Repository seçin
4. Ortam değişkenlerini Vercel'de ayarlayın
5. Dağıtımı başlatın

### Diğer Platformlar
```bash
# Production build
npm run build

# Production modda başlat
npm start
```

## 🛠️ Geliştirme

### Yeni Özellik Ekleme
1. Yeni API rotası ekleyin (`src/app/api/`)
2. Veritabanı şemasını güncelleyin (`prisma/schema.prisma`)
3. Migration oluşturun (`npx prisma migrate dev`)
4. Frontend component'ini oluşturun
5. Test edin

### Kod Standartları
- TypeScript kullanın
- Tailwind CSS ile stil verin
- Component'leri küçük parçalara ayırın
- Türkçe yorumlar ekleyin
- Error handling yapın

## 🔒 Güvenlik

- Şifreler bcrypt ile hash'lenir
- JWT token'ları güvenli bir şekilde saklanır
- Admin işlemleri yetkilendirme ile korunur
- Input'lar validasyon'dan geçirilir
- Environment variables ile gizli bilgiler korunur

## 📱 Mobil Uyumluluk

- Responsive tasarım (Tailwind CSS)
- Mobil-first yaklaşım
- Touch-friendly arayüz
- Optimize edilmiş performans

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişiklikleri yapın ve commit edin
4. Push yapın (`git push origin feature/yeni-ozellik`)
5. Pull request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında dağıtılmaktadır.

## 🆘 Destek

Sorunlar veya öneriler için:
- GitHub Issues kullanın
- Email: support@phoneshop.com

---

**PhoneShop** - Modern e-ticaret çözümü 🛍️
