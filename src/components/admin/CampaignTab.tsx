import {
    Box,
    Text,
    Button,
    VStack,
    HStack,
    Badge,
    IconButton,
    Flex,
    Input,
    Center
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import {
    IoAdd,
    IoTrash,
    IoCopy,
    IoQrCode,
    IoDownload,
    IoClose,
    IoPause,
    IoPlay
} from "react-icons/io5";
import { api } from "../../services/api";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";

interface CampaignTabProps {
    promos: any[];
    categories: string[];
    onRefresh: () => void;
}

export const CampaignTab = ({ promos, categories, onRefresh }: CampaignTabProps) => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        code: "",
        discountPercent: 10,
        usageLimit: 100,
        applicableCategories: [] as string[],
        expiresAt: ""
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleGenerateCode = async () => {
        setIsGenerating(true);
        try {
            const { code } = await api.generatePromoCode();
            setFormData(prev => ({ ...prev, code }));
        } catch (error) {
            alert("Failed to generate code");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreatePromo = async () => {
        setIsSubmitting(true);
        try {
            await api.createPromo(formData);
            onRefresh();
            setIsCreateOpen(false);
            setFormData({
                code: "",
                discountPercent: 10,
                usageLimit: 100,
                applicableCategories: [],
                expiresAt: ""
            });
        } catch (error) {
            alert("Failed to create promo");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePromo = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.deletePromo(id);
            onRefresh();
        } catch (error) {
            alert("Delete failed");
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await api.togglePromoStatus(id);
            // We don't call onRefresh() anymore to avoid the global loading state
            // The UI will update via the socket.io listener in AdminPage
        } catch (error) {
            alert("Toggle failed");
            onRefresh(); // Refresh only on error to sync state
        }
    };

    const openQRModal = (promo: any) => {
        setSelectedPromo(promo);
        setIsQRModalOpen(true);
    };

    const downloadCard = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 2, // Higher quality
                backgroundColor: null,
                logging: false
            });
            const link = document.createElement('a');
            link.download = `promo-${selectedPromo.code}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download image. Try again.");
        }
    };

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={6}>
                <Text fontSize="xl" fontWeight="bold">Active Campaigns</Text>
                <Button colorScheme="red" onClick={() => setIsCreateOpen(true)} gap={2}>
                    <IoAdd /> New Promo Code
                </Button>
            </Flex>

            <Box bg="white" borderRadius="xl" shadow="sm" overflow="hidden">
                <Box overflowX="auto">
                    <Box as="table" w="full" style={{ borderCollapse: 'collapse' }}>
                        <Box as="thead" bg="gray.50">
                            <Box as="tr">
                                <Box as="th" p={4} textAlign="left" fontSize="xs" color="gray.500" textTransform="uppercase">Code</Box>
                                <Box as="th" p={4} textAlign="left" fontSize="xs" color="gray.500" textTransform="uppercase">Discount</Box>
                                <Box as="th" p={4} textAlign="left" fontSize="xs" color="gray.500" textTransform="uppercase">Usage</Box>
                                <Box as="th" p={4} textAlign="left" fontSize="xs" color="gray.500" textTransform="uppercase">Categories</Box>
                                <Box as="th" p={4} textAlign="left" fontSize="xs" color="gray.500" textTransform="uppercase">Status</Box>
                                <Box as="th" p={4} textAlign="right" fontSize="xs" color="gray.500" textTransform="uppercase">Actions</Box>
                            </Box>
                        </Box>
                        <Box as="tbody">
                            {promos.map((promo) => {
                                const usagePercent = Math.min(100, Math.round((promo.usedCount / promo.usageLimit) * 100));
                                return (
                                    <Box as="tr" key={promo._id} borderBottom="1px solid" borderColor="gray.50">
                                        <Box as="td" p={4}>
                                            <HStack gap={2}>
                                                <Text fontWeight="bold" color="red.500">{promo.code}</Text>
                                                <IconButton
                                                    aria-label="Copy"
                                                    size="xs"
                                                    variant="ghost"
                                                    onClick={() => navigator.clipboard.writeText(promo.code)}
                                                >
                                                    <IoCopy />
                                                </IconButton>
                                            </HStack>
                                        </Box>
                                        <Box as="td" p={4}>
                                            <Badge colorScheme="green">{promo.discountPercent}% OFF</Badge>
                                        </Box>
                                        <Box as="td" p={4}>
                                            <VStack align="stretch" gap={1} minW="120px">
                                                <HStack justify="space-between" fontSize="xs">
                                                    <Text>{promo.usedCount} / {promo.usageLimit}</Text>
                                                    <Text fontWeight="bold">{usagePercent}%</Text>
                                                </HStack>
                                                <Box w="full" h="4px" bg="gray.100" borderRadius="full" overflow="hidden">
                                                    <Box h="full" bg="red.500" w={`${usagePercent}%`} transition="width 0.3s" />
                                                </Box>
                                            </VStack>
                                        </Box>
                                        <Box as="td" p={4}>
                                            <HStack gap={1} wrap="wrap">
                                                {promo.applicableCategories.length === 0 ? (
                                                    <Badge variant="outline">All Items</Badge>
                                                ) : (
                                                    promo.applicableCategories.map((cat: string) => (
                                                        <Badge key={cat} size="sm" variant="subtle">{cat}</Badge>
                                                    ))
                                                )}
                                            </HStack>
                                        </Box>
                                        <Box as="td" p={4}>
                                            <Badge colorScheme={promo.isActive ? "green" : "gray"}>
                                                {promo.isActive ? "Active" : "Paused"}
                                            </Badge>
                                        </Box>
                                        <Box as="td" p={4} textAlign="right">
                                            <HStack justify="flex-end" gap={2}>
                                                <IconButton
                                                    aria-label="QR Code"
                                                    size="sm"
                                                    onClick={() => openQRModal(promo)}
                                                >
                                                    <IoQrCode />
                                                </IconButton>
                                                <IconButton
                                                    aria-label={promo.isActive ? "Pause" : "Resume"}
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleToggleStatus(promo._id)}
                                                >
                                                    {promo.isActive ? <IoPause /> : <IoPlay />}
                                                </IconButton>
                                                <IconButton
                                                    aria-label="Delete"
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDeletePromo(promo._id)}
                                                >
                                                    <IoTrash />
                                                </IconButton>
                                            </HStack>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </Box>
                {promos.length === 0 && (
                    <Box p={12} textAlign="center">
                        <Text color="gray.500">No promo codes created yet.</Text>
                    </Box>
                )}
            </Box>

            {/* Manual Modal - Create */}
            {isCreateOpen && (
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
                    onClick={() => setIsCreateOpen(false)}
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
                            <Text fontWeight="bold" fontSize="xl">New Promo Code</Text>
                            <IconButton aria-label="Close" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                                <IoClose size={24} />
                            </IconButton>
                        </Flex>
                        <Box p={6}>
                            <VStack gap={4} align="stretch">
                                <Box>
                                    <Text fontWeight="bold" mb={2} fontSize="sm">Promo Code</Text>
                                    <HStack gap={2}>
                                        <Input
                                            placeholder="e.g. PIZZALOVE"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleGenerateCode}
                                            loading={isGenerating}
                                            px={6}
                                        >
                                            Generate
                                        </Button>
                                    </HStack>
                                </Box>

                                <HStack gap={4}>
                                    <Box flex={1}>
                                        <Text fontWeight="bold" mb={2} fontSize="sm">Discount (%)</Text>
                                        <Input
                                            type="number"
                                            value={formData.discountPercent}
                                            onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                                        />
                                    </Box>
                                    <Box flex={1}>
                                        <Text fontWeight="bold" mb={2} fontSize="sm">Usage Limit</Text>
                                        <Input
                                            type="number"
                                            value={formData.usageLimit}
                                            onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                        />
                                    </Box>
                                </HStack>

                                <Box>
                                    <Text fontWeight="bold" mb={1} fontSize="sm">Applicable Categories</Text>
                                    <Text fontSize="2xs" color="gray.500" mb={3}>Empty for all categories</Text>
                                    <Flex gap={4} wrap="wrap">
                                        {categories.map((cat) => (
                                            <HStack key={cat} as="label" cursor="pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.applicableCategories.includes(cat)}
                                                    onChange={(e) => {
                                                        const newCats = e.target.checked
                                                            ? [...formData.applicableCategories, cat]
                                                            : formData.applicableCategories.filter(c => c !== cat);
                                                        setFormData({ ...formData, applicableCategories: newCats });
                                                    }}
                                                />
                                                <Text fontSize="sm">{cat}</Text>
                                            </HStack>
                                        ))}
                                    </Flex>
                                </Box>

                                <Box>
                                    <Text fontWeight="bold" mb={2} fontSize="sm">Expiry Date</Text>
                                    <Input
                                        type="date"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    />
                                </Box>
                            </VStack>
                        </Box>
                        <Flex p={6} borderTop="1px solid" borderColor="gray.100" justify="flex-end" gap={3}>
                            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button
                                colorScheme="red"
                                onClick={handleCreatePromo}
                                loading={isSubmitting}
                            >
                                Create Promo
                            </Button>
                        </Flex>
                    </Box>
                </Box>
            )}

            {/* Manual Modal - QR Code Card */}
            {isQRModalOpen && (
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
                    onClick={() => setIsQRModalOpen(false)}
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
                            <Text fontWeight="bold" fontSize="xl">Promo Social Card</Text>
                            <IconButton aria-label="Close" variant="ghost" onClick={() => setIsQRModalOpen(false)}>
                                <IoClose size={24} />
                            </IconButton>
                        </Flex>

                        <Box p={8} bg="gray.50">
                            <Center>
                                <Box
                                    ref={cardRef}
                                    bg="red.500"
                                    w="320px"
                                    h="460px"
                                    borderRadius="2xl"
                                    p={6}
                                    color="white"
                                    position="relative"
                                    shadow="2xl"
                                    textAlign="center"
                                    overflow="hidden"
                                >
                                    <Box position="absolute" top="-40px" left="-40px" w="120px" h="120px" bg="whiteAlpha.100" borderRadius="full" />
                                    <Box position="absolute" bottom="-80px" right="-80px" w="240px" h="240px" bg="whiteAlpha.100" borderRadius="full" />

                                    <VStack gap={5} position="relative" zIndex={1}>
                                        <Text fontSize="xl" fontWeight="black" letterSpacing="widest">HARRIS PIZZA</Text>
                                        <Text fontSize="4xl" fontWeight="black" lineHeight="1">
                                            GET {selectedPromo?.discountPercent}%<br />
                                            <Text as="span" fontSize="xl">DISCOUNT</Text>
                                        </Text>

                                        <Box bg="white" p={3} borderRadius="xl" shadow="inner">
                                            <QRCodeSVG
                                                value={`${window.location.origin}/?promo=${selectedPromo?.code}`}
                                                size={140}
                                            />
                                        </Box>

                                        <VStack gap={0}>
                                            <Text fontSize="xs" opacity={0.8}>Use Promo Code</Text>
                                            <Text fontSize="3xl" fontWeight="black" color="yellow.300">{selectedPromo?.code}</Text>
                                        </VStack>

                                        <Text fontSize="2xs" opacity={0.6}>Scan to Order Now • Terms Apply</Text>
                                    </VStack>
                                </Box>
                            </Center>
                        </Box>

                        <Box p={6}>
                            <Button
                                w="full"
                                colorScheme="red"
                                onClick={downloadCard}
                                gap={2}
                            >
                                <IoDownload /> Download for Social Media
                            </Button>
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
