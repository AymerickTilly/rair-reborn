import { useNavigate } from 'react-router';
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
    <button type="button" className="rair-nav__link rair-nav__link--button" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutLink;
