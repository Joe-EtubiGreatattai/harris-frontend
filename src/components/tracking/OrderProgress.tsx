
import { Box, Flex, Text, VStack, Circle, Center } from "@chakra-ui/react"
import { IoCheckmark, IoTime, IoFastFood, IoBicycle, IoHome } from "react-icons/io5"

interface OrderProgressProps {
    status: string;
    deliveryMethod?: 'Delivery' | 'Pick-up';
}

const deliverySteps = [
    { label: 'Confirmed', status: 'Pending', icon: IoTime },
    { label: 'Preparing', status: 'Preparing', icon: IoFastFood },
    { label: 'Ready', status: 'Ready for Delivery', icon: IoCheckmark },
    { label: 'On Way', status: 'Out for Delivery', icon: IoBicycle },
    { label: 'Arrived', status: 'Delivered', icon: IoHome },
]

const pickupSteps = [
    { label: 'Confirmed', status: 'Pending', icon: IoTime },
    { label: 'Preparing', status: 'Preparing', icon: IoFastFood },
    { label: 'Ready', status: 'Ready for Delivery', icon: IoCheckmark },
    { label: 'Picked Up', status: 'Delivered', icon: IoHome },
]

export const OrderProgress = ({ status, deliveryMethod = 'Delivery' }: OrderProgressProps) => {
    const steps = deliveryMethod === 'Pick-up' ? pickupSteps : deliverySteps;
    // Determine the current step index
    const statusIndex = steps.findIndex(s => s.status === status)
    const currentIndex = statusIndex === -1 ? 0 : statusIndex

    return (
        <Box w="full" py={8}>
            <Flex justify="space-between" position="relative" px={4}>
                {/* Connecting Line */}
                <Box
                    position="absolute"
                    top="20px"
                    left="40px"
                    right="40px"
                    h="2px"
                    bg="red.100"
                    zIndex={0}
                >
                    <Box
                        h="full"
                        bg="red.500"
                        transition="width 0.5s ease"
                        w={`${(currentIndex / (steps.length - 1)) * 100}%`}
                    />
                </Box>

                {steps.map((step, index) => {
                    const isCompleted = index <= currentIndex;
                    const isActive = index === currentIndex;
                    const Icon = step.icon;

                    return (
                        <VStack key={step.label} zIndex={1} gap={2} flex={1}>
                            <Circle
                                size="40px"
                                bg={isCompleted ? "red.500" : "red.50"}
                                color={isCompleted ? "white" : "red.200"}
                                border="2px solid"
                                borderColor={isActive ? "red.600" : "transparent"}
                                transition="all 0.3s"
                                boxShadow={isActive ? "0 0 15px rgba(229, 62, 62, 0.3)" : "none"}
                            >
                                <Center>
                                    <Icon size={20} />
                                </Center>
                            </Circle>
                            <Text
                                fontSize="10px"
                                fontWeight={isActive ? "bold" : "medium"}
                                color="gray.600"
                                opacity={isCompleted ? 1 : 0.5}
                                textAlign="center"
                            >
                                {step.label}
                            </Text>
                        </VStack>
                    )
                })}
            </Flex>
        </Box>
    )
}
