import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { addItemSchema, TAddItemSchema } from "../schemas/TaddItemSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { uploadImage } from "../api/uploadImage";
import { addProduct } from "../api/addProduct";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router";

const AddItemPage = () => {
  const [uploadedImageUrl, setUploadedImageUrl] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const backToAdminBoard = () => {
    reset();
    setUploadedImageUrl(null);
    navigate("/admin");
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TAddItemSchema>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      stock: [{ size: "M",  stockAmount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "stock",
  });

  const onSubmit = async (data: TAddItemSchema) => {

  const productId = uuidv4();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { image, ...rest } = data;

  if (!data.image) {
    alert("Please select an image.");
    return;
  }

  try {
    const imageUrl = await uploadImage(data.image[0]); // Upload image first

    if (!imageUrl) {
      alert("Image upload failed.");
      reset();
      return;
    }

    const productData = {
      productId,
      ...rest,
      imageUrl,
    };

    await addProduct(productData); // Then POST to DynamoDB
    // change here to show a message product added:
    reset();
    setUploadedImageUrl(null);
  } catch (err) {
    console.error("Error adding product:", err);
    alert("Failed to add product.");
    reset();
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
          <Form.Control
            as="textarea"
            rows={3}
            {...register("description")}
            isInvalid={!!errors.description}
          />
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
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" {...register(`stock.${index}.stockAmount` as const)} />
            </Col>
            <Col md={2}>
              <Button variant="danger" onClick={() => remove(index)}>
                Remove
              </Button>
            </Col>
          </Row>
        ))}
        <Button
          variant="secondary"
          className="mb-3"
          onClick={() => append({ size: "M", stockAmount: 0 })}
        >
          Add Stock
        </Button>

        <Form.Group className="mb-3">
          <Form.Label>Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            {...register("image")}
            isInvalid={!!errors.image}
          />
          <Form.Control.Feedback type="invalid">{errors.image?.message as string}</Form.Control.Feedback>
          {uploadedImageUrl && (
            <div className="mt-2">
              <strong>Uploaded Image Preview:</strong>
              <br />
              <img src={uploadedImageUrl} alt="Uploaded" style={{ maxWidth: "200px", marginTop: "10px" }} />
            </div>
          )}
        </Form.Group>

        <Button type="submit" className="w-100">
          {isSubmitting ? "Submitting..." : "Add Product"}
        </Button>

        <Button
          variant="danger"
          className="mt-3 w-100"
          onClick={backToAdminBoard}
          >
          Cancel & Return to Admin
        </Button>

      </Form>
    </Container>
  );
};

export default AddItemPage;
