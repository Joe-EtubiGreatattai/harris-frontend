import { Box, Flex, Text, Button, VStack, HStack, Badge, Image, IconButton, Skeleton, Input } from "@chakra-ui/react";
import { toaster } from "../components/ui/toaster";
import { useState, useEffect } from "react";
import { IoRefresh, IoAdd, IoPencil, IoTrash, IoPerson, IoMegaphone, IoWallet, IoSearch, IoPeople, IoQrCode } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { ProductModal } from "../components/admin/ProductModal";
import { ReviewsTab } from "../components/admin/ReviewsTab";
import { RiderModal } from "../components/admin/RiderModal";
import { OrderDetailsView } from "../components/admin/OrderDetailsView";
import { CampaignTab } from "../components/admin/CampaignTab";
import { WithdrawalTab } from "../components/admin/WithdrawalTab";
import { TransactionsTab } from "../components/admin/TransactionsTab";
import { UsersTab } from "../components/admin/UsersTab";
import { RiderMapTab } from "../components/admin/RiderMapTab";
import { socket } from "../services/socket";
import { NewOrderAlert } from "../components/admin/NewOrderAlert";
import { QRCodeTab } from "../components/admin/QRCodeTab";
import { WaiterAlert } from "../components/admin/WaiterAlert";

export const AdminPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [riders, setRiders] = useState<any[]>([]);
    const [ratings, setRatings] = useState<any[]>([]);
    const [promos, setPromos] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>({ deliveryFee: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isRiderModalOpen, setIsRiderModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null); // For details view
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'riders' | 'users' | 'map' | 'settings' | 'reviews' | 'campaign' | 'withdrawals' | 'transactions' | 'qr'>('orders');
    const [newOrderPopup, setNewOrderPopup] = useState<any>(null);
    const [waiterCall, setWaiterCall] = useState<string | null>(null);
    const navigate = useNavigate();

    // Derived state: Filter out Pending Payment orders from Admin view
    const paidOrders = orders.filter(o => o.status !== 'Pending Payment');

    // Filter by search query
    const filteredOrders = paidOrders.filter(order => {
        const query = searchQuery.toLowerCase();
        const customer = order.user || {};
        return (
            order.orderId?.toLowerCase().includes(query) ||
            customer.email?.toLowerCase().includes(query) ||
            customer.address?.toLowerCase().includes(query) ||
            (order.date && order.date.toLowerCase().includes(query)) ||
            new Date(order.createdAt).toLocaleDateString().toLowerCase().includes(query)
        );
    });

    useEffect(() => {
        fetchData();

        // Socket.IO Listeners
        socket.on('newOrder', (newOrder: any) => {
            setOrders((prevOrders) => [newOrder, ...prevOrders]);
            setNewOrderPopup(newOrder); // Trigger the prominent alert
            toaster.create({
                title: "New Order Received!",
                description: `Order #${newOrder.orderId} - ₦${newOrder.total.toLocaleString()}`,
                type: "success",
                duration: 5000,
            });

            // Play notification sound
            const audio = new Audio('/notification.mp3'); // Assuming file exists or just skipping audio for now if uncertain
            audio.play().catch(e => console.log("Audio play failed", e));
        });

        socket.on('waiterCalled', (data: { table: string, time: Date }) => {
            setWaiterCall(data.table);
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log("Audio play failed", e));
        });

        socket.on('orderUpdated', (updatedOrder: any) => {
            setOrders((prevOrders) =>
                prevOrders.map(order =>
                    order._id === updatedOrder._id || order.orderId === updatedOrder.orderId
                        ? updatedOrder
                        : order
                )
            );

            // Also update selected view if it matches
            setSelectedOrder((prev: any) => {
                if (prev && (prev._id === updatedOrder._id || prev.orderId === updatedOrder.orderId)) {
                    return updatedOrder;
                }
                return prev;
            });
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

        socket.on('riderCreated', (newRider: any) => {
            setRiders((prev) => [newRider, ...prev]);
        });

        socket.on('riderDeleted', ({ _id }: { _id: string }) => {
            setRiders((prev) => prev.filter(r => r._id !== _id));
        });

        socket.on('ratingCreated', (newRating: any) => {
            setRatings((prev) => [newRating, ...prev]);
        });

        socket.on('promoCreated', (newPromo: any) => {
            setPromos((prev) => [newPromo, ...prev]);
        });

        socket.on('promoUpdated', (updatedPromo: any) => {
            setPromos((prev) =>
                prev.map(p => p._id === updatedPromo._id ? updatedPromo : p)
            );
        });

        socket.on('promoDeleted', ({ _id }: { _id: string }) => {
            setPromos((prev) => prev.filter(p => p._id !== _id));
        });

        socket.on('settingsUpdated', (newSettings: any) => {
            setSettings(newSettings);
        });

        socket.on('adminOrderPinged', (data: { orderId: string, userEmail: string }) => {
            toaster.create({
                title: "User Pinged Kitchen!",
                description: `Order #${data.orderId} - ${data.userEmail} is asking for an update.`,
                type: "warning",
                duration: 10000,
                action: {
                    label: "Acknowledge",
                    onClick: async () => {
                        try {
                            await api.acknowledgePing(data.orderId);
                            toaster.create({
                                title: "Acknowledged",
                                description: "User has been notified.",
                                type: "success"
                            });
                            fetchData();
                        } catch (err) {
                            alert("Failed to acknowledge");
                        }
                    }
                }
            });
            // Play a different sound or re-fetch to show ping status
            fetchData();
        });

        return () => {
            socket.off('newOrder');
            socket.off('waiterCalled');
            socket.off('orderUpdated');
            socket.off('productUpdated');
            socket.off('riderCreated');
            socket.off('riderUpdated');
            socket.off('riderDeleted');
            socket.off('ratingCreated');
            socket.off('promoCreated');
            socket.off('promoUpdated');
            socket.off('promoDeleted');
            socket.off('settingsUpdated');
        };
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [ordersData, productsData, ridersData, settingsData, ratingsData, promosData] = await Promise.all([
                api.getAllOrders(),
                api.getProducts(),
                api.getRiders(),
                api.getSettings(),
                api.getAllRatings(),
                api.getAllPromos()
            ]);
            setOrders(ordersData);
            setProducts(productsData);
            setRiders(ridersData);
            setSettings(settingsData);
            setRatings(ratingsData);
            setPromos(promosData);
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
            await api.updateOrderStatus(orderId, status, "Admin");
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

    const handleUpdateSettings = async (e?: React.FormEvent, manualData?: any) => {
        if (e) e.preventDefault();
        const dataToSave = manualData || settings;
        try {
            await api.updateSettings(dataToSave);
            toaster.create({
                title: "Success",
                description: "Settings updated successfully",
                type: "success"
            });
            if (manualData) setSettings(manualData);
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

    const handleViewOrder = (orderId: string) => {
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
            setSelectedOrder(order);
        } else {
            console.warn("Order not found for ID:", orderId);
            // Optional: You could fetch the specific order from API if not in the list
        }
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

    // FULL PAGE VIEW FOR ORDER DETAILS
    if (selectedOrder) {
        return (
            <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 8 }}>
                <OrderDetailsView
                    order={selectedOrder}
                    onBack={() => setSelectedOrder(null)}
                />
            </Box>
        );
    }

    return (
        <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 8 }}>
            <NewOrderAlert
                order={newOrderPopup}
                onClose={() => setNewOrderPopup(null)}
                onView={(orderId) => {
                    handleViewOrder(orderId);
                    setNewOrderPopup(null);
                }}
            />
            <WaiterAlert
                table={waiterCall || ""}
                onClose={() => setWaiterCall(null)}
            />
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
                        Orders ({paidOrders.length})
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
                        variant={activeTab === 'users' ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 'users' ? 'red' : 'gray'}
                        onClick={() => setActiveTab('users')}
                        borderRadius="lg"
                        size={{ base: "sm", md: "md" }}
                        whiteSpace="nowrap"
                    >
                        <HStack gap={2}>
                            <IoPeople />
                            <Text>Users</Text>
                        </HStack>
                    </Button>
                    <Button
                        variant={activeTab === 'qr' ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 'qr' ? 'red' : 'gray'}
                        onClick={() => setActiveTab('qr')}
                        borderRadius="lg"
                        size={{ base: "sm", md: "md" }}
                        whiteSpace="nowrap"
                    >
                        <HStack gap={2}>
                            <IoQrCode />
                            <Text>Tables / QR</Text>
                        </HStack>
                    </Button>
                    <Button
                        variant={activeTab === 'map' ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 'map' ? 'red' : 'gray'}
                        onClick={() => setActiveTab('map')}
                        borderRadius="lg"
                        size={{ base: "sm", md: "md" }}
                        whiteSpace="nowrap"
                    >
                        Map View
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
                    <Button
                        variant={activeTab === 'reviews' ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 'reviews' ? 'red' : 'gray'}
                        onClick={() => setActiveTab('reviews')}
                        borderRadius="lg"
                        size={{ base: "sm", md: "md" }}
                        whiteSpace="nowrap"
                    >
                        Reviews ({ratings.length})
                    </Button>
                    <Button
                        variant={activeTab === 'campaign' ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 'campaign' ? 'red' : 'gray'}
                        onClick={() => setActiveTab('campaign')}
                        borderRadius="lg"
                        size={{ base: "sm", md: "md" }}
                        whiteSpace="nowrap"
                    >
                        <HStack gap={2}>
                            <IoMegaphone />
                            <Text>Campaign</Text>
                        </HStack>
                    </Button>
                    <Button
                        variant={activeTab === 'withdrawals' ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 'withdrawals' ? 'red' : 'gray'}
                        onClick={() => setActiveTab('withdrawals')}
                        borderRadius="lg"
                        size={{ base: "sm", md: "md" }}
                        whiteSpace="nowrap"
                    >
                        <HStack gap={2}>
                            <IoWallet />
                            <Text>Withdrawals</Text>
                        </HStack>
                    </Button>
                    <Button
                        variant={activeTab === 'transactions' ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 'transactions' ? 'red' : 'gray'}
                        onClick={() => setActiveTab('transactions')}
                        borderRadius="lg"
                        size={{ base: "sm", md: "md" }}
                        whiteSpace="nowrap"
                    >
                        Transactions
                    </Button>
                </Flex>
            </Box>

            {/* Content Area */}
            <Box>
                {activeTab === 'orders' && (
                    <VStack gap={4} align="stretch">
                        <Box mb={4} position="relative" maxW="400px">
                            <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={1} color="gray.400">
                                <IoSearch size={18} />
                            </Box>
                            <Input
                                placeholder="Search orders..."
                                pl={10}
                                h="40px"
                                bg="white"
                                borderRadius="lg"
                                shadow="sm"
                                border="1px solid"
                                borderColor="gray.100"
                                _focus={{ borderColor: "red.500", shadow: "md" }}
                                fontSize="sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Box>

                        {filteredOrders.map((order) => (
                            <Box key={order._id} p={4} bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" shadow="sm">
                                <Flex justify="space-between" align={{ base: "start", md: "center" }} mb={2} direction={{ base: 'column', md: 'row' }} gap={2}>
                                    <Box>
                                        <HStack mb={1} wrap="wrap">
                                            <Text fontWeight="bold" fontSize="lg">Order #{order.orderId}</Text>
                                            <Badge colorScheme={order.status === 'Delivered' ? 'green' : 'orange'}>{order.status}</Badge>
                                            {order.deliveryMethod === 'Pick-up' && <Badge colorScheme="purple">PICK-UP</Badge>}
                                            {order.pings?.some((p: any) => !p.acknowledged) && (
                                                <Badge colorScheme="red" variant="solid" animation="pulse 2s infinite">PINGED!</Badge>
                                            )}
                                        </HStack>
                                        <Text fontSize="xs" color="gray.500">{new Date(order.createdAt).toLocaleString()} • {order.items.length} items</Text>
                                    </Box>
                                    <VStack align="flex-end" gap={0}>
                                        <Text fontWeight="bold" fontSize="xl" color="red.500">₦{order.total.toLocaleString()}</Text>
                                        {order.pings?.some((p: any) => !p.acknowledged) && (
                                            <Button
                                                size="xs"
                                                colorScheme="red"
                                                mt={1}
                                                onClick={() => {
                                                    api.acknowledgePing(order.orderId).then(() => fetchData())
                                                }}
                                            >
                                                Acknowledge Ping
                                            </Button>
                                        )}
                                    </VStack>
                                </Flex>

                                <VStack align="start" pl={3} borderLeft="2px solid" borderColor="gray.100" my={3} gap={1}>
                                    {order.items.map((item: any, idx: number) => (
                                        <Text key={idx} fontSize="xs">
                                            {item.quantity}x {item.name} ({item.size}) {item.extras?.length > 0 && `+ ${item.extras.join(', ')}`}
                                        </Text>
                                    ))}
                                </VStack>

                                <Flex mt={4} justify="space-between" align={{ base: "stretch", lg: "flex-end" }} direction={{ base: "column", lg: "row" }} gap={5}>
                                    <VStack align="start" gap={3} flex={1}>
                                        <Box w="full">
                                            <Text fontSize="2xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>Customer Info</Text>
                                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={0.5}>{order.user.email}</Text>
                                            <Text fontSize="xs" color="gray.500" mb={1}>{order.user.phone || "No Phone"}</Text>
                                            <Text fontSize="xs" color="gray.500" fontStyle="italic" lineClamp={2}>{order.user.address}</Text>
                                        </Box>

                                        <HStack w="full" maxW={{ md: "250px" }}>
                                            <Text fontSize="xs" fontWeight="bold" color="gray.400" minW="45px">RIDER:</Text>
                                            <Box border="1px solid" borderColor="gray.200" borderRadius="md" px={2} h="36px" display="flex" alignItems="center" flex={1} bg="gray.50">
                                                <select
                                                    style={{
                                                        fontSize: "13px",
                                                        background: "transparent",
                                                        outline: "none",
                                                        width: "100%",
                                                        cursor: (order.status !== 'Ready for Delivery' && order.status !== 'Out for Delivery') ? 'not-allowed' : 'pointer',
                                                        fontWeight: "500"
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

                                    <Flex direction={{ base: "column", sm: "row" }} gap={2} w={{ base: "full", lg: "auto" }}>
                                        {/* Status Controls */}
                                        {order.status !== 'Delivered' && (
                                            <>
                                                {order.status === 'Pending' && (
                                                    <Button size="sm" colorScheme="orange" onClick={() => handleUpdateStatus(order.orderId, "Preparing")} w={{ base: "full", sm: "auto" }}>
                                                        Preparing
                                                    </Button>
                                                )}
                                                {order.status === 'Preparing' && (
                                                    <Button size="sm" colorScheme="blue" onClick={() => handleUpdateStatus(order.orderId, "Ready for Delivery")} w={{ base: "full", sm: "auto" }}>
                                                        Mark as Ready
                                                    </Button>
                                                )}
                                                {order.status === 'Ready for Delivery' && (
                                                    <Button
                                                        size="sm"
                                                        colorScheme="red"
                                                        onClick={() => handleUpdateStatus(order.orderId, "Out for Delivery")}
                                                        disabled={!order.assignedRider}
                                                        w={{ base: "full", sm: "auto" }}
                                                    >
                                                        Dispatch
                                                    </Button>
                                                )}
                                                {order.status === 'Out for Delivery' && (
                                                    <Button size="sm" variant="outline" colorScheme="green" onClick={() => handleUpdateStatus(order.orderId, "Delivered")} w={{ base: "full", sm: "auto" }}>
                                                        Mark Delivered
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                        <Button size="sm" variant="ghost" onClick={() => handleViewOrder(order.orderId)} w={{ base: "full", sm: "auto" }} border="1px solid" borderColor="gray.200">
                                            View Details
                                        </Button>
                                    </Flex>
                                </Flex>
                            </Box>
                        ))}
                        {filteredOrders.length === 0 && (
                            <Text color="gray.500" textAlign="center" py={10}>
                                {searchQuery ? `No orders matching "${searchQuery}"` : "No paid orders found."}
                            </Text>
                        )}
                    </VStack>
                )}

                {activeTab === 'products' && (
                    <Box>
                        <Button colorScheme="red" mb={6} onClick={openAddModal} gap={2}>
                            <IoAdd /> Add New Product
                        </Button>

                        {/* Grouped Products */}
                        {Object.entries(
                            products.reduce((acc: any, product) => {
                                const cat = product.category || 'Uncategorized';
                                if (!acc[cat]) acc[cat] = [];
                                acc[cat].push(product);
                                return acc;
                            }, {})
                        ).map(([category, catProducts]: [string, any]) => (
                            <Box key={category} mb={10}>
                                <Text fontSize="xl" fontWeight="bold" mb={4} color="gray.700" borderBottom="2px solid" borderColor="red.100" pb={2} width="fit-content">
                                    {category}
                                </Text>
                                <Flex wrap="wrap" gap={4}>
                                    {catProducts.map((product: any) => (
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
                        ))}
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

                {activeTab === 'users' && (
                    <UsersTab />
                )}

                {activeTab === 'qr' && (
                    <QRCodeTab />
                )}

                {activeTab === 'map' && (
                    <RiderMapTab />
                )}

                {activeTab === 'settings' && (
                    <Box maxW="500px" bg="white" p={6} borderRadius="xl" shadow="sm">
                        <Text fontSize="xl" fontWeight="bold" mb={6}>Global Settings</Text>
                        <VStack as="form" gap={6} align="stretch" onSubmit={handleUpdateSettings}>
                            <Box borderBottom="1px solid" borderColor="gray.100" pb={4}>
                                <Text fontWeight="bold" mb={2}>Store Status</Text>
                                <HStack gap={4}>
                                    <Badge
                                        colorPalette={settings.isOpen !== false ? "green" : "red"}
                                        variant="solid"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="sm"
                                    >
                                        {settings.isOpen !== false ? "OPEN" : "CLOSED"}
                                    </Badge>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            const newStatus = settings.isOpen === false ? true : false;
                                            handleUpdateSettings({ preventDefault: () => { } } as any, { ...settings, isOpen: newStatus });
                                        }}
                                    >
                                        Switch to {settings.isOpen !== false ? "Closed" : "Open"}
                                    </Button>
                                </HStack>
                                <Text fontSize="xs" color="gray.500" mt={2}>
                                    Closing the store will prevent customers from placing new orders.
                                </Text>
                            </Box>

                            <Box borderBottom="1px solid" borderColor="gray.100" pb={4}>
                                <Text fontWeight="bold" mb={4}>Opening Hours</Text>
                                <Flex gap={4}>
                                    <Box flex={1}>
                                        <Text fontSize="xs" color="gray.500" mb={1}>Opening Time</Text>
                                        <Input
                                            type="time"
                                            value={settings.openingTime || "08:00"}
                                            onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                                            borderRadius="lg"
                                        />
                                    </Box>
                                    <Box flex={1}>
                                        <Text fontSize="xs" color="gray.500" mb={1}>Closing Time</Text>
                                        <Input
                                            type="time"
                                            value={settings.closingTime || "22:00"}
                                            onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                                            borderRadius="lg"
                                        />
                                    </Box>
                                </Flex>
                                <Text fontSize="xs" color="gray.500" mt={2}>
                                    Store will automatically show as closed outside these hours.
                                </Text>
                            </Box>

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

                {activeTab === 'reviews' && (
                    <ReviewsTab ratings={ratings} onViewOrder={handleViewOrder} />
                )}

                {activeTab === 'campaign' && (
                    <CampaignTab
                        promos={promos}
                        categories={[...new Set(products.map(p => p.category))]}
                        onRefresh={fetchData}
                    />
                )}

                {activeTab === 'withdrawals' && (
                    <WithdrawalTab />
                )}

                {activeTab === 'transactions' && (
                    <TransactionsTab />
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
