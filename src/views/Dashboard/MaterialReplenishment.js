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
  HStack,
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

const MaterialReplenishment = () => {
  const user = JSON.parse(localStorage.getItem("user")) ? JSON.parse(localStorage.getItem("user")) : JSON.parse(sessionStorage.getItem("user"));
  const toast = useToast();
  const [tableData, setTableData] = useState([
    {
      id: 1,
      orderNumber: "123",
      materialCategory: "Category A",
      vendor: "Vendor X",
      invitee: "John Doe",
      hostInviterContactInfo: "123-456-7890",
      sender: "Alice",
      status: "Active",
      supplementTemplate: "Template 1",
      createTime: "2023-04-18",
      updateTime: "2023-04-18",
    },
    {
      id: 2,
      orderNumber: "124",
      materialCategory: "Category B",
      vendor: "Vendor Y",
      invitee: "Jane Smith",
      hostInviterContactInfo: "987-654-3210",
      sender: "Bob",
      status: "Inactive",
      supplementTemplate: "Template 2",
      createTime: "2023-04-19",
      updateTime: "2023-04-19",
    },
  ]);

  const [filteredData, setFilteredData] = useState(tableData);
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [newRow, setNewRow] = useState({
    orderNumber: "",
    materialCategory: "",
    vendor: "",
    invitee: "",
    hostInviterContactInfo: "",
    sender: "",
    status: "",
    supplementTemplate: "",
    createTime: "",
    updateTime: "",
  });
  const [selectedRowId, setSelectedRowId] = useState(null);

  const searchInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const cancelRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("http://localhost:8000/api/material-replenishment/get-data", {"email": user.email}, {
          withCredentials: true,
        });

        setTableData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error fetching data",
          description: "There was an error loading the material replenishment data.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchData();

    if (searchInputRef.current) {
      setIsFocused(searchInputRef.current === document.activeElement);
    }
  }, []);

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
      status: "",
      supplementTemplate: "",
      createTime: "",
      updateTime: "",
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
      // Optimistically update UI first
      const updatedTableData = tableData.filter((row) => row.id !== rowToDelete);
      setTableData(updatedTableData);
      setFilteredData(filteredData.filter((row) => row.id !== rowToDelete));
      
      // Then attempt to sync with backend
      await axios.post(
        "http://localhost:8000/api/material-replenishment/delete-data", 
        { id: rowToDelete, email: user.email }, 
        { withCredentials: true }
      );
      
      toast({
        title: "Row deleted",
        description: "The row has been successfully deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting row:", error);
      toast({
        title: "Error",
        description: "Failed to delete the row. UI has been updated but the backend might not be in sync.",
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
    const currentDateTime = new Date().toISOString().slice(0, -8);
    const updatedRow = { 
      ...newRow, 
      updateTime: currentDateTime
    };
    
    if (!selectedRowId) {
      updatedRow.createTime = currentDateTime;
      updatedRow.id = tableData.length > 0 ? Math.max(...tableData.map(row => row.id)) + 1 : 1;
    }

    try {
      // Optimistically update UI first
      if (selectedRowId) {
        // Update existing row
        const updatedTableData = tableData.map((row) =>
          row.id === selectedRowId ? updatedRow : row
        );
        setTableData(updatedTableData);
        setFilteredData(
          filteredData.map((row) => (row.id === selectedRowId ? updatedRow : row))
        );
      } else {
        // Add new row
        setTableData([...tableData, updatedRow]);
        setFilteredData([...filteredData, updatedRow]);
      }

      // Then attempt to sync with backend
      await axios.post(
        "http://localhost:8000/api/material-replenishment/add-data",
        [updatedRow, { user: user.email }],
        { withCredentials: true }
      );

      toast({
        title: selectedRowId ? "Row updated" : "Row added",
        description: selectedRowId 
          ? "The row has been successfully updated" 
          : "A new row has been successfully added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving row:", error);
      toast({
        title: "Error",
        description: "Failed to sync changes with the backend. UI has been updated but the backend might not be in sync.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsModalOpen(false);
      setSelectedRowId(null);
      setNewRow({
        orderNumber: "",
        materialCategory: "",
        vendor: "",
        invitee: "",
        hostInviterContactInfo: "",
        sender: "",
        status: "",
        supplementTemplate: "",
        createTime: "",
        updateTime: "",
      });
    }
  };

  const navigate = useHistory();
  const handleViewAllClick = () => navigate.push("/admin/tables");

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setFilteredData(tableData);
      return;
    }
    
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    
    if (country === "All") {
      // Search in all columns
      const filteredData = tableData.filter((row) =>
        Object.values(row).some(
          value => 
            value && 
            typeof value === 'string' && 
            value.toLowerCase().includes(lowercasedSearchTerm)
        )
      );
      setFilteredData(filteredData);
    } else {
      // Search in specific column
      const columnMapping = {
        "Order Number": "orderNumber",
        "Material Category": "materialCategory",
        "Vendor": "vendor",
        "Invitee": "invitee",
        "Host/Inviter Contact Information": "hostInviterContactInfo",
        "Sender": "sender",
        "Status": "status",
        "Supplement Template": "supplementTemplate",
        "Create Time": "createTime",
        "Update Time": "updateTime"
      };
      
      const columnKey = columnMapping[country];
      if (columnKey) {
        const filteredData = tableData.filter(
          row => 
            row[columnKey] && 
            row[columnKey].toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredData(filteredData);
      }
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setCountry("All");
    setFilteredData(tableData);
  };

  return (
    <Box mt={16}>
      <Flex direction="column" bg="white" p={6} boxShadow="md" borderRadius="15px" width="100%">
        <Flex justify="space-between" mb={8}>
          <Flex direction="column">
            <Text fontSize="xl" fontWeight="bold">Material Replenishment</Text>
            <Text fontSize="md" color="gray.400">Manage Material Replenishment</Text>
          </Flex>
          <Flex direction="row" gap={2}>
            <Button size="sm" onClick={handleViewAllClick} mr={2}>View All</Button>
            <Button size="sm" colorScheme="blue" leftIcon={<UserPlusIcon />} onClick={handleAddRow}>
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
              <option value="Order Number">Order Number</option>
              <option value="Material Category">Material Category</option>
              <option value="Vendor">Vendor</option>
              <option value="Invitee">Invitee</option>
              <option value="Host/Inviter Contact Information">Host/Inviter Contact Information</option>
              <option value="Sender">Sender</option>
              <option value="Status">Status</option>
              <option value="Supplement Template">Supplement Template</option>
              <option value="Create Time">Create Time</option>
              <option value="Update Time">Update Time</option>
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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </InputGroup>
            </FormControl>
            <Button colorScheme="blue" mr={4} onClick={handleSearch}>Search</Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </Flex>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" borderRadius="10px" overflow="hidden">
            <Thead bg="gray.100" height="60px">
              <Tr>
                <Th color="gray.400">#</Th>
                <Th color="gray.400">Order Number</Th>
                <Th color="gray.400">Material Category</Th>
                <Th color="gray.400">Vendor</Th>
                <Th color="gray.400">Invitee</Th>
                <Th color="gray.400">Host/Inviter Contact Information</Th>
                <Th color="gray.400">Sender</Th>
                <Th color="gray.400">Status</Th>
                <Th color="gray.400">Supplement Template</Th>
                <Th color="gray.400">Create Time</Th>
                <Th color="gray.400">Update Time</Th>
                <Th color="gray.400">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.id}</Td>
                  <Td>{row.OrderNumber || row.orderNumber}</Td>
                  <Td>{row.MaterialCategory || row.materialCategory}</Td>
                  <Td>{row.Vendor || row.vendor}</Td>
                  <Td>{row.Invitee || row.invitee}</Td>
                  <Td>{row.Host || row.hostInviterContactInfo}</Td>
                  <Td>{row.Sender || row.sender}</Td>
                  <Td>{row.Status || row.status}</Td>
                  <Td>{row.SupplementTemplate || row.supplementTemplate}</Td>
                  <Td>{row.Created || row.createTime}</Td>
                  <Td>{row.updated || row.updateTime}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="Edit">
                        <IconButton
                          variant="outline"
                          aria-label="Edit"
                          icon={<PencilIcon style={{ height: "16px", width: "16px" }} />}
                          size="xs"
                          onClick={() => handleEditRow(row.id)}
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
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {filteredData.length === 0 && (
          <Flex justify="center" align="center" my={8}>
            <Text color="gray.500">No data found</Text>
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedRowId ? "Edit Row" : "Add New Row"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl width="100%" mt={4}>
              <FormLabel>Order Number</FormLabel>
              <Input
                value={newRow.orderNumber}
                onChange={(e) => setNewRow({ ...newRow, orderNumber: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Material Category</FormLabel>
              <Input
                value={newRow.materialCategory}
                onChange={(e) => setNewRow({ ...newRow, materialCategory: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Vendor</FormLabel>
              <Input
                value={newRow.vendor}
                onChange={(e) => setNewRow({ ...newRow, vendor: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Invitee</FormLabel>
              <Input
                value={newRow.invitee}
                onChange={(e) => setNewRow({ ...newRow, invitee: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Host/Inviter Contact Information</FormLabel>
              <Input
                value={newRow.hostInviterContactInfo}
                onChange={(e) => setNewRow({ ...newRow, hostInviterContactInfo: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Sender</FormLabel>
              <Input
                value={newRow.sender}
                onChange={(e) => setNewRow({ ...newRow, sender: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Status</FormLabel>
              <Select
                value={newRow.status}
                onChange={(e) => setNewRow({ ...newRow, status: e.target.value })}
                placeholder="Select status"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </Select>
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Supplement Template</FormLabel>
              <Input
                value={newRow.supplementTemplate}
                onChange={(e) => setNewRow({ ...newRow, supplementTemplate: e.target.value })}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveRow}>
              {selectedRowId ? "Update" : "Add"}
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
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
              Delete Row
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this row? This action cannot be undone.
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

export default MaterialReplenishment;