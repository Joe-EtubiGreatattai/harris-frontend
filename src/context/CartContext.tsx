import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
    id: string; // unique ID for cart entry (e.g. productID + timestamps or random)
    productId: string;
    name: string;
    image: string;
    size: "S" | "M" | "L" | "XL";
    price: number;
    extras: string[];
    note: string;
    quantity: number;
    category: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'id'>) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    getCartTotal: () => number;
    clearCart: () => void;
    addItemsToCart: (newItems: Omit<CartItem, 'id'>[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (newItem: Omit<CartItem, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setItems(prev => [...prev, { ...newItem, id }]);
    };

    const addItemsToCart = (newItems: Omit<CartItem, 'id'>[]) => {
        const itemsWithIds = newItems.map(item => ({
            ...item,
            id: Math.random().toString(36).substr(2, 9)
        }));
        setItems(prev => [...prev, ...itemsWithIds]);
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const getCartTotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const clearCart = () => {
        setItems([]);
    };

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, getCartTotal, clearCart, addItemsToCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
