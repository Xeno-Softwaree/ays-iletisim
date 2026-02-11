'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

interface Address {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  district: string
  zipCode: string
}

export default function CheckoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [summary, setSummary] = useState<CartSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Adres formu
  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    zipCode: ''
  })
  
  const [billingAddress, setBillingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    zipCode: ''
  })
  
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('credit_card')

  useEffect(() => {
    if (user) {
      fetchCart()
      // Kullanıcı bilgilerini forma doldur
      if (user.firstName && user.lastName) {
        setShippingAddress(prev => ({
          ...prev,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }))
        setBillingAddress(prev => ({
          ...prev,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }))
      }
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
        router.push('/cart')
      }
    } catch (error) {
      console.error('Fetch cart error:', error)
      router.push('/cart')
    } finally {
      setLoading(false)
    }
  }

  const handleAddressChange = (type: 'shipping' | 'billing', field: keyof Address, value: string) => {
    if (type === 'shipping') {
      setShippingAddress(prev => ({ ...prev, [field]: value }))
    } else {
      setBillingAddress(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Form validasyonu
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'district']
    const shippingValid = requiredFields.every(field => shippingAddress[field as keyof Address])
    
    let billingValid = true
    if (!sameAsShipping) {
      billingValid = requiredFields.every(field => billingAddress[field as keyof Address])
    }
    
    if (!shippingValid || !billingValid) {
      alert('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    if (!summary || cartItems.length === 0) {
      alert('Sepetiniz boş')
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const data = await response.json()
        alert('Siparişiniz başarıyla oluşturuldu!')
        router.push(`/orders/${data.order.id}`)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Sipariş oluşturulamadı')
      }
    } catch (error) {
      console.error('Submit order error:', error)
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Giriş Gerekli</h1>
          <p className="text-gray-600 mb-6">Sipariş vermek için giriş yapmalısınız</p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h1>
          <Link
            href="/products"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700"
          >
            Alışverişe Başla
          </Link>
        </div>
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
              PhoneShop
            </Link>
            <nav className="flex space-x-8">
              <Link href="/products" className="text-gray-900 hover:text-indigo-600">
                Ürünler
              </Link>
              <Link href="/cart" className="text-gray-900 hover:text-indigo-600">
                Sepet
              </Link>
              <Link href="/account" className="text-gray-900 hover:text-indigo-600">
                Hesabım
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ödeme</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ana Form */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit}>
              {/* Teslimat Adresi */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Teslimat Adresi</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.firstName}
                      onChange={(e) => handleAddressChange('shipping', 'firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.lastName}
                      onChange={(e) => handleAddressChange('shipping', 'lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingAddress.email}
                      onChange={(e) => handleAddressChange('shipping', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange('shipping', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange('shipping', 'address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şehir *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange('shipping', 'city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İlçe *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.district}
                      onChange={(e) => handleAddressChange('shipping', 'district', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posta Kodu
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleAddressChange('shipping', 'zipCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Fatura Adresi */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Fatura Adresi</h2>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sameAsShipping"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sameAsShipping" className="ml-2 text-sm text-gray-700">
                      Teslimat adresiyle aynı
                    </label>
                  </div>
                </div>
                
                {!sameAsShipping && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Aynı teslimat adresi formu burada tekrar eder */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ad *
                      </label>
                      <input
                        type="text"
                        required
                        value={billingAddress.firstName}
                        onChange={(e) => handleAddressChange('billing', 'firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Soyad *
                      </label>
                      <input
                        type="text"
                        required
                        value={billingAddress.lastName}
                        onChange={(e) => handleAddressChange('billing', 'lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={billingAddress.email}
                        onChange={(e) => handleAddressChange('billing', 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        required
                        value={billingAddress.phone}
                        onChange={(e) => handleAddressChange('billing', 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adres *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={billingAddress.address}
                        onChange={(e) => handleAddressChange('billing', 'address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Şehir *
                      </label>
                      <input
                        type="text"
                        required
                        value={billingAddress.city}
                        onChange={(e) => handleAddressChange('billing', 'city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        İlçe *
                      </label>
                      <input
                        type="text"
                        required
                        value={billingAddress.district}
                        onChange={(e) => handleAddressChange('billing', 'district', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Ödeme Yöntemi */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Yöntemi</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Kredi Kartı / Banka Kartı
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="debit_card"
                      checked={paymentMethod === 'debit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Banka Havalesi / EFT
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Kapıda Ödeme (+29.99 TL hizmet bedeli)
                    </span>
                  </label>
                </div>

                {paymentMethod === 'credit_card' && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Not:</strong> Bu bir demo uygulamasıdır. Gerçek ödeme işlemi yapılmaz.
                    </p>
                    <p className="text-sm text-gray-600">
                      Gerçek uygulamada Stripe, Shopify Payments veya diğer ödeme sağlayıcıları entegre edilir.
                    </p>
                  </div>
                )}
              </div>

              {/* Siparişi Tamamla Butonu */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      İşleniyor...
                    </div>
                  ) : (
                    'Siparişi Tamamla'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sipariş Özeti */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
              
              {/* Sepet Ürünleri */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-md overflow-hidden">
                      {item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Fiyat Detayları */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam</span>
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
                {paymentMethod === 'cash_on_delivery' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kapıda Ödeme Bedeli</span>
                    <span className="font-medium">{formatPrice(29.99)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Toplam</span>
                    <span className="text-indigo-600">
                      {formatPrice(summary.total + (paymentMethod === 'cash_on_delivery' ? 29.99 : 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Güvenlik Bilgisi */}
              <div className="mt-6 p-3 bg-green-50 rounded-md">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-sm text-green-800">
                    Güvenli Ödeme
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Bilgileriniz 256-bit SSL ile korunmaktadır
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}