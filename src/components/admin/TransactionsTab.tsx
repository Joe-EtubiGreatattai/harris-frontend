import { Box, Table, Text, Badge, Spinner, Flex } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { api } from "../../services/api";

export const TransactionsTab = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await api.getTransactions();
            if (response.status) {
                setTransactions(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
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

    return (
        <Box bg="white" p={6} borderRadius="xl" shadow="sm" overflowX="auto">
            <Text fontSize="xl" fontWeight="bold" mb={6}>Paystack Transactions</Text>
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
                    {transactions.map((tx) => (
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
            {transactions.length === 0 && (
                <Text textAlign="center" py={10} color="gray.500">No transactions found.</Text>
            )}
        </Box>
    );
};
