import { Box, Flex, Input } from "@chakra-ui/react"
import { IoSearch } from "react-icons/io5"

interface SearchSectionProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export const SearchSection = ({ searchQuery, onSearchChange }: SearchSectionProps) => {
    return (
        <Box px={6} mb={6}>
            <Flex align="center" bg="gray.50" borderRadius="full" px={5} py={3} boxShadow="sm">
                <IoSearch color="#A0AEC0" size={20} />
                <Input
                    variant="flushed"
                    placeholder="Search pizza..."
                    ml={3}
                    borderBottom="none"
                    _focus={{ borderBottom: "none", outline: "none" }}
                    bg="transparent"
                    fontSize="sm"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </Flex>
        </Box>
    )
}
