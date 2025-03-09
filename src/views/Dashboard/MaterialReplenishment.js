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
} from "@chakra-ui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { useHistory } from "react-router-dom";

const TABS = [
  { label: "All", value: "all" },
  { label: "Monitored", value: "monitored" },
  { label: "Unmonitored", value: "unmonitored" },
];

const MaterialReplenishment = () => {
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

  const [filteredData, setFilteredData] = useState(tableData); // New state for filtered data
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  useEffect(() => {
    if (searchInputRef.current) {
      setIsFocused(searchInputRef.current === document.activeElement);
    }
  }, [searchTerm]);

  const handleAddRow = () => {
    setIsModalOpen(true);
    setSelectedRowId(null);
  };

  const handleEditRow = (rowId) => {
    const selectedRow = tableData.find((row) => row.id === rowId);
    if (selectedRow) {
      setNewRow(selectedRow);
      setSelectedRowId(rowId);
      setIsModalOpen(true);
    }
  };

  const handleSaveRow = () => {
    if (selectedRowId) {
      const updatedTableData = tableData.map((row) =>
        row.id === selectedRowId ? { ...row, ...newRow } : row
      );
      setTableData(updatedTableData);
      setFilteredData(updatedTableData); // Update filteredData as well
      setSelectedRowId(null);
    } else {
      const updatedRow = { ...newRow, id: tableData.length + 1 };
      setTableData([...tableData, updatedRow]);
      setFilteredData([...filteredData, updatedRow]); // Update filteredData as well
    }
    setIsModalOpen(false);
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

  const navigate = useHistory();
  const handleViewAllClick = () => navigate.push("/admin/tables");

  const handleSearch = () => {
    if (country === "All") {
      // Search in all columns
      const filteredData = tableData.filter((row) =>
        row.orderNumber.includes(searchTerm) ||
        row.materialCategory.includes(searchTerm) ||
        row.vendor.includes(searchTerm) ||
        row.invitee.includes(searchTerm) ||
        row.hostInviterContactInfo.includes(searchTerm) ||
        row.sender.includes(searchTerm) ||
        row.status.includes(searchTerm) ||
        row.supplementTemplate.includes(searchTerm) ||
        row.createTime.includes(searchTerm) ||
        row.updateTime.includes(searchTerm)
      );
      setFilteredData(filteredData);
    } else {
      // Search in specific column
      const filteredData = tableData.filter((row) => {
        switch (country) {
          case "Order Number":
            return row.orderNumber.includes(searchTerm);
          case "Material Category":
            return row.materialCategory.includes(searchTerm);
          case "Vendor":
            return row.vendor.includes(searchTerm);
          case "Invitee":
            return row.invitee.includes(searchTerm);
          case "Host/Inviter Contact Information":
            return row.hostInviterContactInfo.includes(searchTerm);
          case "Sender":
            return row.sender.includes(searchTerm);
          case "Status":
            return row.status.includes(searchTerm);
          case "Supplement Template":
            return row.supplementTemplate.includes(searchTerm);
          case "Create Time":
            return row.createTime.includes(searchTerm);
          case "Update Time":
            return row.updateTime.includes(searchTerm);
          default:
            return true;
        }
      });
      setFilteredData(filteredData);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setCountry("All");
    setFilteredData(tableData); // Reset to original data
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
                opacity={isFocused || searchTerm ? 0 : 1} // Set opacity to 0 when focused or has value
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
                  <Td>{row.orderNumber}</Td>
                  <Td>{row.materialCategory}</Td>
                  <Td>{row.vendor}</Td>
                  <Td>{row.invitee}</Td>
                  <Td>{row.hostInviterContactInfo}</Td>
                  <Td>{row.sender}</Td>
                  <Td>{row.status}</Td>
                  <Td>{row.supplementTemplate}</Td>
                  <Td>{row.createTime}</Td>
                  <Td>{row.updateTime}</Td>
                  <Td>
                    <Tooltip label="Edit">
                      <IconButton
                        variant="outline"
                        aria-label="Edit"
                        icon={<PencilIcon />}
                        size="xs"
                        onClick={() => handleEditRow(row.id)}
                      />
                    </Tooltip>
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
              <Input
                value={newRow.status}
                onChange={(e) => setNewRow({ ...newRow, status: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Supplement Template</FormLabel>
              <Input
                value={newRow.supplementTemplate}
                onChange={(e) => setNewRow({ ...newRow, supplementTemplate: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Create Time</FormLabel>
              <Input
                type="datetime-local"
                value={newRow.createTime}
                onChange={(e) => setNewRow({ ...newRow, createTime: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Update Time</FormLabel>
              <Input
                type="datetime-local"
                value={newRow.updateTime}
                onChange={(e) => setNewRow({ ...newRow, updateTime: e.target.value })}
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
    </Box>
  );
};

export default MaterialReplenishment;