import { useEffect, useState } from 'react';
import { useAuthStore } from '../auth/AuthStore';
import CarouselComponent from '../components/Carousel';
import { loadProducts } from '../api/loadProducts';
import Footer from '../components/Footer';
import { Product } from '../types/Product';
import { Slide } from '../types/Slide';
import Spinner from '../components/Spinner';
import '../components/Homestyling.css';

const CATEGORY_LABELS: Record<string, string> = {
  'crew-neck': 'Crew Neck',
  'hoodies':   'Hoodies',
  'knitwear':  'Knitwear',
  'shirts':    'Shirts',
};

const Home = () => {
  const { loading } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
    loadProducts()
      .then((data: Product[]) => {
        setProducts(data);
        const cats = Array.from(new Set(data.map(p => p.category)));
        if (cats[0]) setActiveCategory(cats[0]);
      })
      .catch(console.error)
      .finally(() => setProductsLoading(false));
  }, []);

  if (loading || productsLoading) {
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

  const categories = Array.from(new Set(products.map(p => p.category)));

  const activeSlides: Slide[] = products
    .filter(p => p.category === activeCategory)
    .map(p => ({
      image: p.imageUrl,
      alt: p.name,
      title: p.name,
      text: p.description,
      productId: p.productId,
    }));

  return (
    <div className="home" id="main-content">
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-brand">
        <div className="hero__inner">
          <span className="hero__eyebrow">New Collection</span>
          <h1 className="hero__brand" id="hero-brand">RAIR</h1>
          <p className="hero__tagline">Quality meets comfort&mdash;without compromise</p>
          <div className="hero__cta">
            <a href="#collections" className="btn-rair btn-rair-primary">
              Shop Now
            </a>
          </div>
        </div>
        <div className="hero__scroll" aria-hidden="true">
          <span className="hero__scroll-label">Scroll</span>
          <span className="hero__scroll-line" />
        </div>
      </section>

      {/* Collections */}
      <section id="collections" className="collections" aria-label="Collections">
        <div className="collections__inner">

          <header className="collections__header">
            <p className="collections__title">Collections</p>
            <nav className="collections-tabs" aria-label="Product categories">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`collections-tab${activeCategory === cat ? ' is-active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                </button>
              ))}
            </nav>
          </header>

          <div className="collection-stage">
            <h2 className="collection-stage__name">
              {CATEGORY_LABELS[activeCategory] ?? activeCategory}
            </h2>
            <CarouselComponent slides={activeSlides} />
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
