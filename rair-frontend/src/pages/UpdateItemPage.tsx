import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Modal, Button, Container, Row, Col, Form } from "react-bootstrap";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateItemSchema, TUpdateItemSchema } from "../schemas/TupdateItemSchemas";
import { loadProducts } from "../api/loadProducts";
import { updateProduct } from "../api/updateProduct";
import { deleteProduct } from "../api/deleteProduct";
import ProductCard from "../components/ProductCard";
import { Product } from "../types/Product";
import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "../api/config";

const FOLDERS = ["crew-neck", "hoodies", "knitwear", "shirts"];

const UpdateItemPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Cloudinary picker state
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [folderImages, setFolderImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

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

  const { fields, append, remove } = useFieldArray({ control, name: "stock" });

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

  const loadImages = async (f: string) => {
    setLoadingImages(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`${API_BASE_URL}/images?folder=${f}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFolderImages(Array.isArray(data) ? data : (data.urls ?? []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    if (showModal) loadImages(folder);
  }, [folder, showModal]);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedImageUrl(product.imageUrl || null);
    setFolder(FOLDERS[0]);

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
    setSelectedImageUrl(null);
    setFolderImages([]);
  };

  const onSubmit = async (data: TUpdateItemSchema) => {
    if (!selectedProduct) {
      alert("No product selected.");
      return;
    }
    if (!selectedImageUrl) {
      alert("Please select an image.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image, ...rest } = data;

    const updatedProduct = {
      productId: selectedProduct.productId,
      ...rest,
      imageUrl: selectedImageUrl,
    };

    const result = await updateProduct(updatedProduct);
    if (!result) {
      alert("Failed to update product.");
      return;
    }

    alert("Product updated successfully!");
    handleClose();
    await loadAndSetProducts();
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

      const response = await deleteProduct(productToDelete.productId);
      if (!response) throw new Error("Failed to delete product.");

      alert("Product deleted successfully.");
      await loadAndSetProducts();
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
            <ProductCard product={product} openModal={openModal} handleDelete={handleDelete} />
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" {...register("name")} isInvalid={!!errors.name} />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control type="text" {...register("category")} isInvalid={!!errors.category} />
              <Form.Control.Feedback type="invalid">{errors.category?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} {...register("description")} isInvalid={!!errors.description} />
              <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price ($)</Form.Label>
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
                      <option key={s} value={s}>{s}</option>
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
            ))}
            <Button variant="secondary" className="mb-3" onClick={() => append({ size: "M", stockAmount: 0 })}>
              Add Stock
            </Button>

            {/* Cloudinary image picker */}
            <Form.Group className="mb-3">
              <Form.Label>Image Folder</Form.Label>
              <Form.Select value={folder} onChange={e => { setFolder(e.target.value); setSelectedImageUrl(null); }}>
                {FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
              </Form.Select>
            </Form.Group>

            {loadingImages ? (
              <p>Loading images…</p>
            ) : (
              <div className="mb-3">
                <Form.Label>Select an image</Form.Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {folderImages.map(url => (
                    <img
                      key={url}
                      src={url}
                      alt=""
                      onClick={() => setSelectedImageUrl(url)}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        cursor: "pointer",
                        border: selectedImageUrl === url ? "3px solid #0d6efd" : "3px solid transparent",
                        borderRadius: "6px",
                      }}
                    />
                  ))}
                </div>
                {folderImages.length === 0 && <p className="text-muted">No images found in this folder.</p>}
              </div>
            )}

            {selectedImageUrl && (
              <div className="mb-3">
                <Form.Label>Selected Image</Form.Label><br />
                <img src={selectedImageUrl} alt="Selected" style={{ maxWidth: "150px", borderRadius: "6px" }} />
              </div>
            )}

            <Button type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? "Updating…" : "Update Product"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UpdateItemPage;
