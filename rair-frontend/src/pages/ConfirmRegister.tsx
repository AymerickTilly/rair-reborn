import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuthStore } from "../auth/AuthStore";

const ConfirmRegisterForm = () => {
  const { pendingUsername } = useAuthStore();

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={6} lg={4} className="text-center">
          <h3 className="mb-4">Check your email</h3>
          <p className="text-muted">
            We sent a confirmation link to <strong>{pendingUsername}</strong>.
            Click the link in that email to activate your account — you'll be
            signed in automatically.
          </p>
          <small>
            Already confirmed? <Link to="/login">Sign in</Link>
          </small>
        </Col>
      </Row>
    </Container>
  );
};

export default ConfirmRegisterForm;