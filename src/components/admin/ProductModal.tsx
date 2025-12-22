import { Box, Flex, Text, Button, Input, VStack, HStack, IconButton, Image, Spinner, Center } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { IoClose, IoAdd, IoTrash, IoCloudUploadOutline, IoCheckmarkCircle, IoRadioButtonOff } from "react-icons/io5";
import { api } from "../../services/api";

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
        isAvailable: true,
        isManualBestSeller: false,
        sizePrices: [] as { size: string, price: number }[],
        extras: [] as any[]
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (product) {
            // Convert prices Map/Object to array for editing
            const pricesArr = product.prices ? Object.entries(product.prices).map(([size, price]) => ({ size, price: price as number })) : [];

            setFormData({
                id: product.id,
                name: product.name,
                category: product.category,
                image: product.image,
                description: product.description || "",
                isAvailable: product.isAvailable !== false,
                isManualBestSeller: product.isManualBestSeller || false,
                sizePrices: pricesArr.length > 0 ? pricesArr : [{ size: "Standard", price: product.price || 0 }],
                extras: product.extras || []
            });
        } else {
            setFormData({
                id: `prod-${Math.random().toString(36).substr(2, 6)}`,
                name: "",
                category: "Pizza",
                image: "",
                description: "",
                isAvailable: true,
                isManualBestSeller: false,
                sizePrices: [{ size: "M", price: 0 }],
                extras: [
                    { name: "Cheese", price: 500, isAvailable: true },
                    { name: "Pepperoni", price: 500, isAvailable: true },
                    { name: "Mushroom", price: 500, isAvailable: true }
                ]
            });
        }
    }, [product, isOpen]);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSize = () => {
        setFormData(prev => ({
            ...prev,
            sizePrices: [...prev.sizePrices, { size: "", price: 0 }]
        }));
    };

    const handleSizeChange = (index: number, field: string, value: any) => {
        const newSizes = [...formData.sizePrices];
        newSizes[index] = { ...newSizes[index], [field]: value };
        setFormData(prev => ({ ...prev, sizePrices: newSizes }));
    };

    const handleRemoveSize = (index: number) => {
        setFormData(prev => ({
            ...prev,
            sizePrices: prev.sizePrices.filter((_, i) => i !== index)
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { url } = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (error) {
            alert("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddExtra = () => {
        setFormData(prev => ({
            ...prev,
            extras: [...prev.extras, { name: "", price: 500, isAvailable: true }]
        }));
    };

    const handleExtraChange = (index: number, field: string, value: any) => {
        const newExtras = [...formData.extras];
        newExtras[index] = { ...newExtras[index], [field]: value };
        setFormData(prev => ({ ...prev, extras: newExtras }));
    };

    const handleRemoveExtra = (index: number) => {
        setFormData(prev => ({
            ...prev,
            extras: prev.extras.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Convert sizePrices array back to Map/Object for backend
            const pricesObj: Record<string, number> = {};
            formData.sizePrices.forEach(sp => {
                if (sp.size) pricesObj[sp.size] = sp.price;
            });

            const payload = {
                id: formData.id,
                name: formData.name,
                category: formData.category,
                image: formData.image,
                description: formData.description,
                isAvailable: formData.isAvailable,
                isManualBestSeller: formData.isManualBestSeller,
                prices: pricesObj,
                extras: formData.extras
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
                maxW={{ base: "98%", md: "2xl" }}
                borderRadius="2xl"
                boxShadow="2xl"
                onClick={(e) => e.stopPropagation()}
                overflow="hidden"
                maxH="95vh"
                display="flex"
                flexDirection="column"
            >
                <Flex justify="space-between" align="center" p={{ base: 4, md: 6 }} borderBottom="1px solid" borderColor="gray.100" shrink={0}>
                    <VStack align="start" gap={0}>
                        <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }}>{product ? "Edit Product" : "Add New Product"}</Text>
                        <Text fontSize="2xs" color="gray.500">ID: {formData.id}</Text>
                    </VStack>
                    <IconButton
                        aria-label="Close"
                        variant="ghost"
                        onClick={onClose}
                        borderRadius="full"
                        size="sm"
                    >
                        <IoClose size={24} />
                    </IconButton>
                </Flex>

                <Box p={{ base: 4, md: 6 }} overflowY="auto" flex={1}>
                    <VStack gap={6} align="stretch">
                        <Flex gap={6} direction={{ base: "column", md: "row" }}>
                            <VStack align="stretch" flex={1} gap={4}>
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
                                            <option value="Beef">Beef</option>
                                            <option value="Pasta">Pasta</option>
                                            <option value="Drink">Drink</option>
                                        </select>
                                    </Box>
                                </Box>

                                <Box>
                                    <Flex justify="space-between" align="center" mb={2}>
                                        <Text fontWeight="bold" fontSize="sm">Sizes & Pricing</Text>
                                        <Button size="xs" colorScheme="blue" variant="ghost" onClick={handleAddSize}>
                                            <Flex gap={1} align="center"><IoAdd /> Add Size</Flex>
                                        </Button>
                                    </Flex>
                                    <VStack gap={2} align="stretch">
                                        {formData.sizePrices.map((sp, idx) => (
                                            <Flex key={idx} gap={2} align="center">
                                                <Input
                                                    size="sm"
                                                    placeholder="Size (S, M, L...)"
                                                    value={sp.size}
                                                    onChange={(e) => handleSizeChange(idx, 'size', e.target.value)}
                                                />
                                                <Input
                                                    size="sm"
                                                    type="number"
                                                    placeholder="Price"
                                                    value={sp.price}
                                                    onChange={(e) => handleSizeChange(idx, 'price', parseFloat(e.target.value))}
                                                />
                                                <IconButton
                                                    aria-label="Remove Size"
                                                    size="sm"
                                                    variant="ghost"
                                                    colorScheme="red"
                                                    onClick={() => handleRemoveSize(idx)}
                                                    disabled={formData.sizePrices.length <= 1}
                                                >
                                                    <IoTrash />
                                                </IconButton>
                                            </Flex>
                                        ))}
                                    </VStack>
                                </Box>

                                <Flex align="center" justify="space-between" bg="blue.50" p={3} borderRadius="lg">
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="blue.700">Best Seller Status</Text>
                                        <Text fontSize="xs" color="blue.600">Manually highlight this item?</Text>
                                    </Box>
                                    <Button
                                        size="sm"
                                        colorScheme={formData.isManualBestSeller ? "blue" : "gray"}
                                        variant={formData.isManualBestSeller ? "solid" : "outline"}
                                        onClick={() => setFormData({ ...formData, isManualBestSeller: !formData.isManualBestSeller })}
                                    >
                                        <Flex gap={2} align="center">
                                            {formData.isManualBestSeller ? <IoCheckmarkCircle /> : <IoRadioButtonOff />}
                                            {formData.isManualBestSeller ? "Pinned" : "Standard"}
                                        </Flex>
                                    </Button>
                                </Flex>

                                <Flex align="center" justify="space-between" bg="gray.50" p={3} borderRadius="lg">
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm">Availability</Text>
                                        <Text fontSize="xs" color="gray.500">Is this product currently orderable?</Text>
                                    </Box>
                                    <Button
                                        size="sm"
                                        colorScheme={formData.isAvailable ? "green" : "red"}
                                        variant={formData.isAvailable ? "solid" : "outline"}
                                        onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                                    >
                                        <Flex gap={2} align="center">
                                            {formData.isAvailable ? <IoCheckmarkCircle /> : <IoRadioButtonOff />}
                                            {formData.isAvailable ? "Available" : "Unavailable"}
                                        </Flex>
                                    </Button>
                                </Flex>
                            </VStack>

                            <VStack align="stretch" w={{ base: "full", md: "250px" }} gap={2}>
                                <Text fontWeight="bold" fontSize="sm">Product Image</Text>
                                <Box
                                    h={{ base: "140px", md: "150px" }}
                                    bg="gray.100"
                                    borderRadius="xl"
                                    overflow="hidden"
                                    position="relative"
                                    border="2px dashed"
                                    borderColor={formData.image ? "transparent" : "gray.300"}
                                >
                                    {formData.image ? (
                                        <Image src={formData.image} w="full" h="full" objectFit="cover" />
                                    ) : (
                                        <Center h="full">
                                            {isUploading ? <Spinner color="red.500" /> : <IoCloudUploadOutline size={40} color="gray" />}
                                        </Center>
                                    )}
                                    <Input
                                        type="file"
                                        hidden
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                    <Button
                                        size="xs"
                                        position="absolute"
                                        bottom={2}
                                        right={2}
                                        onClick={() => fileInputRef.current?.click()}
                                        bg="blackAlpha.700"
                                        color="white"
                                    >
                                        {formData.image ? "Change" : "Upload"}
                                    </Button>
                                </Box>
                                <Input
                                    size="sm"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="Or paste Image URL"
                                    fontSize="xs"
                                />
                            </VStack>
                        </Flex>

                        <Box>
                            <Flex justify="space-between" align="center" mb={4}>
                                <Text fontWeight="bold" fontSize="sm">Extras / Toppings</Text>
                                <Button size="xs" colorScheme="red" variant="ghost" onClick={handleAddExtra}>
                                    <Flex gap={1} align="center"><IoAdd /> Add Extra</Flex>
                                </Button>
                            </Flex>
                            <VStack gap={2} align="stretch">
                                {formData.extras.map((extra, index) => (
                                    <Flex key={index} gap={2} bg="gray.50" p={2} borderRadius="lg" align="center" direction={{ base: "column", sm: "row" }}>
                                        <Input
                                            size="sm"
                                            value={extra.name}
                                            placeholder="Extra Name"
                                            onChange={(e) => handleExtraChange(index, 'name', e.target.value)}
                                            bg="white"
                                            flex={1}
                                        />
                                        <HStack w={{ base: "full", sm: "auto" }} justify="space-between">
                                            <Input
                                                size="sm"
                                                type="number"
                                                w="90px"
                                                value={extra.price}
                                                onChange={(e) => handleExtraChange(index, 'price', parseFloat(e.target.value))}
                                                bg="white"
                                            />
                                            <HStack gap={1}>
                                                <IconButton
                                                    aria-label="Toggle Availability"
                                                    size="sm"
                                                    variant="ghost"
                                                    colorScheme={extra.isAvailable ? "green" : "red"}
                                                    onClick={() => handleExtraChange(index, 'isAvailable', !extra.isAvailable)}
                                                >
                                                    {extra.isAvailable ? <IoCheckmarkCircle /> : <IoRadioButtonOff />}
                                                </IconButton>
                                                <IconButton
                                                    aria-label="Delete"
                                                    size="sm"
                                                    variant="ghost"
                                                    colorScheme="red"
                                                    onClick={() => handleRemoveExtra(index)}
                                                >
                                                    <IoTrash />
                                                </IconButton>
                                            </HStack>
                                        </HStack>
                                    </Flex>
                                ))}
                                {formData.extras.length === 0 && (
                                    <Text fontSize="xs" color="gray.500" textAlign="center" py={4}>No extras defined for this product.</Text>
                                )}
                            </VStack>
                        </Box>

                        <Box>
                            <Text fontWeight="bold" mb={2} fontSize="sm">Description</Text>
                            <Input name="description" value={formData.description} onChange={handleChange} placeholder="Delicious cheesy..." />
                        </Box>
                    </VStack>
                </Box>

                <Flex p={{ base: 4, md: 6 }} borderTop="1px solid" borderColor="gray.100" justify="flex-end" gap={3} shrink={0}>
                    <Button variant="ghost" onClick={onClose} disabled={isLoading || isUploading} size={{ base: "sm", md: "md" }}>Cancel</Button>
                    <Button
                        bg="red.500"
                        color="white"
                        _hover={{ bg: "red.600" }}
                        onClick={handleSubmit}
                        loading={isLoading}
                        disabled={isUploading}
                        size={{ base: "sm", md: "md" }}
                        px={{ base: 6, md: 8 }}
                    >
                        Save Product
                    </Button>
                </Flex>
            </Box>
        </Box>
    );
};
