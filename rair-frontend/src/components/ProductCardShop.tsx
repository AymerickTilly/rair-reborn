// src/components/ProductCardShop.tsx
import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { Product } from "../types/Product";

interface ProductCardShopProps {
  product: Product;
}

const ProductCardShop: React.FC<ProductCardShopProps> = ({ product }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="shadow-sm h-100 d-flex flex-column">
      {/* Card fills height and is flex column */}

      <Card.Body className="d-flex flex-column justify-content-between flex-grow-1">
        {/* Card.Body fills available height */}

        <div>
          <Card.Title
            className="fw-bold fs-5 text-center"
            style={{ minHeight: "3rem" }}
          >
            {product.name}
          </Card.Title>

          <Card.Text
            style={{
              maxHeight: expanded ? "none" : "60px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: expanded ? "normal" : "nowrap",
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

          <Card.Text className="fw-bold">Price: ${product.price}</Card.Text>

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
                className="border rounded px-2 py-1 text-muted small text-truncate"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.size} – {item.stockAmount}
              </span>
            ))}
          </div>

          <Button
            variant="link"
            size="sm"
            onClick={() => setExpanded((prev) => !prev)}
            style={{ paddingLeft: 0 }}
          >
            {expanded ? "Show Less" : "Read More"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCardShop;
