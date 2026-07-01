import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { addItemSchema, TAddItemSchema } from "../schemas/TaddItemSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { addProduct } from "../api/addProduct";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router";
import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "../api/config";

const FOLDERS = ["crew-neck", "hoodies", "knitwear", "shirts"];

const AddItemPage = () => {
  const [selectedImageUrl, setSelectedImageUrl] = React.useState<string | null>(null);
  const [folder, setFolder] = React.useState(FOLDERS[0]);
  const [folderImages, setFolderImages] = React.useState<string[]>([]);
  const [loadingImages, setLoadingImages] = React.useState(false);
  const navigate = useNavigate();

  const loadImages = async (f: string) => {
    setLoadingImages(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`${API_BASE_URL}/images?folder=${f}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFolderImages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingImages(false);
    }
  };

  React.useEffect(() => { loadImages(folder); }, [folder]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TAddItemSchema>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      stock: [{ size: "M", stockAmount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "stock" });

  const backToAdminBoard = () => {
    reset();
    setSelectedImageUrl(null);
    navigate("/admin");
  };

  const onSubmit = async (data: TAddItemSchema) => {
    if (!selectedImageUrl) {
      alert("Please select an image from Cloudinary.");
      return;
    }
    const productId = uuidv4();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image, ...rest } = data;
    try {
      await addProduct({ productId, ...rest, imageUrl: selectedImageUrl });
      alert("Product added!");
      reset();
      setSelectedImageUrl(null);
      navigate("/admin");
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to add product.");
    }
  };

  return (
    <Container className="my-5">
      <h2>Add New Product</h2>
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
            <Col md={3}>
              <Form.Label>Size</Form.Label>
              <Form.Select {...register(`stock.${index}.size` as const)}>
                {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
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
                    width: "120px",
                    height: "120px",
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
            <img src={selectedImageUrl} alt="Selected" style={{ maxWidth: "200px", borderRadius: "6px" }} />
          </div>
        )}

        <Button type="submit" className="w-100" disabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : "Add Product"}
        </Button>

        <Button variant="danger" className="mt-3 w-100" onClick={backToAdminBoard}>
          Cancel & Return to Admin
        </Button>
      </Form>
    </Container>
  );
};

export default AddItemPage;
