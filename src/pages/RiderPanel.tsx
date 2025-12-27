import { Box, Flex, Text, Button, VStack, HStack, Badge, Image, Spinner } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { IoBicycle, IoCheckmarkCircle, IoCloudDone, IoLocation, IoMap, IoLogOut, IoInformationCircle } from "react-icons/io5";
import { api } from "../services/api";
import { socket } from "../services/socket";
import { toaster } from "../components/ui/toaster";
import { RiderViewMap } from "../components/rider/RiderViewMap";
import type { Order } from "../context/UserContext";

export const RiderPanel = () => {
    const [riders, setRiders] = useState<any[]>([]);
    const [selectedRider, setSelectedRider] = useState<any>(null);
    const [isOnline, setIsOnline] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPos, setCurrentPos] = useState({ lat: 6.5244, lng: 3.3792 });
    const [showMap, setShowMap] = useState(false);
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const trackingInterval = useRef<any>(null);

    useEffect(() => {
        fetchRiders();
        return () => {
            if (trackingInterval.current) clearInterval(trackingInterval.current);
        };
    }, []);

    useEffect(() => {
        if (selectedRider && (isOnline || showMap)) {
            fetchActiveOrder();
        }
    }, [selectedRider, isOnline, showMap]);

    const fetchActiveOrder = async () => {
        if (!selectedRider) return;
        try {
            const orders = await api.getAssignedOrders(selectedRider._id);
            if (orders && orders.length > 0) {
                setActiveOrder(orders[0]); // Get the most recent active order
            } else {
                setActiveOrder(null);
            }
        } catch (error) {
            console.error("Failed to fetch active order", error);
        }
    };

    const fetchRiders = async () => {
        try {
            const data = await api.getRiders();
            setRiders(data);
        } catch (error) {
            console.error("Failed to fetch riders", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectRider = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const rider = riders.find(r => r._id === e.target.value);
        setSelectedRider(rider);
    };

    const toggleOnline = async () => {
        if (!selectedRider) return;

        const newOnlineStatus = !isOnline;
        const newStatus = newOnlineStatus ? 'Available' : 'Offline';

        try {
            await api.updateRider(selectedRider._id, { status: newStatus });
            setIsOnline(newOnlineStatus);

            if (newOnlineStatus) {
                startTracking();
                toaster.create({ title: "You are now online", type: "success" });
            } else {
                stopTracking();
                toaster.create({ title: "You are now offline", type: "info" });
            }
        } catch (error) {
            toaster.create({ title: "Failed to update status", type: "error" });
        }
    };

    const startTracking = () => {
        if (trackingInterval.current) clearInterval(trackingInterval.current);

        // Initial location
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const init = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCurrentPos(init);
                broadcastLocation(init);
            },
            (err) => console.error("GPS Error", err),
            { enableHighAccuracy: true }
        );

        // Then every 10 seconds (standard for production tracking)
        trackingInterval.current = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setCurrentPos(next);
                    broadcastLocation(next);
                },
                (err) => console.error("GPS Error", err),
                { enableHighAccuracy: true }
            );
        }, 10000);
    };

    const stopTracking = () => {
        if (trackingInterval.current) {
            clearInterval(trackingInterval.current);
            trackingInterval.current = null;
        }
    };

    const broadcastLocation = (location: { lat: number, lng: number }) => {
        if (!selectedRider) return;
        socket.emit('updateRiderLocation', {
            riderId: selectedRider._id,
            location
        });
    };

    if (isLoading) {
        return (
            <Flex justify="center" align="center" h="100vh" bg="gray.900">
                <Spinner size="xl" color="red.500" />
            </Flex>
        );
    }

    if (!selectedRider) {
        return (
            <Flex justify="center" align="center" minH="100vh" bg="gray.900" p={4}>
                <VStack bg="white" p={8} borderRadius="3xl" shadow="2xl" w="full" maxW="400px" gap={6}>
                    <Box textAlign="center">
                        <Box p={4} bg="red.50" color="red.500" borderRadius="full" display="inline-block" mb={4}>
                            <IoBicycle size={40} />
                        </Box>
                        <Text fontSize="2xl" fontWeight="black">Rider Login</Text>
                        <Text color="gray.500">Select your profile to start tracking</Text>
                    </Box>

                    <Box w="full">
                        <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.600">Choose Rider Profile</Text>
                        <select
                            style={{
                                width: '100%',
                                height: '50px',
                                padding: '0 12px',
                                borderRadius: '12px',
                                border: '1px solid #E2E8F0',
                                outline: 'none',
                                fontSize: '16px'
                            }}
                            onChange={handleSelectRider}
                        >
                            <option value="">Select a rider...</option>
                            {riders.map(r => (
                                <option key={r._id} value={r._id}>{r.name} ({r.email})</option>
                            ))}
                        </select>
                    </Box>

                    <Button
                        w="full"
                        h="55px"
                        colorScheme="red"
                        borderRadius="2xl"
                        disabled={!selectedRider}
                        shadow="lg"
                        onClick={() => { }} // Selection logic is handled by handleSelectRider
                    >
                        Access Panel
                    </Button>
                </VStack>
            </Flex>
        );
    }

    return (
        <Box minH="100vh" bg="gray.50">
            {/* Header */}
            <Box bg="white" p={4} shadow="sm" borderBottom="1px solid" borderColor="gray.100" position="sticky" top={0} zIndex={10}>
                <Flex justify="space-between" align="center" maxW="600px" mx="auto">
                    <HStack gap={3}>
                        <Image src={selectedRider.image} w="40px" h="40px" borderRadius="full" border="2px solid" borderColor="red.500" />
                        <VStack align="start" gap={0}>
                            <Text fontWeight="bold" fontSize="sm">{selectedRider.name}</Text>
                            <Badge colorScheme={isOnline ? "green" : "gray"}>{isOnline ? "ONLINE" : "OFFLINE"}</Badge>
                        </VStack>
                    </HStack>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedRider(null); stopTracking(); setIsOnline(false); }}>
                        <IoLogOut size={20} />
                    </Button>
                </Flex>
            </Box>

            <VStack p={6} gap={6} maxW="600px" mx="auto" pt={8}>
                {/* Status Card */}
                <Box bg="white" w="full" p={6} borderRadius="3xl" shadow="md">
                    <VStack gap={6}>
                        <Flex justify="space-between" align="center" w="full">
                            <VStack align="start" gap={0}>
                                <Text fontWeight="bold" fontSize="lg">Duty Status</Text>
                                <Text fontSize="sm" color="gray.500">{isOnline ? "Live tracking active" : "You are currently offline"}</Text>
                            </VStack>
                            <Button
                                colorScheme={isOnline ? "red" : "green"}
                                onClick={toggleOnline}
                                borderRadius="full"
                                px={8}
                            >
                                {isOnline ? "Go Offline" : "Go Online"}
                            </Button>
                        </Flex>

                        {isOnline ? (
                            <Box w="full" bg="green.50" p={4} borderRadius="2xl" border="1px solid" borderColor="green.100">
                                <VStack align="start" gap={1}>
                                    <HStack color="green.700" gap={3}>
                                        <IoCheckmarkCircle size={24} />
                                        <Text fontWeight="bold">Broadcasting Location</Text>
                                    </HStack>
                                    <Text fontSize="xs" color="green.600" ml={9}>
                                        Lat: {currentPos.lat.toFixed(6)}, Lng: {currentPos.lng.toFixed(6)}
                                    </Text>
                                </VStack>
                            </Box>
                        ) : (
                            <Box w="full" bg="gray.100" p={4} borderRadius="2xl">
                                <HStack color="gray.600" gap={3}>
                                    <IoLocation size={24} />
                                    <Text fontWeight="bold">Tracking Suspended</Text>
                                </HStack>
                            </Box>
                        )}
                    </VStack>
                </Box>

                {/* Info Alert */}
                <Box w="full" bg="blue.50" p={4} borderRadius="2xl" border="1px solid" borderColor="blue.100">
                    <HStack align="start" gap={3}>
                        <Box color="blue.500" mt={1}>
                            <IoInformationCircle size={20} />
                        </Box>
                        <VStack align="start" gap={0}>
                            <Text fontWeight="bold" fontSize="sm" color="blue.800">Operational Notice</Text>
                            <Text fontSize="xs" color="blue.600">Ensure GPS is enabled on your device. Keep this browser tab active to prevent tracking interruptions during your shift.</Text>
                        </VStack>
                    </HStack>
                </Box>

                <HStack w="full" gap={4}>
                    <Button
                        flex={1}
                        colorPalette="red"
                        variant="subtle"
                        h="64px"
                        borderRadius="2xl"
                        gap={2}
                        onClick={() => setShowMap(true)}
                        fontSize="md"
                        fontWeight="bold"
                    >
                        <IoMap size={20} /> View Map
                    </Button>
                    <Button
                        flex={1}
                        colorPalette="gray"
                        variant="subtle"
                        h="64px"
                        borderRadius="2xl"
                        gap={2}
                        fontSize="md"
                        fontWeight="bold"
                    >
                        <IoCloudDone size={20} /> Orders
                    </Button>
                </HStack>

                {showMap && (
                    <RiderViewMap
                        riderPos={currentPos}
                        customerEmail={activeOrder?.user?.email}
                        onClose={() => setShowMap(false)}
                    />
                )}
            </VStack>
        </Box>
    );
};
