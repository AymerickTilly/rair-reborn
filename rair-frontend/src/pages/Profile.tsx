import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema, TprofileUpdateFormData } from "../schemas/TprofileUpdateSchema";
import { useAuthStore } from "../auth/AuthStore";
import { loadUserById } from "../api/loadUser";
import { updateUser } from "../api/updateUser";
import { User } from "../types/User";

export default function ProfilePage() {
  const [address, setAddress] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const { userId, email } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TprofileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
  });

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
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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

              {saved && (
                <p
                  className="rair-error"
                  role="status"
                  style={{ color: 'var(--rair-primary)' }}
                >
                  Address updated.
                </p>
              )}

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
          </div>
        </div>
      </div>
    </main>
  );
}
