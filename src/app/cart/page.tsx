'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice: number | null
    images: string[]
    quantity: number
    condition: string
    category: {
      name: string
      slug: string
    }
    brand: {
      name: string
      slug: string
    }
  }
}

interface CartSummary {
  subtotal: number
  tax: number
  shipping: number
  total: number
  totalItems: number
}

export default function CartPage() {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [summary, setSummary] = useState<CartSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchCart()
    }
  }, [user])

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCartItems(data.items)
        setSummary(data.summary)
      } else {
        console.error('Failed to fetch cart')
      }
    } catch (error) {
      console.error('Fetch cart error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      setUpdating(itemId)
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      })

      if (response.ok) {
        fetchCart() // Sepeti yeniden yükle
      } else {
        const data = await response.json()
        alert(data.error || 'Miktar güncellenemedi')
      }
    } catch (error) {
      console.error('Update quantity error:', error)
      alert('Bir hata oluştu')
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    if (!confirm('Bu ürünü sepetten çıkarmak istediğinize emin misiniz?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchCart() // Sepeti yeniden yükle
      } else {
        const data = await response.json()
        alert(data.error || 'Ürün sepetten çıkarılamadı')
      }
    } catch (error) {
      console.error('Remove item error:', error)
      alert('Bir hata oluştu')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  const getConditionText = (condition: string) => {
    const conditions = {
      'NEW': 'Yeni',
      'USED': 'İkinci El',
      'REFURBISHED': 'Yenilenmiş'
    }
    return conditions[condition as keyof typeof conditions] || condition
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Giriş Gerekli</h1>
          <p className="text-gray-600 mb-6">Sepetinizi görmek için giriş yapmalısınız</p>
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!summary || cartItems.length === 0) {
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
                <Link href="/cart" className="text-indigo-600 font-medium">
                  Sepet
                </Link>
                <Link href="/account" className="text-gray-900 hover:text-indigo-600">
                  Hesabım
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h1>
            <p className="text-gray-600 mb-8">Henüz sepetinizde ürün bulunmuyor</p>
            <Link
              href="/products"
              className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700"
            >
              Alışverişe Başla
            </Link>
          </div>
        </main>
      </div>
    )
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
              <Link href="/cart" className="text-indigo-600 font-medium">
                Sepet ({summary.totalItems})
              </Link>
              <Link href="/account" className="text-gray-900 hover:text-indigo-600">
                Hesabım
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Alışveriş Sepeti</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sepet Ürünleri */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start space-x-4">
                  {/* Ürün Resmi */}
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                    {item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Ürün Bilgileri */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.product.brand.name} • {getConditionText(item.product.condition)}
                        </p>
                        {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                          <div className="mt-1">
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.product.comparePrice)}
                            </span>
                            <span className="ml-2 text-sm text-red-600 font-medium">
                              %{Math.round(((item.product.comparePrice - item.product.price) / item.product.comparePrice) * 100)} indirim
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center space-x-2">
                        <label htmlFor={`quantity-${item.id}`} className="text-sm text-gray-600">
                          Adet:
                        </label>
                        <select
                          id={`quantity-${item.id}`}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                          disabled={updating === item.id}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {Array.from({ length: Math.min(item.product.quantity, 10) }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                        {updating === item.id && (
                          <div className="text-indigo-600 text-sm">Güncelleniyor...</div>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.product.price)} / adet
                        </p>
                      </div>
                    </div>

                    {item.quantity > item.product.quantity && (
                      <div className="mt-2 text-sm text-orange-600">
                        ⚠️ Bu üründen sepete ekleyebileceğiniz maksimum adet: {item.product.quantity}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sipariş Özeti */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam ({summary.totalItems} ürün)</span>
                  <span className="font-medium">{formatPrice(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">KDV (%18)</span>
                  <span className="font-medium">{formatPrice(summary.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kargo</span>
                  <span className="font-medium">
                    {summary.shipping === 0 ? 'Ücretsiz' : formatPrice(summary.shipping)}
                  </span>
                </div>
                {summary.shipping === 0 && (
                  <div className="text-xs text-green-600">
                    500 TL ve üzeri siparişlerde kargo ücretsiz!
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Toplam</span>
                    <span className="text-indigo-600">{formatPrice(summary.total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/checkout"
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center block transition-colors"
                >
                  Siparişi Tamamla
                </Link>
                <Link
                  href="/products"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center block transition-colors"
                >
                  Alışverişe Devam Et
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}