import {
    createToaster,
    Toaster as ChakraToaster,
    Stack,
    Text,
    IconButton,
    Portal,
    Box,
} from "@chakra-ui/react"
import { IoClose } from "react-icons/io5"

export const toaster = createToaster({
    placement: "top-end",
    pauseOnPageIdle: true,
})

export const Toaster = () => {
    return (
        <Portal>
            <ChakraToaster toaster={toaster} insetInline="4">
                {(toast) => (
                    <Box
                        key={toast.id}
                        bg="white"
                        p={4}
                        borderRadius="2xl"
                        shadow="2xl"
                        border="1px solid"
                        borderColor="red.100"
                        minW="300px"
                        position="relative"
                        display="flex"
                        flexDirection="column"
                    >
                        <Stack gap="1">
                            {toast.title && (
                                <Text fontWeight="bold" fontSize="sm">
                                    {toast.title}
                                </Text>
                            )}
                            {toast.description && (
                                <Text fontSize="xs" color="gray.600">
                                    {toast.description}
                                </Text>
                            )}
                        </Stack>
                        <IconButton
                            aria-label="Close"
                            size="xs"
                            variant="ghost"
                            position="absolute"
                            top="2"
                            right="2"
                            onClick={() => toaster.dismiss(toast.id)}
                        >
                            <IoClose />
                        </IconButton>
                    </Box>
                )}
            </ChakraToaster>
        </Portal>
    )
}
