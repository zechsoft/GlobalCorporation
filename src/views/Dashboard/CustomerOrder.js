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
import axios from "axios";

const TABS = [
  { label: "All", value: "all" },
  { label: "Monitored", value: "monitored" },
  { label: "Unmonitored", value: "unmonitored" },
];

const CustomerOrder = () => {
  const [tableData, setTableData] = useState([
    {
      id: 1,
      customerNumber: "123",
      customer: "John Doe",
      buyer: "Jane Doe",
      platformNo: "P123",
      poNo: "PO123",
      purchaseDate: "2023-04-18",
      orderAmount: "1000",
      currency: "USD",
      purchasingDepartment: "Dept A",
      purchaser: "Alice",
      requisitionBusinessGroup: "Group 1",
      deliveryStatus: "Shipped",
      orderStatus: "Pending",
      acceptanceStatus: "Accepted",
      statementStatus: "Generated",
    },
    {
      id: 2,
      customerNumber: "124",
      customer: "Alice Smith",
      buyer: "Bob Brown",
      platformNo: "P124",
      poNo: "PO124",
      purchaseDate: "2023-04-19",
      orderAmount: "2000",
      currency: "EUR",
      purchasingDepartment: "Dept B",
      purchaser: "Bob",
      requisitionBusinessGroup: "Group 2",
      deliveryStatus: "Delivered",
      orderStatus: "Completed",
      acceptanceStatus: "Rejected",
      statementStatus: "Pending",
    },
  ]);

  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
  const [filteredData, setFilteredData] = useState(tableData);
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [isDataUpdated, setIsDataUpdated] = useState(false);
  const [newRow, setNewRow] = useState({
    customerNumber: "",
    customer: "",
    buyer: "",
    platformNo: "",
    poNo: "",
    purchaseDate: "",
    orderAmount: "",
    currency: "",
    purchasingDepartment: "",
    purchaser: "",
    requisitionBusinessGroup: "",
    deliveryStatus: "",
    orderStatus: "",
    acceptanceStatus: "",
    statementStatus: "",
  });
  const [selectedRowId, setSelectedRowId] = useState(null);

  const searchInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const cancelRef = useRef();
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8000/api/customer/get-data",
          { "email": user.email },
          {
            withCredentials: true,
          }
        );

        setTableData(response.data);
        setFilteredData(response.data);
        setIsDataUpdated(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Still use the mock data if API fails
        setFilteredData(tableData);
      }
    };

    // Only fetch from API when component mounts or data is updated
    if (isDataUpdated) {
      fetchData();
    }

    if (searchInputRef.current) {
      setIsFocused(searchInputRef.current === document.activeElement);
    }
  }, [isDataUpdated, searchTerm]);

  const handleAddRow = () => {
    setIsModalOpen(true);
    setSelectedRowId(null);
    setNewRow({
      customerNumber: "",
      customer: "",
      buyer: "",
      platformNo: "",
      poNo: "",
      purchaseDate: "",
      orderAmount: "",
      currency: "",
      purchasingDepartment: "",
      purchaser: "",
      requisitionBusinessGroup: "",
      deliveryStatus: "",
      orderStatus: "",
      acceptanceStatus: "",
      statementStatus: "",
    });
  };

  const handleEditRow = (rowId) => {
    const selectedRow = tableData.find((row) => row.id === rowId);
    if (selectedRow) {
      setNewRow(selectedRow);
      setSelectedRowId(rowId);
      setIsModalOpen(true);
    }
  };

  const handleDeleteRow = (rowId) => {
    setRowToDelete(rowId);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Optimistic UI update - remove from local state first
      const updatedTableData = tableData.filter((row) => row.id !== rowToDelete);
      setTableData(updatedTableData);
      setFilteredData(updatedTableData);
      
      // Attempt to sync with backend
      await axios.post(
        "http://localhost:8000/api/customer/delete-data",
        {
          id: rowToDelete,
          user: user.email
        },
        {
          withCredentials: true
        }
      );
      
      toast({
        title: "Row deleted",
        description: "The record has been successfully removed",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error deleting row:", err);
      
      toast({
        title: "Error",
        description: "Failed to delete the record on the server, but it was removed from your view",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleteAlertOpen(false);
      setRowToDelete(null);
    }
  };

  const handleSaveRow = async () => {
    // Create a local copy for the UI update
    let updatedTableData;
    let apiAction;
    let apiPayload;

    if (selectedRowId) {
      // Update existing row
      updatedTableData = tableData.map((row) =>
        row.id === selectedRowId ? { ...row, ...newRow } : row
      );
      apiAction = "update-data";
      apiPayload = { ...newRow, user: user.email };
    } else {
      // Add new row
      const updatedRow = { ...newRow, id: tableData.length > 0 ? Math.max(...tableData.map(row => row.id)) + 1 : 1 };
      updatedTableData = [...tableData, updatedRow];
      apiAction = "add-data";
      apiPayload = [updatedRow, { user: user.email }];
    }

    // Update UI immediately (optimistic update)
    setTableData(updatedTableData);
    setFilteredData(updatedTableData);
    
    // Close modal and reset form
    setIsModalOpen(false);
    setNewRow({
      customerNumber: "",
      customer: "",
      buyer: "",
      platformNo: "",
      poNo: "",
      purchaseDate: "",
      orderAmount: "",
      currency: "",
      purchasingDepartment: "",
      purchaser: "",
      requisitionBusinessGroup: "",
      deliveryStatus: "",
      orderStatus: "",
      acceptanceStatus: "",
      statementStatus: "",
    });

    // Then try to sync with backend
    try {
      await axios.post(
        `http://localhost:8000/api/customer/${apiAction}`,
        apiPayload,
        {
          withCredentials: true
        }
      );
      
      toast({
        title: selectedRowId ? "Record updated" : "Record added",
        description: selectedRowId ? "The record has been successfully updated" : "The new record has been successfully added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error saving data:", err);
      
      toast({
        title: "Warning",
        description: "Changes saved locally but failed to sync with server",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const navigate = useHistory();
  const handleViewAllClick = () => navigate.push("/admin/tables");

  const handleSearch = () => {
    if (country === "All") {
      // Search in all columns
      const filteredData = tableData.filter((row) =>
        Object.values(row).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredData(filteredData);
    } else {
      // Search in specific column
      const filteredData = tableData.filter((row) => {
        const columnKey = Object.keys(row).find(key => 
          key.toLowerCase() === country.toLowerCase().replace(/\s+/g, '') ||
          key.toLowerCase() === country.toLowerCase().replace(/\s+/g, '').replace("no", "number")
        );
        
        if (!columnKey) return false;
        
        return row[columnKey] && 
               row[columnKey].toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredData(filteredData);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setCountry("All");
    setFilteredData(tableData);
  };

  const refreshData = () => {
    setIsDataUpdated(true);
  };

  return (
    <Box mt={16}>
      <Flex direction="column" bg="white" p={6} boxShadow="md" borderRadius="15px" width="100%">
        <Flex justify="space-between" mb={8}>
          <Flex direction="column">
            <Text fontSize="xl" fontWeight="bold">Customer Orders</Text>
            <Text fontSize="md" color="gray.400">Manage Customer Orders</Text>
          </Flex>
          <Flex direction="row" gap={2}>
            <Button size="sm" onClick={handleViewAllClick} mr={2}>View All</Button>
            <Button size="sm" colorScheme="blue" onClick={refreshData} mr={2}>
              Refresh
            </Button>
            <Button size="sm" colorScheme="green" leftIcon={<UserPlusIcon />} onClick={handleAddRow}>
              Add Row
            </Button>
          </Flex>
        </Flex>

        <Flex justify="space-between" align="center" mb={4}>
          <Tabs defaultIndex={0} className="w-full md:w-max" isLazy>
            <TabList>
              {TABS.map(({ label, value }) => (
                <Tab key={value} value={value}>{label}</Tab>
              ))}
            </TabList>
          </Tabs>
          <Flex>
            <Select value={country} onChange={e => setCountry(e.target.value)} placeholder="" width={40} mr={4}>
              <option value="All">All</option>
              <option value="Customer Number">Customer Number</option>
              <option value="Customer">Customer</option>
              <option value="Buyer">Buyer</option>
              <option value="Platform No">Platform No</option>
              <option value="PO No">PO No</option>
              <option value="Purchase Date">Purchase Date</option>
              <option value="Order Amount">Order Amount</option>
              <option value="Currency">Currency</option>
              <option value="Purchasing Department">Purchasing Department</option>
              <option value="Purchaser">Purchaser</option>
              <option value="Requisition Business Group">Requisition Business Group</option>
              <option value="Delivery Status">Delivery Status</option>
              <option value="Order Status">Order Status</option>
              <option value="Acceptance Status">Acceptance Status</option>
              <option value="Statement Status">Statement Status</option>
            </Select>
            <FormControl width="half" mr={4}>
              <FormLabel
                position="absolute"
                top={isFocused || searchTerm ? "-16px" : "12px"}
                left="40px"
                color="gray.500"
                fontSize={isFocused || searchTerm ? "xs" : "sm"}
                transition="all 0.2s ease"
                pointerEvents="none"
                opacity={isFocused || searchTerm ? 0 : 1}
              >
                Search here
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MagnifyingGlassIcon style={{ height: "25px", width: "20px", padding: "2.5px" }} />
                </InputLeftElement>
                <Input
                  ref={searchInputRef}
                  size="md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  borderColor={isFocused ? "green.500" : "gray.300"}
                  _focus={{
                    borderColor: "green.500",
                    boxShadow: "0 0 0 1px green.500",
                  }}
                />
              </InputGroup>
            </FormControl>
            <Button colorScheme="blue" mr={4} onClick={handleSearch}>Search</Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </Flex>
        </Flex>

        {/* Wrapping Table inside Box to enable horizontal scrolling */}
        <Box overflowX="auto">
          <Table variant="simple" borderRadius="10px" overflow="hidden">
            <Thead bg="gray.100" height="60px">
              <Tr>
                <Th color="gray.400">Customer Number</Th>
                <Th color="gray.400">Customer</Th>
                <Th color="gray.400">Buyer</Th>
                <Th color="gray.400">Platform No</Th>
                <Th color="gray.400">PO No</Th>
                <Th color="gray.400">Purchase Date</Th>
                <Th color="gray.400">Order Amount</Th>
                <Th color="gray.400">Currency</Th>
                <Th color="gray.400">Purchasing Department</Th>
                <Th color="gray.400">Purchaser</Th>
                <Th color="gray.400">Requisition Business Group</Th>
                <Th color="gray.400">Delivery Status</Th>
                <Th color="gray.400">Order Status</Th>
                <Th color="gray.400">Acceptance Status</Th>
                <Th color="gray.400">Statement Status</Th>
                <Th color="gray.400">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.customerNumber}</Td>
                  <Td>{row.customer}</Td>
                  <Td>{row.buyer}</Td>
                  <Td>{row.platformNo}</Td>
                  <Td>{row.poNo}</Td>
                  <Td>{row.purchaseDate}</Td>
                  <Td>{row.orderAmount}</Td>
                  <Td>{row.currency}</Td>
                  <Td>{row.purchasingDepartment}</Td>
                  <Td>{row.purchaser}</Td>
                  <Td>{row.requisitionBusinessGroup}</Td>
                  <Td>{row.deliveryStatus}</Td>
                  <Td>{row.orderStatus}</Td>
                  <Td>{row.acceptanceStatus}</Td>
                  <Td>{row.statementStatus}</Td>
                  <Td>
                    <Flex>
                      <Tooltip label="Edit">
                        <IconButton
                          variant="outline"
                          aria-label="Edit"
                          icon={<PencilIcon style={{ height: "16px", width: "16px" }} />}
                          size="xs"
                          onClick={() => handleEditRow(row.id)}
                          mr={2}
                        />
                      </Tooltip>
                      <Tooltip label="Delete">
                        <IconButton
                          variant="outline"
                          colorScheme="red"
                          aria-label="Delete"
                          icon={<TrashIcon style={{ height: "16px", width: "16px" }} />}
                          size="xs"
                          onClick={() => handleDeleteRow(row.id)}
                        />
                      </Tooltip>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {filteredData.length === 0 && (
          <Flex justify="center" align="center" my={8}>
            <Text color="gray.500">No records found</Text>
          </Flex>
        )}

        <Flex justify="space-between" align="center" mt={4}>
          <Text fontSize="sm">Page {currentPage} of 1</Text>
          <Flex>
            <Button size="sm" variant="outline" mr={2} isDisabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</Button>
            <Button size="sm" variant="outline" isDisabled>Next</Button>
          </Flex>
        </Flex>
      </Flex>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedRowId ? "Edit Row" : "Add New Row"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexWrap="wrap" gap={4}>
              <FormControl width="45%">
                <FormLabel>Customer Number</FormLabel>
                <Input
                  value={newRow.customerNumber}
                  onChange={(e) => setNewRow({ ...newRow, customerNumber: e.target.value })}
                />
              </FormControl>
              <FormControl width="45%">
                <FormLabel>Customer</FormLabel>
                <Input
                  value={newRow.customer}
                  onChange={(e) => setNewRow({ ...newRow, customer: e.target.value })}
                />
              </FormControl>
              <FormControl width="45%">
                <FormLabel>Buyer</FormLabel>
                <Input
                  value={newRow.buyer}
                  onChange={(e) => setNewRow({ ...newRow, buyer: e.target.value })}
                />
              </FormControl>
              <FormControl width="45%">
                <FormLabel>Platform No</FormLabel>
                <Input
                  value={newRow.platformNo}
                  onChange={(e) => setNewRow({ ...newRow, platformNo: e.target.value })}
                />
              </FormControl>
              <FormControl width="45%">
                <FormLabel>PO No</FormLabel>
                <Input
                  value={newRow.poNo}
                  onChange={(e) => setNewRow({ ...newRow, poNo: e.target.value })}
                />
              </FormControl>
              <FormControl width="45%">
                <FormLabel>Purchase Date</FormLabel>
                <Input
                  type="date"
                  value={newRow.purchaseDate}
                  onChange={(e) => setNewRow({ ...newRow, purchaseDate: e.target.value })}
                />
              </FormControl>
              <FormControl width="45%">
                <FormLabel>Order Amount</FormLabel>
                <Input
                  value={newRow.orderAmount}
                  onChange={(e) => setNewRow({ ...newRow, orderAmount: e.target.value })}
                />
              </FormControl>
              <FormControl width="45%">
                <FormLabel>Currency</FormLabel>
                <Select
                  value={newRow.currency}
                  onChange={(e) => setNewRow({ ...newRow, currency: e.target.value })}
                  placeholder="Select currency"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="AUD">AUD</option>
                  <option value="CAD">CAD</option>
                </Select>
              </FormControl>
              <FormControl width="45%">
                <FormLabel>Purchasing Department</FormLabel>
                <Input
                  value={newRow.purchasingDepartment}
                  onChange={(e) => setNewRow({ ...newRow, purchasingDepartment: e.target.value })}
                />
              </FormControl>
              <FormControl width="45%">
                <FormLabel>Purchaser</FormLabel>
                <Input
                  value={newRow.purchaser}
                  onChange={(e) => setNewRow({ ...newRow, purchaser: e.target.value })}
                />
              </FormControl>
              <FormControl width="45%">
                <FormLabel>Requisition Business Group</FormLabel>
                <Input
                  value={newRow.requisitionBusinessGroup}
                  onChange={(e) => setNewRow({ ...newRow, requisitionBusinessGroup: e.target.value })}
                />
              </FormControl>
              <FormControl width="45%">
                <FormLabel>Delivery Status</FormLabel>
                <Select
                  value={newRow.deliveryStatus}
                  onChange={(e) => setNewRow({ ...newRow, deliveryStatus: e.target.value })}
                  placeholder="Select status"
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </Select>
              </FormControl>
              <FormControl width="45%">
                <FormLabel>Order Status</FormLabel>
                <Select
                  value={newRow.orderStatus}
                  onChange={(e) => setNewRow({ ...newRow, orderStatus: e.target.value })}
                  placeholder="Select status"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </Select>
              </FormControl>
              <FormControl width="45%">
                <FormLabel>Acceptance Status</FormLabel>
                <Select
                  value={newRow.acceptanceStatus}
                  onChange={(e) => setNewRow({ ...newRow, acceptanceStatus: e.target.value })}
                  placeholder="Select status"
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </Select>
              </FormControl>
              <FormControl width="45%">
                <FormLabel>Statement Status</FormLabel>
                <Select
                  value={newRow.statementStatus}
                  onChange={(e) => setNewRow({ ...newRow, statementStatus: e.target.value })}
                  placeholder="Select status"
                >
                  <option value="Pending">Pending</option>
                  <option value="Generated">Generated</option>
                  <option value="Sent">Sent</option>
                </Select>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveRow}>
              {selectedRowId ? "Update" : "Add"}
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Alert */}
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

export default CustomerOrder;