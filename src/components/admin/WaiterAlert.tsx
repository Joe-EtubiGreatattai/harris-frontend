import {
    Box,
    VStack,
    Text,
    Button,
    Portal,
    Center,
    Heading,
    Icon,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { IoRestaurant, IoClose } from "react-icons/io5";

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(49, 130, 206, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(49, 130, 206, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(49, 130, 206, 0); }
`;

interface WaiterAlertProps {
    table: string;
    onClose: () => void;
}

export const WaiterAlert = ({ table, onClose }: WaiterAlertProps) => {
    if (!table) return null;

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
                        maxW="400px"
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
                                bg="blue.500"
                                p={4}
                                borderRadius="full"
                                color="white"
                                mb={2}
                            >
                                <Icon as={IoRestaurant} w={10} h={10} />
                            </Box>
                            <Heading size="xl" color="blue.600">TABLE CALLING!</Heading>
                            <Text fontSize="lg" fontWeight="medium">
                                A customer at <Text as="span" fontWeight="bold" color="blue.500">{table}</Text> needs a waiter.
                            </Text>
                        </VStack>

                        <Button
                            colorScheme="blue"
                            size="lg"
                            w="full"
                            h="50px"
                            fontSize="xl"
                            onClick={onClose}
                        >
                            Acknowledge
                        </Button>
                    </VStack>
                </Center>
            </Box>
        </Portal>
    );
};
