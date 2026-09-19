import { cldImage } from '../lib/cloudinary';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { useAuthStore } from '../auth/AuthStore';
import { loadUserById } from '../api/loadUser';
import { User } from '../types/User';
import { ProductItem } from '../interface/ProductItem';
import { addOrder } from '../api/addOrder';
import { useToastStore } from '../stores/toastStore';

interface CheckoutLocationState {
  selectedItems: ProductItem[];
}

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: CheckoutLocationState | undefined };
  const [address, setAddress] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [placing, setPlacing] = useState(false);
  const { userId } = useAuthStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (!state || !Array.isArray(state.selectedItems)) {
      navigate('/cart');
      return;
    }
    const sanitized = state.selectedItems.filter(
      (item): item is ProductItem =>
        typeof item.unitPrice === 'number' &&
        typeof item.quantity === 'number' &&
        typeof item.name === 'string'
    );
    setProducts(sanitized);
  }, [state, navigate]);

  useEffect(() => {
    if (!userId) return;
    loadUserById(userId)
      .then((u: User | null) => { if (u?.address) setAddress(u.address); })
      .catch(console.error);
  }, [userId]);

  const itemTotal = (p: ProductItem) => (p.unitPrice * p.quantity).toFixed(2);
  const grandTotal = () =>
    products.reduce((s, p) => s + p.unitPrice * p.quantity, 0).toFixed(2);

  const confirmPayment = async () => {
    if (!userId) return;
    setPlacing(true);
    try {
      // The API checks and decrements stock, prices the items and clears them from the cart.
      const order = await addOrder({
        shippingAddress: address,
        paymentMethod: selectedBank,
        products: products.map(p => ({
          cartId: p.cartId,
          productId: p.id,
          size: p.size[0],
          quantity: p.quantity,
        })),
      });
      navigate('/listOrdersPage', { state: { orderId: order.orderId } });
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not place the order. Please try again.', 'error');
    } finally {
      setPlacing(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <main className="page-shell" id="main-content">
      <div className="page-shell__inner page-shell__inner--narrow">
        <header className="page-shell__header">
          <button
            type="button"
            className="btn-rair btn-rair-ghost"
            onClick={() => navigate('/cart')}
          >
            ← Cart
          </button>
          <h1 className="page-shell__title">Checkout</h1>
        </header>

        {/* Shipping */}
        <section className="checkout-section">
          <h2 className="checkout-section__heading">Shipping address</h2>
          <p className="checkout-section__value">{address || 'No address on file'}</p>
        </section>

        {/* Items */}
        <section className="checkout-section">
          <h2 className="checkout-section__heading">Order summary</h2>
          <div className="checkout-items">
            {products.map(p => (
              <div key={p.id} className="checkout-item">
                <img
                  src={cldImage(p.image, 200)}
                  alt={p.name}
                  className="checkout-item__img"
                  loading="lazy"
                />
                <div className="checkout-item__info">
                  <p className="checkout-item__name">{p.name}</p>
                  <p className="checkout-item__meta">Size: {p.size?.[0] ?? '—'}</p>
                  <p className="checkout-item__meta">Qty: {p.quantity}</p>
                </div>
                <p className="checkout-item__total">${itemTotal(p)}</p>
              </div>
            ))}
          </div>
          <div className="checkout-grand">
            <span>Total</span>
            <span className="checkout-grand__amount">${grandTotal()}</span>
          </div>
        </section>

        {/* Payment */}
        <section className="checkout-section">
          <h2 className="checkout-section__heading">Payment method</h2>
          <div className="rair-field">
            <label className="rair-label" htmlFor="bank-select">Select bank</label>
            <select
              id="bank-select"
              className="rair-select"
              value={selectedBank}
              onChange={e => setSelectedBank(e.target.value)}
            >
              <option value="">— Select a bank —</option>
              <option value="Bank A">Bank A</option>
              <option value="Bank B">Bank B</option>
              <option value="Bank C">Bank C</option>
            </select>
          </div>
        </section>

        <button
          type="button"
          className="btn-rair btn-rair-primary"
          disabled={!address || !selectedBank || placing}
          onClick={() => setShowConfirmModal(true)}
          style={{ width: '100%', marginTop: '2rem' }}
        >
          {placing ? 'Placing order…' : 'Place order'}
        </button>
      </div>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontWeight: 300, color: 'var(--rair-muted)' }}>
            Total: <strong style={{ color: 'var(--rair-ink)' }}>${grandTotal()}</strong>
            {' '}via {selectedBank}
          </p>
          <p style={{ fontWeight: 300, color: 'var(--rair-muted)', fontSize: '0.875rem' }}>
            Shipping to: {address}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn-rair btn-rair-ghost"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-rair btn-rair-primary"
            onClick={confirmPayment}
            disabled={placing}
          >
            {placing ? 'Placing…' : 'Confirm'}
          </button>
        </Modal.Footer>
      </Modal>
    </main>
  );
};

export default Checkout;
