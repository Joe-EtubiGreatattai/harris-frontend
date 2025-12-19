
import { Box, Flex, Skeleton, SkeletonCircle, SimpleGrid } from "@chakra-ui/react"

export const PizzaCardSkeleton = () => (
    <Box bg="white" p={3} borderRadius="3xl" boxShadow="lg" w="full">
        <Flex justify="center" mb={4} mt={2}>
            <SkeletonCircle size="130px" />
        </Flex>
        <Skeleton height="20px" width="80%" mb={2} />
        <Skeleton height="15px" width="60%" mb={4} />
        <Flex justify="space-between" align="center">
            <Skeleton height="24px" width="40%" />
            <SkeletonCircle size="32px" />
        </Flex>
    </Box>
)

export const PopularSectionSkeleton = () => (
    <Box px={6} pb={8}>
        <Skeleton height="24px" width="150px" mb={4} />
        <SimpleGrid columns={2} gap={2}>
            {[1, 2, 3, 4].map(i => <PizzaCardSkeleton key={i} />)}
        </SimpleGrid>
    </Box>
)
