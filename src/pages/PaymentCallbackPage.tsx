import { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Center, Spinner, Text } from "@chakra-ui/react"
import { api } from "../services/api"
import { useUser } from "../context/UserContext"

export const PaymentCallbackPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const reference = searchParams.get('reference')
    const { refreshOrders } = useUser()

    useEffect(() => {
        const verify = async () => {
            if (reference) {
                try {
                    await api.verifyPayment(reference)
                    // Payment success
                    const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder') || '{}')
                    if (pendingOrder && pendingOrder.userEmail) {
                        // Create Order
                        await api.createOrder(pendingOrder)

                        // Refresh user context to show new active order
                        refreshOrders()

                        // Clear cart locally
                        localStorage.removeItem('cart_items')
                        localStorage.removeItem('pendingOrder')

                        // Redirect to Tracking
                        navigate('/tracking')
                    }
                } catch (error) {
                    console.error("Payment verification failed", error)
                    navigate('/')
                }
            }
        }
        verify()
    }, [reference, navigate, refreshOrders])

    return (
        <Center h="100vh" flexDirection="column" gap={4}>
            <Spinner size="xl" color="green.500" />
            <Text>Verifying payment...</Text>
        </Center>
    )
}
