import axios from 'axios';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { formatemoney } from '../../utils/money';
import { Header } from '../../components/Header';
import './OrderPage.css';

export function OrderDetailsPage({ cart }) {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/orders/${orderId}?expand=products`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderId]);

  const handleDeleteOrder = async () => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await axios.delete(`/api/orders/${orderId}`);
      alert('Order deleted successfully');
      navigate('/orders');
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <>
        <Header cart={cart} />
        <div className="main">
          <button 
            onClick={() => navigate('/orders')}
            style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}
          >
            ← Back to Orders
          </button>
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
            <p>Loading order details...</p>
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
          <button 
            onClick={() => navigate('/orders')}
            style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}
          >
            ← Back to Orders
          </button>
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
              onClick={() => window.location.reload()}
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

  // MAIN CONTENT
  if (!order) {
    return (
      <>
        <Header cart={cart} />
        <div className="main">
          <button 
            onClick={() => navigate('/orders')}
            style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}
          >
            ← Back to Orders
          </button>
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#999' }}>
            Order not found
          </div>
        </div>
      </>
    );
  }

  const isCancelled = order.status === 'cancelled';

  return (
    <>
      <Header cart={cart} />
      <div className="main">
        <button 
          onClick={() => navigate('/orders')}
          style={{ 
            marginBottom: '20px', 
            padding: '8px 16px', 
            cursor: 'pointer',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          ← Back to Orders
        </button>

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '30px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: isCancelled ? '2px solid #dc3545' : '2px solid #007bff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
            <div>
              <h1 style={{ margin: '0 0 15px 0', fontSize: '24px' }}>Order #{order._id}</h1>
              <div style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>
                <strong>Order Date:</strong> {dayjs(order.orderTimeMs).format('MMMM D, YYYY')}
              </div>
              <div style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>
                <strong>Status:</strong> <span style={{ 
                  color: isCancelled ? '#dc3545' : '#28a745',
                  fontWeight: 'bold'
                }}>
                  {isCancelled ? '❌ CANCELLED' : '✅ ACTIVE'}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', color: '#999', marginBottom: '10px' }}>Total Amount</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
                {formatemoney(order.totalCostCents)}
              </div>
            </div>
          </div>
        </div>

        <h2 style={{ marginBottom: '20px' }}>Order Items ({order.products?.length || 0})</h2>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #ddd',
          marginBottom: '20px'
        }}>
          {order.products && order.products.length > 0 ? (
            order.products.map((orderProduct) => (
              <div key={orderProduct.product._id} style={{
                display: 'flex',
                gap: '20px',
                paddingBottom: '20px',
                marginBottom: '20px',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ flex: '0 0 150px' }}>
                  <img 
                    src={orderProduct.product.image} 
                    alt={orderProduct.product.name}
                    style={{ width: '100%', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ flex: '1' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>{orderProduct.product.name}</h3>
                  <div style={{ marginBottom: '10px', color: '#666' }}>
                    <div><strong>Price:</strong> {formatemoney(orderProduct.product.priceCents)}</div>
                    <div><strong>Quantity:</strong> {orderProduct.quantity}</div>
                    <div><strong>Item Total:</strong> {formatemoney(orderProduct.quantity * orderProduct.product.priceCents)}</div>
                  </div>
                  <div style={{
                    backgroundColor: '#e7f3ff',
                    padding: '10px',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    <strong>Estimated Delivery:</strong> {dayjs(orderProduct.estimatedDeliveryTimeMs).format('MMMM D, YYYY')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#999' }}>No items in this order</div>
          )}
        </div>

        <h2 style={{ marginBottom: '20px' }}>Order Summary</h2>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          maxWidth: '400px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Subtotal:</span>
            <span>{formatemoney(order.totalCostCents)}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '16px',
            fontWeight: 'bold',
            paddingTop: '10px',
            borderTop: '1px solid #ddd'
          }}>
            <span>Total:</span>
            <span style={{ color: '#007bff' }}>{formatemoney(order.totalCostCents)}</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          {!isCancelled && (
            <button
              onClick={() => {/* Implement cancel functionality if needed */}}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ffc107',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Cancel Order
            </button>
          )}
          <button
            onClick={handleDeleteOrder}
            disabled={deleting}
            style={{
              padding: '10px 20px',
              backgroundColor: deleting ? '#ccc' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: deleting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {deleting ? 'Deleting...' : 'Delete Order'}
          </button>
        </div>
      </div>
    </>
  );
}
