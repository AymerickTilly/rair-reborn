import { TsignUpConfirmSchema, signUpConfirmSchema } from "../schemas/TsignUpConfirmSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { handleSignUpConfirmation } from "../auth/ConfirmSignUp";
import { signIn } from "../auth/SignIn";
import { useAuthStore } from "../auth/AuthStore";
import { addUser } from "../api/addUser";
import { User } from "../types/User";

const ConfirmRegisterForm = () => {
  const navigate = useNavigate();
  const { resetAuth, setLoading, address } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TsignUpConfirmSchema>({
    resolver: zodResolver(signUpConfirmSchema),
  });

  const onSubmit = async (data: TsignUpConfirmSchema) => {
    try {
      // Confirm sign-up
      await handleSignUpConfirmation({
        username: data.email,
        confirmationCode: data.code,
      });

      try {
        // Sign in and get the Cognito sub
        const { sub } = await signIn({ username: data.email, password: data.password });
        useAuthStore.getState().setPendingUsername(null);

        useAuthStore.getState().setUserId(sub)
        // Use the Cognito sub as userId
        const newUser: User = {
          userId: sub, // Use sub (UUID) instead of username
          username: data.email,
          address: address || "",
        };

        const response = await addUser(newUser);

        if (!response) {
          throw new Error("Failed to add user.");
        }

        navigate('/');
      } catch (err) {
        console.error("Sign-in error after confirmation:", err);
        resetAuth();
        setLoading(false);
        navigate('/login');
      }
    } catch (err) {
      console.error("Confirmation error:", err);
      resetAuth();
      setLoading(false);
    }

    reset();
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={6} lg={4}>
          <h3 className="text-center mb-4">Confirmation Code</h3>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                {...register("password")}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>

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

            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              className="w-100"
            >
              {isSubmitting ? "Confirming ..." : "Confirm"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ConfirmRegisterForm;