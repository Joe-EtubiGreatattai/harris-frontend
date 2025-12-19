
import { Box, Flex, Text } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { IoCloudOfflineOutline } from "react-icons/io5"

export const OfflineBanner = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine)

    useEffect(() => {
        const handleOnline = () => setIsOffline(false)
        const handleOffline = () => setIsOffline(true)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (!isOffline) return null

    return (
        <Box bg="orange.400" color="white" py={2} px={4} shadow="md">
            <Flex align="center" justify="center" gap={3}>
                <IoCloudOfflineOutline size={20} />
                <Text fontWeight="bold" fontSize="sm">
                    You're currently offline. Some features may be limited.
                </Text>
            </Flex>
        </Box>
    )
}
