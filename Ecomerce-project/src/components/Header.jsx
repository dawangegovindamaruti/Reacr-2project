import './header.css';
import { Link } from 'react-router-dom';

 export function Header({cart}) {
  let totalquantity = 0;

  cart.forEach((cartItem) => {
     totalquantity += cartItem.quantity;
  });
  return (

    <div className="amazon-header">
      <div className="amazon-header-left-section">
        <Link to="/" className="header-link">
          <img className="amazon-logo"
            src="/images/amazon-logo-white.png"  alt="Amazon Logo" />
          <img className="amazon-mobile-logo"
            src="/images/amazon-mobile-logo-white.png" alt="Amazon Mobile Logo"/>
        </Link>
      </div>

      <div className="amazon-header-middle-section">
        <input className="search-bar" type="text" placeholder="Search" />

        <button className="search-button">
          <img className="search-icon" src="images/icons/search-icon.png" />
        </button>
      </div>

      <div className="amazon-header-right-section">
        <Link className="orders-link header-link" to="/orders">
          <span className="returns-text">Returns</span>
          <span className="orders-text">& Orders</span>
        </Link>

        <Link className="cart-link header-link" to="/checkout">
          <img className="cart-icon" src="images/icons/cart-icon.png" />
          <div className="cart-quantity">{totalquantity}</div>
          <div className="cart-text">Cart</div>
        </Link>
      </div>
    </div>

  )
}