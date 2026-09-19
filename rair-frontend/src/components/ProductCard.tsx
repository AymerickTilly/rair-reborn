import { cldImage } from '../lib/cloudinary';
import { Product } from "../types/Product";

interface ProductCardProps {
  product: Product;
  openModal: (product: Product) => void;
  handleDelete: (productId: string) => void;
}

const ProductCard = ({ product, openModal, handleDelete }: ProductCardProps) => (
  <div className="admin-product-card">
    <div className="admin-product-card__img-wrap">
      <img
        src={cldImage(product.imageUrl, 500)}
        alt={product.name}
        className="admin-product-card__img"
        loading="lazy"
      />
    </div>
    <div className="admin-product-card__body">
      <p className="admin-product-card__name">{product.name}</p>
      <p className="admin-product-card__price">${product.price}</p>
      <p className="admin-product-card__category">{product.category}</p>
      <div className="admin-product-card__stock">
        {product.stock.map((s, i) => (
          <span key={i} className="stock-tag">{s.size} · {s.stockAmount}</span>
        ))}
      </div>
    </div>
    <div className="admin-product-card__actions">
      <button
        type="button"
        className="btn-rair btn-rair-outline"
        onClick={() => openModal(product)}
        style={{ flex: 1 }}
      >
        Edit
      </button>
      <button
        type="button"
        className="btn-rair btn-rair-danger"
        onClick={() => handleDelete(product.productId)}
        style={{ flex: 1 }}
      >
        Delete
      </button>
    </div>
  </div>
);

export default ProductCard;
