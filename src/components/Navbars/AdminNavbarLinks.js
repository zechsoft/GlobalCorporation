import React, { useState, useContext, useEffect } from "react";
import { BellIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Avatar,
  useBreakpointValue,
  useToast,
  Divider,
  Checkbox,
  Spinner,
} from "@chakra-ui/react";
import { NavLink, useHistory } from "react-router-dom";
import routes from "routes.js";
import { ArgonLogoDark, ArgonLogoLight, ChakraLogoDark, ChakraLogoLight, ProfileIcon, SettingsIcon } from "components/Icons/Icons";
import { ItemContent } from "components/Menu/ItemContent";
import { SearchBar } from "components/Navbars/SearchBar/SearchBar";
import { SidebarContext } from "contexts/SidebarContext";
import axios from "axios";

// Sample default avatars for new users
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";

export default function HeaderLinks(props) {
  const {
    variant,
    children,
    fixed,
    scrolled,
    secondary,
    onOpen,
    ...rest
  } = props;

  const { colorMode } = useColorMode();
  const { toggleSidebar } = useContext(SidebarContext);
  const history = useHistory();
  const toast = useToast();

  // Modal states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isClientListModalOpen, setIsClientListModalOpen] = useState(false);
  
  // Form states
  const [loginCredentials, setLoginCredentials] = useState({ email: "", password: "" });
  const [signUpCredentials, setSignUpCredentials] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "client" 
  });
  const [rememberPassword, setRememberPassword] = useState(true);
  
  // User states
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rememberedAccounts, setRememberedAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [allClientAccounts, setAllClientAccounts] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  const navbarIcon = "white";
  const menuBg = "white";

  // Default avatars to assign to new users
  const defaultAvatars = [avatar1, avatar2, avatar3];
 
  // Set authorization header for all requests if token exists
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }; 

  useEffect(() => {
    // Check if user is already logged in
    var userData = JSON.parse(localStorage.getItem("user") || "null");

    // console.log("User data nav -> ",userData);

    // if(userData === null)
    // {
    //   userData = JSON.parse(sessionStorage.getItem("user"));
    // }
    
    if (userData) {
      setIsLoggedIn(true);
      setCurrentUser(userData);
    }
    
    // Load remembered accounts from localStorage
    const savedAccounts = JSON.parse(localStorage.getItem("rememberedAccounts") || "[]");
    setRememberedAccounts(savedAccounts);
    
    // Auto login if only one account is saved and has autoLogin set to true
    const autoLoginAccount = savedAccounts.find(account => account.autoLogin);
    if (autoLoginAccount && !isLoggedIn) {
      handleAutoLogin(autoLoginAccount);
    }
  }, []);

  const redirectToUserDashboard = (user) => {
    if (user.role === "admin") {
      console.log("admin role hit");
      history.push("/admin/dashboard");
    } else {
      console.log("Client route hit")
      history.push("/client/dashboard");
    }
  };

  // Fetch all client accounts from the database
  const fetchAllClientAccounts = async () => {
    setIsLoadingClients(true);
    try {
        // If no token, we'll use the register endpoint to get public users
        const response = await axios.post("http://localhost:8000/api/get-clients");

        setAllClientAccounts(response.data.users.map(client => ({
          ...client,
          avatar: client.avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
        })));

    } catch (error) {
      toast({
        title: "Error fetching client accounts",
        description: error.response?.data?.msg || "Could not load client accounts",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingClients(false);
    }
  };

  // Handle automatic login for returning users
  const handleAutoLogin = async (account) => {
    try {
      // We need to get a new token
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: account.email,
        password: account.savedPassword
      });

      const { token, user } = response.data;
      
      // Set auth token for future requests
      
      // Update user data with new token
      const userData = {
        ...account,
        id: user.id,
        role: user.role
      };

      // Store token and user data in localStorage
      localStorage.setItem("userData", JSON.stringify(userData));
      
      setCurrentUser(userData);
      setIsLoggedIn(true);
      
      toast({
        title: "Welcome Back",
        description: `You've been automatically signed in as ${account.name}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      redirectToUserDashboard(userData);
    } catch (error) {
      // If auto-login fails, remove autoLogin flag
      updateRememberedAccount(account.email, { autoLogin: false });
      
      toast({
        title: "Auto-login failed",
        description: "Please sign in manually",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Open the client list modal
  const openClientListModal = async () => {
    await fetchAllClientAccounts();
    setIsClientListModalOpen(true);
  };

  // Close the client list modal
  const closeClientListModal = () => {
    setIsClientListModalOpen(false);
  };

  // Open the login modal for a specific account
  const openLoginModalForAccount = (account) => {
    console.log("Opened",account);
    setSelectedAccount(account);
    setLoginCredentials({ 
      email: account.Email, 
      password: account.pa
    });
    setIsLoginModalOpen(true);
    closeClientListModal(); // Close the client list modal if it's open
  };

  // Open the login modal
  const openLoginModal = () => {
    setSelectedAccount(null);
    setLoginCredentials({ email: "", password: "" });
    setIsLoginModalOpen(true);
  };

  // Close the login modal
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginCredentials({ email: "", password: "" });
    setSelectedAccount(null);
  };

  // Open the sign up modal
  const openSignUpModal = () => {
    setIsSignUpModalOpen(true);
  };

  // Close the sign up modal
  const closeSignUpModal = () => {
    setIsSignUpModalOpen(false);
    setSignUpCredentials({ name: "", email: "", password: "", role: "client" });
  };

  // Handle login form input changes
  const handleLoginChange = (e) => {
    setLoginCredentials({
      ...loginCredentials,
      [e.target.name]: e.target.value
    });
  };

  // Handle sign up form input changes
  const handleSignUpChange = (e) => {
    setSignUpCredentials({
      ...signUpCredentials,
      [e.target.name]: e.target.value
    });
  };

  // Save account to remembered accounts
  const saveAccountToRemembered = (userData, password, autoLogin = true) => {
    const existingAccounts = [...rememberedAccounts];
    const existingAccountIndex = existingAccounts.findIndex(acc => acc.email === userData.email);
    
    const accountData = {
      ...userData,
      savedPassword: rememberPassword ? password : null,  // Store password for auto-login if chosen
      autoLogin: autoLogin,     // Flag for auto-login on startup
      lastLogin: new Date().toISOString()
    };
    
    if (existingAccountIndex >= 0) {
      // Update existing account
      existingAccounts[existingAccountIndex] = {
        ...existingAccounts[existingAccountIndex],
        ...accountData
      };
    } else {
      // Add new account
      existingAccounts.push(accountData);
    }
    
    // Update state and localStorage
    setRememberedAccounts(existingAccounts);
    localStorage.setItem("rememberedAccounts", JSON.stringify(existingAccounts));
  };

  // Update a remembered account
  const updateRememberedAccount = (email, updates) => {
    const existingAccounts = [...rememberedAccounts];
    const existingAccountIndex = existingAccounts.findIndex(acc => acc.email === email);
    
    if (existingAccountIndex >= 0) {
      existingAccounts[existingAccountIndex] = {
        ...existingAccounts[existingAccountIndex],
        ...updates
      };
      
      setRememberedAccounts(existingAccounts);
      localStorage.setItem("rememberedAccounts", JSON.stringify(existingAccounts));
    }
  };

  // Handle login logic
  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/login", {
        email: loginCredentials.email === undefined ? selectedAccount.email : loginCredentials.email,
        password: loginCredentials.password
      },{withCredentials:true});

      const user = response.data;

      console.log("data -> ",user);
      
      // Create a user object with avatar
      const userData = {
        email: loginCredentials.email || user.displayMail,
        role: user.role || "client",
        avatar: selectedAccount?.avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
        name: user.displayName || loginCredentials.email.split('@')[0]
      };

      // Store token and user data in localStorage
      const checkLocal = localStorage.getItem("user");
      var local = false;

      if(checkLocal === null || checkLocal === undefined)
      {
        console.log("in admin nav session removed");
        sessionStorage.removeItem("user");
      }
      else
      {
        local = true;
        console.log("in admin nav local removed");
        localStorage.removeItem("user");
      }

      if(local)
      {
        console.log("in admin nav local set");
        localStorage.setItem("user", JSON.stringify(user));
      }
      else
      {
        console.log("in admin nav session set");
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      console.log("local nav -> ",localStorage.getItem("user"));
      console.log("session nav-> ",sessionStorage.getItem("user"));
      
      // Remember this account for future logins
      saveAccountToRemembered(userData, loginCredentials.password, true);
      
      setCurrentUser(userData);
      setIsLoggedIn(true);
      
      toast({
        title: "Login Successful",
        description: `Welcome back!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      redirectToUserDashboard(userData);
      closeLoginModal();
      
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: error.response?.data?.msg || "Invalid credentials",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle sign up logic
  const handleSignUp = async () => {

    try {
      const response = await axios.post("http://localhost:8000/api/super-register", {
        name: signUpCredentials.name,
        email: signUpCredentials.email,
        password: signUpCredentials.password,
        role: signUpCredentials.role
      },{withCredentials:true});

      const user = response.data;
      
      // Create a user object with avatar
      const userData = {
        name: signUpCredentials.name,
        email: signUpCredentials.email,
        role: signUpCredentials.role,
        avatar: defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
      };
      
      // Remember this account for future logins
      saveAccountToRemembered(userData, signUpCredentials.password, true);
      
      toast({
        title: "Registration Successful",
        description: `Welcome ${signUpCredentials.name}!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // redirectToUserDashboard(userData);
      closeSignUpModal();
      
    } catch (error) {

      console.log("Error -> ",error);
      toast({
        title: "Registration failed",
        description: error.response?.data?.msg || "Registration failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle direct account selection
  const handleAccountSelection = (account) => {
    // If account has savedPassword, log in directly without showing modal
    if (account.savedPassword) {
      loginCredentials.email = account.email;
      loginCredentials.password = account.savedPassword;
      handleLogin();
    } else {
      // Otherwise, show login modal pre-filled with account email
      openLoginModalForAccount(account);
    }
  };

  // Handle client account selection from all clients list
  const handleClientSelection = (client) => {
    // Check if this client is already in remembered accounts
    const rememberedAccount = rememberedAccounts.find(acc => acc.email === client.email);
    
    if (rememberedAccount && rememberedAccount.savedPassword) {
      // If we already have the saved password, log in directly
      handleAccountSelection(rememberedAccount);
    } else {
      // Otherwise, show login modal pre-filled with client email
      openLoginModalForAccount({
        id: client._id,
        name: client.userName,
        email: client.Email,
        avatar: client.avatar,
        role: client.role
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Update the remembered account to set autoLogin to false
    if (currentUser) {
      updateRememberedAccount(currentUser.email, { autoLogin: false });
    }
    
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setAuthToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    // history.push("/");
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // Redirect user to the appropriate dashboard based on their role

  // Remove an account from remembered accounts
  const removeAccount = (email, e) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    const filteredAccounts = rememberedAccounts.filter(acc => acc.email !== email);
    setRememberedAccounts(filteredAccounts);
    localStorage.setItem("rememberedAccounts", JSON.stringify(filteredAccounts));
    
    toast({
      title: "Account Removed",
      description: "The account has been removed from your saved accounts",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // We'll use Chakra UI's responsive utilities for different views
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  return (
    <Flex
      pe={{ sm: "0px", md: "16px" }}
      w={{ sm: "100%", md: "auto" }}
      alignItems='center'
      flexDirection='row'>
      <SearchBar me='18px' />

      <Box ml="auto" display="flex" alignItems="center">
        {/* Unified Sidebar Toggle Button for both mobile and desktop */}
        <Button
          onClick={toggleSidebar}
          variant="no-hover"
          ref={props.btnRef}
          p="0px"
          borderRadius="50%"
          mr={{ base: "16px", lg: "24px" }}
          bg="white"
          _hover={{ bg: "white" }}
          boxShadow="0px 0px 5px rgba(0, 0, 0, 0.1)"
          aria-label="Toggle Sidebar"
        >
          <HamburgerIcon w="25px" h="25px" color="black" />
        </Button>

        {!isLoggedIn ? (
          <Menu>
            <MenuButton as={Button} variant="no-effects" rightIcon={<ProfileIcon color={navbarIcon} w='22px' h='22px' me='0px' />}>
              <Text display={{ sm: "none", md: "flex" }} color={navbarIcon}>Accounts</Text>
            </MenuButton>
            <MenuList p='16px 8px' bg={menuBg} minWidth="240px">
              <Flex flexDirection='column'>
                {rememberedAccounts.length > 0 && (
                  <>
                    <Text fontWeight="bold" mb="2" px="3">Saved Accounts</Text>
                    {rememberedAccounts.map((account, index) => (
                      <MenuItem 
                        key={index} 
                        borderRadius='8px' 
                        mb='4px'
                        onClick={() => handleAccountSelection(account)}
                      >
                        <Flex alignItems="center" width="100%">
                          <Avatar size="sm" src={account.avatar} name={account.name} mr="2" />
                          <Box flex="1">
                            <Text fontWeight="medium">{account.name}</Text>
                            <Text fontSize="xs" color="gray.500">{account.email}</Text>
                          </Box>
                          <Button 
                            size="xs" 
                            colorScheme="red" 
                            variant="ghost" 
                            onClick={(e) => removeAccount(account.email, e)}
                          >
                            ✕
                          </Button>
                        </Flex>
                      </MenuItem>
                    ))}
                    <Divider my="2" />
                  </>
                )}
                <MenuItem borderRadius='8px' mb='10px' onClick={openClientListModal}>
                  <Text fontWeight="medium">Login with Another Account</Text>
                </MenuItem>
                <MenuItem borderRadius='8px' mb='10px' onClick={openSignUpModal}>
                  <Text fontWeight="medium">Sign Up</Text>
                </MenuItem>
              </Flex>
            </MenuList>
          </Menu>
        ) : (
          <Menu>
            <MenuButton as={Button} variant="no-effects">
              <Avatar size="sm" src={currentUser?.avatar} name={currentUser?.name} />
            </MenuButton>
            <MenuList p='16px 8px' bg={menuBg}>
              <Flex flexDirection='column'>
                <MenuItem borderRadius='8px' mb='10px'>
                  <Text fontWeight="bold">{currentUser?.name}</Text>
                </MenuItem>
                <MenuItem borderRadius='8px' mb='10px'>
                  <Text fontSize="sm">{currentUser?.email}</Text>
                </MenuItem>
                <MenuItem borderRadius='8px' mb='10px'>
                  <Text fontSize="sm">Role: {currentUser?.role}</Text>
                </MenuItem>
                <MenuItem borderRadius='8px' mb='10px' onClick={() => redirectToUserDashboard(currentUser)}>
                  <Text fontWeight="medium">Dashboard</Text>
                </MenuItem>
                <MenuItem borderRadius='8px' mb='10px' onClick={handleLogout}>
                  <Text fontWeight="medium" color="red.500">Logout</Text>
                </MenuItem>
              </Flex>
            </MenuList>
          </Menu>
        )}

        <SettingsIcon
          cursor='pointer'
          ms={{ base: "16px", xl: "0px" }}
          me='16px'
          onClick={props.onOpen}
          color={navbarIcon}
          w='25px'
          h='25px'
          aria-label="Settings"
        />
      </Box>

      {/* Client List Modal */}
      <Modal isOpen={isClientListModalOpen} onClose={closeClientListModal} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Choose an Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoadingClients ? (
              <Flex justify="center" align="center" height="200px">
                <Spinner size="xl" />
              </Flex>
            ) : (
              <Box maxHeight="400px" overflowY="auto">
                {allClientAccounts.length > 0 ? (
                  allClientAccounts.map((client, index) => (
                    <Flex 
                      key={index}
                      p="3"
                      borderRadius="md"
                      mb="2"
                      alignItems="center"
                      cursor="pointer"
                      _hover={{ bg: "gray.100" }}
                      onClick={() => handleClientSelection(client)}
                    >
                      <Avatar 
                        size="md" 
                        src={client.avatar} 
                        name={client.userName} 
                        mr="3" 
                      />
                      <Box>
                        <Text fontWeight="bold">{client.userName}</Text>
                        <Text fontSize="sm" color="gray.600">{client.Email}</Text>
                      </Box>
                    </Flex>
                  ))
                ) : (
                  <Text textAlign="center" py="4">No client accounts found</Text>
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={closeClientListModal}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={openLoginModal}>
              Enter Email Manually
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Login Modal */}
      <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">
            {selectedAccount ? `Login as ${selectedAccount.name}` : "User Login"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display="flex" flexDirection="column" alignItems="center" mb="10px">
              <Avatar 
                src={selectedAccount?.avatar || defaultAvatars[0]} 
                mb="8px" 
                size="xl" 
              />
              <Text fontSize="lg" fontWeight="bold" mb="6">Welcome Back</Text>
              
              {!selectedAccount && (
                <Input
                  placeholder="Email"
                  type="email"
                  name="email"
                  value={loginCredentials.email}
                  onChange={handleLoginChange}
                  mb="4"
                />
              )}
              
              <Input
                placeholder="Password"
                type="password"
                name="password"
                value={loginCredentials.password}
                onChange={handleLoginChange}
                mb="4"
              />
              
              <Checkbox 
                isChecked={rememberPassword} 
                onChange={(e) => setRememberPassword(e.target.checked)}
                alignSelf="flex-start"
                mb="6"
              >
                Remember password for automatic login
              </Checkbox>
              
              <Button colorScheme="blue" width="100%" onClick={handleLogin}>Log in Now</Button>
              
              {!selectedAccount && (
                <Text mt="4" fontSize="sm">
                  Don't have an account?{" "}
                  <Text as="span" color="blue.500" cursor="pointer" onClick={() => {
                    closeLoginModal();
                    openSignUpModal();
                  }}>
                    Sign up
                  </Text>
                </Text>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Sign Up Modal */}
      <Modal isOpen={isSignUpModalOpen} onClose={closeSignUpModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Create Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display="flex" flexDirection="column" alignItems="center" mb="10px">
              <Avatar 
                src={defaultAvatars[0]} 
                mb="8px" 
                size="xl" 
              />
              <Text fontSize="lg" fontWeight="bold" mb="6">Join Us</Text>
              <Input
                placeholder="Name"
                type="text"
                name="name"
                value={signUpCredentials.name}
                onChange={handleSignUpChange}
                mb="4"
              />
              <Input
                placeholder="Email"
                type="email"
                name="email"
                value={signUpCredentials.email}
                onChange={handleSignUpChange}
                mb="4"
              />
              <Input
                placeholder="Password"
                type="password"
                name="password"
                value={signUpCredentials.password}
                onChange={handleSignUpChange}
                mb="4"
              />
              <Box width="100%" mb="6">
                <Text mb="2" fontSize="sm">Select Role:</Text>
                <Flex>
                  <Button 
                    flex="1" 
                    mr="2" 
                    colorScheme={signUpCredentials.role === "client" ? "blue" : "gray"}
                    onClick={() => setSignUpCredentials({...signUpCredentials, role: "client"})}
                  >
                    Client
                  </Button>
                  <Button 
                    flex="1" 
                    colorScheme={signUpCredentials.role === "admin" ? "blue" : "gray"}
                    onClick={() => setSignUpCredentials({...signUpCredentials, role: "admin"})}
                  >
                    Admin
                  </Button>
                </Flex>
              </Box>
              <Button colorScheme="blue" width="100%" onClick={handleSignUp}>Create Account</Button>
              <Text mt="4" fontSize="sm">
                Already have an account?{" "}
                <Text as="span" color="blue.500" cursor="pointer" onClick={() => {
                  closeSignUpModal();
                  openLoginModal();
                }}>
                  Log in
                </Text>
              </Text>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}