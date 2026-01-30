import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  removeFromCart,
  selectCartItems,
  selectCartTotal,
  updateQuantity,
} from '../features/cart/cartSlice';
import { useNotification } from './useNotification';
import type { CartItem } from '../features/cart/cartSlice';

export interface CartViewModel {
  cartItems: CartItem[];
  total: number;
  estimatedShipping: number;
  handleQuantityChange: (productId: string, newQuantity: number) => void;
  handleRemove: (productId: string, productName: string) => void;
  handleCheckout: () => void;
}

export const useCartViewModel = (): CartViewModel => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showInfo } = useNotification();
  const cartItems = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  const estimatedShipping = 83630;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ productId, quantity: newQuantity }));
  };

  const handleRemove = (productId: string, productName: string) => {
    dispatch(removeFromCart(productId));
    showInfo(`${productName} eliminado del carrito`, 2000);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    showInfo('Redirigiendo al checkout...', 1500);

    setTimeout(() => {
      navigate('/checkout');
    }, 500);
  };

  return {
    cartItems,
    total,
    estimatedShipping,
    handleQuantityChange,
    handleRemove,
    handleCheckout,
  };
};
