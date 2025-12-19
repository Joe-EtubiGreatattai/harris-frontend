import { Box, Flex, Text, Button, VStack, HStack, Badge, Image, IconButton, Skeleton } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { IoRefresh, IoAdd, IoPencil, IoTrash, IoPerson } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { ProductModal } from "../components/admin/ProductModal";
import { RiderModal } from "../components/admin/RiderModal";
import { socket } from "../services/socket";

export const AdminPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [riders, setRiders] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>({ deliveryFee: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isRiderModalOpen, setIsRiderModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'riders' | 'settings'>('orders');
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

        socket.on('productCreated', (newProduct: any) => {
            setProducts((prev) => [newProduct, ...prev]);
        });

        socket.on('productUpdated', (updatedProduct: any) => {
            setProducts((prev) =>
                prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
            );
        });

        socket.on('productDeleted', ({ id }: { id: string }) => {
            setProducts((prev) => prev.filter(p => p.id !== id));
        });

        socket.on('riderUpdated', (updatedRider: any) => {
            setRiders((prev) =>
                prev.map(r => r._id === updatedRider._id ? updatedRider : r)
            );
        });

        return () => {
            socket.off('newOrder');
            socket.off('orderUpdated');
            socket.off('productUpdated');
            socket.off('riderUpdated');
        };
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [ordersData, productsData, ridersData, settingsData] = await Promise.all([
                api.getAllOrders(),
                api.getProducts(),
                api.getRiders(),
                api.getSettings()
            ]);
            setOrders(ordersData);
            setProducts(productsData);
            setRiders(ridersData);
            setSettings(settingsData);
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

    const handleAssignRider = async (orderId: string, riderId: string) => {
        try {
            await api.assignRiderToOrder(orderId, riderId);
            // Socket will handle UI update
        } catch (error) {
            alert("Assignment failed");
        }
    };

    const handleToggleSuspension = async (riderId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'Suspended' ? 'Available' : 'Suspended';
            await api.updateRider(riderId, { status: newStatus });
            alert(`Rider ${newStatus === 'Suspended' ? 'suspended' : 'unsuspended'}`);
            fetchData();
        } catch (error) {
            alert("Failed to update rider status");
        }
    };

    const handleSaveProduct = async (productData: any) => {
        try {
            const isExisting = products.some(p => p.id === productData.id);

            if (isExisting) {
                // Strip internal _id and __v to avoid Mongo errors
                const { _id, __v, ...cleanData } = productData;
                await api.updateProduct(productData.id, cleanData);
            } else {
                await api.createProduct(productData);
                alert("Product created");
            }
            fetchData();
        } catch (error) {
            console.error("Operation failed", error);
            throw error;
        }
    };

    const handleSaveRider = async (riderData: any) => {
        try {
            await api.createRider(riderData);
            alert("Rider added");
            fetchData();
        } catch (error) {
            alert("Failed to add rider");
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

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.updateSettings(settings);
            alert("Settings updated successfully");
        } catch (error) {
            alert("Failed to update settings");
        }
    };

    const handleDeleteRider = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.deleteRider(id);
            alert("Rider deleted");
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
            <Box p={{ base: 4, md: 8 }} bg="gray.50" minH="100vh">
                <Flex justify="space-between" align="center" mb={8}>
                    <Skeleton height="40px" width="250px" borderRadius="lg" />
                    <HStack gap={4}>
                        <Skeleton height="40px" width="100px" borderRadius="lg" />
                        <Skeleton height="40px" width="100px" borderRadius="lg" />
                    </HStack>
                </Flex>
                <Skeleton height="400px" borderRadius="2xl" />
            </Box>
        );
    }

    return (
        <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 8 }}>
            <Flex justify="space-between" align={{ base: "start", md: "center" }} mb={8} direction={{ base: "column", md: "row" }} gap={4}>
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">Admin Dashboard</Text>
                <HStack w={{ base: "full", md: "auto" }} justify={{ base: "space-between", md: "flex-end" }}>
                    <Button onClick={fetchData} variant="outline" gap={2} size={{ base: "sm", md: "md" }}>
                        <IoRefresh /> Refresh
                    </Button>
                    <Button onClick={handleLogout} colorScheme="red" variant="ghost" size={{ base: "sm", md: "md" }}>
                        Logout
                    </Button>
                </HStack>
            </Flex>

            {/* Custom Tab Switcher */}
            <Box overflowX="auto" pb={2} mb={6} css={{
                '&::-webkit-scrollbar': { display: 'none' },
                '-ms-overflow-style': 'none',
                'scrollbar-width': 'none'
            }}>
                <Flex bg="white" p={1} borderRadius="xl" width="fit-content" shadow="sm" gap={1}>
                    <Button
                        variant={activeTab === 'orders' ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 'orders' ? 'red' : 'gray'}
                        onClick={() => setActiveTab('orders')}
                        borderRadius="lg"
                        size={{ base: "sm", md: "md" }}
                        whiteSpace="nowrap"
                    >
                        Orders ({orders.length})
                    </Button>
                    <Button
                        variant={activeTab === 'products' ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 'products' ? 'red' : 'gray'}
                        onClick={() => setActiveTab('products')}
                        borderRadius="lg"
                        size={{ base: "sm", md: "md" }}
                        whiteSpace="nowrap"
                    >
                        Products ({products.length})
                    </Button>
                    <Button
                        variant={activeTab === 'riders' ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 'riders' ? 'red' : 'gray'}
                        onClick={() => setActiveTab('riders')}
                        borderRadius="lg"
                        size={{ base: "sm", md: "md" }}
                        whiteSpace="nowrap"
                    >
                        Riders ({riders.length})
                    </Button>
                    <Button
                        variant={activeTab === 'settings' ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 'settings' ? 'red' : 'gray'}
                        onClick={() => setActiveTab('settings')}
                        borderRadius="lg"
                        size={{ base: "sm", md: "md" }}
                        whiteSpace="nowrap"
                    >
                        Settings
                    </Button>
                </Flex>
            </Box>

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

                                <VStack align="start" pl={3} borderLeft="2px solid" borderColor="gray.100" my={3} gap={1}>
                                    {order.items.map((item: any, idx: number) => (
                                        <Text key={idx} fontSize="xs">
                                            {item.quantity}x {item.name} ({item.size}) {item.extras?.length > 0 && `+ ${item.extras.join(', ')}`}
                                        </Text>
                                    ))}
                                </VStack>

                                <Flex mt={3} justify="space-between" align={{ base: "stretch", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
                                    <VStack align="start" gap={2}>
                                        <Text fontSize="xs" fontWeight="bold" color="gray.600">User: {order.user.email} | {order.user.phone || "No Phone"} | {order.user.address}</Text>
                                        <HStack w="full">
                                            <Text fontSize="sm" minW="45px">Rider:</Text>
                                            <Box border="1px solid" borderColor="gray.200" borderRadius="md" px={2} h="36px" display="flex" alignItems="center" flex={1} maxW={{ md: "200px" }}>
                                                <select
                                                    style={{
                                                        fontSize: "14px",
                                                        background: "transparent",
                                                        outline: "none",
                                                        width: "100%",
                                                        cursor: (order.status !== 'Ready for Delivery' && order.status !== 'Out for Delivery') ? 'not-allowed' : 'pointer'
                                                    }}
                                                    value={order.assignedRider?._id || order.assignedRider || ""}
                                                    onChange={(e) => handleAssignRider(order.orderId, e.target.value)}
                                                    disabled={order.status !== 'Ready for Delivery' && order.status !== 'Out for Delivery'}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {riders.filter(r => r.status !== 'Suspended' || (order.assignedRider?._id === r._id || order.assignedRider === r._id)).map(r => (
                                                        <option key={r._id} value={r._id}>{r.name} ({r.status})</option>
                                                    ))}
                                                </select>
                                            </Box>
                                        </HStack>
                                    </VStack>
                                    <HStack justify={{ base: "flex-end", md: "flex-end" }} w={{ base: "full", md: "auto" }}>
                                        {/* Status Controls */}
                                        {order.status !== 'Delivered' && (
                                            <>
                                                {/* Only Users can mark Delivered now. Admin can move to other states like 'Preparing', 'Out for Delivery' */}
                                                {order.status === 'Pending' && (
                                                    <Button size="sm" colorScheme="orange" onClick={() => handleUpdateStatus(order.orderId, "Preparing")} w={{ base: "full", md: "auto" }}>
                                                        Preparing
                                                    </Button>
                                                )}
                                                {order.status === 'Preparing' && (
                                                    <Button size="sm" colorScheme="blue" onClick={() => handleUpdateStatus(order.orderId, "Ready for Delivery")} w={{ base: "full", md: "auto" }}>
                                                        Mark as Ready
                                                    </Button>
                                                )}
                                                {order.status === 'Ready for Delivery' && (
                                                    <Button
                                                        size="sm"
                                                        colorScheme="red"
                                                        onClick={() => handleUpdateStatus(order.orderId, "Out for Delivery")}
                                                        disabled={!order.assignedRider}
                                                        w={{ base: "full", md: "auto" }}
                                                    >
                                                        Dispatch
                                                    </Button>
                                                )}
                                                {order.status === 'Out for Delivery' && (
                                                    <Button size="sm" variant="outline" colorScheme="green" onClick={() => handleUpdateStatus(order.orderId, "Delivered")} w={{ base: "full", md: "auto" }}>
                                                        Mark Delivered
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
                                <Box key={product._id} w={{ base: "full", sm: "calc(50% - 8px)", lg: "250px" }} bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" overflow="hidden" shadow="sm">
                                    <Box position="relative">
                                        <Image src={product.image} h={{ base: "180px", md: "150px" }} w="full" objectFit="cover" opacity={product.isAvailable ? 1 : 0.5} />
                                        {!product.isAvailable && (
                                            <Badge
                                                position="absolute"
                                                top={2}
                                                right={2}
                                                colorScheme="red"
                                                variant="solid"
                                            >
                                                Unavailable
                                            </Badge>
                                        )}
                                    </Box>
                                    <Box p={4}>
                                        <HStack justify="space-between" mb={2}>
                                            <HStack gap={2}>
                                                <Badge>{product.category}</Badge>
                                                <Badge colorScheme="blue" variant="outline" fontSize="9px">{product.salesCount || 0} sales</Badge>
                                            </HStack>
                                            <Text fontWeight="bold" color="red.500">
                                                {typeof product.prices === 'object' && Object.keys(product.prices).length > 0 ? (
                                                    <>
                                                        {Object.keys(product.prices).length > 1 && <Text as="span" fontSize="2xs" color="gray.400" mr={1}>Starting at</Text>}
                                                        ₦{Math.min(...Object.values(product.prices) as number[]).toLocaleString()}
                                                    </>
                                                ) : (
                                                    `₦${product.price || 0}`
                                                )}
                                            </Text>
                                        </HStack>
                                        <Text fontWeight="bold" mb={1} truncate>{product.name}</Text>
                                        <Text fontSize="xs" color="gray.500" mb={4} lineClamp={2}>{product.description}</Text>

                                        <VStack align="stretch" gap={3} mt={2}>
                                            <Flex justify="space-between" align="center">
                                                <HStack gap={2}>
                                                    <Button size="sm" onClick={() => openEditModal(product)} p={2}>
                                                        <IoPencil />
                                                    </Button>
                                                    <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleDeleteProduct(product.id)} p={2}>
                                                        <IoTrash />
                                                    </Button>
                                                </HStack>
                                                <Button
                                                    size="xs"
                                                    colorScheme={product.isAvailable !== false ? "red" : "green"}
                                                    variant="ghost"
                                                    onClick={() => handleSaveProduct({ ...product, isAvailable: !product.isAvailable })}
                                                    fontWeight="bold"
                                                    px={2}
                                                >
                                                    {product.isAvailable !== false ? "Mark as Unavailable" : "Mark as Available"}
                                                </Button>
                                            </Flex>
                                        </VStack>
                                    </Box>
                                </Box>
                            ))}
                        </Flex>
                    </Box>
                )}

                {activeTab === 'riders' && (
                    <Box>
                        <Button colorScheme="red" mb={6} onClick={() => setIsRiderModalOpen(true)} gap={2}>
                            <IoAdd /> Add New Rider
                        </Button>

                        <VStack gap={4} align="stretch">
                            {riders.map((rider) => (
                                <Box key={rider._id} p={4} bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" shadow="sm">
                                    <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
                                        <HStack gap={4}>
                                            <Box p={3} bg="gray.50" borderRadius="full">
                                                <IoPerson size={24} />
                                            </Box>
                                            <Box>
                                                <Text fontWeight="bold" fontSize="lg">{rider.name}</Text>
                                                <Text fontSize="xs" color="gray.500">{rider.email}</Text>
                                                <Text fontSize="xs" color="gray.500">{rider.phone}</Text>
                                            </Box>
                                        </HStack>
                                        <Flex gap={3} w={{ base: "full", md: "auto" }} justify={{ base: "space-between", md: "flex-end" }} align="center">
                                            <Badge colorScheme={rider.status === 'Available' ? 'green' : rider.status === 'Busy' ? 'orange' : rider.status === 'Suspended' ? 'red' : 'gray'}>
                                                {rider.status}
                                            </Badge>
                                            <HStack gap={2}>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    colorScheme={rider.status === 'Suspended' ? 'green' : 'orange'}
                                                    onClick={() => handleToggleSuspension(rider._id, rider.status)}
                                                >
                                                    {rider.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}
                                                </Button>
                                                <IconButton
                                                    aria-label="Delete rider"
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteRider(rider._id)}
                                                >
                                                    <IoTrash />
                                                </IconButton>
                                            </HStack>
                                        </Flex>
                                    </Flex>
                                </Box>
                            ))}
                            {riders.length === 0 && <Text color="gray.500">No riders found.</Text>}
                        </VStack>
                    </Box>
                )}

                {activeTab === 'settings' && (
                    <Box maxW="500px" bg="white" p={6} borderRadius="xl" shadow="sm">
                        <Text fontSize="xl" fontWeight="bold" mb={6}>Global Settings</Text>
                        <VStack as="form" gap={4} align="stretch" onSubmit={handleUpdateSettings}>
                            <Box>
                                <Text fontWeight="bold" mb={2}>Delivery Fee (₦)</Text>
                                <Box border="1px solid" borderColor="gray.200" borderRadius="md" px={3} h="45px" display="flex" alignItems="center">
                                    <input
                                        type="number"
                                        style={{ width: '100%', outline: 'none' }}
                                        value={settings.deliveryFee}
                                        onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                                    />
                                </Box>
                                <Text fontSize="xs" color="gray.500" mt={1}>This fee will be applied to all customer orders at checkout.</Text>
                            </Box>
                            <Button type="submit" colorScheme="red" size="lg" mt={2}>
                                Save Settings
                            </Button>
                        </VStack>
                    </Box>
                )}
            </Box>

            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                product={editingProduct}
                onSave={handleSaveProduct}
            />

            <RiderModal
                isOpen={isRiderModalOpen}
                onClose={() => setIsRiderModalOpen(false)}
                onSave={handleSaveRider}
            />
        </Box >
    );
};
