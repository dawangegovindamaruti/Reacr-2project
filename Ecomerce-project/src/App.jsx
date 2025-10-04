 import { Routes, Route } from 'react-router'
import { HomePage } from './pages/HomePage'
import { CheckoutPage } from './pages/CheckoutPage'
import './App.css'
import { OrderPage } from './pages/OrdersPage'

function App() {

  return (
    <>
    <Routes>
    <Route index element={<HomePage/>}/>
    <Route path="checkout" element={< CheckoutPage/>}/>
    <Route path="orders" element={<OrderPage/>}></Route>

    </Routes>
    
    </>
  )
}

export default App
