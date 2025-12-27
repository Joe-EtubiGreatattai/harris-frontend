import { Box, Flex, Text, Badge, VStack, HStack, IconButton } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IoChevronBack, IoLocation } from "react-icons/io5";
import { socket } from "../../services/socket";

// Fix for default marker icons in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getMarkerIcon = (type: 'rider' | 'customer') => {
    const color = type === 'rider' ? "#38a169" : "#805ad5";
    return L.divIcon({
        className: 'custom-map-icon',
        html: `
            <div style="
                background-color: ${color};
                width: 32px;
                height: 32px;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            ">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    ${type === 'rider'
                ? '<path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"></path><circle cx="12" cy="10" r="3"></circle>'
                : '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>'
            }
                </svg>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

const MapController = ({ riderPos, customerPos }: { riderPos: any, customerPos?: any }) => {
    const map = useMap();

    useEffect(() => {
        if (riderPos) {
            if (customerPos) {
                const bounds = L.latLngBounds([
                    [riderPos.lat, riderPos.lng],
                    [customerPos.lat, customerPos.lng]
                ]);
                map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
            } else {
                map.setView([riderPos.lat, riderPos.lng], 15);
            }
        }
    }, [riderPos, customerPos, map]);

    return null;
};

interface RiderViewMapProps {
    riderPos: { lat: number, lng: number };
    customerEmail?: string;
    onClose: () => void;
}

export const RiderViewMap = ({ riderPos, customerEmail, onClose }: RiderViewMapProps) => {
    const [customerPos, setCustomerPos] = useState<any>(null);

    useEffect(() => {
        if (!customerEmail) return;

        const handleUserLocationUpdate = (data: any) => {
            if (data.email === customerEmail) {
                if (data.isSharing) {
                    setCustomerPos(data.location);
                } else {
                    setCustomerPos(null);
                }
            }
        };

        socket.on('userLocationUpdated', handleUserLocationUpdate);
        return () => {
            socket.off('userLocationUpdated', handleUserLocationUpdate);
        };
    }, [customerEmail]);

    return (
        <Box position="fixed" top={0} left={0} right={0} bottom={0} zIndex={100} bg="white">
            <Flex direction="column" h="full">
                {/* Header */}
                <Flex align="center" p={4} bg="white" borderBottom="1px solid" borderColor="gray.100" shadow="sm" zIndex={10}>
                    <IconButton
                        aria-label="Back"
                        variant="ghost"
                        onClick={onClose}
                        mr={2}
                    >
                        <IoChevronBack size={24} />
                    </IconButton>
                    <Box flex={1}>
                        <Text fontWeight="bold" fontSize="lg">Delivery Navigation</Text>
                        <Text fontSize="xs" color="gray.500">
                            {customerPos ? "Tracking customer live location" : "Waiting for customer location..."}
                        </Text>
                    </Box>
                    {customerPos && (
                        <Badge colorScheme="purple" variant="solid" borderRadius="full" px={3}>LIVE</Badge>
                    )}
                </Flex>

                {/* Map */}
                <Box flex={1} position="relative">
                    <MapContainer
                        center={[riderPos.lat, riderPos.lng]}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Rider Marker */}
                        <Marker position={[riderPos.lat, riderPos.lng]} icon={getMarkerIcon('rider')}>
                            <Popup>You are here</Popup>
                        </Marker>

                        {/* Customer Marker */}
                        {customerPos && (
                            <Marker position={[customerPos.lat, customerPos.lng]} icon={getMarkerIcon('customer')}>
                                <Popup>
                                    <VStack align="start" gap={0} p={1}>
                                        <Text fontWeight="bold">Customer</Text>
                                        <Text fontSize="xs">{customerEmail}</Text>
                                    </VStack>
                                </Popup>
                            </Marker>
                        )}

                        <MapController riderPos={riderPos} customerPos={customerPos} />
                    </MapContainer>

                    {/* Overlay Info */}
                    {!customerPos && (
                        <Box
                            position="absolute"
                            bottom={10}
                            left={4}
                            right={4}
                            bg="white"
                            p={4}
                            borderRadius="2xl"
                            shadow="2xl"
                            zIndex={1000}
                            border="1px solid"
                            borderColor="blue.100"
                        >
                            <HStack gap={3}>
                                <Flex bg="blue.50" p={2} borderRadius="xl" color="blue.500">
                                    <IoLocation size={20} />
                                </Flex>
                                <VStack align="start" gap={0}>
                                    <Text fontWeight="bold" fontSize="sm">Tracking Status</Text>
                                    <Text fontSize="xs" color="gray.500">The customer hasn't enabled live sharing yet.</Text>
                                </VStack>
                            </HStack>
                        </Box>
                    )}
                </Box>
            </Flex>
        </Box>
    );
};
