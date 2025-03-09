import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Avatar,
  useColorModeValue,
  FormControl,
  InputGroup,
  InputRightElement,
  Icon,
  Divider,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { FiSearch, FiSend, FiPaperclip, FiMoreVertical } from "react-icons/fi";
import axios from "axios";

export default function Messages() {
  const [search, setSearch] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const currentUser = "AjayClg"; // Replace with actual user from auth
  const toast = useToast();

  // Chakra color mode values
  const bgForm = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const inputBg = useColorModeValue("gray.50", "navy.900");
  const sidebarBg = useColorModeValue("gray.50", "navy.800");
  const selectedChatBg = useColorModeValue("blue.50", "blue.900");
  const chatHoverBg = useColorModeValue("gray.100", "navy.700");
  const messageBubbleSent = useColorModeValue("blue.500", "blue.400");
  const messageBubbleReceived = useColorModeValue("gray.100", "gray.700");

  // Fetch users
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users");
        console.log("Fetched Users:", response.data);
        setChats(response.data);
      } catch (error) {
        console.error("Error fetching chat users:", error);
        toast({
          title: "Error fetching users",
          description: "Could not load chat users. Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchChats();
  }, [toast]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedChat) {
      setMessages([]); // Clear previous messages first
      axios
        .get(`http://localhost:5000/api/chat/messages/${currentUser}/${selectedChat.username}`)
        .then((response) => {
          console.log("Fetched Messages:", response.data);
          setMessages(response.data);
        })
        .catch((error) => {
          console.error("Error fetching messages:", error);
          toast({
            title: "Error fetching messages",
            description: "Could not load messages. Please try again later.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  }, [selectedChat, currentUser, toast]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) {
      toast({
        title: "Empty message",
        description: "Message cannot be empty!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const payload = {
        sender: currentUser,
        receiver: selectedChat.username,
        message: newMessage,
        timestamp: new Date().toISOString(),
      };
      console.log("Sending Message:", payload);

      const response = await axios.post("http://localhost:5000/api/chat/messages/send", payload);
      console.log("Message Sent Response:", response.data);

      setMessages([...messages, payload]);
      setNewMessage("");

      toast({
        title: "Message sent",
        status: "success",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: "Could not send message. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box mt={16} bg={bgForm} p={6} boxShadow="xl" borderRadius="20px" maxW="1300px" mx="auto">
      <Flex direction="row" height="80vh">
        {/* Sidebar */}
        <Box
          w={{ base: "100%", md: "30%" }}
          borderRight="1px solid"
          borderColor={borderColor}
          p={4}
          bg={sidebarBg}
          borderTopLeftRadius="20px"
          borderBottomLeftRadius="20px"
        >
          <Text fontSize="2xl" color={textColor} fontWeight="bold" mb={4}>
            Messages
          </Text>

          <InputGroup mb={4}>
            <Input
              placeholder="Search or start a new chat"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              borderRadius="lg"
              bg={inputBg}
              border="1px solid"
              borderColor={borderColor}
              _focus={{
                borderColor: "blue.400",
                boxShadow: "0 0 0 1px blue.400",
              }}
            />
            <InputRightElement>
              <Icon as={FiSearch} color="gray.500" />
            </InputRightElement>
          </InputGroup>

          <Divider mb={4} />

          <Text fontSize="sm" color="gray.500" mb={2} fontWeight="medium">
            RECENT CONVERSATIONS
          </Text>

          <Flex direction="column" gap={2} overflowY="auto" maxH="calc(80vh - 180px)">
            {chats
              .filter((chat) => chat.username.toLowerCase().includes(search.toLowerCase()))
              .map((chat, index) => (
                <Flex
                  key={index}
                  align="center"
                  p={3}
                  bg={selectedChat?.username === chat.username ? selectedChatBg : "transparent"}
                  color={selectedChat?.username === chat.username ? "blue.500" : textColor}
                  borderRadius="md"
                  _hover={{ bg: chatHoverBg }}
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  transition="all 0.2s"
                >
                  <Avatar size="md" mr={3} name={chat.username} />
                  <Box flex="1">
                    <Text fontWeight="bold">{chat.username}</Text>
                    <Text fontSize="sm" color="gray.500" noOfLines={1}>
                      {chat.lastMessage || "Start a conversation"}
                    </Text>
                  </Box>
                  {chat.unread && (
                    <Box bg="blue.500" borderRadius="full" w="6px" h="6px" ml={2} />
                  )}
                </Flex>
              ))}
          </Flex>
        </Box>

        {/* Chat Area */}
        <Box
          w={{ base: "0%", md: "70%" }}
          p={0}
          display="flex"
          flexDirection="column"
          borderTopRightRadius="20px"
          borderBottomRightRadius="20px"
          bg={useColorModeValue("white", "gray.800")}
          overflow="hidden"
        >
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <Flex
                align="center"
                justify="space-between"
                p={4}
                borderBottom="1px solid"
                borderColor={borderColor}
                bg={useColorModeValue("white", "gray.800")}
              >
                <Flex align="center">
                  <Avatar size="md" mr={3} name={selectedChat.username} />
                  <Box>
                    <Text fontWeight="bold">{selectedChat.username}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {selectedChat.isOnline ? "Online" : "Last seen recently"}
                    </Text>
                  </Box>
                </Flex>
                <Tooltip label="More options" placement="left">
                  <Button variant="ghost" borderRadius="full" size="sm">
                    <Icon as={FiMoreVertical} />
                  </Button>
                </Tooltip>
              </Flex>

              {/* Messages Area */}
              <Box
                flex="1"
                overflowY="auto"
                p={4}
                bg={useColorModeValue("gray.50", "gray.900")}
                css={{
                  "&::-webkit-scrollbar": {
                    width: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "gray.300",
                    borderRadius: "24px",
                  },
                }}
              >
                {messages.map((msg, i) => (
                  <Flex
                    key={i}
                    justify={msg.sender === currentUser ? "flex-end" : "flex-start"}
                    mb={4}
                  >
                    {msg.sender !== currentUser && (
                      <Avatar size="sm" mr={2} name={msg.sender} />
                    )}
                    <Box
                      bg={
                        msg.sender === currentUser ? messageBubbleSent : messageBubbleReceived
                      }
                      color={msg.sender === currentUser ? "white" : textColor}
                      borderRadius="lg"
                      px={4}
                      py={2}
                      maxW="70%"
                    >
                      <Text>{msg.message}</Text>
                      <Text fontSize="xs" textAlign="right" mt={1} opacity={0.7}>
                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </Box>
                  </Flex>
                ))}
              </Box>

              {/* Message Input */}
              <FormControl p={4} borderTop="1px solid" borderColor={borderColor}>
                <Flex>
                  <Tooltip label="Attach file" placement="top">
                    <Button variant="ghost" borderRadius="full" mr={2}>
                      <Icon as={FiPaperclip} />
                    </Button>
                  </Tooltip>
                  <InputGroup>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message"
                      borderRadius="full"
                      bg={inputBg}
                      flex="1"
                      border="1px solid"
                      borderColor={borderColor}
                      _focus={{
                        borderColor: "blue.400",
                        boxShadow: "0 0 0 1px blue.400",
                      }}
                    />
                    <InputRightElement width="4rem">
                      <Button
                        h="1.75rem"
                        size="sm"
                        colorScheme="blue"
                        borderRadius="full"
                        onClick={sendMessage}
                      >
                        <Icon as={FiSend} />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </Flex>
              </FormControl>
            </>
          ) : (
            <Flex
              direction="column"
              align="center"
              justify="center"
              height="100%"
              bg={useColorModeValue("gray.50", "gray.800")}
              p={10}
            >
              <Box bg="blue.50" p={6} borderRadius="full" mb={4}>
                <Icon as={FiSend} color="blue.500" boxSize={10} />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color={textColor} textAlign="center" mb={4}>
                Select a chat to start messaging
              </Text>
              <Text color="gray.500" textAlign="center" mb={4}>
                Choose from your existing conversations or search for someone new.
              </Text>
              <Text fontSize="sm" color="gray.400">
                🔒 End-to-end encrypted
              </Text>
            </Flex>
          )}
        </Box>
      </Flex>
    </Box>
  );
}