import { Box, Image, Text, Flex, IconButton, Center, Badge } from "@chakra-ui/react"
import { IoAdd, IoHelp } from "react-icons/io5"
import { useNavigate } from "react-router-dom"

interface PizzaCardProps {
    id: string | number;
    name: string;
    description: string;
    price: number;
    image: string;
    isMystery?: boolean;
    isBestSeller?: boolean;
    isAvailable?: boolean;
}

export const PizzaCard = ({ id, name, description, price, image, isMystery, isBestSeller, isAvailable }: PizzaCardProps) => {
    const navigate = useNavigate()

    return (
        <Box
            bg="white"
            p={3}
            borderRadius="3xl"
            boxShadow="lg"
            onClick={() => navigate(`/product/${id}`)}
            cursor="pointer"
            w="full"
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
            position="relative"
            overflow="hidden"
            opacity={isAvailable === false ? 0.8 : 1}
        >
            {isBestSeller && (
                <Box
                    position="absolute"
                    top="12px"
                    left="0px"
                    bg="yellow.400"
                    px={3}
                    py={1}
                    borderRightRadius="full"
                    zIndex={2}
                    boxShadow="sm"
                >
                    <Text fontSize="10px" fontWeight="bold" color="gray.800">Best Seller</Text>
                </Box>
            )}

            {isAvailable === false && (
                <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bg="blackAlpha.400"
                    backdropFilter="blur(2px)"
                    zIndex={5}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    p={2}
                >
                    <Badge colorScheme="red" variant="solid" borderRadius="full" px={3} py={1} fontSize="10px">
                        Temporarily Unavailable
                    </Badge>
                </Box>
            )}

            <Flex justify="center" mb={4} mt={2} position="relative">
                <Image
                    src={image}
                    w="130px"
                    h="130px"
                    objectFit="cover"
                    borderRadius="full"
                    boxShadow="xl"
                    filter={isMystery ? "blur(8px)" : isAvailable === false ? "grayscale(80%)" : "none"}
                />
                {isMystery && (
                    <Center position="absolute" top={0} left={0} right={0} bottom={0}>
                        <IoHelp size={40} color="white" style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" }} />
                    </Center>
                )}
            </Flex>
            <Text fontWeight="extrabold" fontSize="lg" mb={1} color="gray.800" lineHeight="short">{name}</Text>
            <Text color="gray.500" fontSize="xs" mb={4} lineClamp={2} fontWeight="medium">{description}</Text>

            <Flex justify="space-between" align="center" mt="auto">
                <Text fontWeight="black" fontSize="lg" color="gray.800">
                    <Text as="span" color="red.500" fontSize="xs" mr={0.5}>₦</Text>
                    {price.toLocaleString()}
                </Text>
                {isAvailable !== false && (
                    <IconButton
                        aria-label="Add to cart"
                        bg="red.500"
                        color="white"
                        borderRadius="full"
                        size="sm"
                        _hover={{ bg: "red.600" }}
                        boxShadow="lg"
                    >
                        <IoAdd size={20} />
                    </IconButton>
                )}
            </Flex>
        </Box>
    )
}
