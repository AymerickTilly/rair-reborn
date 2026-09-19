import { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { useAuthStore } from '../auth/AuthStore';
import LogoutLink from '../pages/Logout';
import './Navbar.css';

const NavigationBar = () => {
  const { groups } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      if (window.scrollY > 24) setOpen(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  const close = () => setOpen(false);

  return (
    <header className={`rair-nav${scrolled ? ' rair-nav--scrolled' : ''}`} role="banner">
      <NavLink to="/" className="rair-nav__brand" aria-label="RAIR Clothing — Home" onClick={close}>
        RAIR
      </NavLink>

      {/* Mobile burger */}
      <button
        className={`rair-nav__burger${open ? ' is-open' : ''}`}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="rair-nav-menu"
        onClick={() => setOpen(o => !o)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <nav
        id="rair-nav-menu"
        className={`rair-nav__menu${open ? ' is-open' : ''}`}
        aria-label="Main navigation"
      >
        <ul className="rair-nav__list" role="list">
          <li>
            <NavLink
              to="/shop"
              className={({ isActive }) => `rair-nav__link${isActive ? ' active' : ''}`}
              onClick={close}
            >
              Shop
            </NavLink>
          </li>

          {groups.includes('Customer') && (
            <>
              <li>
                <NavLink
                  to="/cart"
                  className={({ isActive }) => `rair-nav__link${isActive ? ' active' : ''}`}
                  onClick={close}
                >
                  Cart
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/listOrdersPage"
                  className={({ isActive }) => `rair-nav__link${isActive ? ' active' : ''}`}
                  onClick={close}
                >
                  Orders
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/profile"
                  className={({ isActive }) => `rair-nav__link${isActive ? ' active' : ''}`}
                  onClick={close}
                >
                  Profile
                </NavLink>
              </li>
            </>
          )}

          {groups.includes('Admin') && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) => `rair-nav__link${isActive ? ' active' : ''}`}
                onClick={close}
              >
                Admin
              </NavLink>
            </li>
          )}

          <li>
            <LogoutLink />
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default NavigationBar;
