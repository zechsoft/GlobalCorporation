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

// Progress badge styling helper
const getProgressBadge = (progress) => {
  let colorScheme;
  switch (progress) {
    case "Completed":
      colorScheme = "green";
      break;
    case "In Progress":
      colorScheme = "yellow";
      break;
    case "Not Started":
      colorScheme = "red";
      break;
    default:
      colorScheme = "gray";
  }
  return <Badge colorScheme={colorScheme}>{progress}</Badge>;
};

const DailyWorkerReportTable = ({ 
  textColor = "gray.700", 
  borderColor = "gray.200"
}) => {
  const [workerReports, setWorkerReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProgress, setFilterProgress] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  
  const toast = useToast();

  // Fetch current user data from local/session storage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user")) || null;
    setCurrentUser(user);
  }, []);

  // Fetch worker reports data
  useEffect(() => {
    const fetchWorkerReports = async () => {
      setIsLoading(true);
      try {
        // Get the authentication token
        const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
        
        if (!user) {
          throw new Error("User not authenticated");
        }

        const response = await axios.get('http://localhost:8000/api/dailywork/get-all');
        
        setWorkerReports(response.data.data);
        setFilteredReports(response.data.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching worker reports:", err);
        setError(err.response?.data?.message || "Failed to fetch worker report data");
        setIsLoading(false);
        
        toast({
          title: "Error",
          description: `Failed to fetch worker report data: ${err.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchWorkerReports();
  }, [toast]);

  // Apply filters when search term or filter status changes
  useEffect(() => {
    let results = workerReports;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(report => 
        report.companyName.toLowerCase().includes(term) ||
        report.projectName.toLowerCase().includes(term) ||
        report.supervisorName.toLowerCase().includes(term) ||
        report.managerName.toLowerCase().includes(term)
      );
    }
    
    // Apply progress filter
    if (filterProgress !== "All") {
      results = results.filter(report => report.progress === filterProgress);
    }
    
    setFilteredReports(results);
  }, [searchTerm, filterProgress, workerReports]);

  // Handle export to CSV
  const exportToCSV = () => {
    // Create CSV headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Sr.No.,Company Name,Project Name,Date,Supervisor Name,Manager Name,Prepared By,No. of Employee,Nature of Work,Progress,Hour of Work,Charges,Date\n";
    
    // Add data rows
    filteredReports.forEach((row, index) => {
      csvContent += `${index + 1},`;
      csvContent += `"${row.CompanyName}",`;
      csvContent += `"${row.ProjectName}",`;
      csvContent += `${new Date(row.Date).toLocaleDateString()},`;
      csvContent += `"${row.SupervisorName}",`;
      csvContent += `"${row.ManagerName}",`;
      csvContent += `"${row.PrepaidBy}",`;
      csvContent += `${row.numberOfEmployee},`;
      csvContent += `"${row.NatureOfWork}",`;
      csvContent += `${row.Progress},`;
      csvContent += `${row.HourOfWork},`;
      csvContent += `${row.Charges},`;
      csvContent += `${new Date(row.Date).toLocaleDateString()}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daily-worker-report-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredReports.length} worker report records to CSV`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return (
      <Box p={5} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading worker report data...</Text>
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
        <Heading size="md">Daily Worker Report</Heading>
        <Text>Welcome, {currentUser?.email} ({currentUser?.role})</Text>
      </Flex>
      
      {/* Filter controls */}
      <HStack spacing={4} mb={5}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search by company, project, supervisor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <Select 
          maxW="200px" 
          value={filterProgress} 
          onChange={(e) => setFilterProgress(e.target.value)}
        >
          <option value="All">All Progress</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
          <option value="Not Started">Not Started</option>
        </Select>
        
        <Button 
          leftIcon={<DownloadIcon />} 
          colorScheme="blue" 
          onClick={exportToCSV}
          isDisabled={filteredReports.length === 0}
        >
          Export CSV
        </Button>
      </HStack>
      
      {/* Results count */}
      <Text mb={3}>
        Showing {filteredReports.length} of {workerReports.length} reports
      </Text>
      
      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" color={textColor} size="md">
          <Thead bg="gray.50">
            <Tr my=".8rem" pl="0px">
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Sr.No.</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Company Name</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Project Name</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Date</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Supervisor Name</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Manager Name</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Prepared By</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">No. of Employee</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Nature of Work</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Progress</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Hour of Work</Th>
              <Th pl="25px" pr="25px" borderColor={borderColor} color="gray.600" fontWeight="bold">Charges</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((row, index) => (
                <Tr key={row._id} _hover={{ bg: "gray.50" }}>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>
                    <Text fontWeight="medium">{index + 1}</Text>
                  </Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.CompanyName}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.ProjectName}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>
                    {new Date(row.Date).toLocaleDateString()}
                  </Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.SupervisorName}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.ManagerName}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.PrepaidBy}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.Employee}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.NatureOfWork}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>
                    {getProgressBadge(row.Progress)}
                  </Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.HourOfWork}</Td>
                  <Td pl="25px" pr="25px" borderColor={borderColor}>{row.Charges}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={12} textAlign="center" py={4}>
                  No worker report data matching current filters
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default DailyWorkerReportTable;