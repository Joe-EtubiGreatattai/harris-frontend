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
            console.log("🔵 Payment callback - Starting verification")
            console.log("🔵 Reference:", reference)

            if (!reference) {
                console.log("❌ No reference found, redirecting to home")
                navigate('/')
                return
            }

            try {
                console.log("🔵 Calling verifyPayment API...")
                const verificationResult = await api.verifyPayment(reference)
                console.log("✅ Verification result:", verificationResult)

                // Check if payment was actually successful
                if (!verificationResult.status || verificationResult.data.status !== 'success') {
                    console.log("❌ Payment not successful:", verificationResult)
                    alert("Payment verification failed. Please contact support.")
                    navigate('/')
                    return
                }

                console.log("✅ Payment verified successfully")

                // Check for pending order
                const pendingOrderStr = localStorage.getItem('pendingOrder')
                console.log("🔵 Pending order from localStorage:", pendingOrderStr)

                const pendingOrder = JSON.parse(pendingOrderStr || '{}')

                if (!pendingOrder || !pendingOrder.user || !pendingOrder.user.email) {
                    console.log("❌ No pending order found or missing user email")
                    navigate('/')
                    return
                }

                console.log("🔵 Creating order with data:", pendingOrder)
                const orderResult = await api.createOrder(pendingOrder)
                console.log("✅ Order created:", orderResult)

                // Refresh user context to show new active order
                console.log("🔵 Refreshing orders...")
                refreshOrders()

                // Clear cart locally
                localStorage.removeItem('cart_items')
                localStorage.removeItem('pendingOrder')
                console.log("✅ Cleared cart and pending order")

                // Redirect to Tracking
                console.log("🔵 Navigating to /tracking")
                navigate('/tracking')
            } catch (error) {
                console.error("❌ Payment verification failed:", error)
                alert("An error occurred while processing your payment. Please contact support.")
                navigate('/')
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
