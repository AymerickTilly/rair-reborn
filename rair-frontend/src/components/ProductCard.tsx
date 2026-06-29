// src/components/ProductCard.tsx
import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { Product } from "../types/Product";

interface ProductCardProps {
  product: Product;
  openModal: (product: Product) => void;
  handleDelete: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  openModal,
  handleDelete,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="shadow-sm h-100">
      <Card.Body className="d-flex flex-column justify-content-between">
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

        <div className="d-flex flex-column gap-2 mt-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => openModal(product)}
          >
            Update
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(product.productId)}
          >
            Delete
          </Button>
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

export default ProductCard;
