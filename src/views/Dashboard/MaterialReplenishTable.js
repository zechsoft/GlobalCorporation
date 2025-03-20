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

// Template status badge styling helper
const getTemplateStatusBadge = (status) => {
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

const MaterialReplenishTable = ({ 
  textColor = "gray.700", 
  borderColor = "gray.200"
}) => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterTemplateStatus, setFilterTemplateStatus] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  
  const toast = useToast();

  // Fetch current user data from local/session storage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user")) || null;
    setCurrentUser(user);
  }, []);

  // Fetch material data
  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        // Get the authentication token
        const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
        
        if (!user) {
          throw new Error("User not authenticated");
        }

        const response = await axios.get('http://localhost:8000/api/material-replenishment/get-all');

        setMaterials(response.data.data);
        setFilteredMaterials(response.data.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching materials:", err);
        setError(err.response?.data?.message || "Failed to fetch material data");
        setIsLoading(false);
        
        toast({
          title: "Error",
          description: `Failed to fetch material data: ${err.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchMaterials();
  }, [toast]);

  // Apply filters when search term or filter status changes
  useEffect(() => {
    let results = materials;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(material => 
        material.orderNumber.toLowerCase().includes(term) ||
        material.materialCategory.toLowerCase().includes(term) ||
        material.vendor.toLowerCase().includes(term) ||
        material.invitee.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (filterStatus !== "All") {
      results = results.filter(material => material.status === filterStatus);
    }
    
    // Apply template status filter
    if (filterTemplateStatus !== "All") {
      results = results.filter(material => material.supplementTemplate === filterTemplateStatus);
    }
    
    setFilteredMaterials(results);
  }, [searchTerm, filterStatus, filterTemplateStatus, materials]);

  // Handle export to CSV
  const exportToCSV = () => {
    // Create CSV headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "#,Order Number,Material Category,Vendor,Invitee,Host/Inviter Contact Information,Sender,Status,Supplement Template,Create Time,Update Time\n";
    
    // Add data rows
    filteredMaterials.forEach((row, index) => {
      csvContent += `${index + 1},`;
      csvContent += `${row.OrderNumber},`;
      csvContent += `"${row.MaterialCategory}",`;
      csvContent += `"${row.Vendor}",`;
      csvContent += `"${row.Invitee}",`;
      // csvContent += `"${row.contactInfo.phone} | ${row.contactInfo.email}",`;
      csvContent += `"${row.Sender}",`;
      csvContent += `${row.Status},`;
      csvContent += `${row.SupplementTemplate},`;
      csvContent += `${new Date(row.Created).toLocaleString()},`;
      csvContent += `${new Date(row.updated).toLocaleString()}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `material-replenish-data-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredMaterials.length} material records to CSV`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return (
      <Box p={5} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading material data...</Text>
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
        <Heading size="md">Material Replenishment</Heading>
        <Text>Welcome, {currentUser?.email} ({currentUser?.role})</Text>
      </Flex>
      
      {/* Filter controls */}
      <HStack spacing={4} mb={5}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search by order number, vendor, category..."
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
          value={filterTemplateStatus} 
          onChange={(e) => setFilterTemplateStatus(e.target.value)}
        >
          <option value="All">All Templates</option>
          <option value="Complete">Complete</option>
          <option value="Incomplete">Incomplete</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Expired">Expired</option>
        </Select>
        
        <Button 
          leftIcon={<DownloadIcon />} 
          colorScheme="blue" 
          onClick={exportToCSV}
          isDisabled={filteredMaterials.length === 0}
        >
          Export CSV
        </Button>
      </HStack>
      
      {/* Results count */}
      <Text mb={3}>
        Showing {filteredMaterials.length} of {materials.length} materials
      </Text>
      
      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" color={textColor} size="md">
          <Thead bg="gray.50">
            <Tr my=".8rem" pl="0px">
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">#</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Order Number</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Material Category</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Vendor</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Invitee</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Host/Inviter Contact Information</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Sender</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Status</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Supplement Template</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Create Time</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Update Time</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((row, index) => (
                <Tr key={row._id} _hover={{ bg: "gray.50" }}>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    <Text fontWeight="medium">{index + 1}</Text>
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    <Text fontWeight="medium">{row.OrderNumber}</Text>
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.MaterialCategory}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.Vendor}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.Invitee}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.Host}</Td>
                    {/* <Tooltip label={`${row.contactInfo.phone} | ${row.contactInfo.email}`} placement="top">
                      <Flex>
                        <Icon as={PhoneIcon} color="blue.500" mr="2" />
                        <Icon as={EmailIcon} color="blue.500" />
                      </Flex>
                    </Tooltip> */}

                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.Sender}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {getStatusBadge(row.Status)}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {getTemplateStatusBadge(row.SupplementTemplate)}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {new Date(row.Created).toLocaleDateString()} {new Date(row.Created).toLocaleTimeString()}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {new Date(row.updated).toLocaleDateString()} {new Date(row.updated).toLocaleTimeString()}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={11} textAlign="center" py={4}>
                  No material data matching current filters
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default MaterialReplenishTable;
