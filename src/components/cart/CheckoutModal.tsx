import {
    Button,
    Input,
    Text,
    VStack,
    Box,
    Flex,
    IconButton
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { IoClose } from "react-icons/io5"
import { useUser } from "../../context/UserContext"

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export const CheckoutModal = ({ isOpen, onClose, onConfirm, isLoading }: CheckoutModalProps) => {
    const { user, geoAddress, updateUser } = useUser()

    // Local state for inputs
    const [email, setEmail] = useState("")
    const [address, setAddress] = useState("")

    // Pre-populate if user exists or geoAddress is available
    useEffect(() => {
        if (isOpen) {
            if (user) {
                setEmail(user.email)
                setAddress(user.address)
            } else if (geoAddress) {
                setAddress(geoAddress)
            }
        }
    }, [isOpen, user, geoAddress])

    const handleSubmit = () => {
        if (!email || !address) return;

        updateUser({ email, address })
        onConfirm()
    }

    if (!isOpen) return null;

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="black/60"
            backdropFilter="blur(2px)"
            zIndex={100}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
            onClick={onClose}
        >
            <Box
                bg="white"
                w="full"
                maxW="sm"
                borderRadius="3xl"
                overflow="hidden"
                onClick={(e) => e.stopPropagation()}
                p={6}
                boxShadow="2xl"
                position="relative"
            >
                <Flex justify="space-between" align="center" mb={6}>
                    <Text fontWeight="bold" fontSize="2xl">One Last Thing!</Text>
                    <IconButton
                        aria-label="Close"
                        variant="ghost"
                        size="sm"
                        borderRadius="full"
                        onClick={onClose}
                    >
                        <IoClose size={24} />
                    </IconButton>
                </Flex>

                <Text color="gray.500" mb={6}>Please confirm your delivery details.</Text>

                <VStack gap={4} align="stretch">
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Email Address</Text>
                        <Input
                            placeholder="name@example.com"
                            size="lg"
                            borderRadius="xl"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            bg="gray.50"
                            border="none"
                        />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Delivery Address</Text>
                        <Input
                            placeholder="123 Pizza Street"
                            size="lg"
                            borderRadius="xl"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            bg="gray.50"
                            border="none"
                        />

                        {/* Saved Addresses Chips */}
                        {(user?.savedAddresses?.home || user?.savedAddresses?.work) && (
                            <Flex mt={3} gap={2}>
                                {user.savedAddresses.home && (
                                    <Button
                                        size="xs"
                                        variant={address === user.savedAddresses.home ? "solid" : "outline"}
                                        colorPalette="red"
                                        borderRadius="full"
                                        onClick={() => setAddress(user.savedAddresses!.home!)}
                                    >
                                        Home
                                    </Button>
                                )}
                                {user.savedAddresses.work && (
                                    <Button
                                        size="xs"
                                        variant={address === user.savedAddresses.work ? "solid" : "outline"}
                                        colorPalette="red"
                                        borderRadius="full"
                                        onClick={() => setAddress(user.savedAddresses!.work!)}
                                    >
                                        Work
                                    </Button>
                                )}
                            </Flex>
                        )}
                    </Box>
                </VStack>

                <Button
                    mt={8}
                    bg="red.500"
                    color="white"
                    w="full"
                    size="lg"
                    borderRadius="xl"
                    height="56px"
                    _hover={{ bg: "red.600" }}
                    onClick={handleSubmit}
                    loading={isLoading}
                    loadingText="Processing Payment..."
                    disabled={!email || !address || isLoading}
                    opacity={(!email || !address) ? 0.5 : 1}
                >
                    Confirm Order
                </Button>
            </Box>
        </Box>
    )
}
