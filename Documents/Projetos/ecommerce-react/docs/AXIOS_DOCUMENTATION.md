# Documentação: Conectando Frontend com Backend usando Axios

## Índice
1. [Instalação](#instalação)
2. [Configuração Básica](#configuração-básica)
3. [Estrutura de Services](#estrutura-de-services)
4. [Interceptors](#interceptors)
5. [Tratamento de Erros](#tratamento-de-erros)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Hooks Customizados](#hooks-customizados)
8. [Variáveis de Ambiente](#variáveis-de-ambiente)

## Instalação

```bash
npm install axios
# ou
yarn add axios
```

## Configuração Básica

### 1. Configuração da API Base (`src/services/api.ts`)

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Criando instância do Axios
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Tratamento de erro global
    if (error.response?.status === 401) {
      // Token expirado - redirecionar para login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Estrutura de Services

### 2. Serviço de Autenticação (`src/features/auth/services/authService.ts`)

```typescript
import api from '../../../services/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    } catch (error) {
      throw new Error('Erro ao fazer login');
    }
  }

  // Registro
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw new Error('Erro ao criar conta');
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  // Verificar token
  async verifyToken(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // Refresh token
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await api.post<{ token: string }>('/auth/refresh', {
        refreshToken,
      });
      return response.data.token;
    } catch (error) {
      throw new Error('Erro ao renovar token');
    }
  }
}

export const authService = new AuthService();
```

### 3. Serviço de Produtos (`src/features/products/services/productService.ts`)

```typescript
import api from '../../../services/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
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

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

class ProductService {
  // Listar produtos
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    try {
      const response = await api.get<ProductsResponse>('/products', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error('Erro ao buscar produtos');
    }
  }

  // Buscar produto por ID
  async getProductById(id: string): Promise<Product> {
    try {
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Produto não encontrado');
    }
  }

  // Criar produto (admin)
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const response = await api.post<Product>('/products', productData);
      return response.data;
    } catch (error) {
      throw new Error('Erro ao criar produto');
    }
  }

  // Atualizar produto (admin)
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const response = await api.put<Product>(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw new Error('Erro ao atualizar produto');
    }
  }

  // Deletar produto (admin)
  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      throw new Error('Erro ao deletar produto');
    }
  }
}

export const productService = new ProductService();
```

### 4. Serviço do Carrinho (`src/features/cart/services/cartService.ts`)

```typescript
import api from '../../../services/api';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  userId: string;
}

class CartService {
  // Buscar carrinho
  async getCart(): Promise<Cart> {
    try {
      const response = await api.get<Cart>('/cart');
      return response.data;
    } catch (error) {
      throw new Error('Erro ao buscar carrinho');
    }
  }

  // Adicionar item ao carrinho
  async addToCart(productId: string, quantity: number): Promise<Cart> {
    try {
      const response = await api.post<Cart>('/cart/items', {
        productId,
        quantity,
      });
      return response.data;
    } catch (error) {
      throw new Error('Erro ao adicionar item ao carrinho');
    }
  }

  // Atualizar quantidade de item
  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    try {
      const response = await api.put<Cart>(`/cart/items/${itemId}`, {
        quantity,
      });
      return response.data;
    } catch (error) {
      throw new Error('Erro ao atualizar item do carrinho');
    }
  }

  // Remover item do carrinho
  async removeFromCart(itemId: string): Promise<Cart> {
    try {
      const response = await api.delete<Cart>(`/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw new Error('Erro ao remover item do carrinho');
    }
  }

  // Limpar carrinho
  async clearCart(): Promise<void> {
    try {
      await api.delete('/cart');
    } catch (error) {
      throw new Error('Erro ao limpar carrinho');
    }
  }
}

export const cartService = new CartService();
```

## Interceptors

### Interceptor para Logs de Requisições (`src/services/interceptors.ts`)

```typescript
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import api from './api';

// Interceptor para log de requisições (desenvolvimento)
if (import.meta.env.MODE === 'development') {
  api.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      console.log('🚀 Requisição enviada:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
      return config;
    }
  );

  api.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log('✅ Resposta recebida:', {
        status: response.status,
        data: response.data,
        url: response.config.url,
      });
      return response;
    },
    (error) => {
      console.error('❌ Erro na requisição:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      return Promise.reject(error);
    }
  );
}
```

## Tratamento de Erros

### Classe para Erros da API (`src/utils/apiError.ts`)

```typescript
export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const handleApiError = (error: any): never => {
  if (error.response) {
    // Erro de resposta do servidor
    const { status, data } = error.response;
    const message = data?.message || 'Erro no servidor';
    throw new ApiError(message, status, data);
  } else if (error.request) {
    // Erro de rede
    throw new ApiError('Erro de conexão', 0);
  } else {
    // Outro tipo de erro
    throw new ApiError(error.message || 'Erro desconhecido', 0);
  }
};
```

## Hooks Customizados

### Hook para Produtos (`src/features/products/hooks/useProducts.ts`)

```typescript
import { useState, useEffect } from 'react';
import { productService, Product, ProductFilters } from '../services/productService';

export const useProducts = (filters: ProductFilters = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getProducts(filters);
        setProducts(response.products);
        setTotal(response.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(filters)]);

  return { products, loading, error, total };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await productService.getProductById(id);
        setProduct(productData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
};
```

### Hook para Autenticação (`src/features/auth/hooks/useAuth.ts`)

```typescript
import { useState, useEffect, createContext, useContext } from 'react';
import { authService, User, LoginData, RegisterData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.verifyToken();
          setUser(userData);
        }
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authService.login(data);
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};
```

## Variáveis de Ambiente

### Arquivo `.env` (raiz do projeto)

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# Environment
VITE_NODE_ENV=development

# Features
VITE_ENABLE_LOGS=true
```

### Arquivo `.env.production`

```env
# API Configuration
VITE_API_URL=https://api.seudominio.com
VITE_API_TIMEOUT=15000

# Environment
VITE_NODE_ENV=production

# Features
VITE_ENABLE_LOGS=false
```

## Exemplo de Uso em Componente

### Componente de Lista de Produtos

```typescript
import React from 'react';
import { useProducts } from '../features/products/hooks/useProducts';

const ProductList: React.FC = () => {
  const { products, loading, error } = useProducts({
    page: 1,
    limit: 10,
  });

  if (loading) return <div>Carregando produtos...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Produtos</h2>
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.imageUrl} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <span>R$ {product.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
```

## Dicas Importantes

1. **Sempre trate erros**: Use try/catch em todas as chamadas de API
2. **Use TypeScript**: Defina interfaces para tipagem das respostas
3. **Centralize configurações**: Use um arquivo de configuração da API
4. **Interceptors**: Use para autenticação automática e tratamento global de erros
5. **Loading states**: Sempre mostre feedback de carregamento
6. **Debounce**: Para pesquisas, use debounce para evitar muitas requisições
7. **Cache**: Considere usar React Query ou SWR para cache automático
8. **Variáveis de ambiente**: Use para diferentes URLs de API (dev, prod)

## Estrutura de Pastas Recomendada

```
src/
├── services/
│   ├── api.ts          # Configuração base do Axios
│   └── interceptors.ts # Interceptors globais
├── features/
│   ├── auth/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   ├── products/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   └── cart/
│       ├── services/
│       ├── hooks/
│       └── types/
└── utils/
    ├── apiError.ts     # Tratamento de erros
    └── constants.ts    # Constantes da API
```

Esta estrutura garante uma organização limpa e escalável para seu projeto e-commerce!
