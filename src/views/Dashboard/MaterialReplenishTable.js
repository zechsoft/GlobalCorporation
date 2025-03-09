import React from "react";
import { Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import TablesTableRow from "components/Tables/TablesTableRow"; // Assuming you have a row component

const MaterialReplenishTable = ({ currentRows, textColor, borderColor }) => {
  return (
    <Table variant="simple" color={textColor}>
      <Thead>
        <Tr my=".8rem" pl="0px" color="gray.400">
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">#</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Order Number</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Material Category</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Vendor</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Invitee</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Host/Inviter Contact Information</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Sender</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Status</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Supplement Template</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Create Time</Th>
          <Th pl="35px" pr="35px" borderColor={borderColor} color="gray.400">Update Time</Th>
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

export default MaterialReplenishTable;