import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed verileri ekleniyor...')

  // Kategorileri oluştur
  const telefonCategory = await prisma.category.upsert({
    where: { slug: 'telefonlar' },
    update: {},
    create: {
      name: 'Telefonlar',
      slug: 'telefonlar',
      description: 'Akıllı telefonlar ve cep telefonları'
    }
  })

  const aksesuarCategory = await prisma.category.upsert({
    where: { slug: 'aksesuarlar' },
    update: {},
    create: {
      name: 'Aksesuarlar',
      slug: 'aksesuarlar',
      description: 'Telefon aksesuarları ve koruyucu ürünler'
    }
  })

  const tabletCategory = await prisma.category.upsert({
    where: { slug: 'tabletler' },
    update: {},
    create: {
      name: 'Tabletler',
      slug: 'tabletler',
      description: 'Tablet bilgisayarlar'
    }
  })

  // Markaları oluştur
  const appleBrand = await prisma.brand.upsert({
    where: { slug: 'apple' },
    update: {},
    create: {
      name: 'Apple',
      slug: 'apple'
    }
  })

  const samsungBrand = await prisma.brand.upsert({
    where: { slug: 'samsung' },
    update: {},
    create: {
      name: 'Samsung',
      slug: 'samsung'
    }
  })

  const xiaomiBrand = await prisma.brand.upsert({
    where: { slug: 'xiaomi' },
    update: {},
    create: {
      name: 'Xiaomi',
      slug: 'xiaomi'
    }
  })

  const huaweiBrand = await prisma.brand.upsert({
    where: { slug: 'huawei' },
    update: {},
    create: {
      name: 'Huawei',
      slug: 'huawei'
    }
  })

  // Ürünleri oluştur
  const products = [
    {
      name: 'iPhone 15 Pro 256GB',
      slug: 'iphone-15-pro-256gb',
      description: 'Apple iPhone 15 Pro, 256GB depolama, Titanyum gövde, A17 Pro chip',
      price: 45999,
      comparePrice: 52999,
      sku: 'IP15P256',
      barcode: '0190199867445',
      quantity: 15,
      weight: 221,
      condition: 'NEW' as const,
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1591337554190-e5575bc6a2a4?w=800&h=600&fit=crop'
      ],
      featured: true,
      categoryId: telefonCategory.id,
      brandId: appleBrand.id
    },
    {
      name: 'iPhone 14 128GB',
      slug: 'iphone-14-128gb',
      description: 'Apple iPhone 14, 128GB depolama, A15 Bionic chip, Ceramic Shield',
      price: 32999,
      comparePrice: 37999,
      sku: 'IP14128',
      barcode: '0190199647565',
      quantity: 25,
      weight: 172,
      condition: 'NEW' as const,
      images: [
        'https://images.unsplash.com/photo-1591337554190-e5575bc6a2a4?w=800&h=600&fit=crop'
      ],
      featured: true,
      categoryId: telefonCategory.id,
      brandId: appleBrand.id
    },
    {
      name: 'Samsung Galaxy S24 Ultra 512GB',
      slug: 'samsung-galaxy-s24-ultra-512gb',
      description: 'Samsung Galaxy S24 Ultra, 512GB depolama, S Pen, 200MP kamera',
      price: 41999,
      comparePrice: 47999,
      sku: 'SGS24U512',
      barcode: '8806094189705',
      quantity: 12,
      weight: 233,
      condition: 'NEW' as const,
      images: [
        'https://images.unsplash.com/photo-1605236453806-b25ea056046e?w=800&h=600&fit=crop'
      ],
      featured: true,
      categoryId: telefonCategory.id,
      brandId: samsungBrand.id
    },
    {
      name: 'Xiaomi 13 Pro 256GB',
      slug: 'xiaomi-13-pro-256gb',
      description: 'Xiaomi 13 Pro, 256GB depolama, Leica kamera, Snapdragon 8 Gen 2',
      price: 24999,
      comparePrice: 28999,
      sku: 'MI13P256',
      barcode: '6934177774824',
      quantity: 18,
      weight: 210,
      condition: 'NEW' as const,
      images: [
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=600&fit=crop'
      ],
      featured: false,
      categoryId: telefonCategory.id,
      brandId: xiaomiBrand.id
    },
    {
      name: 'Huawei P60 Pro 256GB',
      slug: 'huawei-p60-pro-256gb',
      description: 'Huawei P60 Pro, 256GB depolama, 50MP Ultra Lighting kamera',
      price: 21999,
      comparePrice: 25999,
      sku: 'HWP60P256',
      barcode: '6901443249528',
      quantity: 8,
      weight: 200,
      condition: 'NEW' as const,
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop'
      ],
      featured: false,
      categoryId: telefonCategory.id,
      brandId: huaweiBrand.id
    },
    {
      name: 'iPhone 13 Mini 128GB',
      slug: 'iphone-13-mini-128gb',
      description: 'Apple iPhone 13 Mini, 128GB, Kompakt tasarım, A15 Bionic',
      price: 18999,
      comparePrice: 22999,
      sku: 'IP13M128',
      barcode: '0190198723743',
      quantity: 5,
      weight: 140,
      condition: 'USED' as const,
      images: [
        'https://images.unsplash.com/photo-1603092447477-4487ee5be94b?w=800&h=600&fit=crop'
      ],
      featured: false,
      categoryId: telefonCategory.id,
      brandId: appleBrand.id
    },
    {
      name: 'Samsung Galaxy Buds Pro',
      slug: 'samsung-galaxy-buds-pro',
      description: 'Samsung Galaxy Buds Pro, Aktif gürültü engelleme, 360 Audio',
      price: 1899,
      comparePrice: 2499,
      sku: 'SGBP001',
      barcode: '8806094628527',
      quantity: 50,
      weight: 61,
      condition: 'NEW' as const,
      images: [
        'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop'
      ],
      featured: false,
      categoryId: aksesuarCategory.id,
      brandId: samsungBrand.id
    },
    {
      name: 'Apple AirPods Pro (2. Nesil)',
      slug: 'apple-airpods-pro-2',
      description: 'Apple AirPods Pro 2. Nesil, H2 chip, USB-C şarj kutusu',
      price: 4299,
      comparePrice: 5299,
      sku: 'APP2PRO',
      barcode: '0194252831825',
      quantity: 35,
      weight: 50,
      condition: 'NEW' as const,
      images: [
        'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&h=600&fit=crop'
      ],
      featured: true,
      categoryId: aksesuarCategory.id,
      brandId: appleBrand.id
    },
    {
      name: 'iPad Air 5. Nesil 64GB Wi-Fi',
      slug: 'ipad-air-5-64gb-wifi',
      description: 'Apple iPad Air 5. Nesil, 64GB Wi-Fi, M1 chip, 10.9 inç ekran',
      price: 14999,
      comparePrice: 17999,
      sku: 'IPA564W',
      barcode: '0194252721522',
      quantity: 10,
      weight: 461,
      condition: 'NEW' as const,
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop'
      ],
      featured: false,
      categoryId: tabletCategory.id,
      brandId: appleBrand.id
    },
    {
      name: 'Samsung Galaxy Tab S9 128GB Wi-Fi',
      slug: 'samsung-galaxy-tab-s9-128gb-wifi',
      description: 'Samsung Galaxy Tab S9, 128GB Wi-Fi, Snapdragon 8 Gen 2, 11 inç',
      price: 16999,
      comparePrice: 19999,
      sku: 'SGTS9128W',
      barcode: '8806094642350',
      quantity: 7,
      weight: 498,
      condition: 'NEW' as const,
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop'
      ],
      featured: false,
      categoryId: tabletCategory.id,
      brandId: samsungBrand.id
    }
  ]

  // Ürünleri ekle
  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product
    })
  }

  // Admin kullanıcısı oluştur
  const adminPassword = await hashPassword('admin123')
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@phoneshop.com' },
    update: {},
    create: {
      email: 'admin@phoneshop.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '05551234567'
    }
  })

  // Test kullanıcıları oluştur
  const userPassword = await hashPassword('user123')
  const testUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'Test',
      lastName: 'User',
      phone: '05559876543'
    }
  })

  console.log('✅ Seed verileri başarıyla eklendi!')
  console.log('\n📊 Özet:')
  console.log(`- ${products.length} ürün`)
  console.log('- 3 kategori')
  console.log('- 4 marka')
  console.log('- 2 kullanıcı (1 admin, 1 normal)')
  console.log('\n👤 Giriş Bilgileri:')
  console.log('Admin: admin@phoneshop.com / admin123')
  console.log('Test: user@example.com / user123')

  // Oluşturulan ürünlerin listesi
  console.log('\n📱 Oluşturulan ürünler:')
  const createdProducts = await prisma.product.findMany({
    select: {
      name: true,
      price: true,
      quantity: true,
      category: { select: { name: true } },
      brand: { select: { name: true } }
    }
  })

  createdProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} - ${product.brand.name} - ${product.category.name} - ${product.price} TL (${product.quantity} adet)`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Seed verileri eklenirken hata oluştu:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })