import { Box, Flex, Text, Image, Button, IconButton, VStack, Center, Spinner } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { IoTimeOutline, IoCall, IoChevronBack } from "react-icons/io5"
import { useUser } from "../context/UserContext"
import { useState, useEffect } from "react"
import type { Order } from "../context/UserContext"
import { socket } from "../services/socket"

// Persistent Timer Component
const OrderTimer = ({ createdAt }: { createdAt: string }) => {
    const [timeLeft, setTimeLeft] = useState(0)

    useEffect(() => {
        const calculateTime = () => {
            const start = new Date(createdAt).getTime()
            const now = new Date().getTime()
            const elapsed = Math.floor((now - start) / 1000)
            const duration = 60 * 60 // 60 minutes
            return Math.max(0, duration - elapsed)
        }

        setTimeLeft(calculateTime())
        const timer = setInterval(() => {
            setTimeLeft(calculateTime())
        }, 1000)

        return () => clearInterval(timer)
    }, [createdAt])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    return (
        <Flex
            position="absolute"
            bottom="10px"
            right="-10px"
            bg="white"
            color="red.500"
            px={4}
            py={2}
            borderRadius="full"
            align="center"
            gap={2}
            boxShadow="lg"
        >
            <IoTimeOutline size={20} />
            <Text fontWeight="bold">{formatTime(timeLeft)}</Text>
        </Flex>
    )
}

const getOrderMessage = (order: Order) => {
    const createdAt = new Date(order.createdAt).getTime()
    const now = new Date().getTime()
    const elapsedMins = Math.floor((now - createdAt) / 1000 / 60)

    // Check if order has only drinks
    const hasFood = order.items.some(item => item.category !== 'Drinks')

    if (elapsedMins < 2) return "Order Confirmed"

    if (hasFood) {
        if (elapsedMins < 10) return "Chef is preparing your meal"
        if (elapsedMins < 15) return "Boxing your delicious pizza"
        if (elapsedMins < 25) return "Quality check in progress"
    } else {
        // Drinks only
        if (elapsedMins < 5) return "Packing your drinks"
        if (elapsedMins < 10) return "Getting your cups ready"
    }

    return "Rider has moved out!"
}

