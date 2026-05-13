import { Box, Container } from "@chakra-ui/react"
import { Outlet, useLocation } from "react-router-dom"
import { FloatingCartButton } from "./FloatingCartButton"
import { FloatingTrackerButton } from "./FloatingTrackerButton"
import { useEffect } from "react"

export const MainLayout = () => {
    const location = useLocation()

    useEffect(() => {
        const targetUrl = "https://resturants-sooty.vercel.app/harris"

        if (location.pathname === '/' || location.pathname === '/home') {
            if (window.location.href !== targetUrl) {
                window.location.replace(targetUrl)
            }
        }
    }, [location.pathname])

    return (
        <Box minH="100vh" bg="gray.100" display="flex" justifyContent="center">
            <Container
                maxW="md"
                p={0}
                minH="100vh"
                bg="white"
                boxShadow="2xl"
                position="relative"
            >
                <Outlet />
                <FloatingCartButton />
                <FloatingTrackerButton />
            </Container>
        </Box>
    )
}
