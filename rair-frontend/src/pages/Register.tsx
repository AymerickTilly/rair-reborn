import { handleSignUp } from '../auth/SignUp';
import { TsignUpSchema, signUpSchema } from '../schemas/TsignUpSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';
import { addUser } from '../api/addUser';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { setPendingUsername, setAddress } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
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
      if (!result?.isSignUpComplete) {
        setPendingUsername(data.username);
        setAddress(data.address);
        setTimeout(() => navigate('/confirmRegister'), 0);
      } else {
        const userId = result.userId ?? '';
        await addUser({ userId, username: data.username, address: data.address });
        navigate('/');
      }
    } catch {
      setError("root", { message: "Registration failed. Please try again." });
    }
    reset();
  };

  return (
    <main className="auth-page" id="main-content">
      <div className="auth-card">
        <img src="/favicon.svg" alt="RAIR" className="auth-card__brand" />
        <h1 className="auth-card__title">Create account</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="rair-field">
            <label className="rair-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              className="rair-input"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('username')}
            />
            {errors.username && <p className="rair-error">{errors.username.message}</p>}
          </div>

          <div className="rair-field">
            <label className="rair-label" htmlFor="reg-address">Delivery address</label>
            <input
              id="reg-address"
              type="text"
              className="rair-input"
              autoComplete="street-address"
              placeholder="123 Main Street, City"
              {...register('address')}
            />
            {errors.address && <p className="rair-error">{errors.address.message}</p>}
          </div>

          <div className="rair-field">
            <label className="rair-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="rair-input"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && <p className="rair-error">{errors.password.message}</p>}
          </div>

          <div className="rair-field">
            <label className="rair-label" htmlFor="reg-confirm">Confirm password</label>
            <input
              id="reg-confirm"
              type="password"
              className="rair-input"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('confirmpassword')}
            />
            {errors.confirmpassword && (
              <p className="rair-error">{errors.confirmpassword.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="rair-error" role="alert">{errors.root.message}</p>
          )}

          <button
            type="submit"
            className="btn-rair btn-rair-primary"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            {isSubmitting ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </main>
  );
};

export default RegisterForm;
