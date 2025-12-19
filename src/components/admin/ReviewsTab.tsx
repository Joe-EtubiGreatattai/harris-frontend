import { Box, Flex, Text, SimpleGrid, Badge } from "@chakra-ui/react"
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts'
import { IoStar } from "react-icons/io5"

export const ReviewsTab = ({ ratings }: { ratings: any[] }) => {
    // Calculate Stats
    const totalReviews = ratings.length
    const averageRating = totalReviews > 0
        ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
        : "0.0"

    // Prepare Chart Data
    const distribution = [5, 4, 3, 2, 1].map(star => ({
        star: `${star} Stars`,
        count: ratings.filter(r => r.rating === star).length
    }))

    const COLORS = ['#48BB78', '#38B2AC', '#ECC94B', '#ED8936', '#F56565'];

    return (
        <Box>
            {/* Stats Overview */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={8}>
                {/* Stats Card */}
                <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
                    <Text fontSize="sm" color="gray.500" mb={2}>Overall Rating</Text>
                    <Flex align="baseline" gap={2}>
                        <Text fontSize="4xl" fontWeight="black" color="gray.800">{averageRating}</Text>
                        <Text fontSize="sm" color="gray.400">/ 5.0</Text>
                    </Flex>
                    <Text fontSize="sm" color="gray.500" mt={1}>Based on {totalReviews} reviews</Text>
                </Box>

                {/* Chart Card */}
                <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" h="250px">
                    <Text fontSize="sm" fontWeight="bold" mb={4}>Rating Distribution</Text>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="star" type="category" width={60} tick={{ fontSize: 12 }} />
                            <RechartsTooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                                {distribution.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </SimpleGrid>

            {/* Reviews List (Custom "Table") */}
            <Box bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                <Box p={4} borderBottom="1px solid" borderColor="gray.100">
                    <Text fontWeight="bold">Recent Reviews</Text>
                </Box>

                {/* Header */}
                <Box bg="gray.50" px={4} py={3} borderBottom="1px solid" borderColor="gray.100" display={{ base: "none", md: "grid" }} gridTemplateColumns="120px 100px 1fr 120px" gap={4}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Order ID</Text>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Rating</Text>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Comment</Text>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Date</Text>
                </Box>

                {/* Rows */}
                <Flex direction="column">
                    {ratings.map((review) => (
                        <Box
                            key={review._id}
                            p={4}
                            borderBottom="1px solid"
                            borderColor="gray.100"
                            display={{ base: "flex", md: "grid" }}
                            gridTemplateColumns={{ md: "120px 100px 1fr 120px" }}
                            flexDirection={{ base: "column" }}
                            gap={{ base: 2, md: 4 }}
                        >
                            <Box>
                                <Text fontWeight="bold" fontSize="sm">#{review.orderId}</Text>
                                <Text fontSize="xs" color="gray.400" display={{ md: "none" }}>{new Date(review.createdAt).toLocaleDateString()}</Text>
                            </Box>

                            <Box>
                                <Flex align="center" gap={1}>
                                    <Badge colorScheme={review.rating >= 4 ? 'green' : review.rating >= 3 ? 'yellow' : 'red'}>
                                        {review.rating}
                                    </Badge>
                                    <IoStar size={12} color="#ECC94B" />
                                </Flex>
                            </Box>

                            <Box>
                                <Text fontSize="sm" color="gray.600" truncate title={review.comment || ""}>
                                    {review.comment || <Text as="span" color="gray.300" fontStyle="italic">No comment</Text>}
                                </Text>
                            </Box>

                            <Box display={{ base: "none", md: "block" }}>
                                <Text fontSize="xs" color="gray.500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </Text>
                            </Box>
                        </Box>
                    ))}
                    {ratings.length === 0 && (
                        <Box p={8} textAlign="center">
                            <Text color="gray.500">No reviews received yet.</Text>
                        </Box>
                    )}
                </Flex>
            </Box>
        </Box>
    )
}
