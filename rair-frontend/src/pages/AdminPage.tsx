import { useNavigate } from "react-router";

const AdminPage = () => {
  const navigate = useNavigate();

  const actions = [
    { label: "Add item",     icon: "+",  to: "/admin/add-item"    },
    { label: "Update items", icon: "✎",  to: "/admin/update-item" },
    { label: "Orders",       icon: "☰",  to: "/admin/orders"      },
  ];

  return (
    <main className="auth-page" id="main-content">
      <div className="admin-dashboard">
        <div className="auth-card__brand">RAIR</div>
        <h1 className="admin-dashboard__title">Admin</h1>
        <nav className="admin-action-list" aria-label="Admin actions">
          {actions.map(({ label, icon, to }) => (
            <button
              key={to}
              type="button"
              className="admin-action-btn"
              onClick={() => navigate(to)}
            >
              <span className="admin-action-btn__icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
              <span className="admin-action-btn__arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
};

export default AdminPage;
