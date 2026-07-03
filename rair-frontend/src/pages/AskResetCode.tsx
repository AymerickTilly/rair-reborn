import { useState } from "react";
import { useForm } from "react-hook-form";
import { askCodeResetSchema, TaskCodeResetSchema } from "../schemas/TaskCodeResetSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import handleResetPassword from "../auth/SendPwdVerificationCode";

const AskResetCode = () => {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    getValues,
  } = useForm<TaskCodeResetSchema>({
    resolver: zodResolver(askCodeResetSchema),
  });

  const onSubmit = async (data: TaskCodeResetSchema) => {
    try {
      await handleResetPassword(data.email);
      setSent(true);
    } catch {
      setError("root", { message: "Could not send reset email. Check your email address." });
    }
  };

  if (sent) {
    return (
      <main className="auth-page" id="main-content">
        <div className="auth-card">
          <h1 className="auth-card__title">Check your inbox</h1>
          <p className="auth-card__subtitle">
            We sent a reset link to <strong style={{ color: 'var(--rair-ink)' }}>{getValues('email')}</strong>.
            Click it to set a new password.
          </p>
          <p className="auth-card__footer">
            <Link to="/login" className="auth-link">Back to sign in</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page" id="main-content">
      <div className="auth-card">
        <h1 className="auth-card__title">Reset password</h1>
        <p className="auth-card__subtitle">
          Enter your email and we&apos;ll send you a reset link.
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
            {isSubmitting ? "Sending…" : "Send reset link"}
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
