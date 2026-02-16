import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Input, VStack, Heading, Text, Container, Flex, Icon } from '@chakra-ui/react';
import { FaPizzaSlice, FaLock } from 'react-icons/fa';

export const LoginPage = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('https://harris-backend.onrender.com/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                //@ts-ignore
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('adminToken', data.token);
                navigate('/admin');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Flex minH="100vh" bg="gray.50" align="center" justify="center">
            <Container maxW="md">
                <Box bg="white" p={8} borderRadius="xl" shadow="lg" border="1px" borderColor="gray.100">
                    <VStack gap={6}>
                        <VStack gap={3} textAlign="center">
                            <Box p={3} bg="red.500" borderRadius="full" color="white" shadow="md">
                                <Icon as={FaPizzaSlice} w={6} h={6} />
                            </Box>
                            <Heading size="lg" color="gray.800">Harris Pizza Admin</Heading>
                            <Text color="gray.500" fontSize="sm">Enter your credentials to continue</Text>
                        </VStack>

                        {error && (
                            <Box w="full" bg="red.50" p={3} borderRadius="md" border="1px" borderColor="red.100">
                                <Text color="red.500" fontSize="sm" textAlign="center" fontWeight="medium">{error}</Text>
                            </Box>
                        )}

                        <form onSubmit={handleLogin} style={{ width: '100%' }}>
                            <VStack gap={4}>
                                <Box w="full">
                                    <Text color="gray.700" fontSize="sm" fontWeight="bold" mb={1}>Password</Text>
                                    <Flex align="center" bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200" _focusWithin={{ borderColor: 'red.500', ring: 1, ringColor: 'red.500' }}>
                                        <Box px={3} color="gray.400">
                                            <Icon as={FaLock} w={4} h={4} />
                                        </Box>
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={(e: any) => setPassword(e.target.value)}
                                            placeholder="Enter admin password"
                                            size="lg"
                                            border="none"
                                            _focus={{ border: 'none', boxShadow: 'none' }}
                                            bg="transparent"
                                        />
                                    </Flex>
                                </Box>

                                <Button
                                    type="submit"
                                    colorScheme="red"
                                    size="lg"
                                    width="full"
                                    loading={isLoading}
                                    mt={2}
                                    borderRadius="lg"
                                    fontWeight="bold"
                                    shadow="md"
                                    _hover={{ shadow: 'lg', transform: 'translateY(-1px)' }}
                                    transition="all 0.2s"
                                >
                                    Login
                                </Button>
                            </VStack>
                        </form>

                        <Text fontSize="xs" color="gray.400" pt={4}>
                            &copy; 2025 Harris Pizza
                        </Text>
                    </VStack>
                </Box>
            </Container>
        </Flex>
    );
};

export default LoginPage;