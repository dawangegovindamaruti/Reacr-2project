 import { Routes, Route } from 'react-router'
 import axios from 'axios'
import { HomePage } from './pages/Home/HomePage'
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import './App.css'
import { OrderPage } from './pages/orders/OrdersPage'
import { TrackingPage } from './pages/tracking'
import { useEffect, useState} from 'react'

function App() {

     const [cart, setCart] = useState([]);

     useEffect(() =>{
          axios.get('/api/cart-items?expand=product')
          .then((response) =>{
             setCart(response.data);
          });
     },[]);


  return (
    <>
    <Routes>
    <Route index element={<HomePage cart={cart} />}/>
    <Route path="checkout" element={< CheckoutPage cart={cart} />}/>
    <Route path="orders" element={<OrderPage  cart={cart}/>}/>
     <Route path="tracking" element={<TrackingPage cart={cart}/>}/>
    </Routes>
    
    </>
  )
}

export default App
