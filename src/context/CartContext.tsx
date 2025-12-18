import { createContext, useContext, useState, useEffect } from 'react';
import { socket } from "../services/socket";
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

    useEffect(() => {
        const handleCartUpdate = (updatedItems: CartItem[]) => {
            setItems(updatedItems);
        };
        const handleCartClear = () => {
            setItems([]);
        };

        const handleProductUpdated = (updatedProduct: any) => {
            setItems(prevItems => prevItems.map(item => {
                if (item.productId === updatedProduct.id) {
                    // Recalculate price: New base price for size + extras cost (500 each)
                    const newBasePrice = updatedProduct.prices[item.size];
                    const extrasCost = (item.extras?.length || 0) * 500;
                    const newTotalItemPrice = newBasePrice + extrasCost;

                    if (item.price !== newTotalItemPrice) {
                        return { ...item, price: newTotalItemPrice };
                    }
                }
                return item;
            }));
        };

        socket.on('cartUpdated', handleCartUpdate);
        socket.on('cartCleared', handleCartClear);
        socket.on('productUpdated', handleProductUpdated);

        return () => {
            socket.off('cartUpdated', handleCartUpdate);
            socket.off('cartCleared', handleCartClear);
            socket.off('productUpdated', handleProductUpdated);
        };
    }, []);

    const addToCart = (newItem: Omit<CartItem, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newItems = [...items, { ...newItem, id }];
        setItems(newItems);
        socket.emit('cartUpdated', newItems);
    };

    const addItemsToCart = (newItems: Omit<CartItem, 'id'>[]) => {
        const itemsWithIds = newItems.map(item => ({
            ...item,
            id: Math.random().toString(36).substr(2, 9)
        }));
        const combined = [...items, ...itemsWithIds];
        setItems(combined);
        socket.emit('cartUpdated', combined);
    };

    const removeFromCart = (id: string) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        socket.emit('cartUpdated', newItems);
    };

    const updateQuantity = (id: string, delta: number) => {
        const newItems = items.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setItems(newItems);
        socket.emit('cartUpdated', newItems);
    };

    const getCartTotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const clearCart = () => {
        setItems([]);
        socket.emit('cartCleared');
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
