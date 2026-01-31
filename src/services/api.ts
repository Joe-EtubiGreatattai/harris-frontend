const API_URL = 'https://harris-backend-zat9.onrender.com/api';

const getHeaders = () => {
    const token = localStorage.getItem('adminToken');
    const h: any = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
    };
    if (token) {
        h["Authorization"] = `Bearer ${token}`;
    }
    return h;
};

export const api = {
    // Products
    getProducts: async () => {
        const response = await fetch(`${API_URL}/products`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch products");
        return response.json();
    },

    getProductById: async (id: string) => {
        const response = await fetch(`${API_URL}/products/${id}`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch product");
        return response.json();
    },

    // Orders
    createOrder: async (orderData: any) => {
        const response = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(orderData),
        });
        if (!response.ok) throw new Error("Failed to create order");
        return response.json();
    },

    getOrderHistory: async (email: string) => {
        const response = await fetch(`${API_URL}/orders/user/${email}`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch order history");
        return response.json();
    },

    updateOrderStatus: async (id: string, status: string, source?: 'Admin' | 'User') => {
        const response = await fetch(`${API_URL}/orders/${id}/status`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify({ status, source }),
        });
        if (!response.ok) throw new Error("Failed to update order status");
        return response.json();
    },

    pingOrder: async (id: string) => {
        const response = await fetch(`${API_URL}/orders/${id}/ping`, {
            method: "POST",
            headers: getHeaders(),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to ping kitchen");
        }
        return response.json();
    },

    acknowledgePing: async (id: string) => {
        const response = await fetch(`${API_URL}/orders/${id}/acknowledge-ping`, {
            method: "POST",
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Failed to acknowledge ping");
        return response.json();
    },

    updateOrderPhone: async (id: string, phone: string) => {
        const response = await fetch(`${API_URL}/orders/${id}/phone`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify({ phone }),
        });
        if (!response.ok) throw new Error("Failed to update phone number");
        return response.json();
    },

    // Admin: Orders
    getAllOrders: async () => {
        const response = await fetch(`${API_URL}/orders`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch all orders");
        return response.json();
    },

    // Admin: Products
    createProduct: async (productData: any) => {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error("Failed to create product");
        return response.json();
    },

    updateProduct: async (id: string, productData: any) => {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error("Failed to update product");
        return response.json();
    },

    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(`${API_URL}/products/upload`, {
            method: 'POST',
            body: formData, // No JSON headers: getHeaders() for multipart
        });
        if (!response.ok) throw new Error("Upload failed");
        return response.json();
    },

    deleteProduct: async (id: string) => {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Failed to delete product");
        return response.json();
    },

    // Payment
    initializePayment: async (email: string, amount: number, metadata?: any) => {
        const response = await fetch(`${API_URL}/payment/initialize`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, amount, metadata })
        })
        return response.json()
    },

    verifyPayment: async (reference: string) => {
        const response = await fetch(`${API_URL}/payment/verify/${reference}`, { headers: getHeaders() })
        return response.json()
    },

    getTransactions: async (from?: string, to?: string, status?: string) => {
        let url = `${API_URL}/payment/transactions`;
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        if (status) params.append('status', status);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch transactions");
        return response.json();
    },

    // Riders
    getRiders: async () => {
        const response = await fetch(`${API_URL}/riders`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch riders");
        return response.json();
    },

    createRider: async (riderData: any) => {
        const response = await fetch(`${API_URL}/riders`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(riderData)
        });
        if (!response.ok) throw new Error("Failed to create rider");
        return response.json();
    },

    updateRider: async (id: string, data: any) => {
        const response = await fetch(`${API_URL}/riders/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to update rider");
        return response.json();
    },

    assignRiderToOrder: async (orderId: string, riderId: string) => {
        const response = await fetch(`${API_URL}/orders/${orderId}/assign-rider`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ riderId }),
        });
        if (!response.ok) throw new Error("Failed to assign rider");
        return response.json();
    },

    deleteRider: async (id: string) => {
        const response = await fetch(`${API_URL}/riders/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Failed to delete rider");
        return response.json();
    },

    // Settings
    getSettings: async () => {
        const response = await fetch(`${API_URL}/settings`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch settings");
        return response.json();
    },

    updateSettings: async (settingsData: any) => {
        const response = await fetch(`${API_URL}/settings`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify(settingsData),
        });
        if (!response.ok) throw new Error("Failed to update settings");
        return response.json();
    },

    // Notifications
    getVapidPublicKey: async () => {
        const response = await fetch(`${API_URL}/notifications/vapid-public-key`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to get VAPID key");
        return response.json();
    },

    subscribeToPush: async (email: string, subscription: any) => {
        const response = await fetch(`${API_URL}/notifications/subscribe`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, subscription })
        });
        if (!response.ok) throw new Error("Subscription failed");
        return response.json();
    },

    // Ratings
    submitRating: async (ratingData: { orderId: string, rating: number, comment?: string }) => {
        const response = await fetch(`${API_URL}/ratings`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(ratingData)
        });
        if (!response.ok) throw new Error("Failed to submit rating");
        return response.json();
    },

    getAllRatings: async () => {
        const response = await fetch(`${API_URL}/ratings`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch ratings");
        return response.json();
    },

    // Promos
    getAllPromos: async () => {
        const response = await fetch(`${API_URL}/promos`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch promos");
        return response.json();
    },

    createPromo: async (promoData: any) => {
        const response = await fetch(`${API_URL}/promos`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(promoData)
        });
        if (!response.ok) throw new Error("Failed to create promo");
        return response.json();
    },

    validatePromo: async (code: string, cartItems: any[]) => {
        const response = await fetch(`${API_URL}/promos/validate`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ code, cartItems })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to validate promo");
        }
        return response.json();
    },

    togglePromoStatus: async (id: string) => {
        const response = await fetch(`${API_URL}/promos/${id}/toggle`, {
            method: 'PATCH',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Failed to toggle promo status");
        return response.json();
    },

    deletePromo: async (id: string) => {
        const response = await fetch(`${API_URL}/promos/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Failed to delete promo");
        return response.json();
    },

    generatePromoCode: async () => {
        const response = await fetch(`${API_URL}/promos/generate-code`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to generate promo code");
        return response.json();
    },

    // Payouts/Withdrawals
    getBanks: async () => {
        const response = await fetch(`${API_URL}/payouts/banks`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch banks");
        return response.json();
    },

    getBalance: async () => {
        const response = await fetch(`${API_URL}/payouts/balance`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch balance");
        return response.json();
    },

    getFinancialTotals: async () => {
        const response = await fetch(`${API_URL}/payouts/totals`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch totals");
        return response.json();
    },

    verifyAccount: async (accountNumber: string, bankCode: string) => {
        const response = await fetch(`${API_URL}/payouts/verify-account`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ accountNumber, bankCode })
        });
        if (!response.ok) throw new Error("Verification failed");
        return response.json();
    },

    initiateWithdrawal: async (data: any) => {
        const response = await fetch(`${API_URL}/payouts/initiate`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Withdrawal failed");
        }
        return response.json();
    },

    getWithdrawalHistory: async () => {
        const response = await fetch(`${API_URL}/payouts/history`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch history");
        return response.json();
    },

    // Users
    getUsers: async () => {
        const response = await fetch(`${API_URL}/users`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch users");
        return response.json();
    },

    getUserOrders: async (email: string) => {
        const response = await fetch(`${API_URL}/users/${email}/orders`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch user orders");
        return response.json();
    },

    getUserProfile: async (email: string) => {
        const response = await fetch(`${API_URL}/users/profile/${email}`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch user profile");
        return response.json();
    },

    updateUserProfile: async (data: any) => {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to update user profile");
        return response.json();
    },

    getSharingUsers: async () => {
        const response = await fetch(`${API_URL}/users/active/sharing`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch sharing users");
        return response.json();
    },

    getAssignedOrders: async (riderId: string) => {
        const response = await fetch(`${API_URL}/orders/rider/${riderId}`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch assigned orders");
        return response.json();
    },

    // Tables
    getTables: async () => {
        const response = await fetch(`${API_URL}/tables`, { headers: getHeaders() });
        if (!response.ok) throw new Error("Failed to fetch tables");
        return response.json();
    },

    createTable: async (name: string, qrUrl?: string) => {
        const response = await fetch(`${API_URL}/tables`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name, qrUrl })
        });
        if (!response.ok) throw new Error("Failed to create table");
        return response.json();
    },

    deleteTable: async (id: string) => {
        const response = await fetch(`${API_URL}/tables/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Failed to delete table");
        return response.json();
    }
};
