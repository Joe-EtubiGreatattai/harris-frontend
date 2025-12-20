import { Box, Flex, Text, Button, IconButton, Image, Separator, useDisclosure, Input, HStack, Badge } from "@chakra-ui/react"
import { useState } from "react"
import { IoAdd, IoRemove, IoTrash, IoChevronBack } from "react-icons/io5"
import { useCart } from "../context/CartContext"
import { useUser } from "../context/UserContext"
import { useNavigate } from "react-router-dom"
import { CheckoutModal } from "../components/cart/CheckoutModal"
import { api } from "../services/api"
import { motion, AnimatePresence } from "framer-motion"

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
}

export const CartPage = () => {
    const navigate = useNavigate()
    const { items, updateQuantity, removeFromCart, getCartTotal, applyPromoCode, discount, appliedPromoCode, applicableCategories, deliveryFee } = useCart()
    const { user } = useUser()
    const { open, onOpen, onClose } = useDisclosure()

    const [promoInput, setPromoInput] = useState("")
    const [promoError, setPromoError] = useState<string | null>(null)

    const [isApplyingPromo, setIsApplyingPromo] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)


    const subtotal = getCartTotal()
    const discountAmount = (subtotal * discount) / 100
    const total = subtotal - discountAmount + deliveryFee

    const handleApplyPromo = async () => {
        if (!promoInput) return;
        setIsApplyingPromo(true);
        const result = await applyPromoCode(promoInput);
        if (result.success) {
            setPromoError(null);
        } else {
            setPromoError(result.message || "Invalid promo code");
        }
        setIsApplyingPromo(false);
    }

    const handleCheckout = () => {
        // ALWAYS open modal to confirm address
        onOpen()
    }

    const proceedToOrder = async () => {
        if (!user) return;

        setIsSubmitting(true)
        try {
            const orderData = {
                orderId: Math.random().toString(36).substr(2, 9),
                user: {
                    email: user.email,
                    address: user.address,
                    phone: user.phone
                },
                items: items.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    size: item.size,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    category: item.category,
                    extras: item.extras,
                    note: item.note
                })),
                deliveryFee: deliveryFee,
                promoCode: appliedPromoCode,
                total: total,
                status: "Pending",
                date: new Date().toLocaleDateString('en-GB')
            }

            // 1. Initialize Payment
            const payment = await api.initializePayment(user.email, total, {
                orderData: orderData
            })

            if (payment && payment.status && payment.data.authorization_url) {
                // 2. Save pending order to local storage (as fallback/for immediate UI if needed)
                localStorage.setItem('pendingOrder', JSON.stringify(orderData))

                // 3. Redirect to Paystack
                window.location.href = payment.data.authorization_url
            } else {
                alert("Failed to initialize payment")
                setIsSubmitting(false)
            }
        } catch (err) {
            console.error("Payment initialization failed", err)
            alert("Payment initialization error")
            setIsSubmitting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Box pb={0} bg="gray.50" minH="100vh">
                <Flex align="center" px={6} py={6} bg="white" shadow="sm" position="sticky" top={0} zIndex={10}>
                    <IconButton
                        aria-label="Back"
                        variant="ghost"
                        onClick={() => navigate(-1)}
                    >
                        <IoChevronBack size={24} />
                    </IconButton>
                    <Text fontWeight="bold" fontSize="lg" flex={1} textAlign="center" mr={10}>My Cart</Text>
                </Flex>

                <Box p={6}>
                    {items.length === 0 ? (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{ width: "100%", textAlign: "center", paddingTop: "60px" }}
                        >
                            <Box position="relative" mb={8} display="inline-block">
                                {/* Sad Cart Animation */}
                                <motion.div
                                    animate={{
                                        y: [0, -8, 0],
                                        rotate: [-1, 1, -1]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Text fontSize="100px" lineHeight="1">🛍️</Text>
                                </motion.div>

                                {/* Sad eyes/mouth effect using absolute positioning if needed, or just the emoji */}
                            </Box>

                            <Text fontSize="3xl" fontWeight="black" color="gray.800" mb={3} letterSpacing="tight">
                                Your Cart feels light
                            </Text>
                            <Text color="gray.500" fontSize="lg" maxW="300px" mx="auto" mb={10} lineHeight="tall">
                                Add some delicious items to make it happy again!
                            </Text>

                            <Button
                                size="lg"
                                height="70px"
                                px={12}
                                fontSize="xl"
                                bg="red.500"
                                color="white"
                                borderRadius="2xl"
                                _hover={{ bg: "red.600", transform: "scale(1.05)" }}
                                _active={{ transform: "scale(0.95)" }}
                                shadow="xl"
                                onClick={() => navigate('/')}
                                transition="all 0.2s"
                            >
                                Browse Menu
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="show">
                            <AnimatePresence mode="popLayout">
                                {items.map(item => (
                                    <motion.div key={item.id} variants={itemVariants} layout exit={{ opacity: 0, x: 20 }}>
                                        <Flex bg="white" p={4} borderRadius="2xl" mb={4} shadow="sm" align="center">
                                            <Image src={item.image} w="80px" h="80px" borderRadius="xl" objectFit="cover" mr={4} />
                                            <Box flex={1}>
                                                <Text fontWeight="bold" fontSize="md" color="gray.800" lineClamp={1}>{item.name}</Text>
                                                <Text color="gray.400" fontSize="xs" mb={1}>Size {item.size} • {item.extras.length > 0 ? `+${item.extras.length} extras` : 'No extras'}</Text>
                                                <Text fontWeight="bold" fontSize="md" color="red.500">₦{item.price.toLocaleString()}</Text>
                                            </Box>
                                            <Flex direction="column" align="flex-end" gap={2}>
                                                <Flex align="center" gap={3} bg="gray.100" borderRadius="full" px={3} py={1}>
                                                    {item.quantity === 1 ? (
                                                        <IoTrash size={16} color="#E53E3E" cursor="pointer" onClick={() => removeFromCart(item.id)} />
                                                    ) : (
                                                        <IoRemove size={16} color="#A0AEC0" cursor="pointer" onClick={() => updateQuantity(item.id, -1)} />
                                                    )}
                                                    <Text fontWeight="bold" fontSize="sm" color="gray.800">{item.quantity}</Text>
                                                    <IoAdd size={16} color="#2D3748" cursor="pointer" onClick={() => updateQuantity(item.id, 1)} />
                                                </Flex>
                                            </Flex>
                                        </Flex>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                    <Box h="350px" />
                </Box>

                {/* Summary */}
                <AnimatePresence>
                    {items.length > 0 && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20 }}
                            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20 }}
                        >
                            <Box bg="white" p={8} borderTopRadius="3xl" shadow="dark-lg" maxW="md" mx="auto">
                                {/* Promo Code Input */}
                                <Box mb={6}>
                                    <HStack gap={2}>
                                        <Input
                                            placeholder="Promo Code"
                                            value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value)}
                                            borderRadius="xl"
                                            bg="gray.50"
                                            border="none"
                                        />
                                        <Button
                                            colorScheme="red"
                                            variant="subtle"
                                            borderRadius="xl"
                                            onClick={handleApplyPromo}
                                            loading={isApplyingPromo}
                                        >
                                            Apply
                                        </Button>
                                    </HStack>
                                    {promoError && <Text color="red.500" fontSize="xs" mt={1}>{promoError}</Text>}
                                    {appliedPromoCode && (
                                        <Flex mt={2} align="center" gap={2}>
                                            <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2}>
                                                {appliedPromoCode} Applied
                                            </Badge>
                                            <Text fontSize="xs" color="green.600">
                                                -{discount}% off {applicableCategories.length > 0 ? `on ${applicableCategories.join(', ')}` : 'items'}
                                            </Text>
                                        </Flex>
                                    )}
                                </Box>

                                <Flex justify="space-between" mb={3}>
                                    <Text color="gray.500">Subtotal</Text>
                                    <Text fontWeight="bold" color="gray.800">₦{subtotal.toLocaleString()}</Text>
                                </Flex>
                                {discount > 0 && (
                                    <Flex justify="space-between" mb={3}>
                                        <Text color="green.600">Discount ({appliedPromoCode})</Text>
                                        <Text fontWeight="bold" color="green.600">-₦{discountAmount.toLocaleString()}</Text>
                                    </Flex>
                                )}
                                <Flex justify="space-between" mb={5}>
                                    <Text color="gray.500">Delivery</Text>
                                    <Text fontWeight="bold" color="gray.800">₦{deliveryFee.toLocaleString()}</Text>
                                </Flex>
                                <Separator mb={6} borderColor="gray.100" />
                                <Flex justify="space-between" mb={8}>
                                    <Text fontWeight="bold" fontSize="xl" color="gray.800">Total</Text>
                                    <Text fontWeight="bold" fontSize="2xl" color="gray.800">₦{total.toLocaleString()}</Text>
                                </Flex>

                                <Button
                                    bg="black"
                                    color="white"
                                    w="full"
                                    size="lg"
                                    borderRadius="xl"
                                    py={7}
                                    fontSize="lg"
                                    _hover={{ bg: "gray.800" }}
                                    onClick={handleCheckout}
                                >
                                    Checkout
                                </Button>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Checkout Modal */}
                <CheckoutModal
                    isOpen={open}
                    onClose={onClose}
                    onConfirm={proceedToOrder}
                    isLoading={isSubmitting}
                />
            </Box>
        </motion.div>
    )
}
