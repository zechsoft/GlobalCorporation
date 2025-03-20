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
  Heading
} from "@chakra-ui/react";
import { InfoIcon, PhoneIcon, EmailIcon, SearchIcon, DownloadIcon } from "@chakra-ui/icons";

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
  
  const toast = useToast();

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
        supplier.customerNumber.toLowerCase().includes(term) ||
        supplier.customerName.toLowerCase().includes(term) ||
        supplier.buyer.toLowerCase().includes(term) ||
        supplier.invitee.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (filterStatus !== "All") {
      results = results.filter(supplier => supplier.status === filterStatus);
    }
    
    // Apply document status filter
    if (filterDocStatus !== "All") {
      results = results.filter(supplier => supplier.documentStatus === filterDocStatus);
    }
    
    setFilteredSuppliers(results);
  }, [searchTerm, filterStatus, filterDocStatus, suppliers]);

  // Handle export to CSV
  const exportToCSV = () => {
    // Create CSV headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Customer Number,Customer Name,Buyer,Classification,Status,Document Status,Abnormal Info,Invitee,Re-auth Person,Contact Phone,Contact Email,Invitation Date\n";
    
    // Add data rows
    filteredSuppliers.forEach(row => {
      csvContent += `${row.CustomerNumber},`;
      csvContent += `"${row.Customer}",`;
      csvContent += `"${row.buyer}",`;
      csvContent += `"${row.SecondOrderClassification}",`;
      csvContent += `${row.Status},`;
      csvContent += `${row.DocumentStatus},`;
      csvContent += `"${row.AbnormalInfo || ''}",`;
      csvContent += `"${row.Invite}",`;
      csvContent += `"${row.ReAuthPerson}",`;
      csvContent += `${row.InvitationDate}\n`;
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
      <Flex justifyContent="space-between" alignItems="center" mb={5}>
        <Heading size="md">Supplier Information</Heading>
        <Text>Welcome, {currentUser?.email} ({currentUser?.role})</Text>
      </Flex>
      
      {/* Filter controls */}
      <HStack spacing={4} mb={5}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search by customer, number, buyer..."
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
      
      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" color={textColor} size="md">
          <Thead bg="gray.50">
            <Tr my=".8rem" pl="0px">
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Customer Number</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Customer</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Buyer</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Second-order Classification</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Status</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Document Status</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Abnormal Info</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Invitee</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Re-auth Person</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Contact Info</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Invitation Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((row) => (
                <Tr key={row._id} _hover={{ bg: "gray.50" }}>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    <Text fontWeight="medium">{row.customerNumber}</Text>
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.Customer}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.buyer}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.SecondOrderClassification}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {getStatusBadge(row.Status)}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {getDocumentStatusBadge(row.DocumentStatus)}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {row.AbnormalInfo ? (
                      <Tooltip label={row.AbnormalInfo} placement="top">
                        <Flex alignItems="center">
                          <Icon as={InfoIcon} color="red.500" mr="2" />
                          <Text noOfLines={1}>{row.AbnormalInfo}</Text>
                        </Flex>
                      </Tooltip>
                    ) : (
                      <Text color="gray.400">None</Text>
                    )}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.Invite}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.ReAuthPerson}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.ContactInfo}</Td>
                    {/* <Tooltip label={`${row.contactInfo.phone} | ${row.contactInfo.email}`} placement="top">
                      <Flex>
                        <Icon as={PhoneIcon} color="blue.500" mr="2" />
                        <Icon as={EmailIcon} color="blue.500" />
                      </Flex>
                    </Tooltip> */}
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {new Date(row.InvitationDate).toLocaleDateString()}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={11} textAlign="center" py={4}>
                  No supplier data matching current filters
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default SupplierInformationTable; 