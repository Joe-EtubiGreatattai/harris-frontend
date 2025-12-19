import { Box, Flex, Text, IconButton, Image, Button, VStack, Separator, Input, HStack } from "@chakra-ui/react"
import { IoChevronBack, IoReceiptOutline, IoRefresh, IoHomeOutline, IoBriefcaseOutline, IoNotificationsOutline, IoNotifications } from "react-icons/io5"
import { pushNotificationService } from "../services/pushNotificationService"
import { useNavigate } from "react-router-dom"
import { useUser } from "../context/UserContext"
import { useCart } from "../context/CartContext"

export const ProfilePage = () => {
    const navigate = useNavigate()
    const { user, orderHistory, updateSavedAddress } = useUser()
    const { addItemsToCart, clearCart } = useCart()

    const handleReorder = (items: any[]) => {
        clearCart() // Clear current cart first? Or append? Usually reorder replaces or adds. Let's append to keep it simple, or maybe clear to avoid confusion. User request said "simple reorder".
        // Let's clear first to ensure a clean state for the reorder typically expected.
        clearCart()
        addItemsToCart(items)
        navigate('/cart')
    }

    return (
        <Box pb={20} bg="gray.50" minH="100vh">
            {/* Header */}
            <Flex align="center" px={6} py={6} bg="white" shadow="sm" position="sticky" top={0} zIndex={10}>
                <IconButton
                    aria-label="Back"
                    variant="ghost"
                    onClick={() => navigate('/')}
                >
                    <IoChevronBack size={24} />
                </IconButton>
                <Text fontWeight="bold" fontSize="lg" flex={1} textAlign="center" mr={10}>My Profile</Text>
            </Flex>

            {/* User Info */}
            <Flex direction="column" align="center" py={8} px={6} bg="white" mb={4}>
                <Image
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                    w="100px"
                    h="100px"
                    borderRadius="full"
                    mb={4}
                    border="4px solid"
                    borderColor="red.100"
                />
                <Text fontWeight="bold" fontSize="xl" color="gray.800">
                    {user?.email ? user.email.split('@')[0] : "Guest User"}
                </Text>
                <Text color="gray.500" fontSize="sm">
                    {user?.email || "No email set"}
                </Text>
                <Text color="gray.400" fontSize="xs" mt={1} textAlign="center" maxW="200px">
                    {user?.address || "No address set"}
                </Text>
            </Flex>

            {/* Saved Addresses */}
            <Box px={6} mb={8}>
                <Text fontWeight="bold" fontSize="lg" mb={4} color="gray.800">Saved Addresses</Text>
                <VStack gap={3} align="stretch">
                    <Box bg="white" p={4} borderRadius="2xl" shadow="sm">
                        <HStack gap={4} mb={2}>
                            <Flex bg="red.50" p={2} borderRadius="xl" color="red.500">
                                <IoHomeOutline size={20} />
                            </Flex>
                            <Box flex={1}>
                                <Text fontWeight="bold" fontSize="sm">Home</Text>
                                <Input
                                    variant="subtle"
                                    placeholder="Set home address"
                                    value={user?.savedAddresses?.home || ""}
                                    onChange={(e) => updateSavedAddress('home', e.target.value)}
                                    size="sm"
                                    px={0}
                                    bg="transparent"
                                    border="none"
                                    _focus={{ border: "none", ring: "0" }}
                                />
                            </Box>
                        </HStack>
                    </Box>

                    <Box bg="white" p={4} borderRadius="2xl" shadow="sm">
                        <HStack gap={4} mb={2}>
                            <Flex bg="blue.50" p={2} borderRadius="xl" color="blue.500">
                                <IoBriefcaseOutline size={20} />
                            </Flex>
                            <Box flex={1}>
                                <Text fontWeight="bold" fontSize="sm">Work</Text>
                                <Input
                                    variant="subtle"
                                    placeholder="Set work address"
                                    value={user?.savedAddresses?.work || ""}
                                    onChange={(e) => updateSavedAddress('work', e.target.value)}
                                    size="sm"
                                    px={0}
                                    bg="transparent"
                                    border="none"
                                    _focus={{ border: "none", ring: "0" }}
                                />
                            </Box>
                        </HStack>
                    </Box>
                </VStack>
            </Box>

            {/* Order History */}
            <Box px={6}>
                <Text fontWeight="bold" fontSize="lg" mb={4} color="gray.800">Past Orders</Text>

                {orderHistory.length === 0 ? (
                    <Flex direction="column" align="center" justify="center" py={10} bg="white" borderRadius="2xl" shadow="sm">
                        <IoReceiptOutline size={48} color="#CBD5E0" />
                        <Text color="gray.400" mt={4}>No past orders yet</Text>
                    </Flex>
                ) : (
                    <VStack gap={4} align="stretch">
                        {orderHistory.map(order => (
                            <Box key={order.id} bg="white" p={4} borderRadius="2xl" shadow="sm">
                                <Flex justify="space-between" mb={2}>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.500">{order.date}</Text>
                                    <Text fontWeight="bold" fontSize="sm" color={order.status === "Delivered" ? "green.500" : "orange.500"}>
                                        {order.status}
                                    </Text>
                                </Flex>
                                <Separator mb={3} borderColor="gray.100" />

                                <VStack align="stretch" gap={2} mb={4}>
                                    {order.items.map((item, idx) => (
                                        <Text key={idx} fontSize="sm" color="gray.800">
                                            {item.quantity}x {item.name} <Text as="span" color="gray.400" fontSize="xs">({item.size})</Text>
                                        </Text>
                                    ))}
                                </VStack>

                                <Flex justify="space-between" align="center" mt={2}>
                                    <Text fontWeight="black" fontSize="lg" color="gray.800">
                                        ₦{order.total.toLocaleString()}
                                    </Text>
                                    <Button
                                        size="sm"
                                        colorPalette="red"
                                        variant="outline"
                                        borderRadius="full"
                                        onClick={() => handleReorder(order.items)}
                                    >
                                        <IoRefresh style={{ marginRight: '8px' }} /> Reorder
                                    </Button>
                                </Flex>
                            </Box>
                        ))}
                    </VStack>
                )}
            </Box>
        </Box>
    )
}
