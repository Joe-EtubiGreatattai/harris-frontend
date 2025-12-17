const API_URL = "https://valrie-intermolar-smartly.ngrok-free.dev/api";

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
    }
};
