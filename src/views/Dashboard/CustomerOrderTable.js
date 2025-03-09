import React from "react";
import { Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import TablesTableRow from "components/Tables/TablesTableRow"; // Assuming you have a row component

const CustomerOrderTable = ({ currentRows, textColor, borderColor }) => {
  return (
    <Table variant="simple" color={textColor}>
      <Thead>
        <Tr my=".8rem" pl="0px" color="gray.400">
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Customer Number</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Customer</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Buyer</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Platform No</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">PO No</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Purchase Date</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Order Amount</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Currency</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Purchasing Department</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Purchaser</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Requisition Business Group</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Delivery Status</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Order Status</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Acceptance Status</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Statement Status</Th>
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

export default CustomerOrderTable;