export const TrackingPage = () => {
    const navigate = useNavigate()
    const { activeOrders, completeOrder, isLoadingOrders, updateLocalOrder } = useUser()
    const [showConfirm, setShowConfirm] = useState<{ id: string } | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    useEffect(() => {
        // Socket.IO Listener for Tracking Page
        socket.on('orderUpdated', (updatedOrder: any) => {
            // Handle ID mismatch (mongodb _id vs custom orderId)
            // The incoming updatedOrder might use _id, but our local order might use id (which is mapped to orderId or _id)
            // We'll normalize it in the context handler or just pass it through if compatible.
            // Our context handler checks id vs id.
            // ensure updatedOrder has 'id' property if it comes as '_id'
            const safeOrder = { ...updatedOrder, id: updatedOrder.orderId || updatedOrder._id };
            updateLocalOrder(safeOrder);
        });

        return () => {
            socket.off('orderUpdated');
        }
    }, [updateLocalOrder]);

    if (isLoadingOrders) {
        return (
            <Center h="100vh" bg="#E53E3E" color="white" flexDirection="column">
                <Spinner size="xl" color="white" mb={4} />
                <Text fontWeight="bold">Fetching your order...</Text>
            </Center>
        )
    }

    if (activeOrders.length === 0) {
        return (
            <Center h="100vh" bg="#E53E3E" color="white" flexDirection="column">
                <Text fontSize="2xl" fontWeight="bold" mb={4}>No active orders</Text>
                <Button bg="white" color="red.500" onClick={() => navigate('/')}>Back to Menu</Button>
            </Center>
        )
    }

    return (
        <Box minH="100vh" bg="#E53E3E" color="white" position="relative" overflowY="auto">
            {/* Decorators */}
            <Box position="absolute" top="-50px" left="-50px" w="200px" h="200px" bg="white" opacity="0.1" borderRadius="full" />
            <Box position="absolute" top="100px" right="-50px" w="100px" h="100px" bg="white" opacity="0.05" borderRadius="full" />

            {/* Back Button */}
            <Box position="absolute" top={6} left={6} zIndex={10}>
                <IconButton
                    aria-label="Back to Home"
                    variant="ghost"
                    onClick={() => navigate('/')}
                    bg="white/20"
                    color="white"
                    borderRadius="full"
                    _hover={{ bg: "white/30" }}
                    size="lg"
                >
                    <IoChevronBack size={24} />
                </IconButton>
            </Box>

            <Flex direction="column" pt={20} pb={8} px={6}>
                <Text textAlign="center" fontSize="3xl" fontWeight="bold" mb={6} lineHeight="1.2">
                    {activeOrders.length > 0 ? "Track your orders" : "No active orders"}
                </Text>

                <VStack gap={6} align="stretch" w="full" maxW="md" mx="auto">
                    {activeOrders.map((order) => (
                        <Box
                            key={order.id}
                            bg="white/10"
                            borderRadius="3xl"
                            p={4}
                            backdropFilter="blur(10px)"
                            border="1px solid rgba(255,255,255,0.2)"
                            onClick={() => setSelectedOrder(order)} // Click to view details
                            cursor="pointer"
                            _hover={{ bg: "white/20" }}
                            transition="all 0.2s"
                        >
                            <Center mb={4}>
                                <Text fontSize="xl" fontWeight="black" textAlign="center" color="white">
                                    {getOrderMessage(order)}
                                </Text>
                            </Center>

                            <Flex justify="space-between" align="center" mb={4}>
                                <Text fontWeight="bold" opacity={0.8}>Order #{order.id}</Text>
                                <Text fontSize="sm" opacity={0.8}>{order.items.length} items • ₦{order.total.toLocaleString()}</Text>
                            </Flex>

                            {/* Single Main Item Image or Stack */}
                            <Center position="relative" my={4}>
                                <Image
                                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                                    w="200px"
                                    h="200px"
                                    objectFit="cover"
                                    borderRadius="full"
                                    border="4px solid rgba(255,255,255,0.2)"
                                    boxShadow="2xl"
                                    animation="pulse 2s infinite"
                                />
                                <OrderTimer createdAt={order.createdAt} />
                            </Center>

                            {/* Delivery Person */}
                            <Box w="full" bg="white" borderRadius="2xl" p={4} color="gray.800" shadow="lg" mt={4}>
                                <Flex align="center" mb={4}>
                                    <Image src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" w="40px" h="40px" borderRadius="full" mr={3} objectFit="cover" />
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm">Robert Downey</Text>
                                        <Text color="gray.500" fontSize="xs">Delivery Man</Text>
                                    </Box>
                                    <Flex ml="auto" gap={2}>
                                        <Box
                                            p={2}
                                            bg="red.50"
                                            borderRadius="full"
                                            color="red.500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.location.href = "tel:+2348012345678";
                                            }}
                                            cursor="pointer"
                                            _hover={{ bg: "red.100" }}
                                        >
                                            <IoCall size={16} />
                                        </Box>
                                    </Flex>
                                </Flex>

                                <Button
                                    w="full"
                                    bg="red.500"
                                    color="white"
                                    borderRadius="xl"
                                    size="lg"
                                    fontWeight="bold"
                                    _hover={{ bg: "red.600" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowConfirm({ id: order.id });
                                    }}
                                >
                                    Received Order
                                </Button>
                            </Box>
                        </Box>
                    ))}
                </VStack>
            </Flex>

            {/* Confirmation Modal */}
            {showConfirm && (
                <Box
                    position="fixed"
                    top={0} left={0} right={0} bottom={0}
                    bg="black/60"
                    backdropFilter="blur(3px)"
                    zIndex={100}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    p={6}
                    onClick={() => setShowConfirm(null)}
                >
                    <Box
                        bg="white"
                        borderRadius="3xl"
                        p={6}
                        maxW="sm"
                        w="full"
                        color="gray.800"
                        onClick={(e) => e.stopPropagation()}
                        textAlign="center"
                    >
                        <Text fontWeight="bold" fontSize="xl" mb={2}>Confirm Receipt?</Text>
                        <Text color="gray.500" mb={6}>
                            Confirm active order #{showConfirm.id}?
                        </Text>

                        <Flex gap={3}>
                            <Button
                                flex={1}
                                variant="outline"
                                colorScheme="gray"
                                borderRadius="xl"
                                onClick={() => setShowConfirm(null)}
                            >
                                Not Yet
                            </Button>
                            <Button
                                flex={1}
                                bg="red.500"
                                color="white"
                                borderRadius="xl"
                                _hover={{ bg: "red.600" }}
                                onClick={() => {
                                    completeOrder(showConfirm.id)
                                    setShowConfirm(null)
                                }}
                            >
                                Yes, Received!
                            </Button>
                        </Flex>
                    </Box>
                </Box>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <Box
                    position="fixed"
                    top={0} left={0} right={0} bottom={0}
                    bg="black/80"
                    backdropFilter="blur(5px)"
                    zIndex={200}
                    display="flex"
                    alignItems="end" // Bottom sheet style on mobile, or center
                    justifyContent="center"
                    onClick={() => setSelectedOrder(null)}
                >
                    <Box
                        bg="white"
                        borderTopRadius="3xl"
                        borderBottomRadius={{ base: "0", md: "3xl" }}
                        p={6}
                        w="full"
                        maxW="md"
                        maxH="80vh"
                        overflowY="auto"
                        color="gray.800"
                        onClick={(e) => e.stopPropagation()}
                        animation="slideUp 0.3s ease-out"
                        mb={{ base: 0, md: "auto" }} // Center on desktop
                        mt={{ base: 0, md: "auto" }}
                    >
                        <Flex justify="space-between" align="center" mb={6}>
                            <Box>
                                <Text fontWeight="bold" fontSize="2xl">Order Details</Text>
                                <Text color="gray.500" fontSize="sm">#{selectedOrder.id}</Text>
                            </Box>
                            <IconButton
                                aria-label="Close"
                                variant="ghost"
                                onClick={() => setSelectedOrder(null)}
                                borderRadius="full"
                            >
                                <IoChevronBack transform="rotate(-90deg)" />
                            </IconButton>
                        </Flex>

                        <VStack gap={4} align="stretch" >
                            {selectedOrder.items.map((item, idx) => (
                                <Flex key={idx} gap={4}>
                                    <Image
                                        src={item.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200"}
                                        w="60px"
                                        h="60px"
                                        borderRadius="xl"
                                        objectFit="cover"
                                        bg="gray.100"
                                    />
                                    <Box flex={1}>
                                        <Flex justify="space-between" mb={1}>
                                            <Text fontWeight="bold">{item.name}</Text>
                                            <Text fontWeight="bold">₦{(item.price * item.quantity).toLocaleString()}</Text>
                                        </Flex>
                                        <Text fontSize="sm" color="gray.500">
                                            Size: {item.size} • Qty: {item.quantity}
                                        </Text>
                                        {item.extras && item.extras.length > 0 && (
                                            <Text fontSize="xs" color="red.500" mt={1}>
                                                + {item.extras.join(", ")}
                                            </Text>
                                        )}
                                    </Box>
                                </Flex>
                            ))}
                        </VStack>

                        <Box mt={8} pt={4} borderTop="2px dashed" borderColor="gray.200">
                            <Flex justify="space-between" align="center">
                                <Text fontWeight="bold" fontSize="lg">Total Paid</Text>
                                <Text fontWeight="black" fontSize="2xl" color="red.500">
                                    ₦{selectedOrder.total.toLocaleString()}
                                </Text>
                            </Flex>
                        </Box>

                        <Button
                            mt={6}
                            w="full"
                            size="lg"
                            bg="gray.900"
                            color="white"
                            borderRadius="xl"
                            onClick={() => setSelectedOrder(null)}
                        >
                            Close
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    )
}
