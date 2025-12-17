import { Box, Flex, Text, Button, IconButton, Image, Separator, useDisclosure } from "@chakra-ui/react"
import { useState } from "react"
import { IoAdd, IoRemove, IoTrash, IoChevronBack } from "react-icons/io5"
import { useCart } from "../context/CartContext"
import { useUser } from "../context/UserContext"
import { useNavigate } from "react-router-dom"
import { CheckoutModal } from "../components/cart/CheckoutModal"
import { api } from "../services/api"

export const CartPage = () => {
    const navigate = useNavigate()
    const { items, updateQuantity, removeFromCart, getCartTotal } = useCart()
    const { user } = useUser()
    const { open, onOpen, onClose } = useDisclosure()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const subtotal = getCartTotal()
    const deliveryFee = 500
    const total = subtotal + deliveryFee

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
                    address: user.address
                },
                items: items.map(item => ({
                    productId: item.id,
                    name: item.name,
                    size: item.size,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    category: item.category,
                    extras: item.extras,
                    note: item.note
                })),
                total: total,
                status: "Pending",
                date: new Date().toLocaleDateString('en-GB')
            }

            // 1. Initialize Payment
            const payment = await api.initializePayment(user.email, total)

            if (payment && payment.status && payment.data.authorization_url) {
                // 2. Save pending order to local storage
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
                    <Flex direction="column" align="center" justify="center" py={20}>
                        <Text color="gray.400" fontSize="lg" mb={4}>Your cart is empty</Text>
                        <Button colorScheme="red" variant="outline" onClick={() => navigate('/')}>
                            See Menu
                        </Button>
                    </Flex>
                ) : (
                    items.map(item => (
                        <Flex key={item.id} bg="white" p={4} borderRadius="2xl" mb={4} shadow="sm" align="center">
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
                    ))
                )}
                <Box h="350px" />
            </Box>

            {/* Summary */}
            {items.length > 0 && (
                <Box position="fixed" bottom={0} left={0} right={0} bg="white" p={8} borderTopRadius="3xl" shadow="dark-lg" maxW="md" mx="auto" zIndex={20}>
                    <Flex justify="space-between" mb={3}>
                        <Text color="gray.500">Subtotal</Text>
                        <Text fontWeight="bold" color="gray.800">₦{subtotal.toLocaleString()}</Text>
                    </Flex>
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
            )}

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={open}
                onClose={onClose}
                onConfirm={proceedToOrder}
                isLoading={isSubmitting}
            />
        </Box>
    )
}
