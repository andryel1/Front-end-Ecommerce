import { apiService } from './api';

// Tipos/interfaces para produtos
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// Serviços de produtos
export class ProductService {
  static async getProducts(filters?: ProductFilters): Promise<ProductResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<ProductResponse>(endpoint);
  }

  static async getProductById(id: string): Promise<Product> {
    return apiService.get<Product>(`/products/${id}`);
  }

  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return apiService.post<Product>('/products', product);
  }

  static async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return apiService.put<Product>(`/products/${id}`, product);
  }

  static async deleteProduct(id: string): Promise<void> {
    return apiService.delete<void>(`/products/${id}`);
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    return apiService.get<Product[]>(`/products/category/${category}`);
  }

  static async searchProducts(query: string): Promise<Product[]> {
    return apiService.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
  }
}
