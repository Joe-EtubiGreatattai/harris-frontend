import { Flex, Text, VStack, Center, Box } from "@chakra-ui/react"

interface CategoryFilterProps {
    selectedCategory: string
    onSelectCategory: (category: string) => void
}

const PizzaIcon = ({ color, size }: { color: string, size?: string | number }) => (
    <Text color={color} fontSize={size} lineHeight="1">🍕</Text>
)

const BurgerIcon = ({ color, size }: { color: string, size?: string | number }) => (
    <Text color={color} fontSize={size} lineHeight="1">🍔</Text>
)

const DrinkIcon = ({ color, size }: { color: string, size?: string | number }) => (
    <Text color={color} fontSize={size} lineHeight="1">🥤</Text>
)

const ChickenIcon = ({ color, size }: { color: string, size?: string | number }) => (
    <Text color={color} fontSize={size} lineHeight="1">🍗</Text>
)

const ShawarmaIcon = ({ color, size }: { color: string, size?: string | number }) => (
    <Text color={color} fontSize={size} lineHeight="1">🥙</Text>
)

const categories = [
    { id: 1, name: "Pizza", icon: PizzaIcon },
    { id: 2, name: "Burger", icon: BurgerIcon },
    { id: 3, name: "Drink", icon: DrinkIcon },
    { id: 4, name: "Chicken", icon: ChickenIcon },
    { id: 5, name: "Shawarma", icon: ShawarmaIcon },
]

export const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
    return (
        <Box mb={8}>
            <Text px={6} fontSize="lg" fontWeight="bold" mb={4}>Category</Text>
            <Flex gap={4} overflowX="auto" px={6} pb={2} css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
                {categories.map((cat) => {
                    const isActive = selectedCategory === cat.name
                    return (
                        <VStack key={cat.id} gap={3} cursor="pointer" minW="70px" onClick={() => onSelectCategory(cat.name)}>
                            <Center
                                w="70px"
                                h="70px"
                                borderRadius="2xl"
                                bg={isActive ? "red.500" : "white"}
                                boxShadow={isActive ? "lg" : "sm"}
                                transition="all 0.2s"
                                _hover={{ transform: 'translateY(-2px)' }}
                            >
                                <cat.icon color={isActive ? "white" : "#CBD5E0"} size={28} />
                            </Center>
                            <Text fontSize="xs" fontWeight={isActive ? "bold" : "medium"} color={isActive ? "gray.800" : "gray.400"}>
                                {cat.name}
                            </Text>
                        </VStack>
                    )
                })}
            </Flex>
        </Box>
    )
}
