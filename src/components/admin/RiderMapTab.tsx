import { Box, Flex, Text, Badge, Spinner, VStack, HStack, Image } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IoLocation } from "react-icons/io5";
import { socket } from "../../services/socket";
import { api } from "../../services/api";

// Fix for default marker icons in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const getMarkerIcon = (type: 'rider' | 'customer', status?: string) => {
    let color = "#3182ce"; // Default blue
    if (type === 'rider') {
        if (status === 'Available') color = "#38a169"; // green
        if (status === 'Busy') color = "#dd6b20"; // orange
        if (status === 'Suspended') color = "#e53e3e"; // red
    } else {
        color = "#805ad5"; // purple for customers
    }

    return L.divIcon({
        className: 'custom-map-icon',
        html: `
            <div style="
                background-color: ${color};
                width: 30px;
                height: 30px;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            ">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    ${type === 'rider'
                ? '<path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"></path><circle cx="12" cy="10" r="3"></circle>'
                : '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>'
            }
                </svg>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
};

// Component to handle map centering/zooming
const MapController = ({ items }: { items: any[] }) => {
    const map = useMap();

    useEffect(() => {
        if (items.length > 0) {
            const coords = items.map(r => [r.location.lat, r.location.lng] as [number, number]);
            if (coords.length > 0) {
                const bounds = L.latLngBounds(coords);
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
            }
        }
    }, [items.length, map]);

    return null;
};

export const RiderMapTab = () => {
    const [riders, setRiders] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();

        const handleRiderLocationUpdate = (data: any) => {
            setRiders(prev => prev.map(r =>
                r._id === data.riderId
                    ? { ...r, location: data.location, status: data.status }
                    : r
            ));
        };

        const handleUserLocationUpdate = (data: any) => {
            setCustomers(prev => {
                const exists = prev.some(c => c.email === data.email);
                if (!data.isSharing) return prev.filter(c => c.email !== data.email);
                if (exists) {
                    return prev.map(c => c.email === data.email ? { ...c, location: data.location } : c);
                } else {
                    return [...prev, { email: data.email, location: data.location }];
                }
            });
        };

        socket.on('riderLocationUpdated', handleRiderLocationUpdate);
        socket.on('userLocationUpdated', handleUserLocationUpdate);

        return () => {
            socket.off('riderLocationUpdated', handleRiderLocationUpdate);
            socket.off('userLocationUpdated', handleUserLocationUpdate);
        };
    }, []);

    const fetchData = async () => {
        try {
            const [riderData, customerData] = await Promise.all([
                api.getRiders(),
                api.getSharingUsers()
            ]);

            setRiders(riderData.map((r: any) => ({
                ...r,
                location: r.location || { lat: 6.5244, lng: 3.3792 }
            })));

            setCustomers(customerData || []);
        } catch (error) {
            console.error("Failed to fetch map data", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Flex justify="center" align="center" h="500px">
                <Spinner size="xl" color="red.500" />
            </Flex>
        );
    }

    return (
        <VStack gap={6} align="stretch" h="full">
            <Flex justify="space-between" align="center">
                <Box>
                    <Text fontSize="xl" fontWeight="bold">Logistics Command Center</Text>
                    <Text fontSize="sm" color="gray.500">
                        {riders.filter(r => r.status !== 'Offline').length} Riders Online | {customers.length} Customers Sharing
                    </Text>
                </Box>
                <HStack gap={4}>
                    <HStack gap={2}>
                        <Box w={3} h={3} borderRadius="full" bg="green.500" />
                        <Text fontSize="xs">Rider</Text>
                    </HStack>
                    <HStack gap={2}>
                        <Box w={3} h={3} borderRadius="full" bg="purple.500" />
                        <Text fontSize="xs">Customer</Text>
                    </HStack>
                </HStack>
            </Flex>

            <Box
                h="600px"
                borderRadius="2xl"
                overflow="hidden"
                shadow="xl"
                border="1px solid"
                borderColor="gray.100"
                position="relative"
                zIndex={1}
            >
                <MapContainer
                    center={[6.5244, 3.3792]}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Riders */}
                    {riders.filter(r => r.status !== 'Offline').map((rider) => (
                        <Marker
                            key={rider._id}
                            position={[rider.location.lat, rider.location.lng]}
                            icon={getMarkerIcon('rider', rider.status)}
                        >
                            <Popup>
                                <VStack align="start" gap={1} p={1}>
                                    <HStack>
                                        <Image
                                            src={rider.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + rider.name}
                                            w="24px" h="24px"
                                            borderRadius="full"
                                        />
                                        <Text fontWeight="bold" fontSize="sm">{rider.name} (Rider)</Text>
                                    </HStack>
                                    <Badge colorScheme={rider.status === 'Available' ? 'green' : 'orange'}>
                                        {rider.status}
                                    </Badge>
                                    <Text fontSize="xs">{rider.phone}</Text>
                                </VStack>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Customers */}
                    {customers.map((customer) => (
                        <Marker
                            key={customer.email}
                            position={[customer.location.lat, customer.location.lng]}
                            icon={getMarkerIcon('customer')}
                        >
                            <Popup>
                                <VStack align="start" gap={1} p={1}>
                                    <HStack>
                                        <Box bg="purple.500" p={1} borderRadius="full" color="white">
                                            <IoLocation size={12} />
                                        </Box>
                                        <Text fontWeight="bold" fontSize="sm">{customer.email.split('@')[0]} (Customer)</Text>
                                    </HStack>
                                    <Text fontSize="xs">{customer.email}</Text>
                                    <Badge colorScheme="purple" variant="subtle">Live Sharing</Badge>
                                </VStack>
                            </Popup>
                        </Marker>
                    ))}

                    <MapController items={[...riders.filter(r => r.status !== 'Offline'), ...customers]} />
                </MapContainer>
            </Box>
        </VStack>
    );
};
