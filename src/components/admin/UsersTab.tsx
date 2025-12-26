import { Box, Flex, Text, Button, VStack, HStack, Badge, Input, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { IoPerson, IoMail, IoReceipt, IoSearch, IoCloudDone, IoClose } from "react-icons/io5";
import { api } from "../../services/api";
import { toaster } from "../ui/toaster";

export const UsersTab = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userOrders, setUserOrders] = useState<any[]>([]);
    const [isOrdersLoading, setIsOrdersLoading] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewOrders = async (email: string) => {
        setIsOrdersLoading(true);
        setSelectedUser(users.find(u => u.email === email));
        try {
            const orders = await api.getUserOrders(email);
            setUserOrders(orders);
        } catch (error) {
            console.error("Failed to fetch user orders", error);
        } finally {
            setIsOrdersLoading(false);
        }
    };

    const handleOpenEmailModal = (user: any) => {
        setSelectedUser(user);
        setIsEmailModalOpen(true);
    };

    const handleSendEmail = async () => {
        if (!emailSubject || !emailMessage) {
            toaster.create({ title: "Error", description: "Subject and message are required", type: "error" });
            return;
        }

        setIsSendingEmail(true);
        try {
            await api.sendEmail({
                email: selectedUser.email,
                subject: emailSubject,
                message: emailMessage
            });
            toaster.create({ title: "Success", description: "Email sent successfully", type: "success" });
            setIsEmailModalOpen(false);
            setEmailSubject("");
            setEmailMessage("");
        } catch (error) {
            console.error("Failed to send email", error);
            toaster.create({ title: "Error", description: "Failed to send email", type: "error" });
        } finally {
            setIsSendingEmail(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <Flex justify="center" align="center" h="400px">
                <Spinner size="xl" color="red.500" />
            </Flex>
        );
    }

    return (
        <VStack gap={6} align="stretch">
            <Box mb={4} position="relative" maxW="400px">
                <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={1} color="gray.400">
                    <IoSearch size={18} />
                </Box>
                <Input
                    placeholder="Search users by email, phone, or address..."
                    pl={10}
                    h="45px"
                    bg="white"
                    borderRadius="xl"
                    shadow="sm"
                    border="1px solid"
                    borderColor="gray.100"
                    _focus={{ borderColor: "red.500", shadow: "md" }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Box>

            <Box border="1px solid" borderColor="gray.100" borderRadius="2xl" overflow="hidden" shadow="sm" bg="white">
                <Box overflowX="auto">
                    <Box as="table" w="full" style={{ borderCollapse: "collapse" }}>
                        <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                            <Box as="tr">
                                <Box as="th" p={4} textAlign="left" fontSize="xs" color="gray.500" textTransform="uppercase">User Connection</Box>
                                <Box as="th" p={4} textAlign="left" fontSize="xs" color="gray.500" textTransform="uppercase">Contact Info</Box>
                                <Box as="th" p={4} textAlign="center" fontSize="xs" color="gray.500" textTransform="uppercase">Orders</Box>
                                <Box as="th" p={4} textAlign="right" fontSize="xs" color="gray.500" textTransform="uppercase">Total Spent</Box>
                                <Box as="th" p={4} textAlign="right" fontSize="xs" color="gray.500" textTransform="uppercase">Actions</Box>
                            </Box>
                        </Box>
                        <Box as="tbody">
                            {filteredUsers.map((user) => (
                                <Box as="tr" key={user._id} borderBottom="1px solid" borderColor="gray.50" _hover={{ bg: "gray.50/50" }}>
                                    <Box as="td" p={4}>
                                        <HStack gap={3}>
                                            <Box p={2} bg="red.50" color="red.500" borderRadius="full">
                                                <IoPerson size={20} />
                                            </Box>
                                            <VStack align="start" gap={0}>
                                                <Text fontWeight="bold" fontSize="sm">{user.email}</Text>
                                                <Text fontSize="2xs" color="gray.400">Last order: {new Date(user.lastOrder).toLocaleDateString()}</Text>
                                            </VStack>
                                        </HStack>
                                    </Box>
                                    <Box as="td" p={4}>
                                        <VStack align="start" gap={0}>
                                            <Text fontSize="xs" fontWeight="medium">{user.phone || "No Phone"}</Text>
                                            <Text fontSize="xs" color="gray.500" lineClamp={1} maxW="200px">{user.address}</Text>
                                        </VStack>
                                    </Box>
                                    <Box as="td" p={4} textAlign="center">
                                        <Badge colorScheme="blue" variant="solid" borderRadius="full" px={2}>{user.orderCount} orders</Badge>
                                    </Box>
                                    <Box as="td" p={4} textAlign="right" fontWeight="black" color="red.500">
                                        ₦{user.totalSpent.toLocaleString()}
                                    </Box>
                                    <Box as="td" p={4} textAlign="right">
                                        <HStack justify="flex-end" gap={2}>
                                            <Button size="xs" variant="outline" onClick={() => handleViewOrders(user.email)} gap={2}>
                                                <IoReceipt /> History
                                            </Button>
                                            <Button size="xs" colorScheme="red" onClick={() => handleOpenEmailModal(user)} gap={2}>
                                                <IoMail /> Email
                                            </Button>
                                        </HStack>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
                {filteredUsers.length === 0 && (
                    <Box p={10} textAlign="center" color="gray.400">
                        {searchQuery ? `No users matching "${searchQuery}"` : "No users found."}
                    </Box>
                )}
            </Box>

            {/* Custom Modal for Order History */}
            {selectedUser && !isEmailModalOpen && (
                <Flex position="fixed" top={0} left={0} w="full" h="full" bg="blackAlpha.600" zIndex={2000} justify="center" align="center" p={4}>
                    <Box bg="white" w="full" maxW="800px" borderRadius="2xl" shadow="2xl" overflow="hidden" position="relative">
                        <Flex justify="space-between" align="center" p={6} borderBottom="1px solid" borderColor="gray.100">
                            <VStack align="start" gap={0}>
                                <Text fontSize="xl" fontWeight="bold">Order History</Text>
                                <Text fontSize="sm" color="gray.500">{selectedUser.email}</Text>
                            </VStack>
                            <Button variant="ghost" onClick={() => setSelectedUser(null)} p={0}>
                                <IoClose size={24} />
                            </Button>
                        </Flex>

                        <Box p={6} maxH="60vh" overflowY="auto">
                            {isOrdersLoading ? (
                                <Flex justify="center" p={10}><Spinner color="red.500" /></Flex>
                            ) : (
                                <VStack gap={4} align="stretch">
                                    {userOrders.map((order) => (
                                        <Box key={order._id} p={4} border="1px solid" borderColor="gray.100" borderRadius="xl">
                                            <Flex justify="space-between" align="center" mb={2}>
                                                <HStack>
                                                    <Text fontWeight="bold">#{order.orderId}</Text>
                                                    <Badge colorScheme={order.status === 'Delivered' ? 'green' : 'orange'}>{order.status}</Badge>
                                                </HStack>
                                                <Text fontWeight="black" color="red.500">₦{order.total.toLocaleString()}</Text>
                                            </Flex>
                                            <Text fontSize="xs" color="gray.500" mb={3}>{new Date(order.createdAt).toLocaleString()} • {order.items.length} items</Text>
                                            <VStack align="start" pl={3} borderLeft="2px solid" borderColor="gray.100" gap={1}>
                                                {order.items.map((item: any, idx: number) => (
                                                    <Text key={idx} fontSize="xs">
                                                        {item.quantity}x {item.name} ({item.size})
                                                    </Text>
                                                ))}
                                            </VStack>
                                        </Box>
                                    ))}
                                    {userOrders.length === 0 && <Text textAlign="center" py={10} color="gray.400">No orders found.</Text>}
                                </VStack>
                            )}
                        </Box>

                        <Flex justify="flex-end" p={6} bg="gray.50">
                            <Button colorScheme="red" onClick={() => setSelectedUser(null)}>Close</Button>
                        </Flex>
                    </Box>
                </Flex>
            )}

            {/* Custom Modal for Sending Email */}
            {isEmailModalOpen && selectedUser && (
                <Flex position="fixed" top={0} left={0} w="full" h="full" bg="blackAlpha.600" zIndex={2000} justify="center" align="center" p={4}>
                    <Box bg="white" w="full" maxW="600px" borderRadius="2xl" shadow="2xl" overflow="hidden">
                        <Flex justify="space-between" align="center" p={6} borderBottom="1px solid" borderColor="gray.100">
                            <VStack align="start" gap={0}>
                                <Text fontSize="xl" fontWeight="bold">Send Email</Text>
                                <Text fontSize="sm" color="gray.500">To: {selectedUser.email}</Text>
                            </VStack>
                            <Button variant="ghost" onClick={() => setIsEmailModalOpen(false)} p={0}>
                                <IoClose size={24} />
                            </Button>
                        </Flex>

                        <VStack p={6} gap={4} align="stretch">
                            <Box>
                                <Text fontSize="sm" fontWeight="bold" mb={2}>Subject</Text>
                                <Input
                                    placeholder="Enter subject..."
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    borderRadius="xl"
                                />
                            </Box>
                            <Box>
                                <Text fontSize="sm" fontWeight="bold" mb={2}>Message</Text>
                                <textarea
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                    placeholder="Type your message here..."
                                    value={emailMessage}
                                    onChange={(e) => setEmailMessage(e.target.value)}
                                />
                            </Box>
                        </VStack>

                        <Flex justify="flex-end" p={6} bg="gray.50" gap={3}>
                            <Button variant="ghost" onClick={() => setIsEmailModalOpen(false)}>Cancel</Button>
                            <Button
                                colorScheme="red"
                                onClick={handleSendEmail}
                                loading={isSendingEmail}
                                borderRadius="xl"
                                px={8}
                                gap={2}
                            >
                                <IoCloudDone /> Send Email
                            </Button>
                        </Flex>
                    </Box>
                </Flex>
            )}
        </VStack>
    );
};
