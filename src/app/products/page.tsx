'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
  category: {
    name: string
    slug: string
  }
  brand: {
    name: string
    slug: string
  }
}

interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    search: '',
    condition: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  useEffect(() => {
    fetchCategories()
    fetchBrands()
    fetchProducts()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [filters, pagination.page])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      })

      const response = await fetch(`/api/products?${params}`)
      const data: ProductsResponse = await response.json()
      
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Products fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Categories fetch error:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error('Brands fetch error:', error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
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
              <Link href="/login" className="text-gray-900 hover:text-indigo-600">
                Giriş
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filtreler */}
          <aside className="w-full lg:w-64 space-y-6">
            {/* Arama */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Arama</h3>
              <input
                type="text"
                placeholder="Ürün ara..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Kategoriler */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Kategoriler</h3>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tümü</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name} ({cat._count.products})
                  </option>
                ))}
              </select>
            </div>

            {/* Markalar */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Markalar</h3>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tümü</option>
                {brands.map((brand: any) => (
                  <option key={brand.id} value={brand.slug}>
                    {brand.name} ({brand._count.products})
                  </option>
                ))}
              </select>
            </div>

            {/* Durum */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Durum</h3>
              <select
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tümü</option>
                <option value="NEW">Yeni</option>
                <option value="USED">İkinci El</option>
                <option value="REFURBISHED">Yenilenmiş</option>
              </select>
            </div>

            {/* Sıralama */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Sıralama</h3>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  handleFilterChange('sortBy', sortBy)
                  handleFilterChange('sortOrder', sortOrder)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="createdAt-desc">En Yeniler</option>
                <option value="createdAt-asc">En Eski</option>
                <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
                <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
                <option value="name-asc">İsim (A-Z)</option>
                <option value="name-desc">İsim (Z-A)</option>
              </select>
            </div>
          </aside>

          {/* Ürün Listesi */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Ürünler</h1>
              <p className="text-gray-600 mt-2">
                Toplam {pagination.total} ürün bulundu
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Yükleniyor...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Ürün bulunamadı</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                        {product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="h-48 w-full flex items-center justify-center text-gray-400">
                            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {product.name}
                          </h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {getConditionText(product.condition)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {product.brand.name} • {product.category.name}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xl font-bold text-indigo-600">
                              {formatPrice(product.price)}
                            </p>
                            {product.comparePrice && product.comparePrice > product.price && (
                              <p className="text-sm text-gray-500 line-through">
                                {formatPrice(product.comparePrice)}
                              </p>
                            )}
                          </div>
                          {product.quantity <= 5 && product.quantity > 0 && (
                            <span className="text-xs text-orange-600 font-medium">
                              Son {product.quantity} ürün!
                            </span>
                          )}
                          {product.quantity === 0 && (
                            <span className="text-xs text-red-600 font-medium">
                              Stokta yok
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Önceki
                    </button>
                    
                    <span className="px-3 py-2 text-sm text-gray-700">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={!pagination.hasNext}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sonraki
                    </button>
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}