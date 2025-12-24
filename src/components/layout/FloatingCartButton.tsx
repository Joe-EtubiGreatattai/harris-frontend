import { Box, Flex } from "@chakra-ui/react"
import { IoCartOutline } from "react-icons/io5"
import { useNavigate, useLocation } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { motion, AnimatePresence } from "framer-motion"

export const FloatingCartButton = () => {
    const { items } = useCart()
    const navigate = useNavigate()
    const location = useLocation()

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
    const hasItems = itemCount > 0
    const isCartPage = location.pathname === '/cart'

    // Don't show on cart page or if empty
    if (!hasItems || isCartPage) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 1000
                }}
            >
                <Box
                    w="56px"
                    h="56px"
                    borderRadius="full"
                    bg="red.500"
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onClick={() => navigate('/cart')}
                    boxShadow="lg"
                    _hover={{ transform: 'scale(1.05)' }}
                    _active={{ transform: 'scale(0.95)' }}
                    transition="all 0.2s"
                >
                    <IoCartOutline size={28} />
                    <Flex
                        position="absolute"
                        top="-5px"
                        right="-5px"
                        bg="white"
                        color="red.500"
                        w="24px"
                        h="24px"
                        borderRadius="full"
                        align="center"
                        justify="center"
                        fontSize="sm"
                        fontWeight="bold"
                        border="2px solid"
                        borderColor="red.500"
                    >
                        {itemCount}
                    </Flex>
                </Box>
            </motion.div>
        </AnimatePresence>
    )
}
