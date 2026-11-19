 import { Routes, Route } from 'react-router'
 import axios from 'axios'
import { HomePage } from './pages/Home/HomePage'
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import './App.css'
import { OrderPage } from './pages/orders/OrdersPage'
import { TrackingPage } from './pages/tracking'
import ProductAdmin from './pages/ProductAdmin'
import { useEffect, useState} from 'react'

function App() {

     const [cart, setCart] = useState([]);

        
      const loadCart = async () =>{
           const response = await axios.get('/api/cart-items?expand=product')
           setCart(response.data);
           console.log(response)
      };
        
       useEffect(() =>{
        loadCart();
        },[]);


  return (
    <>
    <Routes>
    <Route index element={<HomePage cart={cart}  loadCart={loadCart}/>}/>
    <Route path="checkout" element={< CheckoutPage cart={cart} loadCart={loadCart}/>}/>
    <Route path="orders" element={<OrderPage cart={cart}  />}/>
     <Route path="tracking" element={<TrackingPage cart={cart}/>}/>
    <Route path="admin/products" element={<ProductAdmin/>}/>
    </Routes>
    
    </>
  )
}

export default App
