const Spinner = ({ fullscreen = true }: { fullscreen?: boolean }) => (
  <div className={fullscreen ? 'rair-spinner-screen' : 'rair-spinner-inline'} aria-label="Loading" role="status">
    <span className="rair-spinner" aria-hidden="true" />
  </div>
);

export default Spinner;
