import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Modal, Button, Container, Row, Col, Form } from "react-bootstrap";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateItemSchema, TUpdateItemSchema } from "../schemas/TupdateItemSchemas";
import { loadProducts } from "../api/loadProducts";
import { uploadImage } from "../api/uploadImage";
import { updateProduct } from "../api/updateProduct";
import { deleteImage } from "../api/deleteImage";
import { deleteProduct } from "../api/deleteProduct";
import ProductCard from "../components/ProductCard";
import { Product } from "../types/Product";


const UpdateItemPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TUpdateItemSchema>({
    resolver: zodResolver(updateItemSchema),
    defaultValues: {
      stock: [{ size: "M", stockAmount: 0 }],
    },
  });

  const filteredProducts = products.filter((product) =>
  product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: "stock",
  });
  
  const loadAndSetProducts = async () => {
    try {
      const loaded = await loadProducts();
      setProducts(loaded);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  useEffect(() => {
    loadAndSetProducts();
  }, []);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setUploadedImageUrl(product.imageUrl || null);

    setValue("name", product.name);
    setValue("category", product.category);
    setValue("description", product.description);
    setValue("price", product.price);
    setValue(
      "stock",
      product.stock.map((item) => ({
        size: item.size as "XS" | "S" | "M" | "L" | "XL" | "XXL",
        stockAmount: item.stockAmount,
      }))
    );
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    reset();
    setUploadedImageUrl(null);
  };

  const onSubmit = async (data: TUpdateItemSchema) => {
    if (!selectedProduct) {
      alert("No product selected.");
      return;
    }

    const productId = selectedProduct.productId;

    try {
      let imageUrl = uploadedImageUrl;

      if (data.image?.[0]) {
        if (selectedProduct.imageUrl) {
          const deleted = await deleteImage(selectedProduct.imageUrl);
          if (!deleted) {
            alert("Failed to delete old image.");
            return;
          }
        }

        imageUrl = await uploadImage(data.image[0]);
        if (!imageUrl) {
          alert("Image upload failed.");
          return;
        }
      } else if (!imageUrl) {
        alert("Please upload an image or keep the existing one.");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { image, ...rest } = data;

      const updatedProduct = {
        productId,
        ...rest,
        imageUrl,
      };

      const result = await updateProduct(updatedProduct);
      if (!result) {
        alert("Failed to update product.");
        return;
      }

      alert("Product updated successfully!");
      handleClose();
      await loadAndSetProducts(); // ✅ reload products after update
    } catch (err) {
      alert(`Failed to update product: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleDelete = async (productId: string) => {
  const confirmed = window.confirm("Are you sure you want to delete this product?");
  if (!confirmed) return;

  try {
    const productToDelete = products.find((p) => p.productId === productId);
    if (!productToDelete) {
      alert("Product not found.");
      return;
    }

    // Optionally delete the image
    if (productToDelete.imageUrl) {
      await deleteImage(productToDelete.imageUrl);
    }

    const response = await deleteProduct(productToDelete.productId); // now guaranteed to be string

    if (!response) {
      throw new Error("Failed to delete product.");
    }
    console.log("Product deleted properly")
    alert("Product deleted successfully.");
    await loadAndSetProducts(); // Refresh list
  } catch (err) {
    alert(`Error deleting product: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
};



  return (
      <Container className="py-4">
        <Form className="mb-4">
          <Form.Control
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form>
      <Row className="g-4">
      {filteredProducts.map((product) => (
      <Col key={product.productId} xs={12} sm={6} md={4}>
        <ProductCard
        product={product}
        openModal={openModal}
        handleDelete={handleDelete}
      />
      </Col>
      ))}
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>      
            <Form.Group className="mb-3 mt-3">
              {uploadedImageUrl && (
                <div className="mt-3 d-flex justify-content-center">
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded"
                    style={{ maxWidth: "150px", maxHeight: "200px", objectFit: "contain" }}
                  />
                </div>
              )}              
              <Form.Control type="file" accept="image/*" {...register("image")} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" {...register("name")} isInvalid={!!errors.name} />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} {...register("description")} isInvalid={!!errors.description} />
              <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" step="0.01" {...register("price")} isInvalid={!!errors.price} />
              <Form.Control.Feedback type="invalid">{errors.price?.message}</Form.Control.Feedback>
            </Form.Group>

            <h5>Stock</h5>
            {fields.map((field, index) => (
              <Row key={field.id} className="align-items-end mb-3">
                <Col md={5}>
                  <Form.Label>Size</Form.Label>
                  <Form.Select {...register(`stock.${index}.size` as const)}>
                    {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={5}>
                  <Form.Label>Amount</Form.Label>
                  <Form.Control type="number" {...register(`stock.${index}.stockAmount` as const)} />
                </Col>
                <Col md={2}>
                  <Button variant="danger" onClick={() => remove(index)}>Remove</Button>
                </Col>
              </Row>
            ))}<div className="mb-3">
                <Button
                  variant="secondary"
                  onClick={() => append({ size: "M", stockAmount: 0 })}
                  className="me-2">
                  Add Stock
                </Button>
              </div>
            <Button type="submit" className="w-100 ">
              {isSubmitting ? "Updating..." : "Update Product"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UpdateItemPage;
