import { cldImage } from '../lib/cloudinary';
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Modal } from "react-bootstrap";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateItemSchema, TUpdateItemSchema } from "../schemas/TupdateItemSchemas";
import { loadProducts } from "../api/loadProducts";
import { updateProduct } from "../api/updateProduct";
import { deleteProduct } from "../api/deleteProduct";
import ProductCard from "../components/ProductCard";
import { Product } from "../types/Product";
import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "../api/config";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../stores/toastStore";
import Spinner from "../components/Spinner";

const FOLDERS = ["crew-neck", "hoodies", "knitwear", "shirts"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const UpdateItemPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [folderImages, setFolderImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const {
    register, handleSubmit, control, reset, setValue,
    formState: { errors, isSubmitting },
  } = useForm<TUpdateItemSchema>({
    resolver: zodResolver(updateItemSchema),
    defaultValues: { stock: [{ size: "M", stockAmount: 0 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "stock" });

  const loadAndSetProducts = async () => {
    try { setProducts(await loadProducts()); }
    catch (err) { console.error(err); }
    finally { setProductsLoading(false); }
  };

  useEffect(() => { loadAndSetProducts(); }, []);

  const loadImages = async (f: string) => {
    setLoadingImages(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`${API_BASE_URL}/images?folder=${f}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFolderImages(Array.isArray(data) ? data : (data.urls ?? []));
    } catch (e) { console.error(e); }
    finally { setLoadingImages(false); }
  };

  useEffect(() => { if (showModal) loadImages(folder); }, [folder, showModal]);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedImageUrl(product.imageUrl || null);
    setFolder(FOLDERS[0]);
    setValue("name", product.name);
    setValue("category", product.category);
    setValue("description", product.description);
    setValue("price", product.price);
    setValue("stock", product.stock.map(item => ({
      size: item.size as typeof SIZES[number],
      stockAmount: item.stockAmount,
    })));
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    reset();
    setSelectedImageUrl(null);
    setFolderImages([]);
  };

  const onSubmit = async (data: TUpdateItemSchema) => {
    if (!selectedProduct || !selectedImageUrl) {
      addToast("Please select an image.", 'error');
      return;
    }
    const result = await updateProduct({ productId: selectedProduct.productId, ...data, imageUrl: selectedImageUrl });
    if (!result) { addToast("Failed to update product.", 'error'); return; }
    addToast("Product updated successfully.", 'success');
    setTimeout(() => { handleClose(); loadAndSetProducts(); }, 700);
  };

  const handleDelete = async (productId: string) => {
    setConfirmDeleteId(productId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const p = products.find(x => x.productId === confirmDeleteId);
      if (!p) return;
      const ok = await deleteProduct(p.productId);
      if (!ok) throw new Error();
      addToast("Product deleted.", 'info');
      await loadAndSetProducts();
    } catch {
      addToast("Failed to delete product.", 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="page-shell" id="main-content">
      <div className="page-shell__inner">
        <header className="page-shell__header">
          <button type="button" className="btn-rair btn-rair-ghost" onClick={() => navigate("/admin")}>
            ← Admin
          </button>
          <h1 className="page-shell__title">Update Items</h1>
        </header>

        {/* Search */}
        <div style={{ marginBottom: '2.5rem' }}>
          <input
            className="rair-input"
            type="search"
            placeholder="Search products…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search products"
          />
        </div>

        {/* Product grid */}
        {productsLoading ? (
          <div className="shop__loading">
            <Spinner fullscreen={false} />
            <p className="shop__loading-label">Loading products…</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="page-shell__empty">No products found.</p>
        ) : (
          <div className="admin-product-grid">
            {filtered.map(p => (
              <ProductCard
                key={p.productId}
                product={p}
                openModal={openModal}
                handleDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <Modal show={!!confirmDeleteId} onHide={() => setConfirmDeleteId(null)} centered dialogClassName="rair-modal">
        <Modal.Header closeButton>
          <Modal.Title>Delete product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: 'var(--rair-ink)', marginBottom: '1.5rem' }}>
            This will permanently remove the product. This cannot be undone.
          </p>
          <div className="admin-form__actions">
            <button type="button" className="btn-rair btn-rair-danger" style={{ flex: 1 }} onClick={confirmDelete}>
              Delete permanently
            </button>
            <button type="button" className="btn-rair btn-rair-ghost" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Edit modal */}
      <Modal show={showModal} onHide={handleClose} size="lg" centered dialogClassName="rair-modal">
        <Modal.Header closeButton>
          <Modal.Title>Edit product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="admin-form">
            <div className="rair-field">
              <label className="rair-label" htmlFor="upd-name">Name</label>
              <input id="upd-name" type="text" className="rair-input" {...register("name")} />
              {errors.name && <p className="rair-error">{errors.name.message}</p>}
            </div>

            <div className="rair-field">
              <label className="rair-label" htmlFor="upd-category">Category</label>
              <input id="upd-category" type="text" className="rair-input" {...register("category")} />
              {errors.category && <p className="rair-error">{errors.category.message}</p>}
            </div>

            <div className="rair-field">
              <label className="rair-label" htmlFor="upd-desc">Description</label>
              <textarea
                id="upd-desc"
                className="rair-input"
                rows={3}
                style={{ resize: 'vertical' }}
                {...register("description")}
              />
              {errors.description && <p className="rair-error">{errors.description.message}</p>}
            </div>

            <div className="rair-field">
              <label className="rair-label" htmlFor="upd-price">Price ($)</label>
              <input id="upd-price" type="number" step="0.01" className="rair-input" {...register("price")} />
              {errors.price && <p className="rair-error">{errors.price.message}</p>}
            </div>

            <div className="admin-section-divider">
              <span className="admin-section-label">Stock</span>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="stock-row">
                <div className="rair-field" style={{ marginBottom: 0, flex: 1 }}>
                  <label className="rair-label" htmlFor={`upd-size-${index}`}>Size</label>
                  <select id={`upd-size-${index}`} className="rair-select" {...register(`stock.${index}.size` as const)}>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="rair-field" style={{ marginBottom: 0, flex: 1 }}>
                  <label className="rair-label" htmlFor={`upd-qty-${index}`}>Qty</label>
                  <input id={`upd-qty-${index}`} type="number" className="rair-input" {...register(`stock.${index}.stockAmount` as const)} />
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
              style={{ marginBottom: '2rem' }}
              onClick={() => append({ size: "M", stockAmount: 0 })}
            >
              + Add size
            </button>

            <div className="admin-section-divider">
              <span className="admin-section-label">Image</span>
            </div>

            <div className="rair-field">
              <label className="rair-label" htmlFor="upd-folder">Cloudinary folder</label>
              <select
                id="upd-folder"
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
                <img src={cldImage(selectedImageUrl, 300)} alt="Selected" className="image-picker__preview-img" />
              </div>
            )}

            <div className="admin-form__actions">
              <button
                type="submit"
                className="btn-rair btn-rair-primary"
                disabled={isSubmitting}
                style={{ flex: 1 }}
              >
                {isSubmitting ? "Saving…" : "Save changes"}
              </button>
              <button type="button" className="btn-rair btn-rair-ghost" onClick={handleClose}>
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </main>
  );
};

export default UpdateItemPage;
