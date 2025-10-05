import axios from 'axios';
import { PaymentSummary } from './PaymentSummary';
import './checkout-header.css';
import './CheckoutPage.css'
import { useEffect, useState } from 'react';
import  {OrderSummary} from './OrderSummary'


export function CheckoutPage({ cart }){

const [deliveryOptions, setdeliveryOptions] = useState([]);
const [paymentSummary,setPaymentSummary] = useState(null);

useEffect(() =>{

     const featchCheckoutaData = async () =>{
      let response = await axios.get('/api/delivery-options?expand=estimatedDeliveryTime');
       setdeliveryOptions(response.data);
  
        response = await axios.get('/api/payment-summary')
        setPaymentSummary(response.data);
    
  };
  featchCheckoutaData();
}, []);

  return(<>
  
           <div className="checkout-header">
      <div className="header-content">
        <div className="checkout-header-left-section">
          <a href="/">
            <img className="amazon-logo" src="/public/images/amazon-logo.png"/>
            <img className="amazon-mobile-logo" src="/public/images/amazon-mobile-logo.png"/>
          </a>
        </div>

        <div className="checkout-header-middle-section">
          Checkout (<a className="return-to-home-link"
            href="/">3 items</a>)
        </div>

        <div className="checkout-header-right-section">
          <img src="/public/images/icons/checkout-lock-icon.png"/>
        </div>
      </div>
    </div>

    <div className="main">
      <div className="page-title">Review your order</div>

      <div className="checkout-grid">
        <OrderSummary  cart={cart} deliveryOptions={deliveryOptions}/> 
        
         <PaymentSummary paymentSummary={paymentSummary}/>
      </div>
    </div>
  </>
  );
}