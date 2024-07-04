import { useState } from 'react';
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem,  
  Button, 
  NavbarMenuToggle,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@nextui-org/react";
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <Navbar 
      isBordered 
      isBlurred={false}
      className="bg-background/70 dark:bg-background/80 backdrop-blur-md backdrop-saturate-150 w-full absolute top-0 z-50" maxWidth="full"
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} onClick={() => setIsMenuOpen(!isMenuOpen)} />
      </NavbarContent>

      <NavbarBrand>
        <p className="font-bold size-xl text-inherit cursor-pointer navbar-logo" onClick={() => navigate('/')}>xChat</p>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem className="hidden sm:flex">
          <Button color="primary" variant="flat" onClick={() => navigate('/chat')}>
            Open Chat
          </Button>
        </NavbarItem>
        {user && (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                name={user.displayName || user.email}
                size="sm"
                src={user.photoURL}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{user.email}</p>
              </DropdownItem>
              <DropdownItem key="settings" onClick={() => navigate('/profile')}>My Profile</DropdownItem>
              <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </NavbarContent>
    </Navbar>
  );
};

export default NavBar;