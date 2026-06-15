import React, { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useAuth();
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  // Lấy giỏ hàng khi user đăng nhập hoặc từ localStorage nếu là khách
  useEffect(() => {
    if (user) {
      const fetchDBCart = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/cart`);
          if (res.data && res.data.items) {
            // Map the DB structure to frontend structure
            const dbCart = res.data.items.map(item => ({
              id: item.book.id,
              title: item.book.title,
              price: item.book.price,
              img: item.book.imageUrl || item.book.image_url || 'https://placehold.co/100',
              quantity: item.quantity
            }));
            setCart(dbCart);
          }
        } catch (error) {
          console.error('Error fetching DB cart', error);
        }
      };
      fetchDBCart();
    } else {
      const savedCart = localStorage.getItem('bookstore_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    }
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
            img: product.imageUrl || product.image_url || product.img || 'https://placehold.co/100',
            quantity
          }];
        });
      } catch (error) {
        console.error('Error adding to DB cart', error);
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
          img: product.imageUrl || product.image_url || product.img || 'https://placehold.co/100',
          quantity
        }];
      });
    }

    Swal.fire({
      icon: 'success',
      title: 'Đã thêm vào giỏ hàng',
      text: `${product.title} (x${quantity})`,
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
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
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
