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

const DailyWorkReport = () => {
  const user = JSON.parse(localStorage.getItem("user")) ? JSON.parse(localStorage.getItem("user")) : JSON.parse(sessionStorage.getItem("user"));
  const [tableData, setTableData] = useState([
    {
      id: 1,
      companyName: "ABC Corp",
      projectName: "Project X",
      supervisorName: "John Doe",
      managerName: "Jane Smith",
      prepaidBy: "Client A",
      employees: 5,
      workType: "Construction",
      progress: "50",
      hours: 8,
      charges: "400", // Keep in state but don't display
      date: "2023-04-18",
    },
    {
      id: 2,
      companyName: "XYZ Inc",
      projectName: "Project Y",
      supervisorName: "Alice Johnson",
      managerName: "Bob Lee",
      prepaidBy: "Client B",
      employees: 3,
      workType: "Maintenance",
      progress: "75",
      hours: 6,
      charges: "300", // Keep in state but don't display
      date: "2023-04-19",
    },
  ]);

  const [filteredData, setFilteredData] = useState(tableData);
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRow, setNewRow] = useState({
    companyName: "",
    projectName: "",
    supervisorName: "",
    managerName: "",
    prepaidBy: "",
    employees: "",
    workType: "",
    progress: "",
    hours: "",
    charges: "", // Keep in form but don't display in table
    date: "",
  });
  const [selectedRowId, setSelectedRowId] = useState(null);

  const searchInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("http://localhost:8000/api/dailywork/get-data", {"email": user.email}, {
          withCredentials: true,
        });

        setTableData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
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
      setFilteredData(updatedTableData);
      setSelectedRowId(null);
    } else {
      const updatedRow = { ...newRow, id: tableData.length + 1 };
      setTableData([...tableData, updatedRow]);
      setFilteredData([...filteredData, updatedRow]);
    }
    setIsModalOpen(false);
    setNewRow({
      companyName: "",
      projectName: "",
      supervisorName: "",
      managerName: "",
      prepaidBy: "",
      employees: "",
      workType: "",
      progress: "",
      hours: "",
      charges: "", // Keep in reset
      date: "",
    });

    try {
      // Send data to backend with charges field included
      const response = await axios.post("http://localhost:8000/api/dailywork/add-data", [newRow, {"user": user.email}], {
        withCredentials: true
      });
    } catch(err) {
      console.log(err);
    }
  };

  const navigate = useHistory();
  const handleViewAllClick = () => navigate.push("/admin/tables");

  const handleSearch = () => {
    if (country === "All") {
      const filteredData = tableData.filter((row) =>
        row.employees.toString().includes(searchTerm) ||
        row.workType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.progress.toString().includes(searchTerm)
      );
      setFilteredData(filteredData);
    } else {
      const filteredData = tableData.filter((row) => {
        switch (country) {
          case "No. of Employees":
            return row.employees.toString().includes(searchTerm);
          case "Nature of Work":
            return row.workType.toLowerCase().includes(searchTerm.toLowerCase());
          case "Progress":
            return row.progress.toString().includes(searchTerm);
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
    setFilteredData(tableData);
  };

  return (
    <Box mt={16}>
      <Flex direction="column" bg="white" p={6} boxShadow="md" borderRadius="15px" width="100%">
        <Flex justify="space-between" mb={8}>
          <Flex direction="column">
            <Text fontSize="xl" fontWeight="bold">Daily Work Report</Text>
            <Text fontSize="md" color="gray.400">See information about daily work reports</Text>
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
              <option value="No. of Employees">No. of Employees</option>
              <option value="Nature of Work">Nature of Work</option>
              <option value="Progress">Progress</option>
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

        {/* Wrap the table in a Box with overflowX to enable horizontal scrolling */}
        <Box overflowX="auto">
          <Table variant="simple" borderRadius="10px">
            <Thead bg="gray.100" height="60px">
              <Tr>
                <Th color="gray.400">SR.NO</Th>
                <Th color="gray.400">Company Name</Th>
                <Th color="gray.400">Project Name</Th>
                <Th color="gray.400">Supervisor Name</Th>
                <Th color="gray.400">Manager Name</Th>
                <Th color="gray.400">Prepaid By</Th>
                <Th color="gray.400">No. of Employee</Th>
                <Th color="gray.400">Nature of Work</Th>
                <Th color="gray.400">Progress (%)</Th>
                <Th color="gray.400">Hour of Work</Th>
                {/* Removed Charges column */}
                <Th color="gray.400">Date</Th>
                <Th color="gray.400">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.id}</Td>
                  <Td>{row.CompanyName}</Td>
                  <Td>{row.ProjectName}</Td>
                  <Td>{row.SupervisorName}</Td>
                  <Td>{row.ManagerName}</Td>
                  <Td>{row.PrepaidBy}</Td>
                  <Td>{row.Employee}</Td>
                  <Td>{row.NatureofWork}</Td>
                  <Td>{row.Progress}</Td>
                  <Td>{row.HourofWork}</Td>
                  {/* Removed Charges column */}
                  <Td>{row.Date}</Td>
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
            <FormControl>
              <FormLabel>Company Name</FormLabel>
              <Input
                value={newRow.companyName}
                onChange={(e) => setNewRow({ ...newRow, companyName: e.target.value })}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Project Name</FormLabel>
              <Input
                value={newRow.projectName}
                onChange={(e) => setNewRow({ ...newRow, projectName: e.target.value })}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Supervisor Name</FormLabel>
              <Input
                value={newRow.supervisorName}
                onChange={(e) => setNewRow({ ...newRow, supervisorName: e.target.value })}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Manager Name</FormLabel>
              <Input
                value={newRow.managerName}
                onChange={(e) => setNewRow({ ...newRow, managerName: e.target.value })}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Prepaid By</FormLabel>
              <Input
                value={newRow.prepaidBy}
                onChange={(e) => setNewRow({ ...newRow, prepaidBy: e.target.value })}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>No. of Employee</FormLabel>
              <Input
                value={newRow.employees}
                onChange={(e) => setNewRow({ ...newRow, employees: e.target.value })}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Nature of Work</FormLabel>
              <Input
                value={newRow.workType}
                onChange={(e) => setNewRow({ ...newRow, workType: e.target.value })}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Progress (%)</FormLabel>
              <Input
                value={newRow.progress}
                onChange={(e) => setNewRow({ ...newRow, progress: e.target.value })}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Hour of Work</FormLabel>
              <Input
                value={newRow.hours}
                onChange={(e) => setNewRow({ ...newRow, hours: e.target.value })}
              />
            </FormControl>
            {/* Keep Charges field in the form for backend compatibility */}
            <FormControl mt={4} display="none">
              <FormLabel>Charges</FormLabel>
              <Input
                value={newRow.charges}
                onChange={(e) => setNewRow({ ...newRow, charges: e.target.value })}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={newRow.date}
                onChange={(e) => setNewRow({ ...newRow, date: e.target.value })}
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

export default DailyWorkReport;