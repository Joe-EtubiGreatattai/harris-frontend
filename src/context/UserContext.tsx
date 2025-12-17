import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from "../services/api";
import type { CartItem } from "./CartContext";

export interface UserProfile {
    email: string;
    address: string;
}

export interface Order {
    id: string;
    date: string; // Used for display date
    createdAt: string; // Used for timer
    items: CartItem[];
    total: number;
    status: "Delivered" | "Pending";
}

interface UserContextType {
    user: UserProfile | null;
    geoAddress: string | null;
    hasActiveOrder: boolean;
    activeOrders: Order[];
    orderHistory: Order[];
    isLoadingOrders: boolean;
    updateUser: (details: UserProfile) => void;
    setGeoAddress: (address: string) => void;
    startOrder: () => void;
    completeOrder: (orderId: string) => Promise<void>;
    refreshOrders: () => void;
    updateLocalOrder: (order: Order) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(() => {
        const saved = localStorage.getItem('user_profile');
        return saved ? JSON.parse(saved) : null;
    });

    const [geoAddress, setGeoAddressState] = useState<string | null>(null);
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    // Derived state for active orders
    const activeOrders = orderHistory.filter(o => o.status === 'Pending');
    const hasActiveOrder = activeOrders.length > 0;

    useEffect(() => {
        if (user) {
            localStorage.setItem('user_profile', JSON.stringify(user));
            refreshOrders();
        } else {
            setOrderHistory([]);
            setIsLoadingOrders(false);
        }
    }, [user]);

    const refreshOrders = async () => {
        if (!user?.email) {
            setIsLoadingOrders(false);
            return;
        }
        setIsLoadingOrders(true);
        try {
            const history = await api.getOrderHistory(user.email);
            const formattedHistory = history.map((o: any) => ({
                id: o.orderId || o._id,
                date: o.date || new Date(o.createdAt).toLocaleDateString(),
                createdAt: o.createdAt || new Date().toISOString(), // Fallback if missing
                items: o.items,
                total: o.total,
                status: o.status
            }));
            setOrderHistory(formattedHistory);
        } catch (err) {
            console.error("Failed to fetch order history", err);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const updateUser = (details: UserProfile) => {
        setUser(details);
    };

    const setGeoAddress = (address: string) => {
        setGeoAddressState(address);
    };

    const startOrder = () => {
        // Trigger refresh to pick up new pending order
        refreshOrders();
    };

    const completeOrder = async (orderId: string) => {
        try {
            await api.updateOrderStatus(orderId, "Delivered");
            refreshOrders();
        } catch (err) {
            console.error("Failed to complete order", err);
        }
    };

    const updateLocalOrder = (updatedOrder: Order) => {
        setOrderHistory(prev => prev.map(o => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o)));
    };

    return (
        <UserContext.Provider value={{
            user,
            geoAddress,
            hasActiveOrder,
            activeOrders,
            orderHistory,
            isLoadingOrders,
            updateUser,
            setGeoAddress,
            startOrder,
            completeOrder,
            refreshOrders,
            updateLocalOrder
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
