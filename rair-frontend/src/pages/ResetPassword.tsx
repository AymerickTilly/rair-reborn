import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { resetPasswordSchema, TresetPasswordSchema } from '../schemas/TresetPasswordSchemas';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../auth/AuthStore';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { resetAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<TresetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: TresetPasswordSchema) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
      await supabase.auth.signOut();
      resetAuth();
      navigate('/login');
    } catch {
      setError('root', { message: 'Could not update password. The reset link may have expired.' });
    }
  };

  return (
    <main className="auth-page" id="main-content">
      <div className="auth-card">
        <div className="auth-card__brand">RAIR</div>
        <h1 className="auth-card__title">New password</h1>
        <p className="auth-card__subtitle">Choose a new password for your account.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="rair-field">
            <label className="rair-label" htmlFor="reset-pw">New password</label>
            <input
              id="reset-pw"
              type="password"
              className="rair-input"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('password')}
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
              {...register('confirmpassword')}
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
            {isSubmitting ? 'Saving…' : 'Set new password'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ResetPassword;
