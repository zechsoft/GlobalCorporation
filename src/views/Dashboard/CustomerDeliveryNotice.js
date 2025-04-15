import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  Input,
  Select,
  Flex,
  Text,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  Tab,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useHistory } from "react-router-dom";

const TABS = [
  { label: "All", value: "all" },
  { label: "Monitored", value: "monitored" },
  { label: "Unmonitored", value: "unmonitored" },
];

const CustomerDeliveryNotice = () => {
  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [userData, setUserData] = useState(null);
  const [newRow, setNewRow] = useState({
    orderNumber: "",
    materialCategory: "",
    vendor: "",
    invitee: "",
    hostInviterContactInfo: "",
    sender: "",
    status: "Active",
    supplementTemplate: "",
    isMonitored: false,
  });
  const [selectedRowId, setSelectedRowId] = useState(null);
  const itemsPerPage = 10;

  const searchInputRef = useRef(null);
  const cancelRef = useRef();
  const [isFocused, setIsFocused] = useState(false);
  const toast = useToast();
  const history = useHistory();

  // Check if user is logged in
  useEffect(() => {
    const userDataStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!userDataStr) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      history.push("/auth/signin");
      return;
    }

    try {
      const userDataObj = JSON.parse(userDataStr);
      setUserData(userDataObj);
    } catch (error) {
      toast({
        title: "Authentication error",
        description: "Invalid user data. Please log in again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      history.push("/auth/signin");
    }
  }, [history, toast]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Generate a unique ID for new rows
  const generateUniqueId = () => {
    return 'local_' + Math.random().toString(36).substr(2, 9);
  };

  // Mock data for initial state
  useEffect(() => {
    if (userData && tableData.length === 0) {
      const mockData = [
        {
          _id: "1",
          orderNumber: "ORD001",
          materialCategory: "Electronics",
          vendor: "TechSupplies Inc.",
          invitee: "John Smith",
          hostInviterContactInfo: "john@email.com",
          sender: "Mary Johnson",
          status: "Active",
          supplementTemplate: "Standard",
          isMonitored: true,
          createTime: "2025-04-10T14:30:00Z"
        },
        {
          _id: "2",
          orderNumber: "ORD002",
          materialCategory: "Office Supplies",
          vendor: "Office World",
          invitee: "Sarah Brown",
          hostInviterContactInfo: "sarah@email.com",
          sender: "Tom Wilson",
          status: "Inactive",
          supplementTemplate: "Premium",
          isMonitored: false,
          createTime: "2025-04-11T09:15:00Z"
        }
      ];
      
      setTableData(mockData);
      setFilteredData(mockData);
      setTotalPages(Math.ceil(mockData.length / itemsPerPage));
    }
  }, [userData, tableData.length]);

  useEffect(() => {
    if (searchInputRef.current) {
      setIsFocused(searchInputRef.current === document.activeElement);
    }
  }, [searchTerm]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    
    // Apply tab filtering locally
    if (tab === "all") {
      setFilteredData(tableData);
    } else if (tab === "monitored") {
      const monitored = tableData.filter(row => row.isMonitored === true);
      setFilteredData(monitored);
    } else if (tab === "unmonitored") {
      const unmonitored = tableData.filter(row => row.isMonitored === false);
      setFilteredData(unmonitored);
    }
    
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  };

  const handleAddRow = () => {
    setIsModalOpen(true);
    setSelectedRowId(null);
    setNewRow({
      orderNumber: "",
      materialCategory: "",
      vendor: "",
      invitee: "",
      hostInviterContactInfo: "",
      sender: "",
      status: "Active",
      supplementTemplate: "",
      isMonitored: false,
    });
  };

  const handleEditRow = (rowId) => {
    const selectedRow = tableData.find((row) => row._id === rowId);
    if (selectedRow) {
      setNewRow({
        orderNumber: selectedRow.orderNumber,
        materialCategory: selectedRow.materialCategory,
        vendor: selectedRow.vendor,
        invitee: selectedRow.invitee,
        hostInviterContactInfo: selectedRow.hostInviterContactInfo,
        sender: selectedRow.sender,
        status: selectedRow.status,
        supplementTemplate: selectedRow.supplementTemplate,
        isMonitored: selectedRow.isMonitored,
      });
      setSelectedRowId(rowId);
      setIsModalOpen(true);
    }
  };

  const handleDeleteRow = (rowId) => {
    setRowToDelete(rowId);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    try {
      // Handle delete locally
      const updatedTableData = tableData.filter(row => row._id !== rowToDelete);
      const updatedFilteredData = filteredData.filter(row => row._id !== rowToDelete);
      
      setTableData(updatedTableData);
      setFilteredData(updatedFilteredData);
      setTotalPages(Math.ceil(updatedFilteredData.length / itemsPerPage));
      
      toast({
        title: "Record deleted",
        description: "The record has been successfully removed",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting record",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleteAlertOpen(false);
      setRowToDelete(null);
    }
  };

  const handleSaveRow = () => {
    try {
      if (selectedRowId) {
        // Update existing row locally
        const updatedTableData = tableData.map(row => {
          if (row._id === selectedRowId) {
            return { ...row, ...newRow };
          }
          return row;
        });
        
        // Update filtered data as well
        const updatedFilteredData = filteredData.map(row => {
          if (row._id === selectedRowId) {
            return { ...row, ...newRow };
          }
          return row;
        });
        
        setTableData(updatedTableData);
        setFilteredData(updatedFilteredData);
        
        toast({
          title: "Record updated",
          description: "The record has been successfully updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new row locally
        const currentDate = new Date();
        const newRowWithId = {
          _id: generateUniqueId(),
          ...newRow,
          createTime: currentDate.toISOString(),
        };
        
        const updatedTableData = [...tableData, newRowWithId];
        
        // Update filtered data based on the active tab
        let updatedFilteredData = [...filteredData];
        if (
          activeTab === "all" || 
          (activeTab === "monitored" && newRow.isMonitored) || 
          (activeTab === "unmonitored" && !newRow.isMonitored)
        ) {
          updatedFilteredData = [...filteredData, newRowWithId];
        }
        
        setTableData(updatedTableData);
        setFilteredData(updatedFilteredData);
        setTotalPages(Math.ceil(updatedFilteredData.length / itemsPerPage));
        
        toast({
          title: "Record added",
          description: "The record has been successfully added",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: selectedRowId ? "Error updating record" : "Error adding record",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    try {
      // Handle search locally
      let searchResults = [...tableData];
      
      if (searchTerm) {
        searchResults = searchResults.filter(row => {
          if (searchField === "All") {
            // Search in all fields
            return Object.values(row).some(value => 
              typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
            );
          } else {
            // Search in specific field
            const fieldValue = row[searchField];
            return typeof fieldValue === 'string' && 
              fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
          }
        });
      }
      
      // Apply tab filtering
      if (activeTab === "monitored") {
        searchResults = searchResults.filter(row => row.isMonitored === true);
      } else if (activeTab === "unmonitored") {
        searchResults = searchResults.filter(row => row.isMonitored === false);
      }
      
      setFilteredData(searchResults);
      setTotalPages(Math.ceil(searchResults.length / itemsPerPage));
      setCurrentPage(1);
    } catch (error) {
      toast({
        title: "Error searching records",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setSearchField("All");
    
    // Reset to the appropriate filtered data based on active tab
    if (activeTab === "all") {
      setFilteredData(tableData);
    } else if (activeTab === "monitored") {
      setFilteredData(tableData.filter(row => row.isMonitored === true));
    } else if (activeTab === "unmonitored") {
      setFilteredData(tableData.filter(row => row.isMonitored === false));
    }
    
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    setCurrentPage(1);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    history.push("/auth/signin");
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  if (!userData) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box mt={16}>
      <Flex direction="column" bg="white" p={6} boxShadow="md" borderRadius="15px" width="100%">
        <Flex justify="space-between" mb={8}>
          <Flex direction="column">
            <Text fontSize="xl" fontWeight="bold">
              Customer Delivery Notice
            </Text>
            <Text fontSize="md" color="gray.400">
              Manage Customer Delivery Notice
            </Text>
          </Flex>
          <Flex direction="row" gap={2} align="center">
            <Flex direction="column" align="flex-end" mr={4}>
              <Text fontWeight="bold">{userData.email}</Text>
              <Badge colorScheme={userData.role === "admin" ? "red" : "green"}>
                {userData.role}
              </Badge>
            </Flex>
            <Button size="sm" colorScheme="blue" leftIcon={<UserPlusIcon />} onClick={handleAddRow}>
              Add New
            </Button>
            <Button size="sm" colorScheme="red" variant="outline" onClick={handleLogout} ml={2}>
              Logout
            </Button>
          </Flex>
        </Flex>

        <Flex justify="space-between" align="center" mb={4} flexDirection={{ base: "column", md: "row" }} gap={4}>
          <Tabs
            defaultIndex={0}
            onChange={(index) => handleTabChange(TABS[index].value)}
            className="w-full md:w-max"
            isLazy
          >
            <TabList>
              {TABS.map(({ label, value }) => (
                <Tab key={value} value={value}>
                  {label}
                </Tab>
              ))}
            </TabList>
          </Tabs>
          <Flex flexWrap="wrap" gap={2}>
            <Select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              placeholder=""
              width={{ base: "100%", md: "auto" }}
              minW="200px"
            >
              <option value="All">All</option>
              <option value="orderNumber">Order Number</option>
              <option value="materialCategory">Material Category</option>
              <option value="vendor">Vendor</option>
              <option value="invitee">Invitee</option>
              <option value="hostInviterContactInfo">Host/Inviter Contact Information</option>
              <option value="sender">Sender</option>
              <option value="status">Status</option>
              <option value="supplementTemplate">Supplement Template</option>
            </Select>
            <FormControl width={{ base: "100%", md: "auto" }} minW="200px">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MagnifyingGlassIcon style={{ height: "20px", width: "20px", color: "gray" }} />
                </InputLeftElement>
                <Input
                  ref={searchInputRef}
                  size="md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  borderColor={isFocused ? "blue.500" : "gray.300"}
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px blue.500",
                  }}
                  placeholder="Search here"
                />
              </InputGroup>
            </FormControl>
            <Button colorScheme="blue" onClick={handleSearch}>
              Search
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </Flex>
        </Flex>

        {isLoading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : (
          <>
            <Box overflowX="auto">
              <Table variant="simple" borderRadius="10px" overflow="hidden">
                <Thead bg="gray.100" height="60px">
                  <Tr>
                    <Th color="gray.400">#</Th>
                    <Th color="gray.400">Order Number</Th>
                    <Th color="gray.400">Material Category</Th>
                    <Th color="gray.400">Vendor</Th>
                    <Th color="gray.400">Invitee</Th>
                    <Th color="gray.400">Host/Inviter Contact Info</Th>
                    <Th color="gray.400">Sender</Th>
                    <Th color="gray.400">Status</Th>
                    <Th color="gray.400">Supplement Template</Th>
                    <Th color="gray.400">Created</Th>
                    <Th color="gray.400">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((row, index) => (
                      <Tr key={row._id}>
                        <Td>{indexOfFirstItem + index + 1}</Td>
                        <Td>{row.orderNumber}</Td>
                        <Td>{row.materialCategory}</Td>
                        <Td>{row.vendor}</Td>
                        <Td>{row.invitee}</Td>
                        <Td>{row.hostInviterContactInfo}</Td>
                        <Td>{row.sender}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              row.status === "Active"
                                ? "green"
                                : row.status === "Inactive"
                                ? "red"
                                : "yellow"
                            }
                          >
                            {row.status}
                          </Badge>
                        </Td>
                        <Td>{row.supplementTemplate}</Td>
                        <Td>{formatDate(row.createTime)}</Td>
                        <Td>
                          <Flex gap={2}>
                            <Tooltip label="Edit">
                              <IconButton
                                variant="outline"
                                aria-label="Edit"
                                icon={<PencilIcon style={{ height: "20px", width: "20px" }} />}
                                size="sm"
                                onClick={() => handleEditRow(row._id)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete">
                              <IconButton
                                variant="outline"
                                colorScheme="red"
                                aria-label="Delete"
                                icon={<TrashIcon style={{ height: "20px", width: "20px" }} />}
                                size="sm"
                                onClick={() => handleDeleteRow(row._id)}
                              />
                            </Tooltip>
                          </Flex>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={11} textAlign="center" py={10}>
                        No records found. Try a different search or add a new record.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>

            <Flex justify="space-between" align="center" mt={4}>
              <Text fontSize="sm">
                Page {currentPage} of {totalPages} ({filteredData.length} records)
              </Text>
              <Flex>
                <Button
                  size="sm"
                  variant="outline"
                  mr={2}
                  isDisabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          </>
        )}
      </Flex>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedRowId ? "Edit Record" : "Add New Record"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" gap={4}>
              <Flex gap={4} flexWrap="wrap">
                <FormControl width={{ base: "100%", md: "48%" }}>
                  <FormLabel>Order Number</FormLabel>
                  <Input
                    value={newRow.orderNumber}
                    onChange={(e) => setNewRow({ ...newRow, orderNumber: e.target.value })}
                  />
                </FormControl>
                <FormControl width={{ base: "100%", md: "48%" }}>
                  <FormLabel>Material Category</FormLabel>
                  <Input
                    value={newRow.materialCategory}
                    onChange={(e) => setNewRow({ ...newRow, materialCategory: e.target.value })}
                  />
                </FormControl>
              </Flex>

              <Flex gap={4} flexWrap="wrap">
                <FormControl width={{ base: "100%", md: "48%" }}>
                  <FormLabel>Vendor</FormLabel>
                  <Input
                    value={newRow.vendor}
                    onChange={(e) => setNewRow({ ...newRow, vendor: e.target.value })}
                  />
                </FormControl>
                <FormControl width={{ base: "100%", md: "48%" }}>
                  <FormLabel>Invitee</FormLabel>
                  <Input
                    value={newRow.invitee}
                    onChange={(e) => setNewRow({ ...newRow, invitee: e.target.value })}
                  />
                </FormControl>
              </Flex>

              <FormControl>
                <FormLabel>Host/Inviter Contact Information</FormLabel>
                <Input
                  value={newRow.hostInviterContactInfo}
                  onChange={(e) => setNewRow({ ...newRow, hostInviterContactInfo: e.target.value })}
                />
              </FormControl>

              <Flex gap={4} flexWrap="wrap">
                <FormControl width={{ base: "100%", md: "48%" }}>
                  <FormLabel>Sender</FormLabel>
                  <Input
                    value={newRow.sender}
                    onChange={(e) => setNewRow({ ...newRow, sender: e.target.value })}
                  />
                </FormControl>
                <FormControl width={{ base: "100%", md: "48%" }}>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={newRow.status}
                    onChange={(e) => setNewRow({ ...newRow, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </Select>
                </FormControl>
              </Flex>

              <Flex gap={4} flexWrap="wrap">
                <FormControl width={{ base: "100%", md: "48%" }}>
                  <FormLabel>Supplement Template</FormLabel>
                  <Input
                    value={newRow.supplementTemplate}
                    onChange={(e) => setNewRow({ ...newRow, supplementTemplate: e.target.value })}
                  />
                </FormControl>
                <FormControl width={{ base: "100%", md: "48%" }}>
                  <FormLabel>Monitored</FormLabel>
                  <Select
                    value={newRow.isMonitored.toString()}
                    onChange={(e) => setNewRow({ ...newRow, isMonitored: e.target.value === "true" })}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </Select>
                </FormControl>
              </Flex>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveRow}>
              {selectedRowId ? "Update" : "Add"}
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Record
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this record? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
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

export default CustomerDeliveryNotice;