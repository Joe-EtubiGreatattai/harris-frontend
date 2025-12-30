import {
    Box,
    VStack,
    Text,
    Button,
    Badge,
    Portal,
    Center,
    Heading,
    Flex,
    Icon,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { IoFastFood, IoClose } from "react-icons/io5";

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(229, 62, 62, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
`;

interface NewOrderAlertProps {
    order: any;
    onClose: () => void;
    onView: (orderId: string) => void;
}

export const NewOrderAlert = ({ order, onClose, onView }: NewOrderAlertProps) => {
    if (!order) return null;

    return (
        <Portal>
            <Box
                position="fixed"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg="blackAlpha.800"
                zIndex={9999}
                display="flex"
                alignItems="center"
                justifyContent="center"
                backdropFilter="blur(10px)"
            >
                <Center w="full" px={4}>
                    <VStack
                        bg="white"
                        p={8}
                        borderRadius="2xl"
                        shadow="2xl"
                        maxW="500px"
                        w="full"
                        gap={6}
                        animation={`${pulse} 2s infinite`}
                        position="relative"
                    >
                        <Button
                            position="absolute"
                            top={4}
                            right={4}
                            variant="ghost"
                            onClick={onClose}
                            borderRadius="full"
                        >
                            <IoClose size={24} />
                        </Button>

                        <VStack gap={2} textAlign="center">
                            <Box
                                bg="red.500"
                                p={4}
                                borderRadius="full"
                                color="white"
                                mb={2}
                            >
                                <Icon as={IoFastFood} w={10} h={10} />
                            </Box>
                            <Heading size="xl" color="red.600">NEW ORDER!</Heading>
                            <Text fontSize="lg" fontWeight="medium">
                                A customer just placed an order.
                            </Text>
                        </VStack>

                        <Box
                            w="full"
                            p={4}
                            bg="gray.50"
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="gray.100"
                        >
                            <Flex justify="space-between" mb={2}>
                                <Text fontWeight="bold">Order ID:</Text>
                                <Text>#{order.orderId}</Text>
                            </Flex>
                            <Flex justify="space-between" mb={2}>
                                <Text fontWeight="bold">Total:</Text>
                                <Text fontSize="xl" color="red.500" fontWeight="bold">
                                    ₦{order.total.toLocaleString()}
                                </Text>
                            </Flex>
                            <Flex justify="space-between" mb={2}>
                                <Text fontWeight="bold">Items:</Text>
                                <Badge colorScheme="orange">{order.items.length} items</Badge>
                            </Flex>
                            <VStack align="start" mt={2} pl={2} borderLeft="2px solid" borderColor="red.200" gap={1}>
                                {order.items.slice(0, 3).map((item: any, idx: number) => (
                                    <Text key={idx} fontSize="sm" color="gray.600">
                                        {item.quantity}x {item.name}
                                    </Text>
                                ))}
                                {order.items.length > 3 && (
                                    <Text fontSize="sm" color="gray.400" fontStyle="italic">
                                        + {order.items.length - 3} more items...
                                    </Text>
                                )}
                            </VStack>
                        </Box>

                        <VStack w="full" gap={3}>
                            <Button
                                colorScheme="red"
                                size="lg"
                                w="full"
                                h="60px"
                                fontSize="xl"
                                onClick={() => {
                                    onView(order.orderId);
                                    onClose();
                                }}
                            >
                                View Order Details
                            </Button>
                            <Button
                                variant="ghost"
                                w="full"
                                onClick={onClose}
                            >
                                Dismiss
                            </Button>
                        </VStack>
                    </VStack>
                </Center>
            </Box>
        </Portal>
    );
};
