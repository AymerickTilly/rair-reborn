import { createContext, useContext, useEffect, useId, useRef, type ReactNode } from 'react';
import './Modal.css';

// A small modal built on the native <dialog> element. The browser provides the backdrop, the focus trap,
// and keeping the rest of the page inert, which replaces react-bootstrap's Modal and its CSS.
// The API mirrors the react-bootstrap parts the app used: Modal, Modal.Header, Modal.Title, Modal.Body, Modal.Footer.

interface ModalContextValue {
  onHide: () => void;
  titleId: string;
}

const ModalContext = createContext<ModalContextValue>({ onHide: () => {}, titleId: '' });

interface ModalProps {
  show: boolean;
  onHide: () => void;
  size?: 'lg';
  dialogClassName?: string;
  // Accessible name for modals whose header has no Modal.Title
  ariaLabel?: string;
  children: ReactNode;
}

function Modal({ show, onHide, size, dialogClassName = '', ariaLabel, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (show && !dialog.open) {
      dialog.showModal();
      panelRef.current?.focus();
    } else if (!show && dialog.open) {
      dialog.close();
    }
  }, [show]);

  const classes = ['rair-modal', size === 'lg' ? 'rair-modal--lg' : '', dialogClassName].filter(Boolean).join(' ');

  return (
    <dialog
      ref={dialogRef}
      className={classes}
      aria-labelledby={titleId}
      aria-label={ariaLabel}
      // Escape: let the parent decide instead of the browser closing the dialog behind React's back
      onCancel={(e) => {
        e.preventDefault();
        onHide();
      }}
    >
      {show && (
        <ModalContext.Provider value={{ onHide, titleId }}>
          {/* A click on the frame outside the panel is a click on the backdrop */}
          <div
            className="rair-modal__frame"
            onClick={(e) => {
              if (e.target === e.currentTarget) onHide();
            }}
          >
            <div className="rair-modal__panel" ref={panelRef} tabIndex={-1}>
              {children}
            </div>
          </div>
        </ModalContext.Provider>
      )}
    </dialog>
  );
}

function Header({ closeButton, children }: { closeButton?: boolean; children: ReactNode }) {
  const { onHide } = useContext(ModalContext);
  return (
    <div className="rair-modal__header">
      {children}
      {closeButton && (
        <button type="button" className="rair-modal__close" aria-label="Close" onClick={onHide}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

function Title({ children }: { children: ReactNode }) {
  const { titleId } = useContext(ModalContext);
  return (
    <h2 className="rair-modal__title" id={titleId}>
      {children}
    </h2>
  );
}

function Body({ children }: { children: ReactNode }) {
  return <div className="rair-modal__body">{children}</div>;
}

function Footer({ children }: { children: ReactNode }) {
  return <div className="rair-modal__footer">{children}</div>;
}

Modal.Header = Header;
Modal.Title = Title;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;
