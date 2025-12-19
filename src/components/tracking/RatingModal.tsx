import {
    Button,
    VStack,
    Text,
    Textarea,
    HStack,
    Icon,
    Box,
    Flex,
    IconButton
} from "@chakra-ui/react"
import { useState } from "react"
import { IoStar, IoStarOutline, IoClose } from "react-icons/io5"
import { motion } from "framer-motion"
import confetti from 'canvas-confetti'
import { api } from "../../services/api"

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
}

const MotionBox = motion(Box);

export const RatingModal = ({ isOpen, onClose, orderId }: RatingModalProps) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            await api.submitRating({
                orderId,
                rating,
                comment
            });

            console.log(`Rating submitted for Order #${orderId}:`, { rating, comment });

            if (rating >= 4) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#E53E3E', '#F6E05E', '#FFFFFF']
                });
            }

            setSubmitStatus('success');

            // Close after a brief delay to show success state
            setTimeout(() => {
                onClose();
                // Reset state
                setRating(0);
                setComment("");
                setSubmitStatus('idle');
            }, 1500);

        } catch (error) {
            console.error("Failed to submit rating:", error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Box
            position="fixed"
            top={0} left={0} right={0} bottom={0}
            bg="black/60"
            backdropFilter="blur(5px)"
            zIndex={200}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
            onClick={onClose}
        >
            <Box
                bg="white"
                w="full"
                maxW="sm"
                borderRadius="3xl"
                p={6}
                boxShadow="2xl"
                onClick={(e) => e.stopPropagation()}
                position="relative"
            >
                <Flex justify="space-between" align="center" mb={6}>
                    <Box textAlign="center" w="full">
                        <Text fontSize="2xl" fontWeight="bold">Rate your Experience</Text>
                        <Text fontSize="sm" fontWeight="normal" color="gray.500" mt={1}>
                            Order #{orderId}
                        </Text>
                    </Box>
                    <IconButton
                        aria-label="Close"
                        variant="ghost"
                        onClick={onClose}
                        borderRadius="full"
                        size="sm"
                        position="absolute"
                        right={4}
                        top={4}
                    >
                        <IoClose size={24} />
                    </IconButton>
                </Flex>

                <VStack gap={6}>
                    <HStack gap={2} justify="center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <MotionBox
                                key={star}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                cursor="pointer"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <Icon
                                    as={star <= (hover || rating) ? IoStar : IoStarOutline}
                                    boxSize={8}
                                    color={star <= (hover || rating) ? "yellow.400" : "gray.300"}
                                    transition="color 0.2s"
                                />
                            </MotionBox>
                        ))}
                    </HStack>

                    <Textarea
                        placeholder="Tell us more about your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        borderRadius="xl"
                        resize="none"
                        _focus={{ borderColor: "red.500" }}
                        minH="120px"
                    />

                    {submitStatus === 'success' && (
                        <Text color="green.500" fontWeight="bold">Thank you for your feedback!</Text>
                    )}
                    {submitStatus === 'error' && (
                        <Text color="red.500" fontWeight="bold">Something went wrong. Please try again.</Text>
                    )}
                </VStack>

                <VStack w="full" gap={3} mt={6}>
                    <Button
                        w="full"
                        bg="red.500"
                        color="white"
                        borderRadius="xl"
                        _hover={{ bg: "red.600" }}
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={rating === 0 || isSubmitting}
                        h="50px"
                        fontSize="lg"
                    >
                        Submit Review
                    </Button>
                    <Button
                        variant="ghost"
                        color="gray.500"
                        onClick={onClose}
                        w="full"
                        borderRadius="xl"
                        disabled={isSubmitting}
                    >
                        Skip
                    </Button>
                </VStack>
            </Box>
        </Box>
    );
};
