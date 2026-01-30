import { TextDecoder, TextEncoder } from 'util'

// Polyfills for TextEncoder/TextDecoder (needed for react-router-dom in Jest)
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

// Mock import.meta for Jest
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:3000/api',
        VITE_BUSINESS_PUBLIC_KEY: 'pub_test_key'
      }
    }
  }
})

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:3000/api'
process.env.VITE_BUSINESS_PUBLIC_KEY = 'pub_test_key'
