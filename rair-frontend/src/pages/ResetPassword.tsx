import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';
import {
  resetPasswordSchema,
  TresetPasswordSchema
} from '../schemas/TresetPasswordSchemas';
import handleConfirmResetPassword from '../auth/ResetPassword';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { email, resetAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TresetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: TresetPasswordSchema) => {
    try {
      await handleConfirmResetPassword({
        username: email!,
        confirmationCode: data.code,
        newPassword: data.password,
      });
      resetAuth();
      navigate('/login');
    } catch (err) {
      console.error('Password reset error:', err);
      //resetAuth();
      //navigate('/login');
    }
    reset();
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={6} lg={4}>
          <h3 className="text-center mb-4">Confirm your new password</h3>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="formCode">
              <Form.Label>Confirmation Code</Form.Label>
              <Form.Control
                placeholder="Enter the confirmation code"
                {...register("code")}
                isInvalid={!!errors.code}
              />
              <Form.Control.Feedback type="invalid">
                {errors.code?.message}
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
              {isSubmitting ? 'Confirming reset password ...' : 'Confirm password reset'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
