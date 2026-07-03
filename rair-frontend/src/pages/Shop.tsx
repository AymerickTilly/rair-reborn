import { useEffect, useState } from "react";
import { loadProducts } from "../api/loadProducts";
import { Modal } from "react-bootstrap";
import { Product } from "../types/Product";
import { addToCart } from "../api/addCart";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "../auth/AuthStore";
import { loadProductById } from "../api/loadProduct";
import "../components/Shopstyling.css";

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const userId = useAuthStore((state) => state.userId);

  useEffect(() => {
    loadProducts().then(setProducts).catch(console.error);
  }, []);

  const handleCardClick = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setSelectedQuantity(1);
    setFeedback(null);
    setShowModal(true);
  };

  const handleAddToCart = async () => {
    if (!selectedProduct || !selectedSize) return;
    setAdding(true);
    setFeedback(null);
    try {
      const latestProduct = await loadProductById(selectedProduct.productId);
      const selectedStock = latestProduct.stock.find(
        (item: { size: string }) => item.size === selectedSize
      );
      if (!selectedStock) {
        setFeedback(`Size ${selectedSize} is no longer available.`);
        return;
      }
      if (selectedQuantity > selectedStock.stockAmount) {
        setFeedback(
          selectedStock.stockAmount === 0
            ? `Size ${selectedSize} is out of stock.`
            : `Only ${selectedStock.stockAmount} left in size ${selectedSize}.`
        );
        return;
      }
      await addToCart({
        userId,
        cartId: uuidv4(),
        productId: selectedProduct.productId,
        name: selectedProduct.name,
        price: selectedProduct.price,
        size: selectedSize,
        quantity: selectedQuantity,
        imageUrl: selectedProduct.imageUrl,
      });
      setFeedback("Added to cart.");
      setTimeout(() => setShowModal(false), 900);
    } catch {
      setFeedback("Failed to add to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="shop" id="main-content">
      <div className="shop__inner">
        <header className="shop__header">
          <h1 className="shop__title">Shop</h1>
          <div className="shop__search-wrap">
            <input
              className="shop__search"
              type="search"
              placeholder="Search products…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search products"
            />
          </div>
        </header>

        <div className="shop__grid" role="list">
          {filtered.length === 0 && (
            <p className="shop__empty">No products found</p>
          )}
          {filtered.map((product) => (
            <button
              key={product.productId}
              type="button"
              className="product-card"
              onClick={() => handleCardClick(product)}
              role="listitem"
              aria-label={`View ${product.name} – $${product.price}`}
            >
              <div className="product-card__img-wrap">
                <img
                  className="product-card__img"
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  width={300}
                  height={400}
                />
                <div className="product-card__quick" aria-hidden="true">
                  <span className="product-card__quick-label">Quick view</span>
                </div>
              </div>

              <div className="product-card__body">
                <p className="product-card__name">{product.name}</p>
                <p className="product-card__desc">{product.description}</p>
                <div className="product-card__footer">
                  <span className="product-card__price">${product.price}</span>
                  {product.onSale && (
                    <span className="product-card__sale">
                      Sale ${product.salePrice}
                    </span>
                  )}
                </div>
                <div className="product-card__stock" aria-label="Stock">
                  {product.stock.map((item, i) => (
                    <span key={i} className="stock-tag">
                      {item.size} · {item.stockAmount}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Product modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        dialogClassName="shop-modal rair-modal"
      >
        {selectedProduct && (
          <>
            <Modal.Header closeButton>
              <p className="shop-modal__name">{selectedProduct.name}</p>
            </Modal.Header>
            <Modal.Body>
              <img
                className="shop-modal__img"
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
              />
              <p className="shop-modal__price">${selectedProduct.price}</p>
              {selectedProduct.onSale && (
                <p className="shop-modal__sale">Sale ${selectedProduct.salePrice}</p>
              )}
              <p className="shop-modal__desc">{selectedProduct.description}</p>

              <div className="rair-field">
                <label className="rair-label" htmlFor="size-select">Size</label>
                <select
                  id="size-select"
                  className="rair-select"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  <option value="">Select a size</option>
                  {selectedProduct.stock.map((item, idx) => (
                    <option key={idx} value={item.size}>
                      {item.size} — {item.stockAmount} in stock
                    </option>
                  ))}
                </select>
              </div>

              <div className="rair-field">
                <label className="rair-label" htmlFor="qty-input">Quantity</label>
                <input
                  id="qty-input"
                  type="number"
                  className="rair-input"
                  min={1}
                  max={
                    selectedProduct.stock.find((i) => i.size === selectedSize)
                      ?.stockAmount || 10
                  }
                  value={selectedQuantity}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    const max =
                      selectedProduct.stock.find((i) => i.size === selectedSize)
                        ?.stockAmount || 10;
                    setSelectedQuantity(Math.min(Math.max(v, 1), max));
                  }}
                />
              </div>

              {feedback && (
                <p
                  className="rair-error"
                  role="alert"
                  style={{ color: feedback.startsWith("Added") ? "var(--rair-primary)" : undefined }}
                >
                  {feedback}
                </p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <button
                type="button"
                className="btn-rair btn-rair-ghost"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-rair btn-rair-primary"
                disabled={!selectedSize || adding}
                onClick={handleAddToCart}
              >
                {adding ? "Adding…" : "Add to Cart"}
              </button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Shop;
