import React from "react";
import { Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import TablesTableRow from "components/Tables/TablesTableRow"; // Assuming you have a row component

const DailyWorkerReportTable = ({ currentRows, textColor, borderColor }) => {
  return (
    <Table variant="simple" color={textColor}>
      <Thead>
        <Tr my=".8rem" pl="0px" color="gray.400">
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Company Name</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Project Name</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Date</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Supervisor Name</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Manager Name</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Prepaid By</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Sr.No.</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">No. of Employee</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Nature of Work</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Progress</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Hour of Work</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Charges</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Date</Th>
        </Tr>
      </Thead>
      <Tbody>
        {currentRows.map((row, index) => (
          <TablesTableRow key={index} {...row} isLast={index === currentRows.length - 1} />
        ))}
      </Tbody>
    </Table>
  );
};

export default DailyWorkerReportTable;