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

  const [filteredData, setFilteredData] = useState(tableData); // New state for filtered data
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const navigate = useHistory();
  const handleViewAllClick = () => navigate.push("/admin/tables");

  const handleSearch = () => {
    if (country === "All") {
      // Search in all columns
      const filteredData = tableData.filter((row) =>
        row.customerNumber.includes(searchTerm) ||
        row.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.platformNo.includes(searchTerm) ||
        row.poNo.includes(searchTerm) ||
        row.purchaseDate.includes(searchTerm) ||
        row.orderAmount.includes(searchTerm) ||
        row.currency.includes(searchTerm) ||
        row.purchasingDepartment.includes(searchTerm) ||
        row.purchaser.includes(searchTerm) ||
        row.requisitionBusinessGroup.includes(searchTerm) ||
        row.deliveryStatus.includes(searchTerm) ||
        row.orderStatus.includes(searchTerm) ||
        row.acceptanceStatus.includes(searchTerm) ||
        row.statementStatus.includes(searchTerm)
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
          case "Platform No":
            return row.platformNo.includes(searchTerm);
          case "PO No":
            return row.poNo.includes(searchTerm);
          case "Purchase Date":
            return row.purchaseDate.includes(searchTerm);
          case "Order Amount":
            return row.orderAmount.includes(searchTerm);
          case "Currency":
            return row.currency.includes(searchTerm);
          case "Purchasing Department":
            return row.purchasingDepartment.includes(searchTerm);
          case "Purchaser":
            return row.purchaser.includes(searchTerm);
          case "Requisition Business Group":
            return row.requisitionBusinessGroup.includes(searchTerm);
          case "Delivery Status":
            return row.deliveryStatus.includes(searchTerm);
          case "Order Status":
            return row.orderStatus.includes(searchTerm);
          case "Acceptance Status":
            return row.acceptanceStatus.includes(searchTerm);
          case "Statement Status":
            return row.statementStatus.includes(searchTerm);
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
            <Text fontSize="xl" fontWeight="bold">Customer Orders</Text>
            <Text fontSize="md" color="gray.400">Manage Customer Orders</Text>
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
              <FormLabel>Platform No</FormLabel>
              <Input
                value={newRow.platformNo}
                onChange={(e) => setNewRow({ ...newRow, platformNo: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>PO No</FormLabel>
              <Input
                value={newRow.poNo}
                onChange={(e) => setNewRow({ ...newRow, poNo: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Purchase Date</FormLabel>
              <Input
                type="date"
                value={newRow.purchaseDate}
                onChange={(e) => setNewRow({ ...newRow, purchaseDate: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Order Amount</FormLabel>
              <Input
                value={newRow.orderAmount}
                onChange={(e) => setNewRow({ ...newRow, orderAmount: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Currency</FormLabel>
              <Input
                value={newRow.currency}
                onChange={(e) => setNewRow({ ...newRow, currency: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Purchasing Department</FormLabel>
              <Input
                value={newRow.purchasingDepartment}
                onChange={(e) => setNewRow({ ...newRow, purchasingDepartment: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Purchaser</FormLabel>
              <Input
                value={newRow.purchaser}
                onChange={(e) => setNewRow({ ...newRow, purchaser: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Requisition Business Group</FormLabel>
              <Input
                value={newRow.requisitionBusinessGroup}
                onChange={(e) => setNewRow({ ...newRow, requisitionBusinessGroup: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Delivery Status</FormLabel>
              <Input
                value={newRow.deliveryStatus}
                onChange={(e) => setNewRow({ ...newRow, deliveryStatus: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Order Status</FormLabel>
              <Input
                value={newRow.orderStatus}
                onChange={(e) => setNewRow({ ...newRow, orderStatus: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Acceptance Status</FormLabel>
              <Input
                value={newRow.acceptanceStatus}
                onChange={(e) => setNewRow({ ...newRow, acceptanceStatus: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Statement Status</FormLabel>
              <Input
                value={newRow.statementStatus}
                onChange={(e) => setNewRow({ ...newRow, statementStatus: e.target.value })}
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

export default CustomerOrder;