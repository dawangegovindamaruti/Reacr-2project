import axios from "axios";
import { PaymentSummary } from "./PaymentSummary";
import "./checkout-header.css";
import "./CheckoutPage.css";
import { useEffect, useState } from "react";
import { OrderSummary } from "./OrderSummary";

export function CheckoutPage({ cart, loadCart }) {
  const [deliveryOptions, setdeliveryOptions] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const featchCheckoutaData = async () => {
      try {
        setLoading(true);
        setError(null);
        let response = await axios.get(
          "/api/delivery-options?expand=estimatedDeliveryTime",
        );
        setdeliveryOptions(response.data);

        response = await axios.get("/api/payment-summary");
        setPaymentSummary(response.data);
      } catch (err) {
        console.error("Error loading checkout data:", err);
        setError(
          err.response?.status === 401
            ? "Please sign in to continue to checkout."
            : "Failed to load checkout information. Please make sure the backend server is running on port 3000.",
        );
      } finally {
        setLoading(false);
      }
    };
    featchCheckoutaData();
  }, [cart]);

  // SHOW ERROR
  if (error) {
    return (
      <>
        <div className="checkout-header">
          <div className="header-content">
            <div className="checkout-header-left-section">
              <a href="/">
                <img className="amazon-logo" src="/images/amazon-logo.png" />
              </a>
            </div>
          </div>
        </div>
        <div
          className="main"
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "4px",
            color: "#721c24",
          }}
        >
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <p style={{ fontSize: "13px", marginTop: "20px" }}>
            Terminal: <code>cd ecomerce-backend && node server.js</code>
          </p>
          <a
            href="/"
            style={{
              color: "#007bff",
              textDecoration: "none",
              marginTop: "15px",
              display: "inline-block",
            }}
          >
            ← Back to Home
          </a>
        </div>
      </>
    );
  }

  // SHOW LOADING
  if (loading) {
    return (
      <>
        <div className="checkout-header">
          <div className="header-content">
            <div className="checkout-header-left-section">
              <a href="/">
                <img className="amazon-logo" src="/images/amazon-logo.png" />
              </a>
            </div>
          </div>
        </div>
        <div
          className="main"
          style={{
            textAlign: "center",
            padding: "40px",
            fontSize: "18px",
            color: "#666",
          }}
        >
          Loading checkout information...
        </div>
      </>
    );
  }

  return (
    <>
      <div className="checkout-header">
        <div className="header-content">
          <div className="checkout-header-left-section">
            <a href="/">
              <img className="amazon-logo" src="/images/amazon-logo.png" />
              <img
                className="amazon-mobile-logo"
                src="/images/amazon-mobile-logo.png"
              />
            </a>
          </div>

          <div className="checkout-header-middle-section">
            Checkout (
            <a className="return-to-home-link" href="/">
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </a>
            )
          </div>

          <div className="checkout-header-right-section">
            <img src="/images/icons/checkout-lock-icon.png" />
          </div>
        </div>
      </div>

      <div className="main">
        <div className="page-title">Review your order</div>

        <div className="checkout-grid">
          <OrderSummary
            cart={cart}
            deliveryOptions={deliveryOptions}
            loadCart={loadCart}
          />

          <PaymentSummary paymentSummary={paymentSummary} loadCart={loadCart} />
        </div>
      </div>
    </>
  );
}
