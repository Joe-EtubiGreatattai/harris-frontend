import { useState, useRef, useEffect } from 'react';
import { Box, Button, Input, VStack, Text, HStack, Heading, IconButton, Table, Spinner } from '@chakra-ui/react';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import { IoDownload, IoTrash, IoAdd } from 'react-icons/io5';
import { api } from '../../services/api';
import { toaster } from '../../components/ui/toaster';

export const QRCodeTab = () => {
    const [tableName, setTableName] = useState('');
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // We use a hidden container to generate QRs for download
    const hiddenQrRef = useRef<HTMLDivElement>(null);
    const [qrToDownload, setQrToDownload] = useState<{ name: string, url: string } | null>(null);

    // Use the current origin
    const baseUrl = window.location.origin;

    useEffect(() => {
        loadTables();
    }, []);

    // Effect to handle download once state is updated and QR is rendered
    useEffect(() => {
        if (qrToDownload && hiddenQrRef.current) {
            // Small delay to ensure render
            setTimeout(() => {
                generatePDF(qrToDownload.name);
                setQrToDownload(null);
            }, 500);
        }
    }, [qrToDownload]);

    const loadTables = async () => {
        setLoading(true);
        try {
            const data = await api.getTables();
            setTables(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTable = async () => {
        if (!tableName) return;
        try {
            await api.createTable(tableName);
            setTableName('');
            toaster.create({ title: "Table Created", type: "success" });
            loadTables();
        } catch (err) {
            toaster.create({ title: "Failed to create table", type: "error" });
        }
    };

    const handleDeleteTable = async (id: string) => {
        if (!confirm("Delete this table?")) return;
        try {
            await api.deleteTable(id);
            loadTables();
        } catch (err) {
            toaster.create({ title: "Failed to delete table", type: "error" });
        }
    };

    const prepareDownload = (table: any) => {
        const url = `${baseUrl}/?table=${encodeURIComponent(table.name)}`;
        setQrToDownload({ name: table.name, url });
    };

    const generatePDF = (name: string) => {
        const canvas = hiddenQrRef.current?.querySelector('canvas');
        if (canvas) {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a6'
            });

            const width = pdf.internal.pageSize.getWidth();
            // const height = pdf.internal.pageSize.getHeight();

            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, width, pdf.internal.pageSize.getHeight(), 'F');

            pdf.setFontSize(22);
            pdf.setTextColor(0, 0, 0);
            pdf.text('Scan for Menu', width / 2, 20, { align: 'center' });

            const qrSize = 80;
            pdf.addImage(imgData, 'PNG', (width - qrSize) / 2, 30, qrSize, qrSize);

            pdf.setFontSize(18);
            pdf.text(`Table: ${name}`, width / 2, 120, { align: 'center' });

            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text('Scan to order & call waiter', width / 2, 135, { align: 'center' });

            pdf.save(`table-${name}-qr.pdf`);
        }
    };

    return (
        <Box maxW="800px" mx="auto">
            {/* Hidden QR Generator for Downloads */}
            <Box position="absolute" top="-9999px" left="-9999px" ref={hiddenQrRef}>
                {qrToDownload && (
                    <QRCodeCanvas
                        value={qrToDownload.url}
                        size={200}
                        level={"H"}
                        includeMargin={true}
                    />
                )}
            </Box>

            <VStack gap={6} align="stretch">
                <Box textAlign="center" mb={4}>
                    <Heading size="lg" mb={2}>Table Management</Heading>
                    <Text color="gray.600">Create tables and generate QR codes.</Text>
                </Box>

                <Box p={6} border="1px solid" borderColor="gray.200" borderRadius="xl" bg="white">
                    <HStack gap={4}>
                        <Input
                            placeholder="e.g. Table 1, Patio 5"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            size="lg"
                        />
                        <Button
                            colorPalette="red"
                            size="lg"
                            onClick={handleCreateTable}
                            disabled={!tableName}
                        >
                            <IoAdd /> Create
                        </Button>
                    </HStack>
                </Box>

                <Box p={6} border="1px solid" borderColor="gray.200" borderRadius="xl" bg="white">
                    <Text fontWeight="bold" mb={4} fontSize="lg">Existing Tables ({tables.length})</Text>

                    {loading ? (
                        <Spinner color="red.500" />
                    ) : tables.length === 0 ? (
                        <Text color="gray.500">No tables created yet.</Text>
                    ) : (
                        <Table.Root variant="outline">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                                    <Table.ColumnHeader>Created</Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {tables.map((table) => (
                                    <Table.Row key={table._id}>
                                        <Table.Cell fontWeight="bold">{table.name}</Table.Cell>
                                        <Table.Cell fontSize="sm" color="gray.500">
                                            {new Date(table.createdAt).toLocaleDateString()}
                                        </Table.Cell>
                                        <Table.Cell textAlign="end">
                                            <HStack justify="flex-end" gap={2}>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => prepareDownload(table)}
                                                >
                                                    <IoDownload /> QR
                                                </Button>
                                                <IconButton
                                                    aria-label="Delete table"
                                                    size="sm"
                                                    colorPalette="red"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteTable(table._id)}
                                                >
                                                    <IoTrash />
                                                </IconButton>
                                            </HStack>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    )}
                </Box>
            </VStack>
        </Box>
    );
};
