import { Box, Flex, Text, Button, VStack, HStack, Badge, Input, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { IoWallet, IoCheckmarkCircle, IoTime, IoCloseCircle, IoSearch } from "react-icons/io5";
import { api } from "../../services/api";

export const WithdrawalTab = () => {
    const [banks, setBanks] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    // Form state
    const [selectedBank, setSelectedBank] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [banksData, historyData] = await Promise.all([
                api.getBanks(),
                api.getWithdrawalHistory()
            ]);
            setBanks(banksData.data);
            setHistory(historyData);
        } catch (error) {
            console.error("Failed to load payout data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!selectedBank || accountNumber.length !== 10) {
            alert("Please select a bank and enter a 10-digit account number.");
            return;
        }

        setIsVerifying(true);
        setAccountName(""); // Clear previous name
        try {
            const result = await api.verifyAccount(accountNumber, selectedBank);
            if (result.status) {
                setAccountName(result.data.account_name);
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            alert(error.message || "Could not verify account.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleWithdraw = async () => {
        if (!accountName || !amount || Number(amount) <= 0) {
            alert("Please verify the account and enter a valid amount.");
            return;
        }

        if (!confirm(`Are you sure you want to withdraw ₦${Number(amount).toLocaleString()} to ${accountName}?`)) return;

        setIsWithdrawing(true);
        try {
            const body = {
                amount: Number(amount),
                bankCode: selectedBank,
                bankName: banks.find(b => b.code === selectedBank)?.name,
                accountNumber,
                accountName,
                reason
            };

            await api.initiateWithdrawal(body);
            alert("Withdrawal Initiated! Your transfer has been queued.");

            // Reset form
            setAmount("");
            setReason("");
            loadData(); // Refresh history
        } catch (error: any) {
            alert(error.message || "Something went wrong.");
        } finally {
            setIsWithdrawing(false);
        }
    };

    if (isLoading) {
        return (
            <Flex justify="center" align="center" h="400px">
                <Spinner size="xl" color="red.500" />
            </Flex>
        );
    }

    return (
        <VStack gap={8} align="stretch">
            {/* Withdrawal Form */}
            <Box bg="white" p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                <HStack mb={6} gap={3}>
                    <Box p={2} bg="red.50" color="red.500" borderRadius="lg">
                        <IoWallet size={24} />
                    </Box>
                    <Text fontSize="xl" fontWeight="bold">New Withdrawal</Text>
                </HStack>

                <Flex direction={{ base: "column", lg: "row" }} gap={8}>
                    {/* Bank Info */}
                    <VStack flex={1} align="stretch" gap={4}>
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>Select Bank</Text>
                            <select
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                                style={{
                                    height: "50px",
                                    width: "100%",
                                    borderRadius: "12px",
                                    border: "1px solid #E2E8F0",
                                    paddingLeft: "12px",
                                    paddingRight: "12px",
                                    outline: "none",
                                    backgroundColor: "white",
                                    fontSize: "16px"
                                }}
                            >
                                <option value="">Choose your bank</option>
                                {banks.map(bank => (
                                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                                ))}
                            </select>
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>Account Number</Text>
                            <HStack>
                                <Input
                                    placeholder="10-digit account number"
                                    maxLength={10}
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                                    h="50px"
                                    borderRadius="xl"
                                />
                                <Button
                                    onClick={handleVerify}
                                    disabled={isVerifying}
                                    colorScheme="red"
                                    variant="ghost"
                                    h="50px"
                                    px={6}
                                    borderRadius="xl"
                                >
                                    <HStack gap={2}>
                                        {isVerifying ? <Spinner size="sm" /> : <IoSearch />}
                                        <Text>Verify</Text>
                                    </HStack>
                                </Button>
                            </HStack>
                            {accountName && (
                                <HStack mt={2} color="green.600">
                                    <IoCheckmarkCircle />
                                    <Text fontSize="sm" fontWeight="bold">{accountName}</Text>
                                </HStack>
                            )}
                        </Box>
                    </VStack>

                    {/* Amount Info */}
                    <VStack flex={1} align="stretch" gap={4}>
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>Amount (₦)</Text>
                            <Input
                                type="number"
                                placeholder="Amount to withdraw"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                h="50px"
                                borderRadius="xl"
                            />
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>Reason (Optional)</Text>
                            <Input
                                placeholder="Purpose of withdrawal"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                h="50px"
                                borderRadius="xl"
                            />
                        </Box>

                        <Button
                            colorScheme="red"
                            size="lg"
                            h="60px"
                            borderRadius="xl"
                            mt={2}
                            onClick={handleWithdraw}
                            disabled={!accountName || !amount || isWithdrawing}
                            boxShadow="0 10px 20px -5px rgba(229, 62, 62, 0.4)"
                            _hover={{ transform: 'translateY(-2px)' }}
                            transition="all 0.2s"
                        >
                            <HStack gap={2}>
                                {isWithdrawing && <Spinner size="sm" />}
                                <Text>Confirm Withdrawal</Text>
                            </HStack>
                        </Button>
                    </VStack>
                </Flex>
            </Box>

            {/* History Table */}
            <Box bg="white" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                <Box p={6} borderBottom="1px solid" borderColor="gray.50">
                    <Text fontSize="lg" fontWeight="bold">Withdrawal History</Text>
                </Box>
                <Box overflowX="auto">
                    <Box as="table" w="full" style={{ borderCollapse: "collapse" }}>
                        <Box as="thead" bg="gray.50">
                            <Box as="tr">
                                <Box as="th" p={4} textAlign="left" fontSize="xs" color="gray.500" textTransform="uppercase">Date</Box>
                                <Box as="th" p={4} textAlign="left" fontSize="xs" color="gray.500" textTransform="uppercase">Recipient</Box>
                                <Box as="th" p={4} textAlign="left" fontSize="xs" color="gray.500" textTransform="uppercase">Bank</Box>
                                <Box as="th" p={4} textAlign="right" fontSize="xs" color="gray.500" textTransform="uppercase">Amount</Box>
                                <Box as="th" p={4} textAlign="left" fontSize="xs" color="gray.500" textTransform="uppercase">Status</Box>
                            </Box>
                        </Box>
                        <Box as="tbody">
                            {history.map((item) => (
                                <Box as="tr" key={item._id} borderBottom="1px solid" borderColor="gray.50">
                                    <Box as="td" p={4} whiteSpace="nowrap">
                                        <Text fontSize="sm">{new Date(item.createdAt).toLocaleDateString()}</Text>
                                        <Text fontSize="xs" color="gray.400">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    </Box>
                                    <Box as="td" p={4}>
                                        <Text fontSize="sm" fontWeight="bold">{item.accountName}</Text>
                                        <Text fontSize="xs" color="gray.500">{item.accountNumber}</Text>
                                    </Box>
                                    <Box as="td" p={4} fontSize="sm">{item.bankName}</Box>
                                    <Box as="td" p={4} textAlign="right" fontWeight="bold">₦{item.amount.toLocaleString()}</Box>
                                    <Box as="td" p={4}>
                                        <Badge
                                            colorScheme={item.status === 'Success' ? 'green' : item.status === 'Pending' ? 'orange' : 'red'}
                                            borderRadius="full"
                                            px={3}
                                            py={0.5}
                                            fontSize="xs"
                                        >
                                            <HStack gap={1}>
                                                {item.status === 'Success' ? <IoCheckmarkCircle /> : item.status === 'Pending' ? <IoTime /> : <IoCloseCircle />}
                                                <Text>{item.status}</Text>
                                            </HStack>
                                        </Badge>
                                    </Box>
                                </Box>
                            ))}
                            {history.length === 0 && (
                                <Box as="tr">
                                    <Box as="td" p={10} textAlign="center" color="gray.400">
                                        No withdrawal history found.
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </VStack>
    );
};
