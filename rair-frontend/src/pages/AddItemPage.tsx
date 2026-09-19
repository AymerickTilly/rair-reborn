import { cldImage } from '../lib/cloudinary';
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { addItemSchema, TAddItemSchema } from "../schemas/TaddItemSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { addProduct } from "../api/addProduct";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router";
import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "../api/config";
import { useToastStore } from "../stores/toastStore";

const FOLDERS = ["crew-neck", "hoodies", "knitwear", "shirts"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const AddItemPage = () => {
  const [selectedImageUrl, setSelectedImageUrl] = React.useState<string | null>(null);
  const [folder, setFolder] = React.useState(FOLDERS[0]);
  const [folderImages, setFolderImages] = React.useState<string[]>([]);
  const [loadingImages, setLoadingImages] = React.useState(false);
  const navigate = useNavigate();
  const { addToast } = useToastStore();

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

  React.useEffect(() => { loadImages(folder); }, [folder]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TAddItemSchema>({
    resolver: zodResolver(addItemSchema),
    defaultValues: { stock: [{ size: "M", stockAmount: 0 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "stock" });

  const onSubmit = async (data: TAddItemSchema) => {
    if (!selectedImageUrl) {
      addToast("Please select an image from Cloudinary.", 'error');
      return;
    }
    try {
      const result = await addProduct({ productId: uuidv4(), ...data, imageUrl: selectedImageUrl });
      if (!result) {
        // addProduct returns null on any failure (for example a size listed twice)
        addToast("Failed to add product. Check the form (each size can only be listed once) and try again.", 'error');
        return;
      }
      addToast("Product added successfully.", 'success');
      reset();
      setSelectedImageUrl(null);
      setTimeout(() => navigate("/admin"), 900);
    } catch {
      addToast("Failed to add product. Please try again.", 'error');
    }
  };

  return (
    <main className="page-shell" id="main-content">
      <div className="page-shell__inner page-shell__inner--narrow">
        <header className="page-shell__header">
          <button type="button" className="btn-rair btn-rair-ghost" onClick={() => navigate("/admin")}>
            ← Admin
          </button>
          <h1 className="page-shell__title">Add Item</h1>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="admin-form">
          {/* Name */}
          <div className="rair-field">
            <label className="rair-label" htmlFor="add-name">Name</label>
            <input id="add-name" type="text" className="rair-input" {...register("name")} />
            {errors.name && <p className="rair-error">{errors.name.message}</p>}
          </div>

          {/* Category */}
          <div className="rair-field">
            <label className="rair-label" htmlFor="add-category">Category</label>
            <input id="add-category" type="text" className="rair-input" {...register("category")} />
            {errors.category && <p className="rair-error">{errors.category.message}</p>}
          </div>

          {/* Description */}
          <div className="rair-field">
            <label className="rair-label" htmlFor="add-desc">Description</label>
            <textarea
              id="add-desc"
              className="rair-input"
              rows={4}
              style={{ resize: 'vertical' }}
              {...register("description")}
            />
            {errors.description && <p className="rair-error">{errors.description.message}</p>}
          </div>

          {/* Price */}
          <div className="rair-field">
            <label className="rair-label" htmlFor="add-price">Price ($)</label>
            <input id="add-price" type="number" step="0.01" className="rair-input" {...register("price")} />
            {errors.price && <p className="rair-error">{errors.price.message}</p>}
          </div>

          {/* Stock */}
          <div className="admin-section-divider">
            <span className="admin-section-label">Stock</span>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="stock-row">
              <div className="rair-field" style={{ marginBottom: 0, flex: 1 }}>
                <label className="rair-label" htmlFor={`size-${index}`}>Size</label>
                <select id={`size-${index}`} className="rair-select" {...register(`stock.${index}.size` as const)}>
                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="rair-field" style={{ marginBottom: 0, flex: 1 }}>
                <label className="rair-label" htmlFor={`qty-${index}`}>Qty</label>
                <input id={`qty-${index}`} type="number" className="rair-input" {...register(`stock.${index}.stockAmount` as const)} />
              </div>
              <button
                type="button"
                className="btn-rair btn-rair-danger stock-row__remove"
                onClick={() => remove(index)}
                aria-label="Remove size"
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn-rair btn-rair-ghost"
            style={{ marginBottom: '2.5rem' }}
            onClick={() => append({ size: "M", stockAmount: 0 })}
          >
            + Add size
          </button>

          {/* Image picker */}
          <div className="admin-section-divider">
            <span className="admin-section-label">Image</span>
          </div>

          <div className="rair-field">
            <label className="rair-label" htmlFor="add-folder">Cloudinary folder</label>
            <select
              id="add-folder"
              className="rair-select"
              value={folder}
              onChange={e => { setFolder(e.target.value); setSelectedImageUrl(null); }}
            >
              {FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {loadingImages ? (
            <p className="admin-loading">Loading images&hellip;</p>
          ) : folderImages.length === 0 ? (
            <p className="admin-empty">No images in this folder.</p>
          ) : (
            <div className="image-picker" role="listbox" aria-label="Select image">
              {folderImages.map(url => (
                <button
                  key={url}
                  type="button"
                  role="option"
                  aria-selected={selectedImageUrl === url}
                  className={`image-picker__btn${selectedImageUrl === url ? ' image-picker__btn--selected' : ''}`}
                  onClick={() => setSelectedImageUrl(url)}
                >
                  <img src={cldImage(url, 240)} alt="" className="image-picker__img" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {selectedImageUrl && (
            <div className="image-picker__preview">
              <p className="rair-label">Selected</p>
              <img src={cldImage(selectedImageUrl, 300)} alt="Selected product" className="image-picker__preview-img" />
            </div>
          )}

          <div className="admin-form__actions">
            <button type="submit" className="btn-rair btn-rair-primary" disabled={isSubmitting} style={{ flex: 1 }}>
              {isSubmitting ? "Adding…" : "Add product"}
            </button>
            <button type="button" className="btn-rair btn-rair-ghost" onClick={() => navigate("/admin")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AddItemPage;
