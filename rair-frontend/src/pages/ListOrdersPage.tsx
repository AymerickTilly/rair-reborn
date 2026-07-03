import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';
import { Modal } from 'react-bootstrap';
import Spinner from '../components/Spinner';
import { loadOrders } from '../api/loadOrders';
import { loadProductById } from '../api/loadProduct';
import { updateOrder } from '../api/update_order';
import { updateProduct } from '../api/updateProduct';
import { Order, Product } from '../interface/Order';

const ListOrdersPage = () => {
  const { userId, groups } = useAuthStore();
  const isCustomer = groups.includes('Customer');
  const isAdmin = groups.includes('Admin');

  const { state } = useLocation();
  const orderIdFromState = (state as { orderId?: string })?.orderId;

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Order['status']>('All');
  const [statusUpdates, setStatusUpdates] = useState<Record<string, Order['status']>>({});
  const [orderToUpdate, setOrderToUpdate] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stockArrayToMap = (stock: { size: string; stockAmount: number }[]) =>
    stock.reduce<Record<string, number>>((acc, item) => {
      acc[item.size] = item.stockAmount;
      return acc;
    }, {});

  const refreshOrders = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const all = await loadOrders();
      setOrders(isAdmin ? all : all.filter((o: { userId: string }) => o.userId === userId));
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) refreshOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isAdmin, isCustomer, orderIdFromState]);

  const filtered = orders.filter(o => {
    const s = searchTerm.toLowerCase();
    return (
      (o.orderId.toLowerCase().includes(s) ||
        o.shippingAddress.toLowerCase().includes(s) ||
        o.username.toLowerCase().includes(s) ||
        o.products.some(p => p.name.toLowerCase().includes(s))) &&
      (statusFilter === 'All' || o.status === statusFilter)
    );
  });

  const itemTotal = (p: Product) => (p.unitPrice * p.quantity).toFixed(2);
  const grandTotal = (items: Product[]) =>
    items.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0).toFixed(2);

  const handleCancelClick = (id: string) => { setOrderToCancel(id); setShowCancelModal(true); };

  const confirmCancel = async () => {
    if (!orderToCancel) return;
    try {
      const ok = await updateOrder({ orderId: orderToCancel, status: 'CANCELLED' });
      if (!ok) throw new Error();
      const cancelled = orders.find(o => o.orderId === orderToCancel)!;
      await Promise.all(cancelled.products.map(async prod => {
        const pd = await loadProductById(prod.id);
        const map = stockArrayToMap(pd.stock);
        const updated = pd.stock.map((item: { size: string }) =>
          item.size === prod.size ? { ...item, stockAmount: (map[prod.size] || 0) + prod.quantity } : item
        );
        await updateProduct({ productId: prod.id, stock: updated });
      }));
      await refreshOrders();
    } catch { setError('Failed to cancel order.'); }
    finally { setShowCancelModal(false); setOrderToCancel(null); }
  };

  const handleUpdateClick = (id: string) => { setOrderToUpdate(id); setShowUpdateModal(true); };

  const confirmUpdate = async () => {
    if (!orderToUpdate) return;
    const newStatus = statusUpdates[orderToUpdate];
    try {
      const ok = await updateOrder({ orderId: orderToUpdate, status: newStatus });
      if (!ok) throw new Error();
      if (newStatus === 'CANCELLED') {
        const upd = orders.find(o => o.orderId === orderToUpdate)!;
        await Promise.all(upd.products.map(async prod => {
          const pd = await loadProductById(prod.id);
          const map = stockArrayToMap(pd.stock);
          const updated = pd.stock.map((item: { size: string }) =>
            item.size === prod.size ? { ...item, stockAmount: (map[prod.size] || 0) + prod.quantity } : item
          );
          await updateProduct({ productId: prod.id, stock: updated });
        }));
      }
      await refreshOrders();
    } catch { setError('Failed to update order.'); }
    finally { setShowUpdateModal(false); setOrderToUpdate(null); }
  };

  const statusClass = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'PENDING') return 'rair-badge--pending';
    if (s === 'PROCESSING') return 'rair-badge--processing';
    if (s === 'SHIPPED') return 'rair-badge--shipped';
    if (s === 'DELIVERED') return 'rair-badge--delivered';
    if (s === 'CANCELLED') return 'rair-badge--cancelled';
    return '';
  };

  if (!userId || loading) return <Spinner />;

  return (
    <main className="page-shell" id="main-content">
      <div className="page-shell__inner">
        <header className="page-shell__header">
          <h1 className="page-shell__title">{isAdmin ? 'All Orders' : 'My Orders'}</h1>
        </header>

        {error && <p className="rair-error" role="alert">{error}</p>}

        {/* Filters */}
        <div className="orders-filters">
          <input
            className="rair-input orders-filters__search"
            type="search"
            placeholder="Search by ID, address, product…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search orders"
          />
          <select
            className="rair-select orders-filters__status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as Order['status'] | 'All')}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {filtered.length === 0 && (
          <p className="page-shell__empty">No orders found.</p>
        )}

        <div className="orders-list">
          {filtered.map(o => (
            <div key={o.orderId} className="order-card">
              <div className="order-card__header">
                <div className="order-card__meta">
                  <span className="order-card__id">#{o.orderId.slice(0, 8)}&hellip;</span>
                  <span className="order-card__date">
                    {new Date(o.date).toLocaleDateString()}
                  </span>
                </div>
                <span className={`rair-badge ${statusClass(o.status)}`}>{o.status}</span>
              </div>

              <div className="order-card__info">
                <p className="order-card__detail">{o.username}</p>
                <p className="order-card__detail">{o.shippingAddress}</p>
              </div>

              <div className="order-card__products">
                {o.products.map(p => (
                  <div key={`${p.id}-${p.size}`} className="order-product">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="order-product__img"
                      loading="lazy"
                    />
                    <div className="order-product__info">
                      <p className="order-product__name">{p.name}</p>
                      <p className="order-product__meta">
                        {p.size} · Qty {p.quantity} · ${itemTotal(p)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card__footer">
                <p className="order-card__total">
                  Total: <strong>${grandTotal(o.products)}</strong>
                </p>
                <div className="order-card__actions">
                  {isCustomer && o.status === 'PENDING' && (
                    <button
                      type="button"
                      className="btn-rair btn-rair-danger"
                      onClick={() => handleCancelClick(o.orderId)}
                    >
                      Cancel
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <select
                        className="rair-select"
                        style={{ width: 160 }}
                        value={statusUpdates[o.orderId] || o.status}
                        onChange={e =>
                          setStatusUpdates(prev => ({
                            ...prev,
                            [o.orderId]: e.target.value as Order['status'],
                          }))
                        }
                        aria-label="New status"
                      >
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <button
                        type="button"
                        className="btn-rair btn-rair-primary"
                        onClick={() => handleUpdateClick(o.orderId)}
                        disabled={!statusUpdates[o.orderId] || statusUpdates[o.orderId] === o.status}
                      >
                        Update
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered dialogClassName="rair-modal">
        <Modal.Header closeButton><Modal.Title>Cancel order</Modal.Title></Modal.Header>
        <Modal.Body>
          <p style={{ fontWeight: 300, color: 'var(--rair-muted)' }}>
            Cancel order <strong style={{ color: 'var(--rair-ink)' }}>#{orderToCancel?.slice(0, 8)}&hellip;</strong>?
            Stock will be restocked automatically.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn-rair btn-rair-ghost" onClick={() => setShowCancelModal(false)}>No</button>
          <button type="button" className="btn-rair btn-rair-danger" onClick={confirmCancel}>Cancel order</button>
        </Modal.Footer>
      </Modal>

      {/* Update modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered dialogClassName="rair-modal">
        <Modal.Header closeButton><Modal.Title>Update status</Modal.Title></Modal.Header>
        <Modal.Body>
          <p style={{ fontWeight: 300, color: 'var(--rair-muted)' }}>
            Set order <strong style={{ color: 'var(--rair-ink)' }}>#{orderToUpdate?.slice(0, 8)}&hellip;</strong> to{' '}
            <strong style={{ color: 'var(--rair-ink)' }}>{statusUpdates[orderToUpdate || '']}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn-rair btn-rair-ghost" onClick={() => setShowUpdateModal(false)}>No</button>
          <button type="button" className="btn-rair btn-rair-primary" onClick={confirmUpdate} disabled={!orderToUpdate}>Update</button>
        </Modal.Footer>
      </Modal>
    </main>
  );
};

export default ListOrdersPage;
