import React, { useState, useRef, useEffect } from "react";

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

const SupplierInfo = () => {
  const [tableData, setTableData] = useState([
    {
      id: 1,
      supplierNumber: "123",
      supplier: "John Doe",
      buyer: "Jane Doe",
      secondOrderClassification: "A",
      status: "Active",
      documentStatus: "Pending",
      abnormalInfo: "None",
      invitee: "Jack",
      reAuthPerson: "Jim",
      contactInfo: "123-456-7890",
      invitationDate: "2023-04-18",
    },
    {
      id: 2,
      supplierNumber: "124",
      supplier: "Alice Smith",
      buyer: "Bob Brown",
      secondOrderClassification: "B",
      status: "Inactive",
      documentStatus: "Completed",
      abnormalInfo: "Delayed",
      invitee: "Charlie",
      reAuthPerson: "Dave",
      contactInfo: "987-654-3210",
      invitationDate: "2023-04-19",
    },
  ]);

  const [filteredData, setFilteredData] = useState(tableData);
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const user = JSON.parse(localStorage.getItem("user")) ? JSON.parse(localStorage.getItem("user")) : JSON.parse(sessionStorage.getItem("user"))
  const [newRow, setNewRow] = useState({
    supplierNumber: "",
    supplier: "",
    buyer: "",
    secondOrderClassification: "",
    status: "",
    documentStatus: "",
    abnormalInfo: "",
    invitee: "",
    reAuthPerson: "",
    contactInfo: "",
    invitationDate: "",
  });
  const [selectedRowId, setSelectedRowId] = useState(null);

  const searchInputRef = useRef(null);
  const cancelRef = useRef();
  const [isFocused, setIsFocused] = useState(false);
  const toast = useToast();
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("http://localhost:8000/api/suppliers/get-data",{"email":user.email}, {
          withCredentials: true,
        });
  
        setTableData(response.data.data);
        setFilteredData(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error fetching data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchData()
  
    if (searchInputRef.current) {
      setIsFocused(searchInputRef.current === document.activeElement);
    }
    
  }, [searchTerm]);

  const handleAddRow = () => {
    setIsModalOpen(true);
    setSelectedRowId(null);
    setNewRow({
      supplierNumber: "",
      supplier: "",
      buyer: "",
      secondOrderClassification: "",
      status: "",
      documentStatus: "",
      abnormalInfo: "",
      invitee: "",
      reAuthPerson: "",
      contactInfo: "",
      invitationDate: "",
    });
  };

  const handleEditRow = (rowId) => {
    const selectedRow = tableData.find((row) => row.id === rowId);
    if (selectedRow) {
      setNewRow({
        supplierNumber: selectedRow.supplierNumber || selectedRow.customerNumber,
        supplier: selectedRow.supplier || selectedRow.Customer,
        buyer: selectedRow.buyer,
        secondOrderClassification: selectedRow.secondOrderClassification || selectedRow.SecondOrderClassification,
        status: selectedRow.status || selectedRow.Status,
        documentStatus: selectedRow.documentStatus || selectedRow.DocumentStatus,
        abnormalInfo: selectedRow.abnormalInfo || selectedRow.AbnormalInfo,
        invitee: selectedRow.invitee || selectedRow.Invite,
        reAuthPerson: selectedRow.reAuthPerson || selectedRow.ReAuthPerson,
        contactInfo: selectedRow.contactInfo || selectedRow.ContactInfo,
        invitationDate: selectedRow.invitationDate || selectedRow.InvitationDate,
      });
      setSelectedRowId(rowId);
      setIsModalOpen(true);
    }
  };

  const handleDeleteRow = (rowId) => {
    setRowToDelete(rowId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // We're not actually changing the backend API calls, just updating the UI
      // In a real implementation, we would make an API call here
      
      const updatedTableData = tableData.filter((row) => row.id !== rowToDelete);
      setTableData(updatedTableData);
      setFilteredData(updatedTableData.filter((row) => filterRow(row)));
      
      toast({
        title: "Row deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting row:", error);
      toast({
        title: "Error deleting row",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setRowToDelete(null);
    }
  };

  const handleSaveRow = async() => {
    try {
      if (selectedRowId) {
        const updatedTableData = tableData.map((row) =>
          row.id === selectedRowId ? { 
            ...row, 
            supplierNumber: newRow.supplierNumber,
            supplier: newRow.supplier,
            Customer: newRow.supplier, // Keep both for backward compatibility
            customerNumber: newRow.supplierNumber, // Keep both for backward compatibility
            buyer: newRow.buyer,
            secondOrderClassification: newRow.secondOrderClassification,
            SecondOrderClassification: newRow.secondOrderClassification,
            status: newRow.status,
            Status: newRow.status,
            documentStatus: newRow.documentStatus,
            DocumentStatus: newRow.documentStatus,
            abnormalInfo: newRow.abnormalInfo,
            AbnormalInfo: newRow.abnormalInfo,
            invitee: newRow.invitee,
            Invite: newRow.invitee,
            reAuthPerson: newRow.reAuthPerson,
            ReAuthPerson: newRow.reAuthPerson,
            contactInfo: newRow.contactInfo,
            ContactInfo: newRow.contactInfo,
            invitationDate: newRow.invitationDate,
            InvitationDate: newRow.invitationDate
          } : row
        );
        setTableData(updatedTableData);
        setFilteredData(updatedTableData.filter((row) => filterRow(row)));
        
        toast({
          title: "Row updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        const updatedRow = { 
          ...newRow, 
          id: tableData.length + 1,
          Customer: newRow.supplier, // Keep both for backward compatibility
          customerNumber: newRow.supplierNumber, // Keep both for backward compatibility
          SecondOrderClassification: newRow.secondOrderClassification,
          Status: newRow.status,
          DocumentStatus: newRow.documentStatus,
          AbnormalInfo: newRow.abnormalInfo,
          Invite: newRow.invitee,
          ReAuthPerson: newRow.reAuthPerson,
          ContactInfo: newRow.contactInfo,
          InvitationDate: newRow.invitationDate
        };
        
        const newTableData = [...tableData, updatedRow];
        setTableData(newTableData);
        setFilteredData(newTableData.filter((row) => filterRow(row)));
        
        toast({
          title: "Row added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Send to backend without changing the API structure
        await axios.post("http://localhost:8000/api/supplier/add-material", [
          {
            customerNumber: newRow.supplierNumber,
            customer: newRow.supplier,
            buyer: newRow.buyer,
            secondOrderClassification: newRow.secondOrderClassification,
            status: newRow.status,
            documentStatus: newRow.documentStatus,
            abnormalInfo: newRow.abnormalInfo,
            invitee: newRow.invitee,
            reAuthPerson: newRow.reAuthPerson,
            contactInfo: newRow.contactInfo,
            invitationDate: newRow.invitationDate,
          },
          {"user": user.email}
        ], {
          withCredentials: true
        });
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Error saving row",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsModalOpen(false);
      setNewRow({
        supplierNumber: "",
        supplier: "",
        buyer: "",
        secondOrderClassification: "",
        status: "",
        documentStatus: "",
        abnormalInfo: "",
        invitee: "",
        reAuthPerson: "",
        contactInfo: "",
        invitationDate: "",
      });
      setSelectedRowId(null);
    }
  };

  const navigate = useHistory();
  const handleViewAllClick = () => navigate.push("/admin/tables");

  const filterRow = (row) => {
    if (searchTerm === "") return true;
    
    if (country === "All") {
      // Search in all columns
      return (
        (row.supplierNumber || row.customerNumber || "").toString().includes(searchTerm) ||
        (row.supplier || row.Customer || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.buyer || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.secondOrderClassification || row.SecondOrderClassification || "").toString().includes(searchTerm) ||
        (row.status || row.Status || "").includes(searchTerm) ||
        (row.documentStatus || row.DocumentStatus || "").includes(searchTerm) ||
        (row.abnormalInfo || row.AbnormalInfo || "").includes(searchTerm) ||
        (row.invitee || row.Invite || "").includes(searchTerm) ||
        (row.reAuthPerson || row.ReAuthPerson || "").includes(searchTerm) ||
        (row.contactInfo || row.ContactInfo || "").includes(searchTerm) ||
        (row.invitationDate || row.InvitationDate || "").includes(searchTerm)
      );
    } else {
      // Search in specific column
      switch (country) {
        case "Supplier Number":
          return (row.supplierNumber || row.customerNumber || "").toString().includes(searchTerm);
        case "Supplier":
          return (row.supplier || row.Customer || "").toLowerCase().includes(searchTerm.toLowerCase());
        case "Buyer":
          return (row.buyer || "").toLowerCase().includes(searchTerm.toLowerCase());
        case "Second-order Classification":
          return (row.secondOrderClassification || row.SecondOrderClassification || "").toString().includes(searchTerm);
        case "Status":
          return (row.status || row.Status || "").includes(searchTerm);
        case "Document Status":
          return (row.documentStatus || row.DocumentStatus || "").includes(searchTerm);
        case "Abnormal Info":
          return (row.abnormalInfo || row.AbnormalInfo || "").includes(searchTerm);
        case "Invitee":
          return (row.invitee || row.Invite || "").includes(searchTerm);
        case "Re-auth Person":
          return (row.reAuthPerson || row.ReAuthPerson || "").includes(searchTerm);
        case "Contact Info":
          return (row.contactInfo || row.ContactInfo || "").includes(searchTerm);
        case "Invitation Date":
          return (row.invitationDate || row.InvitationDate || "").includes(searchTerm);
        default:
          return true;
      }
    }
  };

  const handleSearch = () => {
    const filtered = tableData.filter(filterRow);
    setFilteredData(filtered);
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
            <Text fontSize="xl" fontWeight="bold">Supplier Information</Text>
            <Text fontSize="md" color="gray.400">Manage Supplier Information</Text>
          </Flex>
          <Flex direction="row" gap={2}>
            <Button size="sm" onClick={handleViewAllClick} mr={2}>View All</Button>
            <Button size="sm" colorScheme="blue" leftIcon={<UserPlusIcon />} onClick={handleAddRow}>
              Add Row
            </Button>
          </Flex>
        </Flex>

        <Flex justify="space-between" align="center" mb={4} flexDirection={{ base: "column", md: "row" }} gap={4}>
          <Tabs defaultIndex={0} className="w-full md:w-max" isLazy>
            <TabList>
              {TABS.map(({ label, value }) => (
                <Tab key={value} value={value}>{label}</Tab>
              ))}
            </TabList>
          </Tabs>
          <Flex flexWrap="wrap" gap={2}>
            <Select value={country} onChange={e => setCountry(e.target.value)} placeholder="" width={{ base: "full", md: "40" }}>
              <option value="All">All</option>
              <option value="Supplier Number">Supplier Number</option>
              <option value="Supplier">Supplier</option>
              <option value="Buyer">Buyer</option>
              <option value="Second-order Classification">Second-order Classification</option>
              <option value="Status">Status</option>
              <option value="Document Status">Document Status</option>
              <option value="Abnormal Info">Abnormal Info</option>
              <option value="Invitee">Invitee</option>
              <option value="Re-auth Person">Re-auth Person</option>
              <option value="Contact Info">Contact Info</option>
              <option value="Invitation Date">Invitation Date</option>
            </Select>
            <FormControl width={{ base: "full", md: "64" }}>
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
            <Button colorScheme="blue" onClick={handleSearch}>Search</Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </Flex>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" borderRadius="10px" overflow="hidden">
            <Thead bg="gray.100" height="60px">
              <Tr>
                <Th color="gray.400">Supplier Number</Th>
                <Th color="gray.400">Supplier</Th>
                <Th color="gray.400">Buyer</Th>
                <Th color="gray.400">Second-order Classification</Th>
                <Th color="gray.400">Status</Th>
                <Th color="gray.400">Document Status</Th>
                <Th color="gray.400">Abnormal Info</Th>
                <Th color="gray.400">Invitee</Th>
                <Th color="gray.400">Re-auth Person</Th>
                <Th color="gray.400">Contact Info</Th>
                <Th color="gray.400">Invitation Date</Th>
                <Th color="gray.400">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.supplierNumber || row.customerNumber}</Td>
                  <Td>{row.supplier || row.Customer}</Td>
                  <Td>{row.buyer}</Td>
                  <Td>{row.secondOrderClassification || row.SecondOrderClassification}</Td>
                  <Td>{row.status || row.Status}</Td>
                  <Td>{row.documentStatus || row.DocumentStatus}</Td>
                  <Td>{row.abnormalInfo || row.AbnormalInfo}</Td>
                  <Td>{row.invitee || row.Invite}</Td>
                  <Td>{row.reAuthPerson || row.ReAuthPerson}</Td>
                  <Td>{row.contactInfo || row.ContactInfo}</Td>
                  <Td>{row.invitationDate || row.InvitationDate}</Td>
                  <Td>
                    <Flex gap={2}>
                      <Tooltip label="Edit">
                        <IconButton
                          variant="outline"
                          aria-label="Edit"
                          icon={<PencilIcon />}
                          size="xs"
                          onClick={() => handleEditRow(row.id)}
                        />
                      </Tooltip>
                      <Tooltip label="Delete">
                        <IconButton
                          variant="outline"
                          colorScheme="red"
                          aria-label="Delete"
                          icon={<TrashIcon />}
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
          <ModalHeader>{selectedRowId ? "Edit Supplier" : "Add New Supplier"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl width="100%" mt={4}>
              <FormLabel>Supplier Number</FormLabel>
              <Input
                value={newRow.supplierNumber}
                onChange={(e) => setNewRow({ ...newRow, supplierNumber: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Supplier</FormLabel>
              <Input
                value={newRow.supplier}
                onChange={(e) => setNewRow({ ...newRow, supplier: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Buyer</FormLabel>
              <Input
                value={newRow.buyer}
                onChange={(e) => setNewRow({ ...newRow, buyer: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Second-order Classification</FormLabel>
              <Input
                value={newRow.secondOrderClassification}
                onChange={(e) => setNewRow({ ...newRow, secondOrderClassification: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Status</FormLabel>
              <Input
                value={newRow.status}
                onChange={(e) => setNewRow({ ...newRow, status: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Document Status</FormLabel>
              <Input
                value={newRow.documentStatus}
                onChange={(e) => setNewRow({ ...newRow, documentStatus: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Abnormal Info</FormLabel>
              <Input
                value={newRow.abnormalInfo}
                onChange={(e) => setNewRow({ ...newRow, abnormalInfo: e.target.value })}
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
              <FormLabel>Re-auth Person</FormLabel>
              <Input
                value={newRow.reAuthPerson}
                onChange={(e) => setNewRow({ ...newRow, reAuthPerson: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Contact Info</FormLabel>
              <Input
                value={newRow.contactInfo}
                onChange={(e) => setNewRow({ ...newRow, contactInfo: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Invitation Date</FormLabel>
              <Input
                type="date"
                value={newRow.invitationDate}
                onChange={(e) => setNewRow({ ...newRow, invitationDate: e.target.value })}
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
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Supplier
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this supplier? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
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

export default SupplierInfo;