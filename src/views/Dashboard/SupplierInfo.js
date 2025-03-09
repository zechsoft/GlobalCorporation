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

const SupplierInfo = () => {
  const [tableData, setTableData] = useState([
    {
      id: 1,
      customerNumber: "123",
      customer: "John Doe",
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
      customerNumber: "124",
      customer: "Alice Smith",
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

  const [filteredData, setFilteredData] = useState(tableData); // New state for filtered data
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) ? JSON.parse(localStorage.getItem("user")) : JSON.parse(sessionStorage.getItem("user"))
  const [newRow, setNewRow] = useState({
    customerNumber: "",
    customer: "",
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
  const [isFocused, setIsFocused] = useState(false);
  

  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await axios.post("http://localhost:8000/api/suppliers/get-data",{"email":user.email}, {
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

  const handleAddRow = async() => {
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
      customerNumber: "",
      customer: "",
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

    try
    {
      const response = await axios.post("http://localhost:8000/api/supplier/add-material",[newRow,{"user":user.email}],{
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
        row.customerNumber.includes(searchTerm) ||
        row.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.secondOrderClassification.includes(searchTerm) ||
        row.status.includes(searchTerm) ||
        row.documentStatus.includes(searchTerm) ||
        row.abnormalInfo.includes(searchTerm) ||
        row.invitee.includes(searchTerm) ||
        row.reAuthPerson.includes(searchTerm) ||
        row.contactInfo.includes(searchTerm) ||
        row.invitationDate.includes(searchTerm)
      );
      setFilteredData(filteredData);
    } else {
      // Search in specific column
      const filteredData = tableData.filter((row) => {
        switch (country) {
          case "Customer Number":
            return row.customerNumber.includes(searchTerm);
          case "Customer":
            return row.customer.toLowerCase().includes(searchTerm.toLowerCase());
          case "Buyer":
            return row.buyer.toLowerCase().includes(searchTerm.toLowerCase());
          case "Second-order Classification":
            return row.secondOrderClassification.includes(searchTerm);
          case "Status":
            return row.status.includes(searchTerm);
          case "Document Status":
            return row.documentStatus.includes(searchTerm);
          case "Abnormal Info":
            return row.abnormalInfo.includes(searchTerm);
          case "Invitee":
            return row.invitee.includes(searchTerm);
          case "Re-auth Person":
            return row.reAuthPerson.includes(searchTerm);
          case "Contact Info":
            return row.contactInfo.includes(searchTerm);
          case "Invitation Date":
            return row.invitationDate.includes(searchTerm);
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
              <option value="Second-order Classification">Second-order Classification</option>
              <option value="Status">Status</option>
              <option value="Document Status">Document Status</option>
              <option value="Abnormal Info">Abnormal Info</option>
              <option value="Invitee">Invitee</option>
              <option value="Re-auth Person">Re-auth Person</option>
              <option value="Contact Info">Contact Info</option>
              <option value="Invitation Date">Invitation Date</option>
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

        <Table variant="simple" borderRadius="10px" overflow="hidden">
          <Thead bg="gray.100" height="60px">
            <Tr>
              <Th color="gray.400">Customer Number</Th>
              <Th color="gray.400">Customer</Th>
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
                <Td>{row.customerNumber}</Td>
                <Td>{row.Customer}</Td>
                <Td>{row.buyer}</Td>
                <Td>{row.SecondOrderClassification}</Td>
                <Td>{row.Status}</Td>
                <Td>{row.DocumentStatus}</Td>
                <Td>{row.AbnormalInfo}</Td>
                <Td>{row.Invite}</Td>
                <Td>{row.ReAuthPerson}</Td>
                <Td>{row.ContactInfo}</Td>
                <Td>{row.InvitationDate}</Td>
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
              <FormLabel>Customer Number</FormLabel>
              <Input
                value={newRow.customerNumber}
                onChange={(e) => setNewRow({ ...newRow, customerNumber: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Customer</FormLabel>
              <Input
                value={newRow.customer}
                onChange={(e) => setNewRow({ ...newRow, customer: e.target.value })}
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
    </Box>
  );
};

export default SupplierInfo;
