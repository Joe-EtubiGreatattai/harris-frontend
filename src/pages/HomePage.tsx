import { Box, Spinner, Center } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { HomeHeader } from "../components/home/HomeHeader"
import { SearchSection } from "../components/home/SearchSection"
import { CategoryFilter } from "../components/home/CategoryFilter"
import { PopularSection } from "../components/home/PopularSection"
import { api } from "../services/api"
import type { Product } from "../data/menu"

export const HomePage = () => {
    const [selectedCategory, setSelectedCategory] = useState("Pizza")
    const [searchQuery, setSearchQuery] = useState("")
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await api.getProducts()
                setProducts(data)
            } catch (err) {
                console.error("Failed to load products", err)
            } finally {
                setLoading(false)
            }
        }
        loadProducts()
    }, [])

    if (loading) return <Center h="100vh"><Spinner size="xl" color="red.500" /></Center>

    return (
        <Box pb={20}>
            <HomeHeader />
            <SearchSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
            <PopularSection selectedCategory={selectedCategory} searchQuery={searchQuery} products={products} />
        </Box>
    )
}
