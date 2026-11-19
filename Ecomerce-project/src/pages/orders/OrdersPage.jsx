import dayjs from 'dayjs';
import axios from 'axios';
import { useState, useEffect, Fragment } from 'react';
import { formatemoney } from '../../utils/money';
import { Header } from '../../components/Header';
import './OrderPage.css'

export function OrderPage({ cart, loadCart }) {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [addingProductId, setAddingProductId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/orders?expand=products');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.status === 401
        ? 'Please sign in to view your orders.'
        : 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // CANCEL ORDER
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancellingOrderId(orderId);
      await axios.put(`/api/orders/${orderId}/cancel`);
      setOrders(currentOrders => currentOrders.map(order => 
        order._id === orderId 
          ? { ...order, status: 'cancelled' }
          : order
      ));
      alert('Order cancelled successfully');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  // VIEW ORDER DETAILS
  const handleViewOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}?expand=products`);
      console.log('Order Details:', response.data);
      alert(`Order ID: ${response.data._id}\nTotal: ${formatemoney(response.data.totalCostCents)}\nItems: ${response.data.products.length}`);
    } catch (err) {
      console.error('Error fetching order details:', err);
      alert('Failed to load order details');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingOrderId(orderId);
      await axios.delete(`/api/orders/${orderId}`);
      setOrders(currentOrders => currentOrders.filter(order => order._id !== orderId));
      alert('Order deleted successfully');
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleBuyAgain = async (orderProduct) => {
    const productId = orderProduct.product?._id || orderProduct.productId;

    try {
      setAddingProductId(productId);
      await axios.post('/api/cart-items', {
        productId,
        quantity: orderProduct.quantity
      });
      await loadCart();
      alert('Product added to cart');
    } catch (err) {
      console.error('Error adding product to cart:', err);
      alert('Failed to add product to cart');
    } finally {
      setAddingProductId(null);
    }
  };

  const handleDeleteProduct = async (orderId, orderProduct) => {
    const productId = orderProduct.product?._id || orderProduct.productId;
    if (!window.confirm('Remove this product from the order?')) {
      return;
    }

    try {
      setDeletingProductId(`${orderId}-${productId}`);
      const response = await axios.delete(`/api/orders/${orderId}/products/${productId}`);
      setOrders(currentOrders => currentOrders.flatMap(order => {
        if (order._id !== orderId) {
          return [order];
        }

        if (response.data.orderDeleted) {
          return [];
        }

        return {
          ...order,
          products: order.products.filter(product => (
            (product.product?._id || product.productId) !== productId
          )),
          totalCostCents: Math.round(
            order.products
              .filter(product => (product.product?._id || product.productId) !== productId)
              .reduce((total, product) => (
                total + (product.product?.priceCents || 0) * product.quantity
              ), 0) * 1.1
          )
        };
      }));
      alert('Product removed from order');
    } catch (err) {
      console.error('Error deleting product from order:', err);
      alert('Failed to remove product from order');
    } finally {
      setDeletingProductId(null);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <>
        <Header cart={cart} />
        <div className="main">
          <div className="page-title">Your Orders</div>
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
            <p>Loading your orders...</p>
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
          <div className="page-title">Your Orders</div>
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
            <button 
              onClick={loadOrders}
              style={{
                padding: '10px 20px',
                marginTop: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  // EMPTY STATE
  if (orders.length === 0) {
    return (
      <>
        <Header cart={cart} />
        <div className="main">
          <div className="page-title">Your Orders</div>
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#999' }}>
            <p>📦 No orders yet.</p>
            <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>
              Start shopping →
            </a>
          </div>
        </div>
      </>
    );
  }

  // MAIN CONTENT
  return (
    <>
      <title>order page</title>
      <Header cart={cart} />

      <div className="main">
        <div className="page-title">Your Orders ({orders.length})</div>

        <div className="orders-grid">
          {orders.map((order) => {
            const isCancelled = order.status === 'cancelled';
            return (
              <div key={order._id} className="order-container" style={{
                opacity: isCancelled ? 0.6 : 1,
                borderLeft: isCancelled ? '4px solid #dc3545' : '4px solid #007bff'
              }}>

                <div className="order-header">
                  <div className="order-header-left-section">
                    <div className="order-date">
                      <div className="order-header-label">Order Placed:</div>
                      <div>{dayjs(order.orderTimeMs).format('MMMM D')}</div>
                    </div>
                    <div className="order-total">
                      <div className="order-header-label">Total:</div>
                      <div>{formatemoney(order.totalCostCents)}</div>
                    </div>
                  </div>

                  <div className="order-header-right-section">
                    <div className="order-header-label">Order ID:</div>
                    <div>{order._id}</div>
                    {isCancelled && (
                      <div style={{
                        color: '#dc3545',
                        fontWeight: 'bold',
                        marginTop: '8px',
                        fontSize: '12px'
                      }}>
                        ❌ CANCELLED
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-details-grid">
                  {order.products.map((orderproduct) => {
                    return (
                      <Fragment key={orderproduct.product?._id || orderproduct.productId}>
                        <div className="product-image-container">
                          <img src={orderproduct.product.image} />
                        </div>

                        <div className="product-details">
                          <div className="product-name">
                            {orderproduct.product.name}
                          </div>
                          <div className="product-delivery-date">
                            Arriving on: {dayjs(orderproduct.estimatedDeliveryTimeMs).format('MMMM D')}
                          </div>
                          <div className="product-quantity">
                            Quantity: {orderproduct.quantity}
                          </div>
                          <button
                            className="buy-again-button button-primary"
                            onClick={() => handleBuyAgain(orderproduct)}
                            disabled={addingProductId === (orderproduct.product?._id || orderproduct.productId)}
                          >
                            <img className="buy-again-icon" src="images/icons/buy-again.png" />
                            <span className="buy-again-message">
                              {addingProductId === (orderproduct.product?._id || orderproduct.productId)
                                ? 'Adding...'
                                : 'Buy it again'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(order._id, orderproduct)}
                            disabled={deletingProductId === `${order._id}-${orderproduct.product?._id || orderproduct.productId}`}
                            style={{
                              marginTop: '8px',
                              padding: '7px 10px',
                              backgroundColor: '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            {deletingProductId === `${order._id}-${orderproduct.product?._id || orderproduct.productId}`
                              ? 'Removing...'
                              : 'Remove Product'}
                          </button>
                        </div>

                        <div className="product-actions">
                          {!isCancelled && (
                            <a href="/tracking">
                              <button className="track-package-button button-secondary">
                                Track package
                              </button>
                            </a>
                          )}
                        </div>

                      </Fragment>
                    );
                  })}

                </div>

                {/* ORDER ACTIONS */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: '1px solid #ddd',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={() => handleViewOrderDetails(order._id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    View Details
                  </button>

                  {!isCancelled && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={cancellingOrderId === order._id}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: cancellingOrderId === order._id ? '#ccc' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: cancellingOrderId === order._id ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {cancellingOrderId === order._id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    disabled={deletingOrderId === order._id}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: deletingOrderId === order._id ? '#ccc' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: deletingOrderId === order._id ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {deletingOrderId === order._id ? 'Deleting...' : 'Delete Order'}
                  </button>
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </>
  );
}