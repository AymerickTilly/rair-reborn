import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../auth/SignOut';  // Import the signOut function

const LogoutLink = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();  // Call the signOut function
      navigate('/login');  // Redirect to login page after successful sign-out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Nav.Link as="span" onClick={handleLogout} style={{ cursor: 'pointer' }}>
      Logout
    </Nav.Link>
  );
};

export default LogoutLink;
