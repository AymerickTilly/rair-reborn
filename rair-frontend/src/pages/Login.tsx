import { TsignInSchema, signInSchema } from "../schemas/TsignInSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn } from "../auth/SignIn";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/AuthStore";

const Login = () => {
  const navigate = useNavigate();
  const { setPasswordReset, setUserId } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<TsignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: TsignInSchema) => {
    try {
      const { sub } = await signIn({ username: data.email, password: data.password });
      setUserId(sub);
      navigate('/');
    } catch {
      setError("root", { message: "Invalid email or password." });
    }
    reset();
  };

  return (
    <main className="auth-page" id="main-content">
      <div className="auth-card">
        <div className="auth-card__brand">RAIR</div>
        <h1 className="auth-card__title">Sign in</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="rair-field">
            <label className="rair-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="rair-input"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && <p className="rair-error">{errors.email.message}</p>}
          </div>

          <div className="rair-field">
            <label className="rair-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="rair-input"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && <p className="rair-error">{errors.password.message}</p>}
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
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-card__footer">
          <Link
            to="/askResetCode"
            className="auth-link"
            onClick={() => setPasswordReset(true)}
          >
            Forgot password?
          </Link>
        </p>
        <p className="auth-card__footer">
          No account?{" "}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
