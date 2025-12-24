import { Box, Container } from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import { FloatingCartButton } from "./FloatingCartButton"
import { FloatingTrackerButton } from "./FloatingTrackerButton"

export const MainLayout = () => {
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
