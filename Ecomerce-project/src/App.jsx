 import { Routes, Route } from 'react-router-dom'
 import { HomePage } from './pages/Home/HomePage'
 import { CheckoutPage } from './pages/checkout/CheckoutPage';
 import './App.css'
 import { OrderPage } from './pages/orders/OrdersPage'
 import { TrackingPage } from './pages/tracking'
 import ProductAdmin from './pages/ProductAdmin'
 import { useCallback, useEffect, useState} from 'react'
 import axios from 'axios'

 function App() {
      const [cart, setCart] = useState([]);

       const loadCart = useCallback(async () =>{
            try {
              const response = await axios.get('/api/cart-items?expand=product')
              setCart(response.data);
            } catch (error) {
              console.error('Failed to load cart:', error);
            }
       }, []);

        useEffect(() => {
          loadCart();
        }, [loadCart]);


   return (
     <>
     <Routes>
     <Route index element={<HomePage cart={cart} loadCart={loadCart}/>}/>
     <Route path="checkout" element={<CheckoutPage cart={cart} loadCart={loadCart}/>}/>
     <Route path="orders" element={<OrderPage cart={cart} loadCart={loadCart} />}/>
     <Route path="tracking" element={<TrackingPage cart={cart}/>}/>
     <Route path="admin/products" element={<ProductAdmin/>}/>
     </Routes>
    
    </>
  )
}

export default App
