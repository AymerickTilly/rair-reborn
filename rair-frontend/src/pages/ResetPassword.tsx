import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';
import { resetPasswordSchema, TresetPasswordSchema } from '../schemas/TresetPasswordSchemas';
import handleConfirmResetPassword from '../auth/ResetPassword';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { email, resetAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
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
    } catch {
      setError("root", { message: "Invalid code or password. Please try again." });
    }
    reset();
  };

  return (
    <main className="auth-page" id="main-content">
      <div className="auth-card">
        <div className="auth-card__brand">RAIR</div>
        <h1 className="auth-card__title">New password</h1>
        <p className="auth-card__subtitle">
          Enter the code we sent to <strong style={{ color: 'var(--rair-ink)' }}>{email}</strong>.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="rair-field">
            <label className="rair-label" htmlFor="reset-code">Confirmation code</label>
            <input
              id="reset-code"
              type="text"
              className="rair-input"
              autoComplete="one-time-code"
              inputMode="numeric"
              placeholder="123456"
              {...register("code")}
            />
            {errors.code && <p className="rair-error">{errors.code.message}</p>}
          </div>

          <div className="rair-field">
            <label className="rair-label" htmlFor="reset-pw">New password</label>
            <input
              id="reset-pw"
              type="password"
              className="rair-input"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && <p className="rair-error">{errors.password.message}</p>}
          </div>

          <div className="rair-field">
            <label className="rair-label" htmlFor="reset-confirm">Confirm password</label>
            <input
              id="reset-confirm"
              type="password"
              className="rair-input"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("confirmpassword")}
            />
            {errors.confirmpassword && <p className="rair-error">{errors.confirmpassword.message}</p>}
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
            {isSubmitting ? "Confirming…" : "Set new password"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ResetPassword;
