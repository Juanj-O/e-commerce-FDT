import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Product } from '../../types';

// Dummy products for testing
const DUMMY_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    description: 'El iPhone 15 Pro Max cuenta con un diseño de titanio, chip A17 Pro, sistema de cámara Pro de 48MP.',
    price: 5499000,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
  },
  {
    id: '2',
    name: 'MacBook Pro 14" M3 Pro',
    description: 'MacBook Pro con chip M3 Pro, 18GB de memoria unificada, SSD de 512GB.',
    price: 9999000,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
  },
  {
    id: '3',
    name: 'MacBook Pro 14" M3 Pro',
    description: 'MacBook Pro con chip M3 Pro, 18GB de memoria unificada, SSD de 512GB.',
    price: 9999000,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
  },
  {
    id: '4',
    name: 'MacBook Pro 14" M3 Pro',
    description: 'MacBook Pro con chip M3 Pro, 18GB de memoria unificada, SSD de 512GB.',
    price: 9999000,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
  },
  {
    id: '5',
    name: 'MacBook Pro 14" M3 Pro',
    description: 'MacBook Pro con chip M3 Pro, 18GB de memoria unificada, SSD de 512GB.',
    price: 9999000,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
  },
  {
    id: '6',
    name: 'MacBook Pro 14" M3 Pro',
    description: 'MacBook Pro con chip M3 Pro, 18GB de memoria unificada, SSD de 512GB.',
    price: 9999000,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
  },
];

interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  loading: false,
  error: null,
};

// TODO: Replace with real API call when backend is ready
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return DUMMY_PRODUCTS;
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const product = DUMMY_PRODUCTS.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    selectProduct: (state, action: PayloadAction<Product>) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    updateProductStock: (state, action: PayloadAction<{ id: string; stock: number }>) => {
      const product = state.items.find(p => p.id === action.payload.id);
      if (product) {
        product.stock = action.payload.stock;
      }
      if (state.selectedProduct?.id === action.payload.id) {
        state.selectedProduct.stock = action.payload.stock;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product';
      });
  },
});

export const { selectProduct, clearSelectedProduct, updateProductStock } =
  productsSlice.actions;

export default productsSlice.reducer;
