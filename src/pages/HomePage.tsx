import { Box } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { HomeHeader } from "../components/home/HomeHeader"
import { SearchSection } from "../components/home/SearchSection"
import { FavoritesSection } from "../components/home/FavoritesSection"
import { CategoryFilter } from "../components/home/CategoryFilter"
import { PopularSection } from "../components/home/PopularSection"
import { PopularSectionSkeleton } from "../components/home/PizzaCardSkeleton"
import { api } from "../services/api"
import { socket } from "../services/socket"
import type { Product } from "../data/menu"

export const HomePage = () => {
    const [selectedCategory, setSelectedCategory] = useState("Pizza")
    const [searchQuery, setSearchQuery] = useState("")
    const [products, setProducts] = useState<Product[]>(() => {
        // Init from cache
        const saved = localStorage.getItem('cachedProducts')
        return saved ? JSON.parse(saved) : []
    })
    const [loading, setLoading] = useState(products.length === 0)

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await api.getProducts()
                setProducts(data)
                // Save to cache
                localStorage.setItem('cachedProducts', JSON.stringify(data))
            } catch (err) {
                console.error("Failed to load products", err)
                // Fallback is already the cached state
            } finally {
                setLoading(false)
            }
        }
        loadProducts()

        socket.on('productUpdated', (updatedProduct: any) => {
            setProducts(prev =>
                prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
            );
        });

        return () => {
            socket.off('productUpdated');
        };
    }, [])

    return (
        <Box pb={20}>
            <HomeHeader />
            <SearchSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            {loading ? (
                <PopularSectionSkeleton />
            ) : (
                <>
                    {!searchQuery && <FavoritesSection products={products} />}
                    <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
                    <PopularSection selectedCategory={selectedCategory} searchQuery={searchQuery} products={products} />
                </>
            )}
        </Box>
    )
}
