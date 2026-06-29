import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Modal, Container, Form, Row, Col, Image, Button } from 'react-bootstrap';
import { useAuthStore } from '../auth/AuthStore';
import { loadUserById } from '../api/loadUser';
import { User } from '../types/User';
import { ProductItem } from '../interface/ProductItem';
import { v4 as uuidv4 } from 'uuid';
import { addOrder } from '../api/addOrder';
import { deleteCart } from '../api/deleteCart';
import { updateProduct } from '../api/updateProduct';
import { loadProductById } from '../api/loadProduct';
import backgroundImage from '../assets/background-texture.png';

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

  // Pull userId and email, avoid using user.username
  const { userId, email } = useAuthStore();

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
    async function fetchUser() {
      if (userId) {
        try {
          const loadedUser = (await loadUserById(userId)) as User | null; // Use userId here
          if (loadedUser?.address) {
            setAddress(loadedUser.address);
          }
        } catch (err) {
          console.error('Failed to load user data:', err);
        }
      }
    }
    fetchUser();
  }, [userId]);

  const getItemTotal = (product: ProductItem) => {
    if (typeof product.unitPrice !== 'number' || typeof product.quantity !== 'number') return '0.00';
    return (product.unitPrice * product.quantity).toFixed(2);
  };

  const getGrandTotal = () => {
    return products
      .reduce((sum, product) => {
        if (typeof product.unitPrice !== 'number' || typeof product.quantity !== 'number') return sum;
        return sum + product.unitPrice * product.quantity;
      }, 0)
      .toFixed(2);
  };

  const confirmPayment = async () => {
    try {
      if (!userId) {
        alert('User not logged in or missing user ID.');
        return;
      }

      const orderData = {
        orderId: uuidv4(),
        userId,          // Use userId here
        username: email,  // Email can be username or display name
        date: new Date().toISOString(),
        status: "PENDING",
        products: products.map(p => ({
          cartId: p.cartId,
          id: p.id,
          name: p.name,
          image: p.image,
          quantity: p.quantity,
          size: p.size[0],
          unitPrice: p.unitPrice,
          totalPrice: p.unitPrice * p.quantity,
        })),
        totalAmount: parseFloat(getGrandTotal()),
        shippingAddress: address,
        paymentMethod: selectedBank,
      };

      // Helper function to convert stock array to map
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function stockArrayToMap(stockArray: any[]) {
        return stockArray.reduce((acc, item) => {
          acc[item.size] = item.stockAmount;
          return acc;
        }, {} as Record<string, number>);
      }

      const response = await addOrder(orderData);
      if (response) {
        const operationResults = await Promise.all(
          orderData.products.map(async product => {
            try {
              // Delete cart item
              const deleteSuccess = await deleteCart({
                userId: orderData.userId,
                cartId: product.cartId,
                productId: '',
                name: '',
                price: 0,
                size: '',
                quantity: 0,
                imageUrl: ''
              });

              // Load product stock
              const productData = await loadProductById(product.id);
              if (!productData || !productData.stock) {
                console.warn(`Invalid product or stock data for product ID ${product.id}`);
                return false;
              }

              const stockMap = stockArrayToMap(productData.stock);

              if (typeof stockMap[product.size] !== 'number') {
                console.warn(`Invalid stock data for product ID ${product.id}, size ${product.size}`, productData.stock);
                return false;
              }

              const current_stock = stockMap[product.size];
              const new_stock = current_stock - product.quantity;

              if (new_stock < 0) {
                console.warn(`Stock would go negative for product ${product.id} (${product.size})`);
                return false;
              }

              const updatedStockArray = productData.stock.map((item: { size: string; }) =>
                item.size === product.size ? { ...item, stockAmount: new_stock } : item
              );

              const updateSuccess = await updateProduct({
                productId: product.id,
                stock: updatedStockArray,
              });

              return deleteSuccess && updateSuccess;
            } catch (err) {
              console.error(`Error processing product ${product.id}:`, err);
              return false;
            }
          })
        );

        const failedOps = operationResults.filter(success => !success);
        if (failedOps.length > 0) {
          console.warn(`${failedOps.length} product(s) failed to process (delete/update).`);
        }

        alert(`Order placed successfully!\nOrder ID: ${response.item.orderId}`);
        navigate('/listOrdersPage', {
          state: { orderId: response.item.orderId }
        });
      } else {
        alert('Failed to place order.');
      }
    } catch (err) {
      console.error('Order error:', err);
      alert('Something went wrong. Try again.');
    } finally {
      setShowConfirmModal(false);
    }
  };

  const handlePayment = () => {
    setShowConfirmModal(true);
  };

  return (
    <Container
      style={{
        maxWidth: 800,
        fontFamily: 'Arial, serif',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: '#333333',
        backgroundBlendMode: 'overlay',
        padding: 20,
        borderRadius: 10,
      }}
    >
      <div className="mb-3">
        <Button variant="primary" onClick={() => navigate('/cart')}>
          ← Back to Cart
        </Button>
      </div>
      <h2 className="mb-4 text-center">Checkout</h2>
      <Form.Group className="mb-4" controlId="checkoutAddress">
        <h4 className="mb-3">Shipping Address</h4>
        <div className="form-control" style={{ minHeight: '3rem' }}>
          {address || 'No address provided'}
        </div>
      </Form.Group>

      <h4 className="mb-3">Your Items</h4>
      {products.map((product) => (
        <Row className="align-items-center mb-4 border p-2 rounded" key={product.id}>
          <Col xs={3}>
            <Image src={product.image} alt={product.name} fluid rounded />
          </Col>
          <Col xs={9}>
            <div><strong>{product.name}</strong></div>
            <div>Size: {product.size?.[0] ?? 'N/A'}</div>
            <div>
              Unit Price: ${typeof product.unitPrice === 'number' ? product.unitPrice.toFixed(2) : 'N/A'}
            </div>
            <div>Quantity: {product.quantity}</div>
            <div>
              <strong>
                Total: ${typeof product.unitPrice === 'number' ? getItemTotal(product) : 'N/A'}
              </strong>
            </div>
          </Col>
        </Row>
      ))}

      <h5 className="mt-3">
        Grand Total: <span className="text-success">${getGrandTotal()}</span>
      </h5>

      <Form.Group className="mt-4 mb-3">
        <Form.Label>Select Bank</Form.Label>
        <Form.Select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
          <option value="">-- Select a Bank --</option>
          <option value="Bank A">Bank A</option>
          <option value="Bank B">Bank B</option>
          <option value="Bank C">Bank C</option>
        </Form.Select>
      </Form.Group>

      <div className="d-grid gap-2 mt-4 mb-5">
        <Button
          variant="success"
          size="lg"
          onClick={handlePayment}
          disabled={!address || !selectedBank}
        >
          Proceed to Payment
        </Button>
      </div>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to proceed with the payment?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={confirmPayment}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Checkout;
