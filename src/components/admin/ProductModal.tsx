import { Box, Flex, Text, Button, Input, VStack } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: any;
    onSave: (product: any) => Promise<void>;
}

export const ProductModal = ({ isOpen, onClose, product, onSave }: ProductModalProps) => {
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        category: "Pizza",
        image: "",
        description: "",
        price: ""
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (product) {
            // Edit mode
            setFormData({
                id: product.id,
                name: product.name,
                category: product.category,
                image: product.image,
                description: product.description || "",
                price: typeof product.prices === 'object' ? product.prices.M || product.prices.Standard : product.price
            });
        } else {
            // Add mode
            setFormData({
                id: `prod-${Math.random().toString(36).substr(2, 6)}`,
                name: "",
                category: "Pizza",
                image: "",
                description: "",
                price: ""
            });
        }
    }, [product, isOpen]);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const priceVal = parseFloat(formData.price as string);
            const payload = {
                ...formData,
                price: priceVal,
                prices: {
                    S: priceVal * 0.8,
                    M: priceVal,
                    L: priceVal * 1.2,
                    XL: priceVal * 1.4,
                    Standard: priceVal
                }
            };
            await onSave(payload);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

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
            <Box
                bg="white"
                w="full"
                maxW="lg"
                borderRadius="2xl"
                boxShadow="2xl"
                onClick={(e) => e.stopPropagation()}
                overflow="hidden"
            >
                <Flex justify="space-between" align="center" p={6} borderBottom="1px solid" borderColor="gray.100">
                    <Text fontWeight="bold" fontSize="xl">{product ? "Edit Product" : "Add New Product"}</Text>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        borderRadius="full"
                        size="sm"
                        p={0}
                    >
                        <IoClose size={24} />
                    </Button>
                </Flex>

                <Box p={6} maxH="70vh" overflowY="auto">
                    <VStack gap={4} align="stretch">
                        <Box>
                            <Text fontWeight="bold" mb={2} fontSize="sm">Name</Text>
                            <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Pepperoni Feast" />
                        </Box>

                        <Box>
                            <Text fontWeight="bold" mb={2} fontSize="sm">Category</Text>
                            <Box border="1px solid" borderColor="gray.200" borderRadius="md" px={2}>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    style={{ width: "100%", height: "40px", outline: "none" }}
                                >
                                    <option value="Pizza">Pizza</option>
                                    <option value="Burger">Burger</option>
                                    <option value="Chicken">Chicken</option>
                                    <option value="Shawarma">Shawarma</option>
                                    <option value="Drinks">Drinks</option>
                                </select>
                            </Box>
                        </Box>

                        <Box>
                            <Text fontWeight="bold" mb={2} fontSize="sm">Price (Base/Medium)</Text>
                            <Input type="number" name="price" value={formData.price} onChange={handleChange} />
                        </Box>

                        <Box>
                            <Text fontWeight="bold" mb={2} fontSize="sm">Image URL</Text>
                            <Input name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
                        </Box>

                        <Box>
                            <Text fontWeight="bold" mb={2} fontSize="sm">Description</Text>
                            <Input name="description" value={formData.description} onChange={handleChange} placeholder="Delicious cheesy..." />
                        </Box>
                    </VStack>
                </Box>

                <Flex p={6} borderTop="1px solid" borderColor="gray.100" justify="flex-end" gap={3}>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button bg="red.500" color="white" _hover={{ bg: "red.600" }} onClick={handleSubmit} loading={isLoading}>Save</Button>
                </Flex>
            </Box>
        </Box>
    );
};
