 import { Routes, Route } from 'react-router'
import { HomePage } from './pages/HomePage'
import { CheckoutPage } from './pages/CheckoutPage'
import './App.css'
import { OrderPage } from './pages/OrdersPage'
import { TrackingPage } from './pages/tracking'

function App() {

  return (
    <>
    <Routes>
    <Route index element={<HomePage/>}/>
    <Route path="checkout" element={< CheckoutPage/>}/>
    <Route path="orders" element={<OrderPage/>}></Route>
     <Route path="tracking" element={<TrackingPage/>}/>
    </Routes>
    
    </>
  )
}

export default App
