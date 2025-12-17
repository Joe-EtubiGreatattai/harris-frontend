import { useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Center, Spinner, Text, VStack } from "@chakra-ui/react"
import { api } from "../services/api"
import { useUser } from "../context/UserContext"

export const PaymentCallbackPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { user, activeOrders } = useUser()
    const verifiedRef = useRef(false)

    // Retrieve temporary order data from localStorage
    const getPendingOrder = () => {
        const data = localStorage.getItem('pendingOrder')
        return data ? JSON.parse(data) : null
    }

    useEffect(() => {
        const reference = searchParams.get('reference')

        const verify = async () => {
            if (!reference || verifiedRef.current) return
            verifiedRef.current = true

            try {
                const result = await api.verifyPayment(reference)

                if (result.status && result.data.status === 'success') {
                    // Payment successful, now create the order
                    const pendingOrder = getPendingOrder()

                    if (pendingOrder) {
                        try {
                            const newOrder = await api.createOrder(pendingOrder)
                            // Manually refresh orders (or rely on context polling/update)
                            // Assuming context might not auto-refresh deeply enough or fast enough without a trigger
                            // But since we are navigating, a simple "reload" or context refresh would be good.
                            // For now, let's trust the context or force a reload if needed.
                            // Actually, calling createOrder updates the backend.
                            // We should clear the pending order.
                            localStorage.removeItem('pendingOrder')
                            localStorage.removeItem('cart') // Clear cart on success

                            // window.location.href = '/tracking' // Force reload to update context
                            navigate('/tracking')
                            // Ideally, we should also update the context, but navigation to tracking will re-mount components
                            // TrackingPage uses activeOrders from context. Context needs to know about the new order.
                            // The context usually fetches on mount or update.
                            window.location.reload() // Safest way to ensure context updates for now
                        } catch (err) {
                            console.error("Order creation failed even after payment", err)
                            alert("Payment received but order creation failed. Please contact support.")
                            navigate('/')
                        }
                    } else {
                        console.error("No pending order found")
                        navigate('/')
                    }
                } else {
                    alert("Payment verification failed")
                    navigate('/cart')
                }
            } catch (err) {
                console.error("Verification error", err)
                alert("Payment verification error")
                navigate('/cart')
            }
        }

        verify()
    }, [searchParams, navigate])

    return (
        <Center h="100vh" flexDirection="column">
            <VStack gap={4}>
                <Spinner size="xl" color="green.500" thickness="4px" />
                <Text fontSize="lg" fontWeight="bold">Verifying Payment...</Text>
                <Text color="gray.500">Please do not close this window</Text>
            </VStack>
        </Center>
    )
}
