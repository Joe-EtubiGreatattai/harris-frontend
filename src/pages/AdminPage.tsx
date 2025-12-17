import { Box, Flex, Text, Button, VStack, HStack, Badge, Spinner, Image } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { ProductModal } from "../components/admin/ProductModal";
import { IoAdd, IoPencil, IoTrash, IoRefresh } from "react-icons/io5";
import { socket } from "../services/socket"; // Import socket

export const AdminPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();

        // Socket.IO Listeners
        socket.on('newOrder', (newOrder: any) => {
            setOrders((prevOrders) => [newOrder, ...prevOrders]);
        });

        socket.on('orderUpdated', (updatedOrder: any) => {
            setOrders((prevOrders) =>
                prevOrders.map(order =>
                    order._id === updatedOrder._id || order.orderId === updatedOrder.orderId
                        ? updatedOrder
                        : order
                )
            );
        });

        return () => {
            socket.off('newOrder');
            socket.off('orderUpdated');
        };
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [ordersData, productsData] = await Promise.all([
                api.getAllOrders(),
                api.getProducts()
            ]);
            setOrders(ordersData);
            setProducts(productsData);
        } catch (error) {
            console.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            // Optimistic update
            setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o));
            await api.updateOrderStatus(orderId, status);
            // Socket will confirm the update, but optimistic makes it feel instant
        } catch (error) {
            alert("Update failed");
            fetchData(); // Revert on error
        }
    };

    const handleSaveProduct = async (productData: any) => {
        try {
            if (editingProduct) {
                await api.updateProduct(editingProduct.id, productData);
                alert("Product updated");
            } else {
                await api.createProduct(productData);
                alert("Product created");
            }
            fetchData();
        } catch (error) {
            alert("Operation failed");
            throw error;
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.deleteProduct(id);
            alert("Product deleted");
            fetchData();
        } catch (error) {
            alert("Delete failed");
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const openEditModal = (product: any) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    if (isLoading) {
        return (
            <Flex justify="center" align="center" h="100vh">
                <Spinner size="xl" color="red.500" />
            </Flex>
        );
    }

    return (
        <Box minH="100vh" bg="gray.50" p={8}>
            <Flex justify="space-between" align="center" mb={8}>
                <Text fontSize="3xl" fontWeight="bold">Admin Dashboard</Text>
                <HStack>
                    <Button onClick={fetchData} variant="outline" gap={2}>
                        <IoRefresh /> Refresh
                    </Button>
                    <Button onClick={handleLogout} colorScheme="red" variant="ghost">
                        Logout
                    </Button>
                </HStack>
            </Flex>

            {/* Custom Tab Switcher */}
            <Flex mb={6} bg="white" p={1} borderRadius="xl" width="fit-content" shadow="sm">
                <Button
                    variant={activeTab === 'orders' ? 'solid' : 'ghost'}
                    colorScheme={activeTab === 'orders' ? 'red' : 'gray'}
                    onClick={() => setActiveTab('orders')}
                    borderRadius="lg"
                >
                    Orders ({orders.length})
                </Button>
                <Button
                    variant={activeTab === 'products' ? 'solid' : 'ghost'}
                    colorScheme={activeTab === 'products' ? 'red' : 'gray'}
                    onClick={() => setActiveTab('products')}
                    borderRadius="lg"
                >
                    Products ({products.length})
                </Button>
            </Flex>

            {/* Content Area */}
            <Box>
                {activeTab === 'orders' && (
                    <VStack gap={4} align="stretch">
                        {orders.map((order) => (
                            <Box key={order._id} p={4} bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" shadow="sm">
                                <Flex justify="space-between" align="start" mb={2} direction={{ base: 'column', md: 'row' }} gap={2}>
                                    <Box>
                                        <HStack mb={1}>
                                            <Text fontWeight="bold" fontSize="lg">Order #{order.orderId}</Text>
                                            <Badge colorScheme={order.status === 'Delivered' ? 'green' : 'orange'}>{order.status}</Badge>
                                        </HStack>
                                        <Text fontSize="sm" color="gray.500">{new Date(order.createdAt).toLocaleString()} • {order.items.length} items</Text>
                                    </Box>
                                    <Text fontWeight="bold" fontSize="xl" color="red.500">₦{order.total.toLocaleString()}</Text>
                                </Flex>

                                <VStack align="start" pl={4} borderLeft="2px solid" borderColor="gray.100" my={3}>
                                    {order.items.map((item: any, idx: number) => (
                                        <Text key={idx} fontSize="sm">
                                            {item.quantity}x {item.name} ({item.size}) {item.extras?.length > 0 && `+ ${item.extras.join(', ')}`}
                                        </Text>
                                    ))}
                                </VStack>

                                <Flex mt={3} justify="space-between" align="center" wrap="wrap" gap={3}>
                                    <Text fontSize="sm" fontWeight="bold">User: {order.user.email} | {order.user.address}</Text>
                                    <HStack>
                                        {/* Status Controls */}
                                        {order.status !== 'Delivered' && (
                                            <>
                                                {/* Only Users can mark Delivered now. Admin can move to other states like 'Preparing', 'Out for Delivery' */}
                                                {order.status !== 'Preparing' && (
                                                    <Button size="sm" onClick={() => handleUpdateStatus(order.orderId, "Preparing")}>
                                                        Prepare
                                                    </Button>
                                                )}
                                                {order.status !== 'Out for Delivery' && (
                                                    <Button size="sm" onClick={() => handleUpdateStatus(order.orderId, "Out for Delivery")}>
                                                        Dispatch
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </HStack>
                                </Flex>
                            </Box>
                        ))}
                        {orders.length === 0 && <Text color="gray.500">No orders found.</Text>}
                    </VStack>
                )}

                {activeTab === 'products' && (
                    <Box>
                        <Button colorScheme="red" mb={6} onClick={openAddModal} gap={2}>
                            <IoAdd /> Add New Product
                        </Button>

                        <Flex wrap="wrap" gap={4}>
                            {products.map((product) => (
                                <Box key={product._id} w="250px" bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" overflow="hidden" shadow="sm">
                                    <Image src={product.image} h="150px" w="full" objectFit="cover" />
                                    <Box p={4}>
                                        <HStack justify="space-between" mb={2}>
                                            <Badge>{product.category}</Badge>
                                            <Text fontWeight="bold" color="red.500">
                                                ₦{typeof product.prices === 'object' ? (product.prices.M || product.prices.Standard || 0).toLocaleString() : product.price}
                                            </Text>
                                        </HStack>
                                        <Text fontWeight="bold" mb={1} truncate>{product.name}</Text>
                                        <Text fontSize="xs" color="gray.500" mb={4} lineClamp={2}>{product.description}</Text>

                                        <HStack>
                                            <Button size="sm" onClick={() => openEditModal(product)}>
                                                <IoPencil />
                                            </Button>
                                            <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleDeleteProduct(product.id)}>
                                                <IoTrash />
                                            </Button>
                                        </HStack>
                                    </Box>
                                </Box>
                            ))}
                        </Flex>
                    </Box>
                )}
            </Box>

            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                product={editingProduct}
                onSave={handleSaveProduct}
            />
        </Box>
    );
};
