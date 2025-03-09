import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "@chakra-ui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useHistory } from "react-router-dom";
import { customerDeliveryNoticeApi } from "./services/customerDeliveryNoticeAPI";

const TABS = [
  { label: "All", value: "all" },
  { label: "Monitored", value: "monitored" },
  { label: "Unmonitored", value: "unmonitored" },
];

const CustomerDeliveryNotice = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (!userData) return;

    setIsLoading(true);
    try {
      let params = {};

      // Handle tab filtering
      if (activeTab === "monitored") {
        params.isMonitored = true;
      } else if (activeTab === "unmonitored") {
        params.isMonitored = false;
      }

      const response = await customerDeliveryNoticeApi.getAll(params);
      setTableData(response);
      setFilteredData(response);
      setTotalPages(Math.ceil(response.length / itemsPerPage));
    } catch (error) {
      toast({
        title: "Error fetching data",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, toast, userData]);

  useEffect(() => {
    if (userData) {
      fetchData();
    }
  }, [fetchData, userData]);

  useEffect(() => {
    if (searchInputRef.current) {
      setIsFocused(searchInputRef.current === document.activeElement);
    }
  }, [searchTerm]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
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

  const handleDeleteRow = async (rowId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await customerDeliveryNoticeApi.delete(rowId);
        toast({
          title: "Record deleted",
          description: "The record has been successfully deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchData();
      } catch (error) {
        toast({
          title: "Error deleting record",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleSaveRow = async () => {
    try {
      if (selectedRowId) {
        await customerDeliveryNoticeApi.update(selectedRowId, newRow);
        toast({
          title: "Record updated",
          description: "The record has been successfully updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await customerDeliveryNoticeApi.create(newRow);
        toast({
          title: "Record added",
          description: "The record has been successfully added.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      setIsModalOpen(false);
      fetchData();
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

  const handleViewAllClick = () => history.push("/admin/tables");

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const searchParams = {
        searchTerm,
        searchField: searchField === "All" ? "" : searchField,
      };

      // Handle tab filtering
      if (activeTab === "monitored") {
        searchParams.isMonitored = true;
      } else if (activeTab === "unmonitored") {
        searchParams.isMonitored = false;
      }

      const response = await customerDeliveryNoticeApi.search(searchParams);
      setFilteredData(response);
      setTotalPages(Math.ceil(response.length / itemsPerPage));
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
    setFilteredData(tableData);
    setTotalPages(Math.ceil(tableData.length / itemsPerPage));
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
            <Button size="sm" onClick={handleViewAllClick} mr={2}>
              View All
            </Button>
            <Button size="sm" colorScheme="blue" leftIcon={<UserPlusIcon />} onClick={handleAddRow}>
              Add Row
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
                    required
                  />
                </FormControl>
                <FormControl width={{ base: "100%", md: "48%" }}>
                  <FormLabel>Material Category</FormLabel>
                  <Input
                    value={newRow.materialCategory}
                    onChange={(e) => setNewRow({ ...newRow, materialCategory: e.target.value })}
                    required
                  />
                </FormControl>
              </Flex>

              <Flex gap={4} flexWrap="wrap">
                <FormControl width={{ base: "100%", md: "48%" }}>
                  <FormLabel>Vendor</FormLabel>
                  <Input
                    value={newRow.vendor}
                    onChange={(e) => setNewRow({ ...newRow, vendor: e.target.value })}
                    required
                  />
                </FormControl>
                <FormControl width={{ base: "100%", md: "48%" }}>
                  <FormLabel>Invitee</FormLabel>
                  <Input
                    value={newRow.invitee}
                    onChange={(e) => setNewRow({ ...newRow, invitee: e.target.value })}
                    required
                  />
                </FormControl>
              </Flex>

              <FormControl>
                <FormLabel>Host/Inviter Contact Information</FormLabel>
                <Input
                  value={newRow.hostInviterContactInfo}
                  onChange={(e) => setNewRow({ ...newRow, hostInviterContactInfo: e.target.value })}
                  required
                />
              </FormControl>

              <Flex gap={4} flexWrap="wrap">
                <FormControl width={{ base: "100%", md: "48%" }}>
                  <FormLabel>Sender</FormLabel>
                  <Input
                    value={newRow.sender}
                    onChange={(e) => setNewRow({ ...newRow, sender: e.target.value })}
                    required
                  />
                </FormControl>
                <FormControl width={{ base: "100%", md: "48%" }}>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={newRow.status}
                    onChange={(e) => setNewRow({ ...newRow, status: e.target.value })}
                    required
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
                    required
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
    </Box>
  );
};

export default CustomerDeliveryNotice;