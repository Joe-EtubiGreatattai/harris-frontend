import { Box, Flex, Text, VStack, Button, Badge, Image, IconButton } from "@chakra-ui/react"
import { IoClose, IoPerson, IoLocation, IoCall } from "react-icons/io5"
import { motion } from "framer-motion"
import React from "react"

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
}

export const OrderDetailsModal = ({ isOpen, onClose, order }: OrderDetailsModalProps) => {
    if (!isOpen || !order) return null;

    return (
        <Box
            position="fixed"
            top={0} left={0} right={0} bottom={0}
            bg="black/60"
            backdropFilter="blur(5px)"
            zIndex={200}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{ width: '100%', maxWidth: '600px' }}
                onClick={(e) => e.stopPropagation()}
            >
                <Box
                    bg="white"
                    borderRadius="2xl"
                    overflow="hidden"
                    boxShadow="2xl"
                    maxH="90vh"
                    display="flex"
                    flexDirection="column"
                >
                    {/* Header */}
                    <Flex p={6} borderBottom="1px solid" borderColor="gray.100" justify="space-between" align="center" bg="gray.50">
                        <Box>
                            <Text fontSize="2xl" fontWeight="bold">Order Details</Text>
                            <Text color="gray.500">#{order.orderId}</Text>
                        </Box>
                        <IconButton
                            aria-label="Close"
                            variant="ghost"
                            borderRadius="full"
                            onClick={onClose}
                        >
                            <IoClose size={24} />
                        </IconButton>
                    </Flex>

                    {/* Scrollable Content */}
                    <Box p={6} overflowY="auto" flex={1}>
                        {/* Status Bar */}
                        <Flex mb={6} align="center" gap={3}>
                            <Badge
                                colorScheme={order.status === 'Delivered' ? 'green' : 'orange'}
                                fontSize="md"
                                px={3} py={1}
                                borderRadius="full"
                            >
                                {order.status}
                            </Badge>
                            <Text color="gray.500" fontSize="sm">
                                {new Date(order.createdAt).toLocaleString()}
                            </Text>
                        </Flex>

                        {/* Customer Info */}
                        <Box mb={8} bg="blue.50" p={4} borderRadius="xl">
                            <Text fontWeight="bold" mb={3} display="flex" alignItems="center" gap={2}>
                                <IoPerson /> Customer Information
                            </Text>
                            <SimpleRow label="Name/Email" value={order.user?.email || "N/A"} />
                            <SimpleRow label="Phone" value={order.user?.phone || "N/A"} icon={<IoCall />} />
                            <SimpleRow label="Address" value={order.user?.address || "N/A"} icon={<IoLocation />} />
                        </Box>

                        {/* Order Items */}
                        <Text fontWeight="bold" mb={4}>Items Ordered</Text>
                        <VStack gap={4} align="stretch" mb={8}>
                            {order.items.map((item: any, idx: number) => (
                                <Flex key={idx} gap={4} p={3} border="1px solid" borderColor="gray.100" borderRadius="xl">
                                    <Image
                                        src={item.image}
                                        w="60px"
                                        h="60px"
                                        objectFit="cover"
                                        borderRadius="lg"
                                        bg="gray.100"
                                    />
                                    <Box flex={1}>
                                        <Flex justify="space-between">
                                            <Text fontWeight="bold">{item.name}</Text>
                                            <Text fontWeight="bold">₦{(item.price * item.quantity).toLocaleString()}</Text>
                                        </Flex>
                                        <Text fontSize="sm" color="gray.600">
                                            Size: {item.size} • Qty: {item.quantity}
                                        </Text>
                                        {item.extras?.length > 0 && (
                                            <Text fontSize="xs" color="blue.500" mt={1}>
                                                + {item.extras.join(", ")}
                                            </Text>
                                        )}
                                    </Box>
                                </Flex>
                            ))}
                        </VStack>

                        {/* Summary */}
                        <Box borderTop="2px dashed" borderColor="gray.200" pt={4}>
                            <Flex justify="space-between" mb={2}>
                                <Text color="gray.500">Subtotal</Text>
                                <Text fontWeight="medium">₦{(order.total - (order.deliveryFee || 0)).toLocaleString()}</Text>
                            </Flex>
                            <Flex justify="space-between" mb={2}>
                                <Text color="gray.500">Delivery Fee</Text>
                                <Text fontWeight="medium">₦{(order.deliveryFee || 0).toLocaleString()}</Text>
                            </Flex>
                            <Flex justify="space-between" align="center" mt={4}>
                                <Text fontWeight="bold" fontSize="lg">Total Amount</Text>
                                <Text fontWeight="black" fontSize="2xl" color="red.500">
                                    ₦{order.total.toLocaleString()}
                                </Text>
                            </Flex>
                        </Box>
                    </Box>

                    {/* Footer */}
                    <Box p={4} borderTop="1px solid" borderColor="gray.100" bg="gray.50">
                        <Button w="full" onClick={onClose}>Close Details</Button>
                    </Box>
                </Box>
            </motion.div>
        </Box>
    );
};

// Helper
const SimpleRow = ({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) => (
    <Flex align="start" gap={2} mb={2}>
        <Flex align="center" gap={2} w="120px">
            {icon && <Box color="gray.400">{icon}</Box>}
            <Text fontSize="sm" color="gray.500">{label}:</Text>
        </Flex>
        <Text fontSize="sm" fontWeight="medium" flex={1}>{value}</Text>
    </Flex>
);
