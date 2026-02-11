'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { user, logout } = useAuth()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              AYS-İletişim
            </Link>
            <nav className="flex space-x-8">
              <Link href="/products" className="text-gray-900 hover:text-indigo-600">
                Ürünler
              </Link>
              <Link href="/cart" className="text-gray-900 hover:text-indigo-600">
                Sepet
              </Link>
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/account" className="text-gray-900 hover:text-indigo-600">
                    {user.firstName}
                  </Link>
                  {user.email === 'admin@aysiletisim.com' && (
                    <Link href="/admin" className="text-indigo-600 font-medium">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Çıkış
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-gray-900 hover:text-indigo-600">
                    Giriş
                  </Link>
                  <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    Kayıt
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="relative bg-gray-900">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-indigo-900 opacity-75"></div>
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Telefon ve
              <span className="block text-indigo-400">Aksesuar Dünyası</span>
            </h1>
            <p className="mt-6 text-xl text-indigo-200 max-w-3xl">
              En yeni telefonlar, kaliteli aksesuarlar ve uygun fiyatlar. 
              Güvenli alışveriş, hızlı teslimat.
            </p>
            <div className="mt-10 flex space-x-4">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Alışverişe Başla
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 transition-colors"
              >
                Üye Ol
              </Link>
            </div>
          </div>
        </div>

        {/* Öne Çıkan Kategoriler */}
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Kategoriler</h2>
            <p className="mt-4 text-lg text-gray-600">
              İhtiyacınıza uygun ürünleri keşfedin
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <svg className="h-24 w-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">Telefonlar</h3>
                <p className="mt-2 text-gray-600">
                  iPhone, Samsung, Xiaomi ve daha fazlası
                </p>
                <Link
                  href="/products?category=telefonlar"
                  className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  Keşfet
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <svg className="h-24 w-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">Aksesuarlar</h3>
                <p className="mt-2 text-gray-600">
                  Kulaklıklar, kılıflar, şarj aletleri
                </p>
                <Link
                  href="/products?category=aksesuarlar"
                  className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  Keşfet
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <svg className="h-24 w-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M7 8h10M7 12h10m-7 4h10M3 21h18a1 1 0 001-1V4a1 1 0 00-1-1H3a1 1 0 00-1 1v16a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">Tabletler</h3>
                <p className="mt-2 text-gray-600">
                  iPad, Samsung Galaxy Tab ve daha fazlası
                </p>
                <Link
                  href="/products?category=tabletler"
                  className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  Keşfet
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Öne Çıkan Ürünler */}
        <div className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">Öne Çıkan Ürünler</h2>
              <p className="mt-4 text-lg text-gray-600">
                En popüler ürünlerimiz
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Örnek ürünler */}
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-t-lg">
                  <img
                    src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop"
                    alt="iPhone 15 Pro"
                    className="h-48 w-full object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">iPhone 15 Pro 256GB</h3>
                  <p className="mt-2 text-sm text-gray-600">Apple • Yeni</p>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-indigo-600">{formatPrice(45999)}</p>
                    <p className="text-sm text-gray-500 line-through">{formatPrice(52999)}</p>
                  </div>
                  <Link
                    href="/products"
                    className="mt-4 block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    İncele
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-t-lg">
                  <img
                    src="https://images.unsplash.com/photo-1605236453806-b25ea056046e?w=400&h=300&fit=crop"
                    alt="Samsung Galaxy S24 Ultra"
                    className="h-48 w-full object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Galaxy S24 Ultra 512GB</h3>
                  <p className="mt-2 text-sm text-gray-600">Samsung • Yeni</p>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-indigo-600">{formatPrice(41999)}</p>
                    <p className="text-sm text-gray-500 line-through">{formatPrice(47999)}</p>
                  </div>
                  <Link
                    href="/products"
                    className="mt-4 block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    İncele
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-t-lg">
                  <img
                    src="https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400&h=300&fit=crop"
                    alt="Apple AirPods Pro"
                    className="h-48 w-full object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">AirPods Pro (2.Nesil)</h3>
                  <p className="mt-2 text-sm text-gray-600">Apple • Yeni</p>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-indigo-600">{formatPrice(4299)}</p>
                    <p className="text-sm text-gray-500 line-through">{formatPrice(5299)}</p>
                  </div>
                  <Link
                    href="/products"
                    className="mt-4 block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    İncele
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Tüm Ürünleri Gör
              </Link>
            </div>
          </div>
        </div>

        {/* Özellikler */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Neden AYS-İletişim?</h2>
        </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="flex justify-center">
                  <svg className="h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Güvenli Alışveriş</h3>
                <p className="mt-2 text-gray-600">
                  256-bit SSL ile korunuyor, bilgileriniz güvende
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center">
                  <svg className="h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Hızlı Teslimat</h3>
                <p className="mt-2 text-gray-600">
                  Aynı gün kargo, ertesi gün teslimat
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center">
                  <svg className="h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Müşteri Memnuniyeti</h3>
                <p className="mt-2 text-gray-600">
                  14 gün iade garantisi, 7/24 destek
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-indigo-400">AYS-İletişim</h3>
              <p className="mt-4 text-gray-400">
                Modern teknoloji ürünleri, uygun fiyatlar ve güvenli alışveriş deneyimi.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Hızlı Linkler</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-gray-400 hover:text-white">Ürünler</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white">Hakkımızda</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">İletişim</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Müşteri Hizmetleri</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white">Yardım</Link></li>
                <li><Link href="/shipping" className="text-gray-400 hover:text-white">Kargo Bilgisi</Link></li>
                <li><Link href="/returns" className="text-gray-400 hover:text-white">İade ve Değişim</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2026 AYS-İletişim. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
