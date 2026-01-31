import { Box, Text } from "@chakra-ui/react"
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
import { useCart } from "../context/CartContext"
import { useSearchParams } from "react-router-dom"
import { toaster } from "../components/ui/toaster"

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
    const { applyPromoCode, appliedPromoCode, isOpen, isWithinHours, openingTime, closingTime } = useCart()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        socket.on('settingsUpdated', (updatedSettings: any) => {
            const description = updatedSettings.isOpen === false
                ? "We are currently closed. Checkout is disabled."
                : `Delivery fee is now ₦${updatedSettings.deliveryFee}`;

            toaster.create({
                title: "Settings Updated",
                description: description,
                type: updatedSettings.isOpen === false ? "error" : "info"
            })
        })

        return () => {
            socket.off('settingsUpdated')
        }
    }, [])

    useEffect(() => {
        const promoFromUrl = searchParams.get('promo')
        if (promoFromUrl && !appliedPromoCode) {
            const autoApply = async () => {
                const result = await applyPromoCode(promoFromUrl)
                if (result.success) {
                    toaster.create({
                        title: "Promo Applied!",
                        description: `Code ${promoFromUrl.toUpperCase()} has been applied to your cart.`,
                        type: "success"
                    })
                }
            }
            autoApply()
        }
    }, [searchParams, appliedPromoCode, applyPromoCode])

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

    const [table, setTable] = useState<string | null>(null);

    useEffect(() => {
        const tableParam = searchParams.get('table');
        if (tableParam) {
            setTable(tableParam);
        }
    }, [searchParams]);

    const handleCallWaiter = () => {
        if (!table) return;
        socket.emit('callWaiter', { table });
        toaster.create({
            title: "Waiter Called",
            description: "A waiter has been notified and will be with you shortly.",
            type: "success"
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Box pb={20}>
                {(!isOpen || !isWithinHours) && (
                    <Box bg="red.500" py={2} px={4} textAlign="center" color="white" fontWeight="bold" fontSize="sm">
                        <Text>
                            {!isOpen
                                ? "We are currently closed. You can still browse but checkout is disabled. 😴"
                                : `We are currently closed. Our opening hours are ${openingTime} to ${closingTime}. 😴`}
                        </Text>
                    </Box>
                )}

                {table && (
                    <Box
                        position="fixed"
                        bottom={6}
                        right={6}
                        zIndex={1000}
                        bg="blue.600"
                        color="white"
                        py={4}
                        px={6}
                        cursor="pointer"
                        onClick={handleCallWaiter}
                        textAlign="center"
                        fontWeight="bold"
                        borderRadius="full"
                        boxShadow="lg"
                        _hover={{ bg: "blue.700", transform: "scale(1.05)" }}
                        _active={{ transform: "scale(0.95)" }}
                        transition="all 0.2s"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={3}
                    >
                        <span style={{ fontSize: '1.5rem' }}>🔔</span>
                        <Text fontSize="lg">Call waiter to my Table</Text>
                    </Box>
                )}

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
