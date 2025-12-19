import { Box, Flex, Text, Image, Button, IconButton, VStack, Center, Spinner } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { IoTimeOutline, IoCall, IoChevronBack, IoClose, IoWarning } from "react-icons/io5"
import { useUser } from "../context/UserContext"
import { useState, useEffect } from "react"
import type { Order } from "../context/UserContext"
import { OrderProgress } from "../components/tracking/OrderProgress"
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from "framer-motion"

// Persistent Timer Component
const OrderTimer = ({ createdAt, isBusy }: { createdAt: string, isBusy?: boolean }) => {
    const [timeLeft, setTimeLeft] = useState(0)

    useEffect(() => {
        const calculateTime = () => {
            const start = new Date(createdAt).getTime()
            const now = new Date().getTime()
            const elapsed = Math.floor((now - start) / 1000)
            const baseDuration = 45 * 60 // 45 minutes base
            const busyExtra = isBusy ? 20 * 60 : 0 // 20 extra minutes if busy
            const duration = baseDuration + busyExtra
            return Math.max(0, duration - elapsed)
        }

        setTimeLeft(calculateTime())
        const timer = setInterval(() => {
            setTimeLeft(calculateTime())
        }, 1000)

        return () => clearInterval(timer)
    }, [createdAt, isBusy])

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

const listContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const listItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

export const TrackingPage = () => {
    const navigate = useNavigate()
    const { activeOrders, completeOrder, isLoadingOrders } = useUser()
    const [showConfirm, setShowConfirm] = useState<Order | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const isBusy = activeOrders.length > 5

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

    const handleCompleteOrder = (orderId: string) => {
        completeOrder(orderId)
        setShowConfirm(null)
        // Trigger Confetti
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#E53E3E', '#F6E05E', '#FFFFFF']
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Box pb={20} bg="gray.50" minH="100vh">
                {/* Header */}
                <Flex align="center" px={6} py={6} bg="white" shadow="sm" position="sticky" top={0} zIndex={10}>
                    <IconButton
                        aria-label="Back"
                        variant="ghost"
                        color="gray.800"
                        onClick={() => navigate('/')}
                        _hover={{ bg: "gray.100" }}
                    >
                        <IoChevronBack size={24} />
                    </IconButton>
                    <Text fontWeight="bold" fontSize="lg" color="gray.800" flex={1} textAlign="center" mr={10}>Track Orders</Text>
                </Flex>

                <Flex direction="column" p={6} gap={6}>
                    <AnimatePresence>
                        {isBusy && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                            >
                                <Flex
                                    bg="yellow.400"
                                    p={4}
                                    borderRadius="2xl"
                                    align="center"
                                    gap={3}
                                    boxShadow="lg"
                                >
                                    <IoWarning size={24} color="gray.800" />
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="gray.800">High Demand Today</Text>
                                        <Text fontSize="xs" color="gray.700">Kitchen is busy! Delivery might take a bit longer.</Text>
                                    </Box>
                                </Flex>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        variants={listContainer}
                        initial="hidden"
                        animate="show"
                    >
                        <VStack align="stretch" gap={6}>
                            {activeOrders.map(order => (
                                <motion.div key={`${order.id}-${order.status}`} variants={listItem}>
                                    <Box
                                        bg="white"
                                        borderRadius="3xl"
                                        p={4}
                                        shadow="sm"
                                        border="1px solid"
                                        borderColor="gray.100"
                                        onClick={() => setSelectedOrder(order)} // Click to view details
                                        cursor="pointer"
                                        _hover={{ shadow: "md" }}
                                        transition="all 0.2s"
                                    >
                                        <OrderProgress status={order.status} />

                                        <Flex justify="space-between" align="center" mb={4}>
                                            <Text fontWeight="bold" color="gray.800">Order #{order.id}</Text>
                                            <Text fontSize="sm" color="gray.500">{order.items.length} items • ₦{order.total.toLocaleString()}</Text>
                                        </Flex>

                                        {/* Single Main Item Image or Stack */}
                                        <Center position="relative" my={4}>
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <Image
                                                    src={order.items[0]?.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"}
                                                    w="200px"
                                                    h="200px"
                                                    objectFit="cover"
                                                    borderRadius="full"
                                                    border="4px solid white"
                                                    boxShadow="2xl"
                                                    animation="pulse 2s infinite"
                                                />
                                            </motion.div>
                                            {(order.status === 'Preparing' || order.status === 'Ready for Delivery' || order.status === 'Out for Delivery') ? (
                                                <OrderTimer createdAt={order.createdAt} isBusy={isBusy} />
                                            ) : null}
                                        </Center>

                                        {/* Delivery Person - Simplified */}
                                        {(order.status === 'Ready for Delivery' || order.status === 'Out for Delivery') && order.assignedRider && (
                                            <Box w="full" bg="white" borderRadius="2xl" p={4} color="gray.800" shadow="lg" mt={4}>
                                                <Flex align="center">
                                                    <Image
                                                        src={order.assignedRider.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
                                                        w="40px"
                                                        h="40px"
                                                        borderRadius="full"
                                                        mr={3}
                                                        objectFit="cover"
                                                    />
                                                    <Box flex={1}>
                                                        <Text fontWeight="bold" fontSize="sm">{order.assignedRider.name}</Text>
                                                        <Text color="gray.500" fontSize="xs">Rider Assigned</Text>
                                                    </Box>
                                                    <IconButton
                                                        aria-label="Call Rider"
                                                        variant="ghost"
                                                        colorScheme="red"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.location.href = `tel:${order.assignedRider?.phone}`;
                                                        }}
                                                    >
                                                        <IoCall size={16} />
                                                    </IconButton>
                                                </Flex>

                                                <Button
                                                    w="full"
                                                    bg="red.500"
                                                    color="white"
                                                    borderRadius="xl"
                                                    size="sm"
                                                    mt={3}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowConfirm(order);
                                                    }}
                                                >
                                                    Mark as Received
                                                </Button>
                                            </Box>
                                        )}
                                    </Box>
                                </motion.div>
                            ))}
                        </VStack>
                    </motion.div>
                </Flex>

                {/* Confirmation Modal */}
                <AnimatePresence>
                    {showConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
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
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
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
                                        boxShadow="2xl"
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
                                                onClick={() => handleCompleteOrder(showConfirm.id)}
                                            >
                                                Yes, Received!
                                            </Button>
                                        </Flex>
                                    </Box>
                                </motion.div>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Order Details Modal */}
                <AnimatePresence>
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
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                style={{ width: '100%', maxWidth: '448px' }}
                            >
                                <Box
                                    bg="white"
                                    borderTopRadius="3xl"
                                    p={6}
                                    w="full"
                                    maxH="80vh"
                                    overflowY="auto"
                                    color="gray.800"
                                    onClick={(e) => e.stopPropagation()}
                                    mb={0}
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
                                            <IoClose size={24} />
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
                                        <Flex justify="space-between" mb={2}>
                                            <Text color="gray.500">Subtotal</Text>
                                            <Text fontWeight="bold">₦{(selectedOrder.total - (selectedOrder.deliveryFee || 0)).toLocaleString()}</Text>
                                        </Flex>
                                        <Flex justify="space-between" mb={4}>
                                            <Text color="gray.500">Delivery Fee</Text>
                                            <Text fontWeight="bold">₦{(selectedOrder.deliveryFee || 0).toLocaleString()}</Text>
                                        </Flex>
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
                            </motion.div>
                        </Box>
                    )}
                </AnimatePresence>
            </Box>
        </motion.div>
    )
}
