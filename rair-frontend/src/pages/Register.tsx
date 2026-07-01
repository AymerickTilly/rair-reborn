import { handleSignUp } from '../auth/SignUp';
import { TsignUpSchema, signUpSchema } from '../schemas/TsignUpSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';
import { addUser } from '../api/addUser';
import backgroundImage from '../assets/background-texture.png';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { setPendingUsername, setAddress } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TsignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: TsignUpSchema) => {
    try {
      const result = await handleSignUp({
        username: data.username,
        password: data.password,
        email: data.username,
      });
      console.log('SignUp Result:', result);
      if (!result?.isSignUpComplete) {
        // Email confirmation required — show "check your email" page
        setPendingUsername(data.username);
        setAddress(data.address);
        setTimeout(() => navigate('/confirmRegister'), 0);
      } else {
        // Email confirmation disabled — session is live immediately
        const userId = result.userId ?? '';
        await addUser({
          userId,
          username: data.username,
          address: data.address,
        });
        navigate('/');
      }
    } catch (err) {
      console.error('Signup error:', err);
    }
    reset();
  };

  return (
    <div
      className="register-page"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: '#333333',
        backgroundBlendMode: 'overlay',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <Row className="w-100 justify-content-center">
          <Col xs={12} sm={10} md={6} lg={4}>
            <h3 className="text-center mb-4">Create your account</h3>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Label>Your email as username</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter username"
                  {...register('username')}
                  isInvalid={!!errors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formAddress">
                <Form.Label>Your delivery address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your delivery address"
                  {...register('address')}
                  isInvalid={!!errors.address}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  {...register('password')}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formConfirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm password"
                  {...register('confirmpassword')}
                  isInvalid={!!errors.confirmpassword}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmpassword?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
                className="w-100"
              >
                {isSubmitting ? 'Creating your account ...' : 'Sign up'}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <small>
                Already have an account? <Link to="/login">Login</Link>
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterForm;
