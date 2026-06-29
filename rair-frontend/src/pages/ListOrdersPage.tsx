// src/pages/ListOrdersPage.tsx

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../auth/AuthStore';
import {
  Container,
  Card,
  Row,
  Col,
  Image,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { loadOrders } from '../api/loadOrders';
import { loadProductById } from '../api/loadProduct';
import { updateOrder } from '../api/update_order';
import { updateProduct } from '../api/updateProduct';
import { Order, Product } from '../interface/Order';
import backgroundImage from '../assets/background-texture.png';

const ListOrdersPage = () => {
  const { userId, groups } = useAuthStore(); // ✅ include userId directly
  const isCustomer = groups.includes('Customer');
  const isAdmin = groups.includes('Admin');

  const { state } = useLocation();
  const orderIdFromState = (state as { orderId?: string })?.orderId;

  const [monitoringOrders, setMonitoringOrders] = useState<Order[]>([]);
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
    console.log('[refreshOrders] userId:', userId);
    if (!userId) {
      console.warn('[refreshOrders] userId not ready, skipping');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const all = await loadOrders();
      if (isAdmin) {
        console.log('[refreshOrders] admin orders:', all);
        setMonitoringOrders(all);
      } else if (isCustomer) {
        const mine = all.filter((o: { userId: string; }) => o.userId === userId);
        console.log(`[refreshOrders] ${mine.length} orders for userId "${userId}"`);
        setMonitoringOrders(mine);
      }
    } catch (err) {
      console.error('[refreshOrders] error', err);
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      refreshOrders();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isAdmin, isCustomer, orderIdFromState]);

  const ordersToDisplay = monitoringOrders;

  const filtered = ordersToDisplay.filter(o => {
    const s = searchTerm.toLowerCase();
    return (
      (o.orderId.toLowerCase().includes(s) ||
        o.shippingAddress.toLowerCase().includes(s) ||
        o.username.toLowerCase().includes(s) ||
        o.products.some(p => p.name.toLowerCase().includes(s))) &&
      (statusFilter === 'All' || o.status === statusFilter)
    );
  });

  const getItemTotal = (p: Product) => (p.unitPrice * p.quantity).toFixed(2);
  const getGrandTotal = (items: Product[]) =>
    items.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0).toFixed(2);

  const handleCancelClick = (id: string) => {
    setOrderToCancel(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!orderToCancel) return;
    try {
      console.log('[confirmCancel] cancelling', orderToCancel);
      const ok = await updateOrder({ orderId: orderToCancel, status: 'CANCELLED' });
      if (!ok) throw new Error('Order update failed');
      const cancelled = ordersToDisplay.find(o => o.orderId === orderToCancel)!;
      await Promise.all(cancelled.products.map(async prod => {
        const pd = await loadProductById(prod.id);
        const map = stockArrayToMap(pd.stock);
        const newStock = (map[prod.size] || 0) + prod.quantity;
        const updated = pd.stock.map((item: { size: string; }) =>
          item.size === prod.size ? { ...item, stockAmount: newStock } : item
        );
        await updateProduct({ productId: prod.id, stock: updated });
      }));
      await refreshOrders();
      alert(`Order ${orderToCancel} cancelled and stock restocked.`);
    } catch (err) {
      console.error('[confirmCancel]', err);
      alert('Failed to cancel order.');
    } finally {
      setShowCancelModal(false);
      setOrderToCancel(null);
    }
  };

  const handleUpdateClick = (id: string) => {
    setOrderToUpdate(id);
    setShowUpdateModal(true);
  };

  const confirmUpdate = async () => {
    if (!orderToUpdate) return;
    const newStatus = statusUpdates[orderToUpdate]!;
    try {
      console.log('[confirmUpdate]', orderToUpdate, '→', newStatus);
      const ok = await updateOrder({ orderId: orderToUpdate, status: newStatus });
      if (!ok) throw new Error('Order update failed');
      if (newStatus === 'CANCELLED') {
        const upd = ordersToDisplay.find(o => o.orderId === orderToUpdate)!;
        await Promise.all(upd.products.map(async prod => {
          const pd = await loadProductById(prod.id);
          const map = stockArrayToMap(pd.stock);
          const newStock = (map[prod.size] || 0) + prod.quantity;
          const updated = pd.stock.map((item: { size: string; }) =>
            item.size === prod.size ? { ...item, stockAmount: newStock } : item
          );
          await updateProduct({ productId: prod.id, stock: updated });
        }));
      }
      await refreshOrders();
      alert(`Order ${orderToUpdate} updated to ${newStatus}.`);
    } catch (err) {
      console.error('[confirmUpdate]', err);
      alert('Failed to update order status.');
    } finally {
      setShowUpdateModal(false);
      setOrderToUpdate(null);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'black';
      case 'DELIVERED': return 'green';
      case 'PROCESSING': return 'blue';
      case 'SHIPPED': return 'orange';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  if (!userId || loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container
      style={{
        maxWidth: 900,
        fontFamily: 'arial, serif',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: '#333333',
        backgroundBlendMode: 'overlay',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <h2 className="mb-4 text-center" style={{ paddingTop: '20px' }}>
        {isAdmin ? 'User Orders' : 'Your Orders'}
      </h2>
      <Form className="mb-4">
        <Row className="g-2">
          <Col md>
            <Form.Control
              placeholder="Search by ID, Address, Product..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs="auto">
            <Form.Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as Order['status'] | 'All')}
            >
              <option value="All">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </Form.Select>
          </Col>
        </Row>
      </Form>

      {filtered.length === 0 && <p>No orders found.</p>}

      {filtered.map(o => (
        <Card className="mb-4 shadow-sm" key={o.orderId}>
          <Card.Header className="bg-light">
            <div className="d-flex justify-content-between flex-wrap">
              <span><strong>ID:</strong> {o.orderId}</span>
              <span><strong>Date:</strong> {new Date(o.date).toLocaleDateString()}</span>
              <span>
                <strong>Status:</strong>{' '}
                <strong style={{ color: getStatusColor(o.status) }}>{o.status}</strong>
              </span>
            </div>
          </Card.Header>
          <Card.Body>
            <p><strong>User:</strong> {o.username}</p>
            <p><strong>Address:</strong> {o.shippingAddress}</p>
            <h5>Items:</h5>
            {o.products.map(p => (
              <Row className="align-items-center mb-3" key={`${p.id}-${p.size}`}>
                <Col xs={3}><Image src={p.image} fluid rounded /></Col>
                <Col xs={9}>
                  <div><strong>{p.name}</strong></div>
                  <div>Size: {p.size}</div>
                  <div>Qty: {p.quantity}</div>
                  <div>Unit: ${p.unitPrice.toFixed(2)}</div>
                  <div>Total: ${getItemTotal(p)}</div>
                </Col>
              </Row>
            ))}
            <h5 className="text-end">
              Grand Total: <strong>${getGrandTotal(o.products)}</strong>
            </h5>
            <div className="d-flex justify-content-end gap-2">
              {isCustomer && o.status === 'PENDING' && (
                <Button variant="danger" onClick={() => handleCancelClick(o.orderId)}>
                  Cancel
                </Button>
              )}
              {isAdmin && (
                <>
                  <Form.Select
                    style={{ width: 160 }}
                    value={statusUpdates[o.orderId] || o.status}
                    onChange={e =>
                      setStatusUpdates(prev => ({
                        ...prev,
                        [o.orderId]: e.target.value as Order['status'],
                      }))
                    }
                  >
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </Form.Select>
                  <Button variant="primary" onClick={() => handleUpdateClick(o.orderId)}>
                    Update
                  </Button>
                </>
              )}
            </div>
          </Card.Body>
        </Card>
      ))}

      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Cancel Order</Modal.Title></Modal.Header>
        <Modal.Body>Cancel order {orderToCancel}?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>No</Button>
          <Button variant="danger" onClick={confirmCancel}>Yes</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Update Status</Modal.Title></Modal.Header>
        <Modal.Body>
          Update order {orderToUpdate} to <strong>{statusUpdates[orderToUpdate || '']}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>No</Button>
          <Button variant="primary" onClick={confirmUpdate} disabled={!orderToUpdate}>Yes</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ListOrdersPage;
