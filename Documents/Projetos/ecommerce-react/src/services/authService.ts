import { apiService } from './api';

// Tipos/interfaces para autenticação
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Serviços de autenticação
export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    
    // Salvar token no localStorage
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    return response;
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', userData);
    
    // Salvar token no localStorage
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    return response;
  }

  static async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } finally {
      // Remover tokens do localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  }

  static async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/auth/me');
  }

  static async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });

    // Atualizar token no localStorage
    localStorage.setItem('authToken', response.token);
    
    return response;
  }

  static async forgotPassword(email: string): Promise<void> {
    return apiService.post('/auth/forgot-password', { email });
  }

  static async resetPassword(token: string, password: string): Promise<void> {
    return apiService.post('/auth/reset-password', { token, password });
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
