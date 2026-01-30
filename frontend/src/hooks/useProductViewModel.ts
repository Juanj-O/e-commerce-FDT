import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setProduct, setQuantity, setStep } from '../features/checkout/checkoutSlice';
import { fetchProducts, selectProduct } from '../features/products/productsSlice';
import { addToCart } from '../features/cart/cartSlice';
import { useNotification } from './useNotification';
import type { Product } from '../types';

export interface ProductViewModel {
  product: Product | undefined;
  loading: boolean;
  quantity: number;
  isInfoOpen: boolean;
  isOutOfStock: boolean;
  setIsInfoOpen: (v: boolean) => void;
  handleBuyNow: () => void;
  handleQuantityChange: (newQuantity: number) => void;
  handleAddToCart: () => void;
}

export const useProductViewModel = (productId: string | undefined): ProductViewModel => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showSuccess } = useNotification();
  const { items, loading } = useAppSelector((state) => state.products);
  const [quantity, setLocalQuantity] = useState(1);
  const [isInfoOpen, setIsInfoOpen] = useState(true);

  const product = items.find((item) => item.id === productId);

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, items.length]);

  const isOutOfStock = product ? product.stock <= 0 : true;

  const handleBuyNow = () => {
    if (!product) return;

    dispatch(selectProduct(product));
    dispatch(setProduct(product));
    dispatch(setQuantity(quantity));
    dispatch(setStep('payment'));
    navigate('/checkout');
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (!product) return;
    if (newQuantity < 1) return;
    if (newQuantity > product.stock) return;
    setLocalQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!product) return;

    dispatch(addToCart({ product, quantity }));
    showSuccess(`${product.name} agregado al carrito`, 2000);
  };

  return {
    product,
    loading,
    quantity,
    isInfoOpen,
    isOutOfStock,
    setIsInfoOpen,
    handleBuyNow,
    handleQuantityChange,
    handleAddToCart,
  };
};
