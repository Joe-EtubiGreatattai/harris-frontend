import { useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Center, Spinner, Text } from "@chakra-ui/react"
import { api } from "../services/api"
import { useUser } from "../context/UserContext"
import { useCart } from "../context/CartContext"

export const PaymentCallbackPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const reference = searchParams.get('reference')
    const { refreshOrders } = useUser()
    const { clearCart } = useCart()
    const verificationStarted = useRef(false)

    useEffect(() => {
        const verify = async () => {
            if (verificationStarted.current) return
            verificationStarted.current = true

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

                console.log("✅ Payment verified successfully - Order should be created via Webhook")

                // Wait a moment for webhook to finalize (optional but helpful for immediate redirect)
                await new Promise(resolve => setTimeout(resolve, 2000))

                // Refresh user context to show new active order (fetched from DB)
                console.log("🔵 Refreshing orders...")
                refreshOrders()

                // Clear cart via context
                clearCart()
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
