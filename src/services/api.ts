const API_URL = 'https://harris-backend.onrender.com/api';

const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
}

export const api = {
    // Products
    getProducts: async () => {
        const response = await fetch(`${API_URL}/products`, { headers });
        if (!response.ok) throw new Error("Failed to fetch products");
        return response.json();
    },

    getProductById: async (id: string) => {
        const response = await fetch(`${API_URL}/products/${id}`, { headers });
        if (!response.ok) throw new Error("Failed to fetch product");
        return response.json();
    },

    // Orders
    createOrder: async (orderData: any) => {
        const response = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers,
            body: JSON.stringify(orderData),
        });
        if (!response.ok) throw new Error("Failed to create order");
        return response.json();
    },

    getOrderHistory: async (email: string) => {
        const response = await fetch(`${API_URL}/orders/user/${email}`, { headers });
        if (!response.ok) throw new Error("Failed to fetch order history");
        return response.json();
    },

    updateOrderStatus: async (id: string, status: string) => {
        const response = await fetch(`${API_URL}/orders/${id}/status`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error("Failed to update order status");
        return response.json();
    },

    // Admin: Orders
    getAllOrders: async () => {
        const response = await fetch(`${API_URL}/orders`, { headers });
        if (!response.ok) throw new Error("Failed to fetch all orders");
        return response.json();
    },

    // Admin: Products
    createProduct: async (productData: any) => {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers,
            body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error("Failed to create product");
        return response.json();
    },

    updateProduct: async (id: string, productData: any) => {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PATCH',
            headers,
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
            body: formData, // No JSON headers for multipart
        });
        if (!response.ok) throw new Error("Upload failed");
        return response.json();
    },

    deleteProduct: async (id: string) => {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers
        });
        if (!response.ok) throw new Error("Failed to delete product");
        return response.json();
    },

    // Payment
    initializePayment: async (email: string, amount: number) => {
        const response = await fetch(`${API_URL}/payment/initialize`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ email, amount })
        })
        return response.json()
    },

    verifyPayment: async (reference: string) => {
        const response = await fetch(`${API_URL}/payment/verify/${reference}`, { headers })
        return response.json()
    },

    // Riders
    getRiders: async () => {
        const response = await fetch(`${API_URL}/riders`, { headers });
        if (!response.ok) throw new Error("Failed to fetch riders");
        return response.json();
    },

    createRider: async (riderData: any) => {
        const response = await fetch(`${API_URL}/riders`, {
            method: 'POST',
            headers,
            body: JSON.stringify(riderData)
        });
        if (!response.ok) throw new Error("Failed to create rider");
        return response.json();
    },

    updateRider: async (id: string, riderData: any) => {
        const response = await fetch(`${API_URL}/riders/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(riderData)
        });
        if (!response.ok) throw new Error("Failed to update rider");
        return response.json();
    },

    assignRiderToOrder: async (orderId: string, riderId: string) => {
        const response = await fetch(`${API_URL}/orders/${orderId}/assign-rider`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ riderId }),
        });
        if (!response.ok) throw new Error("Failed to assign rider");
        return response.json();
    },

    deleteRider: async (id: string) => {
        const response = await fetch(`${API_URL}/riders/${id}`, {
            method: 'DELETE',
            headers
        });
        if (!response.ok) throw new Error("Failed to delete rider");
        return response.json();
    },

    // Settings
    getSettings: async () => {
        const response = await fetch(`${API_URL}/settings`, { headers });
        if (!response.ok) throw new Error("Failed to fetch settings");
        return response.json();
    },

    updateSettings: async (settingsData: any) => {
        const response = await fetch(`${API_URL}/settings`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(settingsData),
        });
        if (!response.ok) throw new Error("Failed to update settings");
        return response.json();
    },

    // Notifications
    getVapidPublicKey: async () => {
        const response = await fetch(`${API_URL}/notifications/vapid-public-key`, { headers });
        if (!response.ok) throw new Error("Failed to get VAPID key");
        return response.json();
    },

    subscribeToPush: async (email: string, subscription: any) => {
        const response = await fetch(`${API_URL}/notifications/subscribe`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ email, subscription })
        });
        if (!response.ok) throw new Error("Subscription failed");
        return response.json();
    },

    // Ratings
    submitRating: async (ratingData: { orderId: string, rating: number, comment?: string }) => {
        const response = await fetch(`${API_URL}/ratings`, {
            method: 'POST',
            headers,
            body: JSON.stringify(ratingData)
        });
        if (!response.ok) throw new Error("Failed to submit rating");
        return response.json();
    },

    getAllRatings: async () => {
        const response = await fetch(`${API_URL}/ratings`, { headers });
        if (!response.ok) throw new Error("Failed to fetch ratings");
        return response.json();
    }
};
