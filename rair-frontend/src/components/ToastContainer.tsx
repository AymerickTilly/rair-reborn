import { useToastStore } from '../stores/toastStore';

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item toast-item--${t.type}`} role="alert">
          <span className="toast-item__msg">{t.message}</span>
          <button
            className="toast-item__close"
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
