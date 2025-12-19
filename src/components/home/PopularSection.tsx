
import { SimpleGrid, Text, Box, Flex } from "@chakra-ui/react"
import { PizzaCard } from "./PizzaCard"
import { IoSearch } from "react-icons/io5"
import type { Product } from "../../data/menu"

interface PopularSectionProps {
    selectedCategory: string;
    searchQuery: string;
    products: Product[];
}

export const PopularSection = ({ selectedCategory, searchQuery, products }: PopularSectionProps) => {

    const filteredProducts = products.filter(p => {
        const matchesCategory = p.category === selectedCategory

        if (!searchQuery) return matchesCategory

        const query = searchQuery.toLowerCase()
        const matchesSearch =
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)

        // If searching, we might want to search ACROSS categories or still within?
        // Usually global search is better UX, but let's stick to category for now OR global if category is "All" (which we don't have yet)
        // Let's do: Filter by category AND search query. 
        // User request "make sure search works".
        // If I search "Cheese" I expect to see it even if I'm on "Drinks" tab? 
        // Maybe. But tabs imply filter. 
        // Let's implement: matchesCategory && matchesSearch.
        return matchesCategory && matchesSearch
    })

    return (
        <Box px={6} pb={8}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>Popular Today</Text>

            {filteredProducts.length === 0 ? (
                <Flex direction="column" align="center" justify="center" py={10} color="gray.400">
                    <IoSearch size={48} />
                    <Text mt={4}>No items found for "{searchQuery}" in {selectedCategory}</Text>
                </Flex>
            ) : (
                <SimpleGrid columns={2} gap={2}>
                    {filteredProducts.map(product => (
                        <PizzaCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            description={product.description}
                            prices={product.prices}
                            image={product.image}
                            isMystery={product.id === "create-your-own"}
                            isBestSeller={product.isBestSeller}
                            isAvailable={product.isAvailable}
                            category={product.category}
                        />
                    ))}
                </SimpleGrid>
            )}
        </Box>
    )
}
