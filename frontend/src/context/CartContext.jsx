import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { showNotification } from '../utils/alert';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components -- co-located with CartProvider by design; splitting into a separate file would mean touching every importer for a Fast Refresh nicety only
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useAuth();
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const refreshCart = async () => {
    if (user) {
      try {
        const res = await axios.get(`${API_BASE_URL}/cart`);
        if (res.data && res.data.items) {
          const dbCart = res.data.items.map(item => ({
            id: item.book.id,
            title: item.book.title,
            price: item.book.price,
            oldPrice: item.book.oldPrice || item.book.price,
            img: item.book.imageUrl || item.book.image_url || 'https://placehold.co/100',
            quantity: item.quantity
          }));
          setCart(dbCart);
        }
      } catch (error) {
        console.error('Error fetching DB cart', error);
      }
    } else {
      const savedCart = localStorage.getItem('bookstore_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    }
  };

  // Lấy giỏ hàng khi user đăng nhập hoặc từ localStorage nếu là khách
  useEffect(() => {
    refreshCart();
    // refreshCart is stable for this component's lifetime; only re-run when user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Lưu vào localStorage nếu là khách
  useEffect(() => {
    if (!user) {
      localStorage.setItem('bookstore_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = async (product, quantity = 1) => {
    if (user) {
      try {
        await axios.post(`${API_BASE_URL}/cart`, { bookId: product.id, quantity });
        // Update local state for immediate feedback
        setCart(prev => {
          const existing = prev.find(i => i.id === product.id);
          if (existing) {
            return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
          }
          return [...prev, {
            id: product.id,
            title: product.title,
            price: product.price,
            oldPrice: product.oldPrice || product.price,
            img: product.imageUrl || product.image_url || product.img || 'https://placehold.co/100',
            quantity
          }];
        });
      } catch (error) {
        console.error('Error adding to DB cart', error);
        showNotification('Lỗi', error.response?.data?.message || 'Không thể thêm vào giỏ hàng', 'error');
        return; // Return early to not show success notification
      }
    } else {
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === product.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        }
        return [...prevCart, {
          id: product.id,
          title: product.title,
          price: product.price,
          oldPrice: product.oldPrice || product.price,
          img: product.imageUrl || product.image_url || product.img || 'https://placehold.co/100',
          quantity
        }];
      });
    }

    showNotification('Thêm vào giỏ thành công', `${product.title} (x${quantity})`, 'success');
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    if (user) {
      try {
        await axios.put(`${API_BASE_URL}/cart/${productId}`, { quantity: newQuantity });
      } catch (error) {
        console.error('Error updating DB cart', error);
      }
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = async (productId) => {
    if (user) {
      try {
        await axios.delete(`${API_BASE_URL}/cart/${productId}`);
      } catch (error) {
        console.error('Error removing from DB cart', error);
      }
    }
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = async () => {
    if (user) {
      try {
        await axios.delete(`${API_BASE_URL}/cart`);
      } catch (error) {
        console.error('Error clearing DB cart', error);
      }
    }
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
