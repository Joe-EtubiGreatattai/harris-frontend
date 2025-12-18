import { Box, Flex, Text, Button, Input, VStack, Image, Spinner, Center, IconButton } from "@chakra-ui/react";
import { useState, useRef } from "react";
import { IoClose, IoCloudUploadOutline } from "react-icons/io5";
import { api } from "../../services/api";

interface RiderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (riderData: any) => Promise<void>;
}

export const RiderModal = ({ isOpen, onClose, onSave }: RiderModalProps) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        image: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await onSave(formData);
            setFormData({ name: "", email: "", phone: "", image: "" });
            onClose();
        } catch (error) {
            console.error("Failed to save rider", error);
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
                maxW="md"
                borderRadius="2xl"
                boxShadow="2xl"
                onClick={(e) => e.stopPropagation()}
                overflow="hidden"
            >
                <Flex justify="space-between" align="center" p={6} borderBottom="1px solid" borderColor="gray.100">
                    <Text fontWeight="bold" fontSize="xl">Add New Rider</Text>
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

                <Box p={6}>
                    <VStack gap={4} align="stretch">
                        <Box>
                            <Text fontWeight="bold" mb={2} fontSize="sm">Name</Text>
                            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Rider Name" />
                        </Box>
                        <Box>
                            <Text fontWeight="bold" mb={2} fontSize="sm">Email</Text>
                            <Input name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" type="email" />
                        </Box>
                        <Box>
                            <Text fontWeight="bold" mb={2} fontSize="sm">Phone</Text>
                            <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" />
                        </Box>

                        <Flex gap={4} direction={{ base: "column", md: "row" }} align="start">
                            <Box flex={1} w="full">
                                <Text fontWeight="bold" fontSize="sm" mb={2}>Rider Image</Text>
                                <Box
                                    h="120px"
                                    bg="gray.50"
                                    borderRadius="xl"
                                    overflow="hidden"
                                    position="relative"
                                    border="2px dashed"
                                    borderColor={formData.image ? "transparent" : "gray.200"}
                                >
                                    {formData.image ? (
                                        <Image src={formData.image} w="full" h="full" objectFit="cover" />
                                    ) : (
                                        <Center h="full">
                                            {isUploading ? <Spinner color="red.500" /> : <IoCloudUploadOutline size={30} color="gray" />}
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
                                        bg="blackAlpha.600"
                                        color="white"
                                        _hover={{ bg: "blackAlpha.700" }}
                                    >
                                        {formData.image ? "Change" : "Upload"}
                                    </Button>
                                </Box>
                            </Box>
                            <Box flex={1} w="full">
                                <Text fontWeight="bold" mb={2} fontSize="sm">Or paste Image URL</Text>
                                <Input name="image" value={formData.image} onChange={handleChange} placeholder="https://..." size="sm" />
                            </Box>
                        </Flex>
                    </VStack>
                </Box>

                <Flex p={6} borderTop="1px solid" borderColor="gray.100" justify="flex-end" gap={3}>
                    <Button variant="ghost" onClick={onClose} disabled={isLoading || isUploading}>Cancel</Button>
                    <Button bg="red.500" color="white" _hover={{ bg: "red.600" }} onClick={handleSubmit} loading={isLoading} disabled={isUploading}>Add Rider</Button>
                </Flex>
            </Box>
        </Box>
    );
};
