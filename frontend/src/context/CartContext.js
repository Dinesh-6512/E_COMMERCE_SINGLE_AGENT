import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const { user } = useAuth();

useEffect(() => {
    if (user) {
        const storedCart = localStorage.getItem('cart');

        if (storedCart) {
            setCart(JSON.parse(storedCart));
        } else {
            setCart([]);
        }
    }
}, [user]);

// Clear cart state immediately when user logs out
useEffect(() => {
    const handleLogout = () => {
        setCart([]);
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
        window.removeEventListener('auth:logout', handleLogout);
    };
}, []);
 
useEffect(() => {
    if (localStorage.getItem('token')) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}, [cart]);
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: product.quantity ?? 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    // Atomically replace cart with a new list of items (used by agent sync)
    const syncCart = (items) => {
        setCart(items);
    };

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, syncCart, total }}>

            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
