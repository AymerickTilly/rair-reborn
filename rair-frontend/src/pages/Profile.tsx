import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema, TprofileUpdateFormData } from "../schemas/TprofileUpdateSchema";
import { useAuthStore } from "../auth/AuthStore";
import { loadUserById } from "../api/loadUser";
import { updateUser } from "../api/updateUser";
import { User } from "../types/User";
import { supabase } from "../lib/supabase";
import { useToastStore } from "../stores/toastStore";

const pwSchema = z.object({
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});
type TPwSchema = z.infer<typeof pwSchema>;

export default function ProfilePage() {
  const [address, setAddress] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const { userId, email } = useAuthStore();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TprofileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
  });

  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    reset: resetPw,
    formState: { errors: pwErrors, isSubmitting: pwSubmitting },
  } = useForm<TPwSchema>({ resolver: zodResolver(pwSchema) });

  useEffect(() => {
    const id = userId ?? email;
    if (!id) return;
    loadUserById(id).then(data => {
      if (data) {
        setUsername(data.username);
        setAddress(data.address);
        setValue("address", data.address);
      }
    }).catch(console.error);
  }, [setValue, userId, email]);

  const onSubmit = async (formData: TprofileUpdateFormData) => {
    const id = userId ?? email;
    if (!id) return;
    const userData: User = { userId: id, username, address: formData.address };
    const ok = await updateUser(userData);
    if (ok) {
      setAddress(formData.address);
      setEditMode(false);
      addToast('Address updated.', 'success');
    } else {
      addToast('Failed to update address.', 'error');
    }
  };

  const onSubmitPw = async (data: TPwSchema) => {
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      addToast('Failed to update password.', 'error');
    } else {
      addToast('Password updated.', 'success');
      setChangingPw(false);
      resetPw();
    }
  };

  const initial = username[0]?.toUpperCase() || 'U';

  return (
    <main className="page-shell" id="main-content">
      <div className="page-shell__inner page-shell__inner--narrow">
        <header className="page-shell__header">
          <h1 className="page-shell__title">Profile</h1>
        </header>

        <div className="profile-card">
          <div className="profile-card__avatar" aria-hidden="true">{initial}</div>
          <div className="profile-card__body">
            <p className="profile-card__email">{username || '—'}</p>

            {/* Address */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="rair-field">
                <label className="rair-label" htmlFor="profile-address">
                  Delivery address
                </label>
                <input
                  id="profile-address"
                  type="text"
                  className="rair-input"
                  {...register("address")}
                  disabled={!editMode}
                  defaultValue={address}
                  autoComplete="street-address"
                />
                {errors.address && (
                  <p className="rair-error">{errors.address.message}</p>
                )}
              </div>

              <div className="profile-card__actions">
                {editMode ? (
                  <>
                    <button
                      type="submit"
                      className="btn-rair btn-rair-primary"
                      disabled={!isDirty || isSubmitting}
                    >
                      {isSubmitting ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="btn-rair btn-rair-ghost"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn-rair btn-rair-outline"
                    onClick={() => setEditMode(true)}
                  >
                    Edit address
                  </button>
                )}
              </div>
            </form>

            {/* Password */}
            <div className="profile-card__divider" />
            {changingPw ? (
              <form onSubmit={handleSubmitPw(onSubmitPw)} noValidate>
                <div className="rair-field">
                  <label className="rair-label" htmlFor="pw-new">New password</label>
                  <input
                    id="pw-new"
                    type="password"
                    className="rair-input"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...registerPw('password')}
                  />
                  {pwErrors.password && <p className="rair-error">{pwErrors.password.message}</p>}
                </div>
                <div className="rair-field">
                  <label className="rair-label" htmlFor="pw-confirm">Confirm password</label>
                  <input
                    id="pw-confirm"
                    type="password"
                    className="rair-input"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...registerPw('confirmPassword')}
                  />
                  {pwErrors.confirmPassword && <p className="rair-error">{pwErrors.confirmPassword.message}</p>}
                </div>
                <div className="profile-card__actions">
                  <button
                    type="submit"
                    className="btn-rair btn-rair-primary"
                    disabled={pwSubmitting}
                  >
                    {pwSubmitting ? 'Saving…' : 'Update password'}
                  </button>
                  <button
                    type="button"
                    className="btn-rair btn-rair-ghost"
                    onClick={() => { setChangingPw(false); resetPw(); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="btn-rair btn-rair-outline"
                onClick={() => setChangingPw(true)}
              >
                Change password
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
