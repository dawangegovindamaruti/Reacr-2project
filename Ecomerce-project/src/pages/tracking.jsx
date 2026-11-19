import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Header } from '../components/Header'
import { formatemoney } from '../utils/money';
import './TrackingPage.css'

export function TrackingPage({ cart }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const loadOrdersForTracking = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/orders?expand=products');
        // Filter only active orders
        const activeOrders = response.data.filter(order => order.status !== 'cancelled');
        setOrders(activeOrders);
      } catch (err) {
        console.error('Error fetching tracking data:', err);
        setError('Failed to load tracking information');
      } finally {
        setLoading(false);
      }
    };

    loadOrdersForTracking();
  }, []);

  // Calculate delivery status
  const getDeliveryStatus = (estimatedDeliveryTimeMs) => {
    const now = Date.now();
    const daysRemaining = Math.ceil((estimatedDeliveryTimeMs - now) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return { status: 'Delivered', percentage: 100, color: '#28a745' };
    } else if (daysRemaining === 0) {
      return { status: 'Out for Delivery', percentage: 75, color: '#ffc107' };
    } else if (daysRemaining === 1) {
      return { status: 'Arriving Tomorrow', percentage: 75, color: '#ffc107' };
    } else if (daysRemaining <= 3) {
      return { status: 'Shipped', percentage: 50, color: '#17a2b8' };
    } else {
      return { status: 'Preparing', percentage: 25, color: '#6c757d' };
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <>
        <Header cart={cart} />
        <div className="main">
          <div className="page-title">Track Your Orders</div>
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
            Loading tracking information...
          </div>
        </div>
      </>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <>
        <Header cart={cart} />
        <div className="main">
          <div className="page-title">Track Your Orders</div>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24',
            margin: '20px'
          }}>
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  // NO ORDERS STATE
  if (orders.length === 0) {
    return (
      <>
        <Header cart={cart} />
        <div className="main">
          <div className="page-title">Track Your Orders</div>
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#999' }}>
            <p>📦 No active orders to track</p>
            <a href="/orders" style={{ color: '#007bff', textDecoration: 'none' }}>
              View all orders →
            </a>
          </div>
        </div>
      </>
    );
  }

  // MAIN CONTENT
  return (
    <>
      <Header cart={cart} />

      <div className="main">
        <div className="page-title">Track Your Orders</div>

        <a className="back-to-orders-link link-primary" href="/orders">
          ← Back to Orders
        </a>

        <div className="tracking-container">
          {orders.map((order) => (
            <div key={order._id} className="order-tracking-card">
              {/* ORDER HEADER */}
              <div 
                className="tracking-order-header"
                onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="order-id-label">Order ID: {order._id}</div>
                  <div className="order-date">Placed: {dayjs(order.orderTimeMs).format('MMM D, YYYY')}</div>
                </div>
                <div>
                  <div className="order-total">Total: {formatemoney(order.totalCostCents)}</div>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}>
                    {expandedOrderId === order._id ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {/* EXPANDED CONTENT */}
              {expandedOrderId === order._id && (
                <div className="tracking-expanded">
                  {/* PRODUCTS */}
                  <div className="tracking-products">
                    <h3>Items in Order ({order.products.length})</h3>
                    {order.products.map((product, idx) => {
                      const deliveryStatus = getDeliveryStatus(product.estimatedDeliveryTimeMs);
                      return (
                        <div key={idx} className="tracking-product-item">
                          <img src={product.product.image} className="tracking-product-image" />

                          <div className="tracking-product-details">
                            <div className="product-name">{product.product.name}</div>
                            <div className="product-quantity">Qty: {product.quantity}</div>
                            <div className="product-price">{formatemoney(product.product.priceCents)}</div>

                            {/* DELIVERY INFO */}
                            <div className="delivery-info">
                              <div className="estimated-delivery">
                                📅 Est. Delivery: <strong>{dayjs(product.estimatedDeliveryTimeMs).format('MMM D')}</strong>
                              </div>
                              <div style={{ marginTop: '8px' }}>
                                <span className="status-badge" style={{ backgroundColor: deliveryStatus.color }}>
                                  {deliveryStatus.status}
                                </span>
                              </div>
                            </div>

                            {/* PROGRESS BAR */}
                            <div className="progress-container">
                              <div className="progress-bar-outer">
                                <div
                                  className="progress-bar-inner"
                                  style={{
                                    width: `${deliveryStatus.percentage}%`,
                                    backgroundColor: deliveryStatus.color
                                  }}
                                ></div>
                              </div>

                              {/* PROGRESS LABELS */}
                              <div className="progress-labels-container">
                                <div className="progress-label">
                                  ✓ Preparing
                                </div>
                                <div className="progress-label">
                                  {deliveryStatus.percentage >= 50 ? '✓' : '•'} Shipped
                                </div>
                                <div className="progress-label">
                                  {deliveryStatus.percentage >= 75 ? '✓' : '•'} Out for Delivery
                                </div>
                                <div className="progress-label">
                                  {deliveryStatus.percentage === 100 ? '✓' : '•'} Delivered
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ORDER SUMMARY */}
                  <div className="order-summary-box">
                    <h3>Order Summary</h3>
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>{formatemoney(order.totalCostCents * 0.909)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax (10%):</span>
                      <span>{formatemoney(order.totalCostCents * 0.091)}</span>
                    </div>
                    <div className="summary-row" style={{ fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '8px', marginTop: '8px' }}>
                      <span>Total:</span>
                      <span>{formatemoney(order.totalCostCents)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* HELP SECTION */}
        <div className="tracking-help-section">
          <h3>📞 Need Help?</h3>
          <p>If your package is delayed or lost, please <a href="/orders">contact support</a> through your order page.</p>
        </div>
      </div>
    </>
  );
}