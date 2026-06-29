import { Navbar, Nav, Container } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';
import LogoutLink from '../pages/Logout';
import './Navbar.css';

const NavigationBar = () => {
  const { groups } = useAuthStore();

  return (
    <Navbar bg="light" variant="light" expand="lg" className="shadow-sm">
      <Container>
        <Nav.Link as={NavLink} to="/" className="nav-link-custom">
          Home
        </Nav.Link>

        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/shop" className="nav-link-custom">
              Shop
            </Nav.Link>

            {groups.includes("Customer") && (
              <Nav.Link as={NavLink} to="/profile" className="nav-link-custom">
                Profile
              </Nav.Link>
            )}

            {groups.includes("Admin") && (
              <Nav.Link as={NavLink} to="/admin" className="nav-link-custom">
                Admin
              </Nav.Link>
            )}
          </Nav>

          <Nav className="align-items-center">
            {groups.includes("Customer") && (
              <Nav.Link as={NavLink} to="/cart" className="nav-link-custom">
                Cart
              </Nav.Link>
            )}
            {groups.includes("Customer") && (
              <Nav.Link as={NavLink} to="/listOrdersPage" className="nav-link-custom">
                Orders
              </Nav.Link>
            )}
            <Nav.Link as="span" className="nav-link-custom">
              <LogoutLink />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
