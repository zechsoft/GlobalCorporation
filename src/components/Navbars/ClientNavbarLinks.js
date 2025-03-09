import React, { useState, useContext } from "react";
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
  FormControl, // Add this import
  FormLabel,   // Add this import
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import routes from "clientroutes"; // Ensure this is the correct path for client routes
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";
import { ArgonLogoDark, ArgonLogoLight, ProfileIcon, SettingsIcon } from "components/Icons/Icons";
import { SearchBar } from "components/Navbars/SearchBar/SearchBar";
import ProfileDropdown from "components/ProfileDropdown/ProfileDropdown";
import { SidebarResponsive } from "components/Sidebar/Sidebar";
import { SidebarContext } from "contexts/SidebarContext";

export default function ClientNavbarLinks(props) {
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

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const openLoginModal = (user) => {
    setCurrentUser(user);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleLogin = (user) => {
    setUser(user);
    setIsLoggedIn(true);
    closeLoginModal();
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  const navbarIcon = "white";
  const menuBg = "white";

  const users = [
    {
      name: 'Client1',
      avatar: avatar1,
    },
    {
      name: 'Client2',
      avatar: avatar2,
    },
    {
      name: 'Client3',
      avatar: avatar3,
    }
  ];

  const isMobileView = useBreakpointValue({ base: true, md: false });
  const isDesktopView = useBreakpointValue({ base: false, lg: true });

  return (
    <Flex
      pe={{ sm: "0px", md: "16px" }}
      w={{ sm: "100%", md: "auto" }}
      alignItems="center"
      flexDirection="row"
    >
      <SearchBar me="18px" />

      <Menu>
        <ProfileDropdown />
      </Menu>

      <Box ml="auto" display="flex" alignItems="center">
        {(isMobileView || isDesktopView) && (
          <Button
            onClick={toggleSidebar}
            variant="no-hover"
            ref={props.btnRef}
            p="0px"
            borderRadius="50%"
            mr={{ base: "16px", lg: "15px" }}
            bg="white"
            _hover={{ bg: "white" }}
            boxShadow="0px 0px 5px rgba(0, 0, 0, 0.1)"
            ml="10px" // Move this slightly right
          >
            <HamburgerIcon w="25px" h="25px" color="black" />
          </Button>
        )}
      </Box>

      <SidebarResponsive
        logo={
          <Stack direction="row" spacing="12px" align="center" justify="center">
            {colorMode === "dark" ? (
              <ArgonLogoLight w="74px" h="27px" />
            ) : (
              <ArgonLogoLight w="74px" h="27px" />
            )}
          </Stack>
        }
        colorMode={colorMode}
        secondary={props.secondary}
        routes={routes}
        {...rest}
      />

      <SettingsIcon
        cursor="pointer"
        ms={{ base: "16px", xl: "0px" }}
        me="13px"
        onClick={props.onOpen}
        color={navbarIcon}
        w="30px"
        h="30px"
      />
      
      {/* Login Modal */}
      <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="email">
              <FormLabel>Email Address</FormLabel>
              <Input
                value={currentUser ? currentUser.email : ""}
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                type="email"
                placeholder="Enter your email"
              />
            </FormControl>
            <FormControl id="password" mt="4">
              <FormLabel>Password</FormLabel>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter your password"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => handleLogin(currentUser)}>
              Log In
            </Button>
            <Button variant="ghost" onClick={closeLoginModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
