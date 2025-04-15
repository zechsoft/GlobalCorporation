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
  useToast
} from "@chakra-ui/react";
import { InfoIcon, SearchIcon, DownloadIcon } from "@chakra-ui/icons";

// Status badge styling helper
const getStatusBadge = (status) => {
  let colorScheme;
  switch (status) {
    case "Approved":
      colorScheme = "green";
      break;
    case "Pending":
      colorScheme = "yellow";
      break;
    case "Rejected":
      colorScheme = "red";
      break;
    default:
      colorScheme = "gray";
  }
  return <Badge colorScheme={colorScheme}>{status}</Badge>;
};

const MaterialInquiryTable = ({ 
  textColor = "gray.700", 
  borderColor = "gray.200"
}) => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
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

        const response = await axios.get('http://localhost:8000/api/material-inquiry/get-all');
        
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
        material.material.toLowerCase().includes(term) ||
        material.supplementOrderNumber.toLowerCase().includes(term) ||
        material.explanation.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (filterStatus !== "All") {
      results = results.filter(material => material.status === filterStatus);
    }
    
    setFilteredMaterials(results);
  }, [searchTerm, filterStatus, materials]);

  // Handle export to CSV
  const exportToCSV = () => {
    // Create CSV headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Material,Supplement Order Number,Status,Explanation,Create Time,Update Time\n";
    
    // Add data rows
    filteredMaterials.forEach(row => {
      csvContent += `"${row.Suppliermaterial}",`;
      csvContent += `${row.OrderNumber},`;
      csvContent += `${row.status},`;
      csvContent += `"${row.explaination || ''}",`;
      csvContent += `${row.createdTime},`;
      csvContent += `${row.updateTime}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `material-inquiry-${new Date().toISOString().slice(0,10)}.csv`);
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
      {/* Filter controls */}
      <HStack spacing={4} mb={5}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search by material, order number..."
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
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
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
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Material</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Supplement Order Number</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Status</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Explanation</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Create Time</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Update Time</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((row) => (
                <Tr key={row._id} _hover={{ bg: "gray.50" }}>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    <Text fontWeight="medium">{row.Suppliermaterial}</Text>
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.OrderNumber}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {getStatusBadge(row.status)}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {row.explanation ? (
                      <Tooltip label={row.explaination} placement="top">
                        <Flex alignItems="center">
                          <Icon as={InfoIcon} color="blue.500" mr="2" />
                          <Text noOfLines={1}>{row.explaination}</Text>
                        </Flex>
                      </Tooltip>
                    ) : (
                      <Text color="gray.400">None</Text>
                    )}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {new Date(row.createdTime).toLocaleString()}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {new Date(row.updateTime).toLocaleString()}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} textAlign="center" py={4}>
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

export default MaterialInquiryTable;