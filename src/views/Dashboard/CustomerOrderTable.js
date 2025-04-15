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
    case "Complete":
      colorScheme = "green";
      break;
    case "Pending":
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

// Order status badge styling helper
const getOrderStatusBadge = (status) => {
  let colorScheme;
  switch (status) {
    case "Fulfilled":
      colorScheme = "green";
      break;
    case "Processing":
      colorScheme = "blue";
      break;
    case "Delayed":
      colorScheme = "orange";
      break;
    case "Cancelled":
      colorScheme = "red";
      break;
    default:
      colorScheme = "gray";
  }
  return <Badge colorScheme={colorScheme}>{status}</Badge>;
};

const CustomerOrderTable = ({ 
  textColor = "gray.700", 
  borderColor = "gray.200"
}) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterOrderStatus, setFilterOrderStatus] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  
  const toast = useToast();

  // Fetch current user data from local/session storage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user")) || null;
    setCurrentUser(user);
  }, []);

  // Fetch order data
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Get the authentication token
        const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
        
        if (!user) {
          throw new Error("User not authenticated");
        }

        const response = await axios.get('http://localhost:8000/api/customer/get-all');

        console.log(response);
        
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.message || "Failed to fetch order data");
        setIsLoading(false);
        
        toast({
          title: "Error",
          description: `Failed to fetch order data: ${err.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchOrders();
  }, [toast]);

  // Apply filters when search term or filter status changes
  useEffect(() => {
    let results = orders;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(order => 
        order.customerNumber.toLowerCase().includes(term) ||
        order.customer.toLowerCase().includes(term) ||
        order.buyer.toLowerCase().includes(term) ||
        order.platformNo.toLowerCase().includes(term) ||
        order.poNo.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (filterStatus !== "All") {
      results = results.filter(order => order.deliveryStatus === filterStatus);
    }
    
    // Apply order status filter
    if (filterOrderStatus !== "All") {
      results = results.filter(order => order.orderStatus === filterOrderStatus);
    }
    
    setFilteredOrders(results);
  }, [searchTerm, filterStatus, filterOrderStatus, orders]);

  // Handle export to CSV
  const exportToCSV = () => {
    // Create CSV headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Customer Number,Customer,Buyer,Platform No,PO No,Purchase Date,Order Amount,Currency,Purchasing Department,Purchaser,Requisition Business Group,Delivery Status,Order Status,Acceptance Status,Statement Status\n";
    
    // Add data rows
    filteredOrders.forEach(row => {
      csvContent += `${row.customerNumber},`;
      csvContent += `"${row.customer}",`;
      csvContent += `"${row.buyer}",`;
      csvContent += `"${row.platformNo}",`;
      csvContent += `"${row.poNo}",`;
      csvContent += `${row.purchaseDate},`;
      csvContent += `${row.orderAmount},`;
      csvContent += `${row.currency},`;
      csvContent += `"${row.purchasingDepartment}",`;
      csvContent += `"${row.purchaser}",`;
      csvContent += `"${row.requisitionBusinessGroup}",`;
      csvContent += `${row.deliveryStatus},`;
      csvContent += `${row.orderStatus},`;
      csvContent += `${row.acceptanceStatus},`;
      csvContent += `${row.statementStatus}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customer-orders-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredOrders.length} order records to CSV`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return (
      <Box p={5} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading order data...</Text>
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
            placeholder="Search by customer, PO, platform..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <Select 
          maxW="200px" 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Delivery Statuses</option>
          <option value="Complete">Complete</option>
          <option value="Pending">Pending</option>
          <option value="In Transit">In Transit</option>
          <option value="Delayed">Delayed</option>
        </Select>
        
        <Select 
          maxW="200px" 
          value={filterOrderStatus} 
          onChange={(e) => setFilterOrderStatus(e.target.value)}
        >
          <option value="All">All Order Statuses</option>
          <option value="Fulfilled">Fulfilled</option>
          <option value="Processing">Processing</option>
          <option value="Cancelled">Cancelled</option>
        </Select>
        
        <Button 
          leftIcon={<DownloadIcon />} 
          colorScheme="blue" 
          onClick={exportToCSV}
          isDisabled={filteredOrders.length === 0}
        >
          Export CSV
        </Button>
      </HStack>
      
      {/* Results count */}
      <Text mb={3}>
        Showing {filteredOrders.length} of {orders.length} orders
      </Text>
      
      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" color={textColor} size="md">
          <Thead bg="gray.50">
            <Tr my=".8rem" pl="0px">
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Customer Number</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Customer</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Buyer</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Platform No</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">PO No</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Purchase Date</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Order Amount</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Currency</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Purchasing Department</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Purchaser</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Requisition Business Group</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Delivery Status</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Order Status</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Acceptance Status</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Statement Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((row) => (
                <Tr key={row._id} _hover={{ bg: "gray.50" }}>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>
                    <Text fontWeight="medium">{row.customerNumber}</Text>
                  </Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.customer}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.buyer}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.platformNo}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.poNo}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>
                    {new Date(row.purchaseDate).toLocaleDateString()}
                  </Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor} isNumeric>
                    {Number(row.orderAmount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.currency}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.purchasingDepartment}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.purchaser}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.requisitionBusinessGroup}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>
                    {getStatusBadge(row.deliveryStatus)}
                  </Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>
                    {getOrderStatusBadge(row.orderStatus)}
                  </Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.acceptanceStatus}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.statementStatus}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={15} textAlign="center" py={4}>
                  No order data matching current filters
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default CustomerOrderTable;