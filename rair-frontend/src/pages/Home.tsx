import { useAuthStore } from '../auth/AuthStore';
import Footer from '../components/Footer';
import Spinner from '../components/Spinner';
import '../components/Homestyling.css';

const Home = () => {
  const { loading } = useAuthStore();

  if (loading) {
    return (
      <div className="home" id="main-content">
        <div className="hero">
          <div className="hero__inner">
            <span className="hero__eyebrow">New Collection</span>
            <h1 className="hero__brand">RAIR</h1>
            <Spinner fullscreen={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home" id="main-content">
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-brand">
        <div className="hero__inner">
          <span className="hero__eyebrow">New Collection</span>
          <h1 className="hero__brand" id="hero-brand">RAIR</h1>
          <p className="hero__tagline">Cold. Precise. Uncompromising.</p>
          <div className="hero__cta">
            <a href="/shop" className="btn-rair btn-rair-primary">
              Shop Now
            </a>
          </div>
        </div>
        <div className="hero__scroll" aria-hidden="true">
          <span className="hero__scroll-label">Scroll</span>
          <span className="hero__scroll-line" />
        </div>
      </section>

      {/* Brand story */}
      <section className="brand-story" aria-label="About RAIR">
        <div className="brand-story__inner">

          <div className="brand-story__block">
            <p className="brand-story__kicker">The brand</p>
            <h2 className="brand-story__heading">Built for clarity.<br />Stripped of noise.</h2>
            <p className="brand-story__body">
              RAIR is a contemporary clothing line defined by restraint. Each piece is designed
              with a single intention: to hold its shape, sit precisely, and outlast the moment
              it was bought for. No excess. No compromise. Just garments that do exactly what
              they are supposed to do.
            </p>
          </div>

          <div className="brand-story__block brand-story__block--aside">
            <p className="brand-story__kicker">About this project</p>
            <h2 className="brand-story__heading">A school project in Cloud Computing.</h2>
            <p className="brand-story__body">
              The original assignment used AWS&mdash;backend, APIs, S3 bucket, the works. This
              version is a full rebuild: same concept, rewritten in C# and ASP.NET Core to
              explore a new stack, with Supabase for auth and data, deployed on Vercel and Render.
            </p>
            <a href="/shop" className="btn-rair btn-rair-ghost brand-story__cta">
              Browse the shop
            </a>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
