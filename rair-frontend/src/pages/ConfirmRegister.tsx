import { Link } from "react-router-dom";
import { useAuthStore } from "../auth/AuthStore";

const ConfirmRegisterForm = () => {
  const { pendingUsername } = useAuthStore();

  return (
    <main className="auth-page" id="main-content">
      <div className="auth-card">
        <h1 className="auth-card__title">Check email</h1>
        <p className="auth-card__subtitle">
          We sent a confirmation link to{" "}
          <strong style={{ color: 'var(--rair-ink)' }}>{pendingUsername}</strong>.
          Click it to activate your account.
        </p>
        <p className="auth-card__footer">
          Already confirmed?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </main>
  );
};

export default ConfirmRegisterForm;
