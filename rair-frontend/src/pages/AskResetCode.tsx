import { useForm } from "react-hook-form";
import { askCodeResetSchema, TaskCodeResetSchema } from "../schemas/TaskCodeResetSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../auth/AuthStore";
import handleResetPassword from "../auth/SendPwdVerificationCode";

const AskResetCode = () => {
  const navigate = useNavigate();
  const { setPasswordReset, setEmail } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<TaskCodeResetSchema>({
    resolver: zodResolver(askCodeResetSchema),
  });

  const onSubmit = async (data: TaskCodeResetSchema) => {
    try {
      await handleResetPassword(data.email);
      setEmail(data.email);
      navigate("/resetPassword");
    } catch {
      setPasswordReset(false);
      setError("root", { message: "Could not send reset code. Check your email address." });
    }
    reset();
  };

  return (
    <main className="auth-page" id="main-content">
      <div className="auth-card">
        <div className="auth-card__brand">RAIR</div>
        <h1 className="auth-card__title">Reset password</h1>
        <p className="auth-card__subtitle">
          Enter your email and we&apos;ll send you a reset code.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="rair-field">
            <label className="rair-label" htmlFor="reset-email">Email</label>
            <input
              id="reset-email"
              type="email"
              className="rair-input"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && <p className="rair-error">{errors.email.message}</p>}
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
            {isSubmitting ? "Sending…" : "Send reset code"}
          </button>
        </form>

        <p className="auth-card__footer">
          <Link to="/login" className="auth-link">Back to sign in</Link>
        </p>
      </div>
    </main>
  );
};

export default AskResetCode;
