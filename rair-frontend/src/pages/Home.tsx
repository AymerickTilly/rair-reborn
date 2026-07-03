import { useEffect, useState } from 'react';
import { useAuthStore } from '../auth/AuthStore';
import CarouselComponent from '../components/Carousel';
import { loadProducts } from '../api/loadProducts';
import Footer from '../components/Footer';
import { Product } from '../types/Product';
import { Slide } from '../types/Slide';
import Spinner from '../components/Spinner';
import '../components/Homestyling.css';

const Home = () => {
  const { loading } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    loadProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setProductsLoading(false));
  }, []);

  if (loading || productsLoading) return <Spinner />;

  const categories = Array.from(new Set(products.map((p) => p.category)));

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
            <h2 className="collections__title">Collections</h2>
          </header>

          {categories.map((category) => {
            const categoryProducts = products.filter((p) => p.category === category);
            const slides: Slide[] = categoryProducts.map((p) => ({
              image: p.imageUrl,
              alt: `${p.name}`,
              title: p.name,
              text: p.description,
              productId: p.productId,
            }));

            return (
              <div key={category} className="collection-row">
                <div className="collection-row__header">
                  <h3 className="collection-row__name">{category}</h3>
                </div>
                <CarouselComponent slides={slides} />
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
