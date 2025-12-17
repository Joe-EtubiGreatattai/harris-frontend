import { Box, Container } from "@chakra-ui/react"
import { Outlet } from "react-router-dom"

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
                overflowY="auto"
                overflowX="hidden"
            >
                <Outlet />
            </Container>
        </Box>
    )
}
