const Footer = () => {
  return (
    <footer className="rair-footer" aria-label="Site footer">
      <div className="rair-footer__inner">
        <span className="rair-footer__brand">RAIR</span>
        <nav aria-label="Footer navigation">
          <ul className="rair-footer__links" role="list">
            <li><a href="#" className="rair-footer__link">Privacy</a></li>
            <li aria-hidden="true" className="rair-footer__sep">·</li>
            <li><a href="#" className="rair-footer__link">Terms</a></li>
            <li aria-hidden="true" className="rair-footer__sep">·</li>
            <li><a href="mailto:contact@rairclothing.com" className="rair-footer__link">Contact</a></li>
          </ul>
        </nav>
        <p className="rair-footer__copy">© 2025 RAIR Clothing. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
