import { Box, Table, Text, Badge, Spinner, Flex, HStack, Input } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { IoSearch } from "react-icons/io5";

export const TransactionsTab = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateRange, setDateRange] = useState({
        from: '',
        to: ''
    });

    useEffect(() => {
        fetchTransactions();
    }, [dateRange, statusFilter]);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const response = await api.getTransactions(dateRange.from, dateRange.to, statusFilter);
            if (response.status) {
                setTransactions(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Local filtering for search query (Reference)
    const filteredTransactions = transactions.filter(tx =>
        tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading && transactions.length === 0) {
        return (
            <Flex justify="center" align="center" py={10}>
                <Spinner size="xl" color="red.500" />
            </Flex>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount / 100);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge colorPalette="green" variant="solid">Success</Badge>;
            case 'failed':
                return <Badge colorPalette="red" variant="solid">Failed</Badge>;
            case 'abandoned':
                return <Badge colorPalette="gray" variant="solid">Abandoned</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const totalSum = filteredTransactions.reduce((acc, tx) => acc + tx.amount, 0);

    return (
        <Box bg="white" p={6} borderRadius="xl" shadow="sm">
            <Flex justify="space-between" align="center" mb={6} direction={{ base: "column", md: "row" }} gap={4}>
                <HStack gap={3}>
                    <Text fontSize="xl" fontWeight="bold">Paystack Transactions</Text>
                    <Badge colorPalette="red" variant="subtle" borderRadius="full" px={3}>
                        {filteredTransactions.length} results
                    </Badge>
                    <Badge colorPalette="green" variant="subtle" borderRadius="full" px={3}>
                        Total: {formatCurrency(totalSum)}
                    </Badge>
                </HStack>

                <HStack gap={4} wrap="wrap" justify={{ base: "center", md: "flex-end" }}>
                    <Box position="relative" minW={{ base: "full", md: "250px" }}>
                        <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={1} color="gray.400">
                            <IoSearch size={18} />
                        </Box>
                        <Input
                            placeholder="Search reference or email..."
                            pl={10}
                            size="sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            borderRadius="lg"
                            bg="gray.50"
                            border="none"
                            _focus={{ bg: "white", boxShadow: "sm" }}
                        />
                    </Box>

                    <Box>
                        <Text fontSize="xs" color="gray.500" mb={1} fontWeight="semibold">STATUS</Text>
                        <select
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #EDF2F7',
                                borderRadius: '8px',
                                outline: 'none',
                                fontSize: '13px',
                                backgroundColor: '#F7FAFC',
                                cursor: 'pointer',
                                minWidth: '130px'
                            }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                            <option value="abandoned">Abandoned</option>
                        </select>
                    </Box>

                    <Box>
                        <Text fontSize="xs" color="gray.500" mb={1} fontWeight="semibold">FROM</Text>
                        <input
                            type="date"
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #EDF2F7',
                                borderRadius: '8px',
                                outline: 'none',
                                fontSize: '13px',
                                backgroundColor: '#F7FAFC',
                                cursor: 'text'
                            }}
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xs" color="gray.500" mb={1} fontWeight="semibold">TO</Text>
                        <input
                            type="date"
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #EDF2F7',
                                borderRadius: '8px',
                                outline: 'none',
                                fontSize: '13px',
                                backgroundColor: '#F7FAFC',
                                cursor: 'text'
                            }}
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        />
                    </Box>
                    {(dateRange.from || dateRange.to || statusFilter || searchQuery) && (
                        <Text
                            fontSize="xs"
                            color="red.500"
                            cursor="pointer"
                            mt={6}
                            onClick={() => {
                                setDateRange({ from: '', to: '' });
                                setStatusFilter('');
                                setSearchQuery('');
                            }}
                        >
                            Clear All
                        </Text>
                    )}
                </HStack>
            </Flex>

            <Box overflowX="auto">
                {isLoading ? (
                    <Flex justify="center" py={10}>
                        <Spinner color="red.500" />
                    </Flex>
                ) : (
                    <>
                        <Table.Root size="sm" variant="line">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Reference</Table.ColumnHeader>
                                    <Table.ColumnHeader>Customer</Table.ColumnHeader>
                                    <Table.ColumnHeader>Amount</Table.ColumnHeader>
                                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                                    <Table.ColumnHeader>Date</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filteredTransactions.map((tx) => (
                                    <Table.Row key={tx.id}>
                                        <Table.Cell>
                                            <Text fontSize="xs" fontWeight="mono">{tx.reference}</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text fontSize="xs" color="gray.600">{tx.customer.email}</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text fontWeight="bold">{formatCurrency(tx.amount)}</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {getStatusBadge(tx.status)}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text fontSize="xs" color="gray.500">
                                                {new Date(tx.created_at).toLocaleString()}
                                            </Text>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                        {filteredTransactions.length === 0 && (
                            <Text textAlign="center" py={10} color="gray.500">No transactions found matching your filters.</Text>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};
