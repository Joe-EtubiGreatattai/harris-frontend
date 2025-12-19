import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api } from "../services/api";
import { socket } from "../services/socket";
import type { CartItem } from "./CartContext";

export interface UserProfile {
    email: string;
    address: string;
    favorites?: string[];
    savedAddresses?: {
        home?: string;
        work?: string;
    };
}

export interface Order {
    id: string;
    date: string; // Used for display date
    createdAt: string; // Used for timer
    items: CartItem[];
    total: number;
    status: "Delivered" | "Pending" | "Preparing" | "Ready for Delivery" | "Out for Delivery";
    assignedRider?: {
        _id: string;
        name: string;
        phone: string;
        image?: string;
    };
    deliveryFee?: number;
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
    toggleFavorite: (productId: string) => void;
    isFavorite: (productId: string) => boolean;
    updateSavedAddress: (type: 'home' | 'work', address: string) => void;
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
    const activeOrders = orderHistory.filter(o => o.status !== 'Delivered');
    const hasActiveOrder = activeOrders.length > 0;

    const refreshOrders = useCallback(async () => {
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
                createdAt: o.createdAt || new Date().toISOString(),
                items: o.items,
                total: o.total,
                status: o.status,
                assignedRider: o.assignedRider,
                deliveryFee: o.deliveryFee
            }));
            setOrderHistory(formattedHistory);
        } catch (err) {
            console.error("Failed to fetch order history", err);
        } finally {
            setIsLoadingOrders(false);
        }
    }, [user?.email]);

    const updateLocalOrder = useCallback((updatedOrder: Order) => {
        setOrderHistory(prev => prev.map(o => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o)));
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user_profile', JSON.stringify(user));
            refreshOrders();
        } else {
            setOrderHistory([]);
            setIsLoadingOrders(false);
        }
    }, [user, refreshOrders]);

    // Real-time Socket Listeners
    useEffect(() => {
        if (!user?.email) return;

        const handleOrderUpdate = (updatedOrder: any) => {
            // Check if this order belongs to the current user
            const orderEmail = updatedOrder.user?.email || updatedOrder.user;
            if (orderEmail === user.email) {
                const formatted: Order = {
                    id: updatedOrder.orderId || updatedOrder._id,
                    date: updatedOrder.date || new Date(updatedOrder.createdAt).toLocaleDateString(),
                    createdAt: updatedOrder.createdAt || new Date().toISOString(),
                    items: updatedOrder.items,
                    total: updatedOrder.total,
                    status: updatedOrder.status,
                    assignedRider: updatedOrder.assignedRider
                };
                updateLocalOrder(formatted);
            }
        };

        const handleNewOrder = (newOrder: any) => {
            const orderEmail = newOrder.user?.email || newOrder.user;
            if (orderEmail === user.email) {
                refreshOrders();
            }
        };

        const handleProfileUpdate = (updatedProfile: UserProfile) => {
            if (updatedProfile.email === user.email) {
                // Only update if it's different to avoid loops
                setUser(prev => {
                    if (prev?.address !== updatedProfile.address) {
                        return updatedProfile;
                    }
                    return prev;
                });
            }
        };

        socket.on('orderUpdated', handleOrderUpdate);
        socket.on('newOrder', handleNewOrder);
        socket.on('userProfileUpdated', handleProfileUpdate);

        return () => {
            socket.off('orderUpdated', handleOrderUpdate);
            socket.off('newOrder', handleNewOrder);
            socket.off('userProfileUpdated', handleProfileUpdate);
        };
    }, [user?.email, refreshOrders, updateLocalOrder]);

    const updateUser = (details: UserProfile) => {
        setUser(details);
        socket.emit('userProfileUpdated', details); // Notify other tabs
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


    const toggleFavorite = (productId: string) => {
        if (!user) return;
        const currentFavorites = user.favorites || [];
        const newFavorites = currentFavorites.includes(productId)
            ? currentFavorites.filter(id => id !== productId)
            : [...currentFavorites, productId];

        const updatedUser = { ...user, favorites: newFavorites };
        setUser(updatedUser);
        localStorage.setItem('user_profile', JSON.stringify(updatedUser));
    };

    const isFavorite = (productId: string) => {
        return user?.favorites?.includes(productId) || false;
    };

    const updateSavedAddress = (type: 'home' | 'work', address: string) => {
        if (!user) return;
        const updatedUser = {
            ...user,
            savedAddresses: {
                ...(user.savedAddresses || {}),
                [type]: address
            }
        };
        setUser(updatedUser);
        localStorage.setItem('user_profile', JSON.stringify(updatedUser));
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
            updateLocalOrder,
            toggleFavorite,
            isFavorite,
            updateSavedAddress
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
