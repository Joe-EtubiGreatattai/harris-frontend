import { Box, Flex, Text, VStack, Button, Badge, Image, SimpleGrid, Icon } from "@chakra-ui/react"
import { IoArrowBack, IoPerson, IoLocation, IoCall, IoBicycle, IoTime, IoCalendar } from "react-icons/io5"
import React from "react"

interface OrderDetailsViewProps {
    order: any;
    onBack: () => void;
}

export const OrderDetailsView = ({ order, onBack }: OrderDetailsViewProps) => {
    if (!order) return null;

    return (
        <Box bg="gray.50" minH="calc(100vh - 100px)">
            {/* Header */}
            <Flex mb={{ base: 4, md: 6 }} justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
                <Button onClick={onBack} variant="ghost" gap={2} size={{ base: "sm", md: "md" }} p={{ base: 0, md: 2 }}>
                    <IoArrowBack /> Back to Dashboard
                </Button>
                <Flex align="center" gap={3} w={{ base: "full", md: "auto" }} justify={{ base: "space-between", md: "flex-end" }}>
                    <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>Order #{order.orderId}</Text>
                    <Badge
                        colorScheme={order.status === 'Delivered' ? 'green' : 'orange'}
                        fontSize={{ base: "xs", md: "md" }}
                        px={3} py={1}
                        borderRadius="full"
                    >
                        {order.status}
                    </Badge>
                </Flex>
            </Flex>

            {/* Timeline Section */}
            <Box bg="white" p={6} borderRadius="xl" shadow="sm" mb={8}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>Order Timeline</Text>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                    {/* Placed At */}
                    <Box>
                        <Flex align="center" gap={2} mb={1} color="gray.500">
                            <Icon as={IoCalendar} />
                            <Text fontSize="sm" fontWeight="bold" textTransform="uppercase">Placed At</Text>
                        </Flex>
                        <Text fontSize="xl" fontWeight="medium">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            {new Date(order.createdAt).toLocaleDateString()}
                        </Text>
                    </Box>

                    {/* Delivered At */}
                    <Box>
                        <Flex align="center" gap={2} mb={1} color="gray.500">
                            <Icon as={IoCalendar} />
                            <Text fontSize="sm" fontWeight="bold" textTransform="uppercase">Delivered At</Text>
                        </Flex>
                        {order.status === 'Delivered' && order.deliveredAt ? (
                            <>
                                <Text fontSize="xl" fontWeight="medium">
                                    {new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                    {new Date(order.deliveredAt).toLocaleDateString()}
                                </Text>
                                <Text fontSize="xs" color="blue.500" fontWeight="bold" mt={1}>
                                    By: {order.deliveredBy || 'Admin'}
                                </Text>
                            </>
                        ) : (
                            <Text color="gray.400" fontStyle="italic">Not delivered yet</Text>
                        )}
                    </Box>

                    {/* Duration */}
                    <Box>
                        <Flex align="center" gap={2} mb={1} color="gray.500">
                            <Icon as={IoTime} />
                            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">Total Duration</Text>
                        </Flex>
                        {order.status === 'Delivered' && order.deliveredAt ? (
                            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" color="green.500">
                                {calculateDuration(order.createdAt, order.deliveredAt)}
                            </Text>
                        ) : (
                            <Text color="gray.400" fontStyle="italic" fontSize="sm">-</Text>
                        )}
                    </Box>
                </SimpleGrid>
            </Box>

            <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
                {/* Left Column: Details */}
                <Box gridColumn={{ lg: "span 1" }}>
                    <VStack gap={6} align="stretch">
                        {/* Customer Card */}
                        <Box bg="white" p={6} borderRadius="xl" shadow="sm">
                            <Text fontWeight="bold" mb={4} display="flex" alignItems="center" gap={2} fontSize="lg">
                                <Icon as={IoPerson} color="blue.500" /> Customer Information
                            </Text>
                            <VStack align="stretch" gap={3}>
                                <DetailRow label="Name/Email" value={order.user?.email || "N/A"} />
                                <DetailRow label="Phone" value={order.user?.phone || "N/A"} icon={<IoCall />} />
                                <DetailRow label="Address" value={order.user?.address || "N/A"} icon={<IoLocation />} />
                            </VStack>
                        </Box>

                        {/* Rider Card */}
                        <Box bg="white" p={6} borderRadius="xl" shadow="sm">
                            <Text fontWeight="bold" mb={4} display="flex" alignItems="center" gap={2} fontSize="lg">
                                <Icon as={IoBicycle} color="orange.500" /> Assigned Rider
                            </Text>
                            {order.assignedRider && typeof order.assignedRider === 'object' ? (
                                <VStack align="stretch" gap={3}>
                                    <DetailRow label="Name" value={order.assignedRider.name} />
                                    <DetailRow label="Phone" value={order.assignedRider.phone} icon={<IoCall />} />
                                    <DetailRow label="Status" value={order.assignedRider.status} />
                                </VStack>
                            ) : (
                                <Text color="gray.500" fontStyle="italic">No rider assigned.</Text>
                            )}
                        </Box>
                    </VStack>
                </Box>

                {/* Right Column: Items */}
                <Box gridColumn={{ lg: "span 2" }}>
                    <Box bg="white" p={6} borderRadius="xl" shadow="sm">
                        <Text fontWeight="bold" mb={6} fontSize="lg">Items Ordered</Text>
                        <VStack gap={4} align="stretch" mb={8}>
                            {order.items.map((item: any, idx: number) => (
                                <Flex key={idx} gap={4} p={4} border="1px solid" borderColor="gray.100" borderRadius="xl" bg="gray.50">
                                    <Image
                                        src={item.image}
                                        w="80px"
                                        h="80px"
                                        objectFit="cover"
                                        borderRadius="lg"
                                        bg="white"
                                    />
                                    <Box flex={1}>
                                        <Flex justify="space-between" mb={1}>
                                            <Text fontWeight="bold" fontSize="lg">{item.name}</Text>
                                            <Text fontWeight="bold" fontSize="lg">₦{(item.price * item.quantity).toLocaleString()}</Text>
                                        </Flex>
                                        <Text fontSize={{ base: "sm", md: "md" }} color="gray.600">
                                            Size: {item.size} • Qty: {item.quantity}
                                        </Text>
                                        {item.extras?.length > 0 && (
                                            <Text fontSize="sm" color="blue.500" mt={2}>
                                                + {item.extras.join(", ")}
                                            </Text>
                                        )}
                                        {item.note && (
                                            <Text fontSize="sm" color="gray.500" mt={2} fontStyle="italic">
                                                Note: "{item.note}"
                                            </Text>
                                        )}
                                    </Box>
                                </Flex>
                            ))}
                        </VStack>

                        <Box borderBottom="1px solid" borderColor="gray.100" mb={6} />

                        {/* Financial Summary */}
                        <Box maxW="400px" ml="auto">
                            <Flex justify="space-between" mb={2}>
                                <Text color="gray.500">Subtotal</Text>
                                <Text fontWeight="medium">₦{(order.total - (order.deliveryFee || 0)).toLocaleString()}</Text>
                            </Flex>
                            <Flex justify="space-between" mb={2}>
                                <Text color="gray.500">Delivery Fee</Text>
                                <Text fontWeight="medium">₦{(order.deliveryFee || 0).toLocaleString()}</Text>
                            </Flex>
                            <Flex justify="space-between" align="center" mt={4} pt={4} borderTop="1px solid" borderColor="gray.100">
                                <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>Total Amount</Text>
                                <Text fontWeight="black" fontSize={{ base: "2xl", md: "3xl" }} color="red.500">
                                    ₦{order.total.toLocaleString()}
                                </Text>
                            </Flex>
                        </Box>
                    </Box>
                </Box>
            </SimpleGrid>
        </Box>
    );
};

// Helper
const DetailRow = ({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) => (
    <Flex align="start" gap={3}>
        <Box color="gray.400" mt={1}>
            {icon}
        </Box>
        <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="bold">{label}</Text>
            <Text fontWeight="medium">{value}</Text>
        </Box>
    </Flex>
);

const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diff = endTime - startTime;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
        return `${hours}h ${remainingMinutes} m`;
    }
    return `${minutes} mins`;
};
