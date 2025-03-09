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
import axios from "axios";

const TABS = [
  { label: "All", value: "all" },
  { label: "Monitored", value: "monitored" },
  { label: "Unmonitored", value: "unmonitored" },
];

const MaterialInquiry = () => {
  const [tableData, setTableData] = useState([
    {
      id: 1,
      supplierMaterial: "Material A",
      supplementOrderNumber: "SO123",
      status: "Active",
      explanation: "Initial order",
      createTime: "2023-04-18",
      updateTime: "2023-04-18",
    },
    {
      id: 2,
      supplierMaterial: "Material B",
      supplementOrderNumber: "SO124",
      status: "Inactive",
      explanation: "Supplement order",
      createTime: "2023-04-19",
      updateTime: "2023-04-19",
    },
  ]);
  const user = JSON.parse(localStorage.getItem("user")) ? JSON.parse(localStorage.getItem("user")) : JSON.parse(sessionStorage.getItem("user"))
  const [filteredData, setFilteredData] = useState(tableData); // New state for filtered data
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRow, setNewRow] = useState({
    supplierMaterial: "",
    supplementOrderNumber: "",
    status: "",
    explanation: "",
    createTime: "",
    updateTime: "",
  });
  const [selectedRowId, setSelectedRowId] = useState(null);

  const searchInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await axios.post("http://localhost:8000/api/material-inquiry/get-data",{"email":user.email}, {
          withCredentials: true, // If your API requires authentication cookies
        });
  
        setTableData(response.data.data);
        setFilteredData(response.data.data); // Set filtered data to match initial data
      } catch (error) {
        console.error("Error fetching data:", error);
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
  };

  const handleEditRow = (rowId) => {
    const selectedRow = tableData.find((row) => row.id === rowId);
    if (selectedRow) {
      setNewRow(selectedRow);
      setSelectedRowId(rowId);
      setIsModalOpen(true);
    }
  };

  const handleSaveRow = async() => {
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
      supplierMaterial: "",
      supplementOrderNumber: "",
      status: "",
      explanation: "",
      createTime: "",
      updateTime: "",
    });

    try
    {
      const response = await axios.post("http://localhost:8000/api/material-inquiry/add-material",[newRow,{"user":user.email}],{
        withCredentials : true
      })
    }
    catch(err)
    {
      console.log(err);
    }
  };

  const navigate = useHistory();
  const handleViewAllClick = () => navigate.push("/admin/tables");

  const handleSearch = () => {
    if (country === "All") {
      // Search in all columns
      const filteredData = tableData.filter((row) =>
        row.supplierMaterial.includes(searchTerm) ||
        row.supplementOrderNumber.includes(searchTerm) ||
        row.status.includes(searchTerm) ||
        row.explanation.includes(searchTerm) ||
        row.createTime.includes(searchTerm) ||
        row.updateTime.includes(searchTerm)
      );
      setFilteredData(filteredData);
    } else {
      // Search in specific column
      const filteredData = tableData.filter((row) => {
        switch (country) {
          case "Supplier Material":
            return row.supplierMaterial.includes(searchTerm);
          case "Supplement Order Number":
            return row.supplementOrderNumber.includes(searchTerm);
          case "Status":
            return row.status.includes(searchTerm);
          case "Explanation":
            return row.explanation.includes(searchTerm);
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
            <Text fontSize="xl" fontWeight="bold">Material Inquiry</Text>
            <Text fontSize="md" color="gray.400">Manage Material Inquiry</Text>
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
              <option value="Supplier Material">Supplier Material</option>
              <option value="Supplement Order Number">Supplement Order Number</option>
              <option value="Status">Status</option>
              <option value="Explanation">Explanation</option>
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
                <Th color="gray.400">Supplier Material</Th>
                <Th color="gray.400">Supplement Order Number</Th>
                <Th color="gray.400">Status</Th>
                <Th color="gray.400">Explanation</Th>
                <Th color="gray.400">Create Time</Th>
                <Th color="gray.400">Update Time</Th>
                <Th color="gray.400">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.id}</Td>
                  <Td>{row.Suppliermaterial}</Td>
                  <Td>{row.OrderNumber}</Td>
                  <Td>{row.status}</Td>
                  <Td>{row.explaination}</Td>
                  <Td>{row.createdTime}</Td>
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
              <FormLabel>Supplier Material</FormLabel>
              <Input
                value={newRow.supplierMaterial}
                onChange={(e) => setNewRow({ ...newRow, supplierMaterial: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Supplement Order Number</FormLabel>
              <Input
                value={newRow.supplementOrderNumber}
                onChange={(e) => setNewRow({ ...newRow, supplementOrderNumber: e.target.value })}
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
              <FormLabel>Explanation</FormLabel>
              <Input
                value={newRow.explanation}
                onChange={(e) => setNewRow({ ...newRow, explanation: e.target.value })}
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

export default MaterialInquiry;