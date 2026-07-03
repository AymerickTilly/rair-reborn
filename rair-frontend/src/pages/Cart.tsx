import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';
import { loadCartsByID } from '../api/loadCarts';
import { Cart } from '../types/Cart';
import { deleteCart } from '../api/deleteCart';
import Spinner from '../components/Spinner';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId, loading } = useAuthStore();
  const [carts, setCarts] = useState<Cart[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoadingCarts, setIsLoadingCarts] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setIsLoadingCarts(true);
    loadCartsByID(userId)
      .then(setCarts)
      .catch((err) => console.error("Failed to load cart:", err))
      .finally(() => setIsLoadingCarts(false));
  }, [userId]);

  const toggleAll = () =>
    setSelectedIds(selectedIds.length === carts.length ? [] : carts.map(c => c.cartId));

  const toggleOne = (cartId: string) =>
    setSelectedIds(prev =>
      prev.includes(cartId) ? prev.filter(id => id !== cartId) : [...prev, cartId]
    );

  const changeQty = (cartId: string, qty: number) => {
    if (qty < 1) return;
    setCarts(prev => prev.map(c => c.cartId === cartId ? { ...c, quantity: qty } : c));
  };

  const handleDelete = async (cart: Cart) => {
    const ok = await deleteCart(cart);
    if (ok) {
      setCarts(prev => prev.filter(c => c.cartId !== cart.cartId));
      setSelectedIds(prev => prev.filter(id => id !== cart.cartId));
    }
  };

  const subtotal = (item: Cart) => item.price * item.quantity;
  const total = carts
    .filter(c => selectedIds.includes(c.cartId))
    .reduce((sum, c) => sum + subtotal(c), 0)
    .toFixed(2);

  const selectedItems = carts
    .filter(c => selectedIds.includes(c.cartId))
    .map(item => ({
      cartId: item.cartId,
      id: item.productId,
      name: item.name,
      image: item.imageUrl,
      quantity: item.quantity,
      size: [item.size],
      unitPrice: item.price,
    }));

  if (loading || isLoadingCarts) return <Spinner />;

  return (
    <main className="page-shell" id="main-content">
      <div className="page-shell__inner">
        <header className="page-shell__header">
          <h1 className="page-shell__title">Cart</h1>
          {carts.length > 0 && (
            <button
              type="button"
              className="btn-rair btn-rair-ghost"
              onClick={toggleAll}
            >
              {selectedIds.length === carts.length ? 'Deselect all' : 'Select all'}
            </button>
          )}
        </header>

        {carts.length === 0 ? (
          <p className="page-shell__empty">Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-list">
              {carts.map(item => (
                <div key={item.cartId} className="cart-item">
                  <label className="cart-item__check-wrap">
                    <input
                      type="checkbox"
                      className="cart-item__checkbox"
                      checked={selectedIds.includes(item.cartId)}
                      onChange={() => toggleOne(item.cartId)}
                      aria-label={`Select ${item.name}`}
                    />
                  </label>

                  <div className="cart-item__img-wrap">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="cart-item__img"
                      loading="lazy"
                    />
                  </div>

                  <div className="cart-item__info">
                    <p className="cart-item__name">{item.name}</p>
                    <p className="cart-item__meta">
                      Size: <span>{item.size}</span>
                    </p>
                    <p className="cart-item__meta">
                      Unit: <span>${item.price.toFixed(2)}</span>
                    </p>
                  </div>

                  <div className="cart-item__controls">
                    <label className="rair-label" htmlFor={`qty-${item.cartId}`}>Qty</label>
                    <input
                      id={`qty-${item.cartId}`}
                      type="number"
                      className="rair-input cart-item__qty"
                      min={1}
                      value={item.quantity}
                      onChange={e => changeQty(item.cartId, parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <p className="cart-item__subtotal">${subtotal(item).toFixed(2)}</p>

                  <button
                    type="button"
                    className="btn-rair btn-rair-danger cart-item__remove"
                    onClick={() => handleDelete(item)}
                    aria-label={`Remove ${item.name}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-summary__total">
                <span className="cart-summary__label">Total</span>
                <span className="cart-summary__amount">${total}</span>
              </div>
              <button
                type="button"
                className="btn-rair btn-rair-primary"
                disabled={selectedIds.length === 0}
                onClick={() => navigate('/checkout', { state: { selectedItems } })}
              >
                Checkout ({selectedIds.length})
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default CartPage;
