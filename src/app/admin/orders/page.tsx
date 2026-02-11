'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      name: string
      slug: string
      images: string[]
    }
  }>
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: ''
  })

  useEffect(() => {
    if (user && user.email === 'admin@phoneshop.com') {
      fetchOrders()
    } else {
      setError('Admin yetkisi gerekli')
      setLoading(false)
    }
  }, [user, filters, pagination.page])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      })
      
      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setPagination(data.pagination)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Siparişler getirilemedi')
      }
    } catch (error) {
      console.error('Fetch orders error:', error)
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, updates: any) => {
    try {
      setUpdating(orderId)
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const data = await response.json()
        // Sipariş listesini güncelle
        setOrders(prev => prev.map(order => 
          order.id === orderId ? data.order : order
        ))
        
        // Detay modalını güncelle
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.order)
        }
        
        alert('Sipariş güncellendi')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Güncelleme başarısız')
      }
    } catch (error) {
      console.error('Update order error:', error)
      alert('Bir hata oluştu')
    } finally {
      setUpdating(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'PROCESSING': 'bg-purple-100 text-purple-800',
      'SHIPPED': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PAID': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'REFUNDED': 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const texts = {
      'PENDING': 'Beklemede',
      'CONFIRMED': 'Onaylandı',
      'PROCESSING': 'Hazırlanıyor',
      'SHIPPED': 'Kargolandı',
      'DELIVERED': 'Teslim Edildi',
      'CANCELLED': 'İptal Edildi'
    }
    return texts[status as keyof typeof texts] || status
  }

  const getPaymentStatusText = (status: string) => {
    const texts = {
      'PENDING': 'Beklemede',
      'PAID': 'Ödendi',
      'FAILED': 'Başarısız',
      'REFUNDED': 'İade Edildi'
    }
    return texts[status as keyof typeof texts] || status
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Hata</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700"
          >
            Ana Sayfaya Dön
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
            <Link href="/admin" className="text-2xl font-bold text-indigo-600">
              PhoneShop Admin
            </Link>
            <nav className="flex space-x-8">
              <Link href="/admin/products" className="text-gray-900 hover:text-indigo-600">
                Ürünler
              </Link>
              <Link href="/admin/orders" className="text-indigo-600 font-medium">
                Siparişler
              </Link>
              <Link href="/" className="text-gray-900 hover:text-indigo-600">
                Mağaza
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Sipariş Yönetimi</h1>
        </div>

        {/* Filtreler */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sipariş Durumu
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tümü</option>
                <option value="PENDING">Beklemede</option>
                <option value="CONFIRMED">Onaylandı</option>
                <option value="PROCESSING">Hazırlanıyor</option>
                <option value="SHIPPED">Kargolandı</option>
                <option value="DELIVERED">Teslim Edildi</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ödeme Durumu
              </label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tümü</option>
                <option value="PENDING">Beklemede</option>
                <option value="PAID">Ödendi</option>
                <option value="FAILED">Başarısız</option>
                <option value="REFUNDED">İade Edildi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Siparişler Tablosu */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sipariş No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ödeme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Sipariş bulunamadı
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.user.firstName} {order.user.lastName}
                        <div className="text-gray-500">{order.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {getPaymentStatusText(order.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Detay
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
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
        )}
      </main>

      {/* Sipariş Detayı Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Sipariş Detayı - {selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Müşteri Bilgileri */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Müşteri Bilgileri</h4>
                <p className="text-sm text-gray-600">
                  {selectedOrder.user.firstName} {selectedOrder.user.lastName}
                </p>
                <p className="text-sm text-gray-600">{selectedOrder.user.email}</p>
              </div>

              {/* Sipariş Durumu Güncelleme */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Durum Güncelleme</h4>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newOrder = { ...selectedOrder, status: e.target.value }
                      setSelectedOrder(newOrder)
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                    disabled={updating === selectedOrder.id}
                  >
                    <option value="PENDING">Beklemede</option>
                    <option value="CONFIRMED">Onaylandı</option>
                    <option value="PROCESSING">Hazırlanıyor</option>
                    <option value="SHIPPED">Kargolandı</option>
                    <option value="DELIVERED">Teslim Edildi</option>
                    <option value="CANCELLED">İptal Edildi</option>
                  </select>
                  
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => {
                      const newOrder = { ...selectedOrder, paymentStatus: e.target.value }
                      setSelectedOrder(newOrder)
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                    disabled={updating === selectedOrder.id}
                  >
                    <option value="PENDING">Beklemede</option>
                    <option value="PAID">Ödendi</option>
                    <option value="FAILED">Başarısız</option>
                    <option value="REFUNDED">İade Edildi</option>
                  </select>
                </div>
                
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, {
                    status: selectedOrder.status,
                    paymentStatus: selectedOrder.paymentStatus
                  })}
                  disabled={updating === selectedOrder.id}
                  className="w-full bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updating === selectedOrder.id ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </div>

            {/* Ürünler */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Ürünler</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center space-x-3">
                      {item.product.images.length > 0 && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Adet: {item.quantity} x {formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Toplam */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Toplam:</span>
                <span className="text-indigo-600">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}