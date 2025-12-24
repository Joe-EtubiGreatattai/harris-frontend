import { Box, Flex } from "@chakra-ui/react"
import { IoTimeOutline } from "react-icons/io5"
import { useNavigate, useLocation } from "react-router-dom"
import { useUser } from "../../context/UserContext"
import { motion, AnimatePresence } from "framer-motion"

export const FloatingTrackerButton = () => {
    const { hasActiveOrder, activeOrders } = useUser()
    const navigate = useNavigate()
    const location = useLocation()

    // Don't show on tracking page or if no active orders
    if (!hasActiveOrder || location.pathname === '/tracking') return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000
                }}
            >
                <Box
                    w="56px"
                    h="56px"
                    borderRadius="full"
                    bg="red.100" // Light red background like original
                    color="red.600"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onClick={() => navigate('/tracking')}
                    boxShadow="lg"
                    border="2px solid"
                    borderColor="red.500"
                    animation="pulse 2s infinite"
                    _hover={{ transform: 'scale(1.05)' }}
                    _active={{ transform: 'scale(0.95)' }}
                    transition="all 0.2s"
                >
                    <IoTimeOutline size={28} />
                    {activeOrders.length > 0 && (
                        <Flex
                            position="absolute"
                            top="-5px"
                            right="-5px"
                            bg="red.600"
                            color="white"
                            w="24px"
                            h="24px"
                            borderRadius="full"
                            align="center"
                            justify="center"
                            fontSize="sm"
                            fontWeight="bold"
                            border="2px solid white"
                        >
                            {activeOrders.length}
                        </Flex>
                    )}
                </Box>
            </motion.div>
        </AnimatePresence>
    )
}
