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
import { motion } from "framer-motion"

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

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

        const syncCache = (updatedList: Product[]) => {
            localStorage.setItem('cachedProducts', JSON.stringify(updatedList));
        };

        socket.on('productCreated', (newProduct: Product) => {
            setProducts(prev => {
                const updated = [newProduct, ...prev];
                syncCache(updated);
                return updated;
            });
        });

        socket.on('productUpdated', (updatedProduct: Product) => {
            setProducts(prev => {
                const updated = prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
                syncCache(updated);
                return updated;
            });
        });

        socket.on('productDeleted', ({ id }: { id: string }) => {
            setProducts(prev => {
                const updated = prev.filter(p => p.id !== id);
                syncCache(updated);
                return updated;
            });
        });

        return () => {
            socket.off('productCreated');
            socket.off('productUpdated');
            socket.off('productDeleted');
        };
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Box pb={20}>
                <HomeHeader />
                <SearchSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

                {loading ? (
                    <PopularSectionSkeleton />
                ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="show">
                        {!searchQuery && (
                            <motion.div variants={itemVariants}>
                                <FavoritesSection products={products} />
                            </motion.div>
                        )}
                        <motion.div variants={itemVariants}>
                            <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <PopularSection selectedCategory={selectedCategory} searchQuery={searchQuery} products={products} />
                        </motion.div>
                    </motion.div>
                )}
            </Box>
        </motion.div>
    )
}
