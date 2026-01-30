import axios, { AxiosError } from 'axios'
import type {
  ApiResponse,
  CreateTransactionRequest,
  ProcessPaymentResponse,
  Product,
  Transaction
} from '../types'

// Use a fallback approach for environment variables
// In Vite: import.meta.env.VITE_API_URL
// In Jest/tests: will use the fallback
const API_BASE_URL = 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    return Promise.reject(new Error(message))
  }
)

export const productsApi = {
  getAll: async (): Promise<ApiResponse<Product[]>> => {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products')
    return response.data
  },

  getById: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`)
    return response.data
  }
}

export const transactionsApi = {
  create: async (data: CreateTransactionRequest): Promise<ApiResponse<ProcessPaymentResponse>> => {
    const response = await apiClient.post<ApiResponse<ProcessPaymentResponse>>(
      '/transactions',
      data
    )
    return response.data
  },

  getById: async (id: string): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`)
    return response.data
  }
}

export default apiClient
