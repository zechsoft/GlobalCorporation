import React from "react";
import { Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import TablesTableRow from "components/Tables/TablesTableRow"; // Assuming you have a row component

const CustomerDeliveryTable = ({ currentRows, textColor, borderColor }) => {
  return (
    <Table variant="simple" color={textColor}>
      <Thead>
        <Tr my=".8rem" pl="0px" color="gray.400">
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">#</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Customer</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Delivery Notice No</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Start Time</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">End Time</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Creator</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Urgent Material</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Order Status</Th>
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

export default CustomerDeliveryTable;