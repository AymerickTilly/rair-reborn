// src/pages/Shop.tsx
import { useEffect, useState } from "react";
import { loadProducts } from "../api/loadProducts";
import {
  Col,
  Container,
  Row,
  Card,
  Button,
  Modal,
  Image,
  Form,
} from "react-bootstrap";
import { Product } from "../types/Product";
import { addToCart } from "../api/addCart";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "../auth/AuthStore";
import "../components/Shopstyling.css";
import backgroundImage from "../assets/background-texture.png";
import { loadProductById } from "../api/loadProduct";

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const userId = useAuthStore((state) => state.userId); // ✅ Using Option 1

  useEffect(() => {
    loadProducts()
      .then(setProducts)
      .catch(console.error);
  }, []);

  const handleCardClick = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setSelectedQuantity(1);
    setShowModal(true);
  };

  const handleAddToCart = async () => {
    if (!selectedProduct || !selectedSize) {
      alert("Please select a product and size.");
      return;
    }

    try {
      const latestProduct = await loadProductById(selectedProduct.productId);
      const selectedStock = latestProduct.stock.find(
        (item: { size: string; }) => item.size === selectedSize
      );

      if (!selectedStock) {
        alert(`Size ${selectedSize} is no longer available.`);
        return;
      }

      if (selectedQuantity > selectedStock.stockAmount) {
        if (selectedStock.stockAmount === 0) {
          alert(`The stock for size ${selectedSize} is empty, please wait until next supply`);
        } else {
          alert(`Only ${selectedStock.stockAmount} in stock for size ${selectedSize}. Please adjust quantity.`);
        }
        return;
      }

      const cartId = uuidv4();

      const cartItem = {
        userId,
        cartId,
        productId: selectedProduct.productId,
        name: selectedProduct.name,
        price: selectedProduct.price,
        size: selectedSize,
        quantity: selectedQuantity,
        imageUrl: selectedProduct.imageUrl,
      };

      const response = await addToCart(cartItem);
      console.log("Cart item added:", response);
      alert("Item added to cart!");
      setShowModal(false);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart.");
    }
  };

  return (
    <div
      className="shop-container"
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: "none",
        backgroundBlendMode: "overlay",
      }}
    >
      <Container className="py-4">
        <Row className="g-4 d-flex align-items-stretch">
          <Form className="mb-4">
            <Form.Control
              type="text"
              placeholder="Search for clothes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form>

          {products
            .filter((product) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((product) => (
              <Col
                key={product.productId}
                xs={12}
                sm={6}
                md={4}
                className="d-flex h-100"
              >
                <Card
                  className="shop-card shadow-sm h-100 w-100 d-flex flex-column"
                  onClick={() => handleCardClick(product)}
                  style={{ cursor: "pointer" }}
                >
                  <Card.Body className="d-flex flex-column justify-content-between flex-grow-1">
                    <div>
                      <Card.Title
                        className="fw-bold fs-5 text-center"
                        style={{ minHeight: "3rem" }}
                      >
                        {product.name}
                      </Card.Title>

                      <Card.Text
                        style={{
                          maxHeight: "60px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {product.description}
                      </Card.Text>

                      <div className="text-center mb-2">
                        <Card.Img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{
                            maxWidth: "150px",
                            maxHeight: "150px",
                            objectFit: "contain",
                          }}
                        />
                      </div>

                      <Card.Text className="fw-bold">
                        Price: ${product.price}
                      </Card.Text>
                      {product.onSale && (
                        <Card.Text className="text-danger">
                          Sale Price: ${product.salePrice}
                        </Card.Text>
                      )}
                    </div>

                    <div>
                      <strong>Stock:</strong>
                      <div
                        className="mt-1 mb-2"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "0.25rem",
                        }}
                      >
                        {product.stock.map((item, index) => (
                          <span
                            key={index}
                            className="shop-stock-tag border rounded px-2 py-1 text-muted small text-truncate"
                          >
                            {item.size} – {item.stockAmount}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Row>
      </Container>

      {/* Product Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        {selectedProduct && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedProduct.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="text-center mb-3">
                <Image
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  style={{ maxHeight: "200px", objectFit: "contain" }}
                  fluid
                />
              </div>
              <p>{selectedProduct.description}</p>
              <p>
                <strong>Price:</strong> ${selectedProduct.price}
              </p>
              {selectedProduct.onSale && (
                <p className="text-danger">
                  <strong>Sale Price:</strong> ${selectedProduct.salePrice}
                </p>
              )}
              <Form.Group controlId="sizeSelect" className="mb-3">
                <Form.Label>
                  <strong>Select Size</strong>
                </Form.Label>
                <Form.Select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  <option value="">Select a size</option>
                  {selectedProduct.stock.map((item, idx) => (
                    <option key={idx} value={item.size}>
                      {item.size} – {item.stockAmount} in stock
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group controlId="quantityInput">
                <Form.Label>
                  <strong>Quantity</strong>
                </Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={
                    selectedProduct.stock.find(
                      (item) => item.size === selectedSize
                    )?.stockAmount || 10
                  }
                  value={selectedQuantity}
                  onChange={(e) => {
                    const inputQuantity = Number(e.target.value);
                    const maxStock =
                      selectedProduct.stock.find(
                        (item) => item.size === selectedSize
                      )?.stockAmount || 10;

                    if (inputQuantity > maxStock) {
                      setSelectedQuantity(maxStock);
                    } else if (inputQuantity < 1) {
                      setSelectedQuantity(1);
                    } else {
                      setSelectedQuantity(inputQuantity);
                    }
                  }}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                className="shop-secondary-button"
                onClick={() => setShowModal(false)}
              >
                Close
              </Button>
              <Button
                className="shop-button"
                disabled={!selectedSize}
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Shop;
