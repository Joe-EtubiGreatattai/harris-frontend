import { Box, Flex, Image, Text, Button, IconButton, Badge, Textarea, Center, Spinner } from "@chakra-ui/react"
import { IoChevronBack, IoHeartOutline, IoAdd, IoRemove, IoCart } from "react-icons/io5"
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"
import { api } from "../services/api"
import { socket } from "../services/socket"
import { motion } from "framer-motion"

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

export const ProductPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { addToCart } = useCart()

    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // State for selections
    const [selectedSize, setSelectedSize] = useState<string>("")
    const [quantity, setQuantity] = useState(1)
    const [selectedExtras, setSelectedExtras] = useState<string[]>([])
    const [note, setNote] = useState("")

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const data = await api.getProductById(id)
                setProduct(data)
                // Default to first size available
                if (data.prices) {
                    setSelectedSize(Object.keys(data.prices)[0])
                }
            } catch (err) {
                console.error("Failed to fetch product", err)
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()

        const handleProductUpdated = (updatedProduct: any) => {
            if (updatedProduct.id === id) {
                setProduct(updatedProduct);
            }
        };

        const handleProductDeleted = ({ id: deletedId }: { id: string }) => {
            if (deletedId === id) {
                alert("This product is no longer available.");
                navigate('/');
            }
        };

        socket.on('productUpdated', handleProductUpdated);
        socket.on('productDeleted', handleProductDeleted);

        return () => {
            socket.off('productUpdated', handleProductUpdated);
            socket.off('productDeleted', handleProductDeleted);
        };
    }, [id])

    const calculateTotal = () => {
        if (!product || !selectedSize) return 0;
        let basePrice = product.prices[selectedSize] || 0;
        let extrasPrice = selectedExtras.length * 500 // ₦500 per extra
        return (basePrice + extrasPrice)
    }

    const handleAddToCart = () => {
        if (!product) return;

        addToCart({
            productId: product.id,
            name: product.name,
            price: calculateTotal(),
            quantity: quantity,
            image: product.image,
            size: selectedSize,
            extras: selectedExtras,
            note: note,
            category: product.category
        })
        navigate('/cart')
    }

    const toggleExtra = (extra: string) => {
        setSelectedExtras(prev =>
            prev.includes(extra) ? prev.filter(e => e !== extra) : [...prev, extra]
        )
    }

    if (loading) return <Center h="100vh"><Spinner size="xl" color="red.500" /></Center>

    if (!product) {
        return <Center h="100vh"><Text>Product not found</Text></Center>
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Box pb={24} bg="gray.50" minH="100vh">
                {/* Image Header */}
                <Box position="relative" h="350px">
                    <motion.div
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Image
                            src={product.image}
                            w="full"
                            h="full"
                            objectFit="cover"
                        />
                    </motion.div>
                    <Flex position="absolute" top={0} left={0} right={0} p={6} justify="space-between" align="center">
                        <IconButton
                            aria-label="Back"
                            variant="ghost"
                            bg="white/30"
                            backdropFilter="blur(10px)"
                            color="white"
                            borderRadius="full"
                            onClick={() => navigate(-1)}
                        >
                            <IoChevronBack size={24} />
                        </IconButton>
                        <IconButton
                            aria-label="Favorite"
                            variant="ghost"
                            bg="white/30"
                            backdropFilter="blur(10px)"
                            color="white"
                            borderRadius="full"
                        >
                            <IoHeartOutline size={24} />
                        </IconButton>
                    </Flex>
                </Box>

                {/* Content Container */}
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                    <Box
                        mt="-40px"
                        bg="gray.50"
                        borderTopRadius="3xl"
                        p={6}
                        position="relative"
                        zIndex={1}
                    >
                        <motion.div variants={itemVariants}>
                            <Flex justify="space-between" align="start" mb={2}>
                                <Box maxW="70%">
                                    <Text fontSize="2xl" fontWeight="bold" color="gray.800" lineHeight="1.2">{product.name}</Text>
                                    <Flex gap={2} mt={2}>
                                        <Badge colorScheme="red" borderRadius="full" px={2}>Spicy</Badge>
                                        {product.isBestSeller && <Badge colorScheme="orange" borderRadius="full" px={2}>Best Seller</Badge>}
                                    </Flex>
                                </Box>
                                <Text fontSize="2xl" fontWeight="black" color="red.500">
                                    ₦{(product.prices?.[selectedSize] || 0).toLocaleString()}
                                </Text>
                            </Flex>

                            <Text color="gray.500" fontSize="sm" mt={4} mb={6}>
                                {product.description}
                            </Text>
                        </motion.div>

                        {/* Size Selection */}
                        <motion.div variants={itemVariants}>
                            <Text fontWeight="bold" mb={3} color="gray.700">Size</Text>
                            <Flex gap={3} mb={6} flexWrap="wrap">
                                {product.prices && Object.keys(product.prices).map((size) => (
                                    <Button
                                        key={size}
                                        minW="60px"
                                        variant={selectedSize === size ? "solid" : "outline"}
                                        colorScheme="red"
                                        borderRadius="xl"
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </Button>
                                ))}
                            </Flex>
                        </motion.div>

                        {/* Extras/Toppings */}
                        {product.extras && product.extras.length > 0 && (
                            <motion.div variants={itemVariants}>
                                <Text fontWeight="bold" mb={3} color="gray.700">Extra Toppings</Text>
                                <Flex gap={2} mb={6} flexWrap="wrap">
                                    {product.extras.filter((e: any) => e.isAvailable !== false).map((extra: any) => (
                                        <Button
                                            key={extra.name}
                                            size="sm"
                                            variant={selectedExtras.includes(extra.name) ? "solid" : "ghost"}
                                            colorScheme={selectedExtras.includes(extra.name) ? "red" : "gray"}
                                            bg={selectedExtras.includes(extra.name) ? "red.500" : "gray.200"}
                                            color={selectedExtras.includes(extra.name) ? "white" : "gray.600"}
                                            borderRadius="full"
                                            onClick={() => toggleExtra(extra.name)}
                                            _hover={{ bg: selectedExtras.includes(extra.name) ? "red.600" : "gray.300" }}
                                        >
                                            {extra.name} (₦{extra.price})
                                        </Button>
                                    ))}
                                </Flex>
                            </motion.div>
                        )}

                        {/* Note */}
                        <motion.div variants={itemVariants}>
                            <Text fontWeight="bold" mb={3} color="gray.700">Note to Kitchen</Text>
                            <Textarea
                                placeholder="Remove onions, extra sauce..."
                                borderRadius="xl"
                                bg="white"
                                border="none"
                                shadow="sm"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </motion.div>
                    </Box>
                </motion.div>

                {/* Bottom Action Bar */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Flex
                        position="fixed"
                        bottom={0}
                        left={0}
                        right={0}
                        bg="white"
                        p={4}
                        borderTopRadius="2xl"
                        shadow="2xl"
                        boxShadow="0px -4px 20px rgba(0,0,0,0.05)"
                        align="center"
                        justify="space-between"
                        zIndex={20}
                    >
                        <Flex align="center" bg="gray.100" borderRadius="full" px={4} py={2}>
                            <IconButton
                                aria-label="Decrease"
                                size="sm"
                                rounded="full"
                                variant="ghost"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <IoRemove />
                            </IconButton>
                            <Text fontWeight="bold" mx={4} fontSize="lg">{quantity}</Text>
                            <IconButton
                                aria-label="Increase"
                                size="sm"
                                rounded="full"
                                variant="ghost"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <IoAdd />
                            </IconButton>
                        </Flex>

                        <Button
                            flex={1}
                            ml={4}
                            colorScheme="red"
                            bg={product.isAvailable === false ? "gray.400" : "red.500"}
                            borderRadius="full"
                            size="lg"
                            onClick={handleAddToCart}
                            disabled={product.isAvailable === false}
                        >
                            <Flex align="center" gap={2}>
                                {product.isAvailable === false ? (
                                    <Text>Unavailable</Text>
                                ) : (
                                    <>
                                        <IoCart />
                                        <Text>₦{(calculateTotal() * quantity).toLocaleString()}</Text>
                                    </>
                                )}
                            </Flex>
                        </Button>
                    </Flex>
                </motion.div>
            </Box>
        </motion.div>
    )
}
