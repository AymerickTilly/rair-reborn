// src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useAuthStore } from '../auth/AuthStore';
import CarouselComponent from '../components/Carousel';
import { loadProducts } from '../api/loadProducts';
import Footer from '../components/Footer';
import { Product } from '../types/Product';
import { Slide } from '../types/Slide';
import '../components/Homestyling.css';
import backgroundImage from '../assets/background-texture.png';

const Home = () => {
  const { loading, userId } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await loadProducts();
        setProducts(allProducts);
        setProductsLoading(false);
        console.log(userId);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [userId]);

  if (loading || productsLoading) return <p>Loading...</p>;

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div
        className="home-page"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundColor: 'none',
          backgroundBlendMode: 'overlay',
          minHeight: '100vh',
          width: '100%',
        }}
      >
      <Container
        fluid
        className="d-flex flex-column align-items-center text-center pb-4"
        style={{
          fontFamily: 'Times New Roman, sans-serif',
          paddingTop: '20px',
        }}
      >
        <h1 className="display-1 mb-4 text-white text-shadow">RAIR Clothing.</h1>
          <div className="mission-statement-card mt-4">
          <p>
            At <strong>RAIR</strong>, quality meets comfort—without compromise.
            <br />
            We craft modern, trend-driven outerwear using sustainable materials,
            ensuring you look sharp and feel comfortable every day.
            <br /><br />
            Ready to upgrade your wardrobe with style and purpose?
            <br />
            <strong>Place your order today.</strong>
          </p>
        </div>
        <div
          className="d-flex flex-wrap justify-content-center"
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            rowGap: '0.01rem',
            columnGap: '2rem',
          }}
        >
          {categories.map((category) => {
            const categoryProducts = products.filter((p) => p.category === category);
            const slides: Slide[] = categoryProducts.map((p) => ({
              image: p.imageUrl,
              alt: `${p.name} image`,
              title: p.name,
              text: p.description,
              productId: p.productId,
            }));

            return (
              <CarouselComponent key={category} slides={slides} />
            );
          })}
        </div>

      
      </Container>

      <Footer />
    </div>
  );
};

export default Home;
