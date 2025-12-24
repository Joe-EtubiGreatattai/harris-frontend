import { Flex, Text, Box, Spinner } from "@chakra-ui/react"
import { IoLocationSharp } from "react-icons/io5"
import { useState, useEffect } from "react"
import { useUser } from "../../context/UserContext"

import { useNavigate } from "react-router-dom"

export const HomeHeader = () => {
    const [address, setAddress] = useState("Locating...")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Contexts
    const { user, setGeoAddress } = useUser()

    const navigate = useNavigate()



    const fetchAddress = () => {
        setLoading(true)
        setError(null)

        if (user && user.address) {
            setAddress(user.address)
            setGeoAddress(user.address)
            setLoading(false)
            return
        }

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser")
            setLoading(false)
            setAddress("Location unavailable")
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    const data = await response.json()

                    if (data && data.address) {
                        // Construct a shorter address: Road, City/Suburb
                        const road = data.address.road || data.address.pedestrian || ""
                        const city = data.address.city || data.address.town || data.address.suburb || data.address.village || ""
                        const shortAddress = [road, city].filter(Boolean).join(", ")
                        const displayAddr = shortAddress || data.display_name.split(",")[0]

                        setAddress(displayAddr)
                        setGeoAddress(data.display_name) // Store full address in context
                    } else {
                        setAddress("Address not found")
                    }
                } catch (err) {
                    console.error("Failed to fetch address", err)
                    setError("Failed to fetch address")
                    setAddress("Location Error")
                } finally {
                    setLoading(false)
                }
            },
            (err) => {
                console.error("Geolocation error", err)
                setError("Unable to retrieve your location")
                setLoading(false)
                setAddress("Location access denied")
            }
        )
    }

    useEffect(() => {
        fetchAddress()
    }, [])

    return (
        <Flex
            justify="space-between"
            align="center"
            py={6}
            px={6}
            bg="white"
            position="sticky"
            top={0}
            zIndex={100}
            shadow="md"
            w="full"
        >
            <Box onClick={fetchAddress} cursor="pointer">
                <Flex align="center" gap={2} color="gray.500" fontSize="xs" mb={1}>
                    <IoLocationSharp color="#e53e3e" />
                    <Text textTransform="uppercase" letterSpacing="wide" fontWeight="bold" fontSize="10px">Your delivery address</Text>
                </Flex>
                <Flex align="center" gap={2}>
                    <Text fontWeight="bold" fontSize="md" truncate maxW="250px" color="gray.800">
                        {address}
                    </Text>
                    {loading && <Spinner size="xs" color="red.500" />}
                </Flex>
                {error && <Text fontSize="xs" color="red.500">{error} (Tap to retry)</Text>}
            </Box>

            <Box
                w="40px"
                h="40px"
                borderRadius="full"
                overflow="hidden"
                border="2px solid"
                borderColor="gray.100"
                cursor="pointer"
                onClick={() => navigate('/profile')}
            >
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
        </Flex>
    )
}
