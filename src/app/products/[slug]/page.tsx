'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  images: string[]
  condition: 'NEW' | 'USED' | 'REFURBISHED'
  quantity: number
  sku: string
  weight: number | null
  category: {
    name: string
    slug: string
  }
  brand: {
    name: string
    slug: string
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetchProduct()
    }
  }, [params.slug])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      } else {
        console.error('Product not found')
      }
    } catch (error) {
      console.error('Fetch product error:', error)
    } finally {
      setLoading(false)
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

  const addToCart = async () => {
    if (!user) {
      alert('Sepete eklemek için giriş yapmalısınız')
      return
    }

    if (!product) return

    try {
      setAddingToCart(true)
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: product.id,
          quantity
        })
      })

      if (response.ok) {
        alert('Ürün sepete eklendi!')
      } else {
        const data = await response.json()
        alert(data.error || 'Sepete eklenemedi')
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      alert('Bir hata oluştu')
    } finally {
      setAddingToCart(false)
    }
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ürün bulunamadı</h1>
          <Link href="/products" className="text-indigo-600 hover:text-indigo-800">
            Ürünlere geri dön
          </Link>
        </div>
      </div>
    )
  }

  const discountPercentage = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

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
              <Link href={user ? "/account" : "/login"} className="text-gray-900 hover:text-indigo-600">
                {user ? 'Hesabım' : 'Giriş'}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-indigo-600">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-indigo-600">Ürünler</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-indigo-600">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>
      </div>

      {/* Product Details */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-white rounded-lg overflow-hidden">
              {product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center text-gray-400">
                  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-indigo-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover hover:scale-105 transition-transform"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {getConditionText(product.condition)}
                </span>
                {discountPercentage > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    %{discountPercentage} İndirim
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <span>Marka: <Link href={`/products?brand=${product.brand.slug}`} className="text-indigo-600 hover:text-indigo-800">{product.brand.name}</Link></span>
                <span>Kategori: <Link href={`/products?category=${product.category.slug}`} className="text-indigo-600 hover:text-indigo-800">{product.category.name}</Link></span>
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                SKU: {product.sku}
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b border-gray-200 py-4">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-indigo-600">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              
              {product.quantity <= 5 && product.quantity > 0 && (
                <p className="mt-2 text-sm text-orange-600 font-medium">
                  ⚠️ Son {product.quantity} ürün! Stoklarla sınırlı.
                </p>
              )}
              
              {product.quantity === 0 && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  ❌ Bu ürün şu anda stokta yok
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürün Açıklaması</h3>
                <div className="prose prose-sm max-w-none text-gray-600">
                  {product.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Product Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ürün Detayları</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-gray-900">Durum</dt>
                  <dd className="text-gray-600">{getConditionText(product.condition)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Stok Durumu</dt>
                  <dd className="text-gray-600">{product.quantity > 0 ? `${product.quantity} adet` : 'Stokta yok'}</dd>
                </div>
                {product.weight && (
                  <div>
                    <dt className="font-medium text-gray-900">Ağırlık</dt>
                    <dd className="text-gray-600">{product.weight}g</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  Adet:
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={product.quantity === 0}
                >
                  {Array.from({ length: Math.min(product.quantity, 10) }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={addToCart}
                disabled={product.quantity === 0 || addingToCart}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addingToCart ? 'Ekleniyor...' : product.quantity === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
              </button>

              <Link
                href="/products"
                className="block w-full text-center border border-gray-300 text-gray-700 py-3 px-6 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}