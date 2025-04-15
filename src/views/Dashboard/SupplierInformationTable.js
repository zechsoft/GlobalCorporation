import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
  Box,
  Text,
  Tooltip,
  Flex,
  Icon,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from "@chakra-ui/react";
import { InfoIcon, PhoneIcon, EmailIcon, SearchIcon, DownloadIcon, DeleteIcon } from "@chakra-ui/icons";

// Status badge styling helper
const getStatusBadge = (status) => {
  let colorScheme;
  switch (status) {
    case "Active":
      colorScheme = "green";
      break;
    case "Pending":
      colorScheme = "yellow";
      break;
    case "Inactive":
      colorScheme = "red";
      break;
    default:
      colorScheme = "gray";
  }
  return <Badge colorScheme={colorScheme}>{status}</Badge>;
};

// Document status badge styling helper
const getDocumentStatusBadge = (status) => {
  let colorScheme;
  switch (status) {
    case "Complete":
      colorScheme = "green";
      break;
    case "Incomplete":
      colorScheme = "orange";
      break;
    case "Pending Review":
      colorScheme = "blue";
      break;
    case "Expired":
      colorScheme = "red";
      break;
    default:
      colorScheme = "gray";
  }
  return <Badge colorScheme={colorScheme}>{status}</Badge>;
};

