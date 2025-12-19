
import { Box, Text, Flex } from "@chakra-ui/react"
import { PizzaCard } from "./PizzaCard"
import type { Product } from "../../data/menu"
import { useUser } from "../../context/UserContext"

interface FavoritesSectionProps {
    products: Product[];
}

export const FavoritesSection = ({ products }: FavoritesSectionProps) => {
    const { user } = useUser()
    const favoriteIds = user?.favorites || []

    if (favoriteIds.length === 0) return null

    const favoriteProducts = products.filter(p => favoriteIds.includes(p.id))

    return (
        <Box px={6} mb={8}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>Your Favorites ❤️</Text>
            <Flex
                overflowX="auto"
                pb={2}
                gap={4}
                css={{
                    '&::-webkit-scrollbar': { display: 'none' },
                    '-ms-overflow-style': 'none',
                    'scrollbar-width': 'none'
                }}
            >
                {favoriteProducts.map(product => (
                    <Box key={product.id} minW="200px" maxW="200px">
                        <PizzaCard
                            id={product.id}
                            name={product.name}
                            description={product.description}
                            price={product.prices.S}
                            image={product.image}
                            isMystery={product.id === "create-your-own"}
                            isBestSeller={product.isBestSeller}
                            isAvailable={product.isAvailable}
                        />
                    </Box>
                ))}
            </Flex>
        </Box>
    )
}
