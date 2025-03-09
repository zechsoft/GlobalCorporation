import React from "react";
import { Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import TablesTableRow from "components/Tables/TablesTableRow";

const SupplierInformationTable = ({ currentRows, textColor, borderColor }) => {
  return (
    <Table variant="simple" color={textColor}>
      <Thead>
        <Tr my=".8rem" pl="0px" color="gray.400">
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Customer Number</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Customer</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Buyer</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Second-order Classification</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Status</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Document Status</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Abnormal Info</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Invitee</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Re-auth Person</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Contact Info</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Invitation Date</Th>
        </Tr>
      </Thead>
      <Tbody>
        {currentRows.map((row, index) => (
          <TablesTableRow key={row.customerNumber} {...row} isLast={index === currentRows.length - 1} />
        ))}
      </Tbody>
    </Table>
  );
};

export default SupplierInformationTable;