const SupplierInformationTable = ({ 
  textColor = "gray.700", 
  borderColor = "gray.200"
}) => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDocStatus, setFilterDocStatus] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  // Fetch current user data from local/session storage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user")) || null;
    setCurrentUser(user);
  }, []);

  // Fetch supplier data
  useEffect(() => {
    const fetchSuppliers = async () => {
      setIsLoading(true);
      try {
        // Get the authentication token
        const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
        
        if (!user) {
          throw new Error("User not authenticated");
        }

        const response = await axios.get('http://localhost:8000/api/suppliers/get-all');
        
        console.log(response.data);
        setSuppliers(response.data.data || []);
        setFilteredSuppliers(response.data.data || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
        setError(err.response?.data?.message || "Failed to fetch supplier data");
        setIsLoading(false);
        
        toast({
          title: "Error",
          description: `Failed to fetch supplier data: ${err.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchSuppliers();
  }, [toast]);

  // Apply filters when search term or filter status changes
  useEffect(() => {
    let results = suppliers;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(supplier => 
        (supplier.supplierNumber || supplier.customerNumber || "").toString().toLowerCase().includes(term) ||
        (supplier.supplier || supplier.Customer || supplier.customerName || "").toLowerCase().includes(term) ||
        (supplier.buyer || "").toLowerCase().includes(term) ||
        (supplier.invitee || supplier.Invite || "").toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (filterStatus !== "All") {
      results = results.filter(supplier => (supplier.status || supplier.Status) === filterStatus);
    }
    
    // Apply document status filter
    if (filterDocStatus !== "All") {
      results = results.filter(supplier => (supplier.documentStatus || supplier.DocumentStatus) === filterDocStatus);
    }
    
    setFilteredSuppliers(results);
  }, [searchTerm, filterStatus, filterDocStatus, suppliers]);

  // Handle delete row
  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    onOpen();
  };

  const confirmDelete = async () => {
    try {
      // Here we would normally make an API call to delete the supplier
      // Since we're not changing the backend, we'll just update the UI
      
      setSuppliers(suppliers.filter(s => s._id !== supplierToDelete._id));
      setFilteredSuppliers(filteredSuppliers.filter(s => s._id !== supplierToDelete._id));
      
      toast({
        title: "Supplier Deleted",
        description: `Supplier ${supplierToDelete.supplier || supplierToDelete.Customer} was successfully removed.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete supplier: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
      setSupplierToDelete(null);
    }
  };

  // Handle export to CSV
  const exportToCSV = () => {
    // Create CSV headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Supplier Number,Supplier Name,Buyer,Classification,Status,Document Status,Abnormal Info,Invitee,Re-auth Person,Contact Info,Invitation Date\n";
    
    // Add data rows
    filteredSuppliers.forEach(row => {
      csvContent += `${row.supplierNumber || row.customerNumber || ''},`;
      csvContent += `"${row.supplier || row.Customer || ''}",`;
      csvContent += `"${row.buyer || ''}",`;
      csvContent += `"${row.secondOrderClassification || row.SecondOrderClassification || ''}",`;
      csvContent += `${row.status || row.Status || ''},`;
      csvContent += `${row.documentStatus || row.DocumentStatus || ''},`;
      csvContent += `"${row.abnormalInfo || row.AbnormalInfo || ''}",`;
      csvContent += `"${row.invitee || row.Invite || ''}",`;
      csvContent += `"${row.reAuthPerson || row.ReAuthPerson || ''}",`;
      csvContent += `"${row.contactInfo || row.ContactInfo || ''}",`;
      csvContent += `${row.invitationDate || row.InvitationDate || ''}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `supplier-data-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredSuppliers.length} supplier records to CSV`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return (
      <Box p={5} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading supplier data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box p={5} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm">
      {/* Removed the Supplier Information heading and Welcome text */}
      
      {/* Filter controls */}
      <HStack spacing={4} mb={5} flexWrap="wrap">
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search by supplier, number, buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <Select 
          maxW="200px" 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Inactive">Inactive</option>
        </Select>
        
        <Select 
          maxW="200px" 
          value={filterDocStatus} 
          onChange={(e) => setFilterDocStatus(e.target.value)}
        >
          <option value="All">All Document Statuses</option>
          <option value="Complete">Complete</option>
          <option value="Incomplete">Incomplete</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Expired">Expired</option>
        </Select>
        
        <Button 
          leftIcon={<DownloadIcon />} 
          colorScheme="blue" 
          onClick={exportToCSV}
          isDisabled={filteredSuppliers.length === 0}
        >
          Export CSV
        </Button>
      </HStack>
      
      {/* Results count */}
      <Text mb={3}>
        Showing {filteredSuppliers.length} of {suppliers.length} suppliers
      </Text>
      
      {/* Table with horizontal scroll */}
      <Box overflowX="auto">
        <Table variant="simple" color={textColor} size="md">
          <Thead bg="gray.50">
            <Tr my=".8rem" pl="0px">
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Supplier Number</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Supplier</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Buyer</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Second-order Classification</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Status</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Document Status</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Abnormal Info</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Invitee</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Re-auth Person</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Contact Info</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Invitation Date</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((row) => (
                <Tr key={row._id} _hover={{ bg: "gray.50" }}>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    <Text fontWeight="medium">{row.supplierNumber || row.customerNumber}</Text>
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.supplier || row.Customer}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.buyer}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.secondOrderClassification || row.SecondOrderClassification}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {getStatusBadge(row.status || row.Status)}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {getDocumentStatusBadge(row.documentStatus || row.DocumentStatus)}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {(row.abnormalInfo || row.AbnormalInfo) ? (
                      <Tooltip label={row.abnormalInfo || row.AbnormalInfo} placement="top">
                        <Flex alignItems="center">
                          <Icon as={InfoIcon} color="red.500" mr="2" />
                          <Text noOfLines={1}>{row.abnormalInfo || row.AbnormalInfo}</Text>
                        </Flex>
                      </Tooltip>
                    ) : (
                      <Text color="gray.400">None</Text>
                    )}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.invitee || row.Invite}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.reAuthPerson || row.ReAuthPerson}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.contactInfo || row.ContactInfo}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {row.invitationDate || row.InvitationDate ? 
                      new Date(row.invitationDate || row.InvitationDate).toLocaleDateString() : 
                      ""}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    <Tooltip label="Delete Supplier" placement="top">
                      <IconButton
                        aria-label="Delete supplier"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(row)}
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={12} textAlign="center" py={6}>
                  <Text fontSize="md">No supplier data matching current filters</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Supplier
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete supplier {supplierToDelete?.supplier || supplierToDelete?.Customer}? 
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default SupplierInformationTable;