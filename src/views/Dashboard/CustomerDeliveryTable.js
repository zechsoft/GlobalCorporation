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
import { InfoIcon, PhoneIcon, EmailIcon, SearchIcon, DownloadIcon } from "@chakra-ui/icons";

// Status badge styling helper
const getStatusBadge = (status) => {
  let colorScheme;
  switch (status) {
    case "Completed":
      colorScheme = "green";
      break;
    case "In Progress":
      colorScheme = "yellow";
      break;
    case "Cancelled":
      colorScheme = "red";
      break;
    default:
      colorScheme = "gray";
  }
  return <Badge colorScheme={colorScheme}>{status}</Badge>;
};

// Urgent material badge styling helper
const getUrgentBadge = (isUrgent) => {
  let colorScheme = isUrgent ? "red" : "gray";
  return <Badge colorScheme={colorScheme}>{isUrgent ? "Urgent" : "Standard"}</Badge>;
};

const CustomerDeliveryTable = ({ 
  textColor = "gray.700", 
  borderColor = "gray.200"
}) => {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterUrgent, setFilterUrgent] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  
  const toast = useToast();

  // Fetch current user data from local/session storage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user")) || null;
    setCurrentUser(user);
  }, []);

  // Fetch delivery data
  useEffect(() => {
    const fetchDeliveries = async () => {
      setIsLoading(true);
      try {
        // Get the authentication token
        const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
        
        if (!user) {
          throw new Error("User not authenticated");
        }

        const response = await axios.get('http://localhost:8000/api/customerdelivery/get-all');
        
        setDeliveries(response.data.data);
        setFilteredDeliveries(response.data.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching deliveries:", err);
        setError(err.response?.data?.message || "Failed to fetch delivery data");
        setIsLoading(false);
        
        toast({
          title: "Error",
          description: `Failed to fetch delivery data: ${err.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchDeliveries();
  }, [toast]);

  // Apply filters when search term or filter status changes
  useEffect(() => {
    let results = deliveries;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(delivery => 
        delivery.customer.toLowerCase().includes(term) ||
        delivery.deliveryNoticeNo.toLowerCase().includes(term) ||
        delivery.creator.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (filterStatus !== "All") {
      results = results.filter(delivery => delivery.orderStatus === filterStatus);
    }
    
    // Apply urgent filter
    if (filterUrgent !== "All") {
      const isUrgent = filterUrgent === "Urgent";
      results = results.filter(delivery => delivery.urgentMaterial === isUrgent);
    }
    
    setFilteredDeliveries(results);
  }, [searchTerm, filterStatus, filterUrgent, deliveries]);

  // Handle export to CSV
  const exportToCSV = () => {
    // Create CSV headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "#,Customer,Delivery Notice No,Start Time,End Time,Creator,Urgent Material,Order Status\n";
    
    // Add data rows
    filteredDeliveries.forEach((row, index) => {
      csvContent += `${index + 1},`;
      csvContent += `"${row.customer}",`;
      csvContent += `${row.deliveryNoticeNo},`;
      csvContent += `${new Date(row.startTime).toLocaleString()},`;
      csvContent += `${new Date(row.endTime).toLocaleString()},`;
      csvContent += `"${row.creator}",`;
      csvContent += `${row.urgentMaterial ? "Urgent" : "Standard"},`;
      csvContent += `${row.orderStatus}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customer-delivery-data-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredDeliveries.length} delivery records to CSV`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return (
      <Box p={5} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading delivery data...</Text>
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
            placeholder="Search by customer, notice number..."
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
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
          <option value="Cancelled">Cancelled</option>
        </Select>
        
        <Select 
          maxW="200px" 
          value={filterUrgent} 
          onChange={(e) => setFilterUrgent(e.target.value)}
        >
          <option value="All">All Materials</option>
          <option value="Urgent">Urgent Only</option>
          <option value="Standard">Standard Only</option>
        </Select>
        
        <Button 
          leftIcon={<DownloadIcon />} 
          colorScheme="blue" 
          onClick={exportToCSV}
          isDisabled={filteredDeliveries.length === 0}
        >
          Export CSV
        </Button>
      </HStack>
      
      {/* Results count */}
      <Text mb={3}>
        Showing {filteredDeliveries.length} of {deliveries.length} deliveries
      </Text>
      
      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" color={textColor} size="md">
          <Thead bg="gray.50">
            <Tr my=".8rem" pl="0px">
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">#</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Customer</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Delivery Notice No</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Start Time</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">End Time</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Creator</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Urgent Material</Th>
              <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.600" fontWeight="bold">Order Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((row, index) => (
                <Tr key={row._id} _hover={{ bg: "gray.50" }}>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    <Text fontWeight="medium">{index + 1}</Text>
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.customer}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.deliveryNoticeNo}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {new Date(row.startTime).toLocaleString()}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {new Date(row.endTime).toLocaleString()}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>{row.creator}</Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {getUrgentBadge(row.urgentMaterial)}
                  </Td>
                  <Td pl="35px" pr="35px" borderColor={borderColor}>
                    {getStatusBadge(row.orderStatus)}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={8} textAlign="center" py={4}>
                  No delivery data matching current filters
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default CustomerDeliveryTable;