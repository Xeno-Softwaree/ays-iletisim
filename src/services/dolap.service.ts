// Dolap API entegrasyonu için servis katmanı
// Bu servis, Dolap platformundan ürün ve stok senkronizasyonu için kullanılır

export interface DolapProduct {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  category: string
  brand?: string
  condition: 'new' | 'used' | 'good'
  stock: number
  location: string
}

export interface DolapCredentials {
  apiKey: string
  apiSecret: string
  shopId: string
}

class DolapService {
  private credentials: DolapCredentials | null = null
  private baseUrl = 'https://api.dolap.com/v1'

  constructor() {
    // Environment variables'dan credential'ları yükle
    this.loadCredentials()
  }

  private loadCredentials() {
    if (process.env.DOLAP_API_KEY && process.env.DOLAP_API_SECRET && process.env.DOLAP_SHOP_ID) {
      this.credentials = {
        apiKey: process.env.DOLAP_API_KEY,
        apiSecret: process.env.DOLAP_API_SECRET,
        shopId: process.env.DOLAP_SHOP_ID
      }
    }
  }

  // API çağrıları için yardımcı metod
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.credentials) {
      throw new Error('Dolap API credentials bulunamadı')
    }

    const url = `${this.baseUrl}${endpoint}`
    
    const headers = {
      'Authorization': `Bearer ${this.credentials.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      if (!response.ok) {
        throw new Error(`Dolap API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Dolap API request failed:', error)
      throw error
    }
  }

  // Dolap dükkanındaki tüm ürünleri getir
  async getProducts(): Promise<DolapProduct[]> {
    try {
      const data = await this.makeRequest(`/shops/${this.credentials!.shopId}/products`)
      return data.products || []
    } catch (error) {
      console.error('Dolap ürünleri getirilemedi:', error)
      return []
    }
  }

  // Tek bir ürünü getir
  async getProduct(productId: string): Promise<DolapProduct | null> {
    try {
      const data = await this.makeRequest(`/products/${productId}`)
      return data.product
    } catch (error) {
      console.error('Dolap ürünü getirilemedi:', error)
      return null
    }
  }

  // Ürün stok bilgisini güncelle
  async updateStock(productId: string, newStock: number): Promise<boolean> {
    try {
      await this.makeRequest(`/products/${productId}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ stock: newStock })
      })
      return true
    } catch (error) {
      console.error('Dolap stok güncellenemedi:', error)
      return false
    }
  }

  // Yeni ürün ekle
  async createProduct(product: Partial<DolapProduct>): Promise<DolapProduct | null> {
    try {
      const data = await this.makeRequest('/products', {
        method: 'POST',
        body: JSON.stringify(product)
      })
      return data.product
    } catch (error) {
      console.error('Dolap ürünü oluşturulamadı:', error)
      return null
    }
  }

  // Mevcut ürünü güncelle
  async updateProduct(productId: string, updates: Partial<DolapProduct>): Promise<boolean> {
    try {
      await this.makeRequest(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      return true
    } catch (error) {
      console.error('Dolap ürünü güncellenemedi:', error)
      return false
    }
  }

  // Ürünü sil
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/products/${productId}`, {
        method: 'DELETE'
      })
      return true
    } catch (error) {
      console.error('Dolap ürünü silinemedi:', error)
      return false
    }
  }

  // Stok senkronizasyonu (bizim veritabanımız -> Dolap)
  async syncStockToDolap(localProducts: Array<{ id: string; sku: string; quantity: number }>): Promise<void> {
    const dolapProducts = await this.getProducts()
    
    for (const localProduct of localProducts) {
      // SKU'ya göre Dolap ürününü bul
      const dolapProduct = dolapProducts.find(dp => dp.id === localProduct.sku)
      
      if (dolapProduct && dolapProduct.stock !== localProduct.quantity) {
        await this.updateStock(dolapProduct.id, localProduct.quantity)
        console.log(`Stok senkronize edildi: ${dolapProduct.title} -> ${localProduct.quantity}`)
      }
    }
  }

  // Dolap'tan ürün çekme (Dolap -> bizim veritabanımız)
  async importProductsFromDolap(): Promise<DolapProduct[]> {
    return this.getProducts()
  }

  // Dolap ürününü bizim formatımıza çevir
  static convertToLocalFormat(dolapProduct: DolapProduct) {
    return {
      name: dolapProduct.title,
      description: dolapProduct.description,
      price: dolapProduct.price,
      quantity: dolapProduct.stock,
      images: dolapProduct.images,
      sku: dolapProduct.id,
      condition: dolapProduct.condition === 'new' ? 'NEW' : 
                   dolapProduct.condition === 'used' ? 'USED' : 'REFURBISHED',
      status: 'ACTIVE' as const,
      categoryId: '', // Category mapping required
      brandId: '' // Brand mapping required
    }
  }
}

// Singleton instance
export const dolapService = new DolapService()

// Mock implementation for development
export class MockDolapService extends DolapService {
  private mockProducts: DolapProduct[] = [
    {
      id: 'mock-1',
      title: 'iPhone 13 Pro 128GB',
      description: 'Az kullanılmış iPhone 13 Pro',
      price: 15000,
      images: ['https://via.placeholder.com/300x300?text=iPhone+13+Pro'],
      category: 'Telefon',
      brand: 'Apple',
      condition: 'good',
      stock: 5,
      location: 'İstanbul'
    },
    {
      id: 'mock-2',
      title: 'Samsung Galaxy S22 Ultra',
      description: 'Samsung Galaxy S22 Ultra 256GB',
      price: 12000,
      images: ['https://via.placeholder.com/300x300?text=Galaxy+S22+Ultra'],
      category: 'Telefon',
      brand: 'Samsung',
      condition: 'new',
      stock: 10,
      location: 'Ankara'
    }
  ]

  async getProducts(): Promise<DolapProduct[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return this.mockProducts
  }

  async getProduct(productId: string): Promise<DolapProduct | null> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return this.mockProducts.find(p => p.id === productId) || null
  }

  async updateStock(productId: string, newStock: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300))
    const product = this.mockProducts.find(p => p.id === productId)
    if (product) {
      product.stock = newStock
      console.log(`Mock: Stok güncellendi ${productId} -> ${newStock}`)
      return true
    }
    return false
  }
}