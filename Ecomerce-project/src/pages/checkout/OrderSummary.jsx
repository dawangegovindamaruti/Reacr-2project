 import { formatemoney } from "../../utils/money";
 import dayjs from "dayjs";
import { DeliveryOption } from "./DeliveryOptions";
import axios from "axios";
import { useState } from "react";

export function OrderSummary({cart, deliveryOptions,loadCart}){

  const [updatingProductId, setUpdatingProductId] = useState(null);

  const handleUpdateQuantity = async (productId, currentQuantity) => {
    const newQuantity = prompt(`Enter new quantity (current: ${currentQuantity}):`, currentQuantity);
    
    if (newQuantity === null) return; // User cancelled
    
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 1) {
      alert('Please enter a valid quantity (at least 1)');
      return;
    }

    try {
      setUpdatingProductId(productId);
      await axios.put(`/api/cart-items/${productId}`, { quantity });
      await loadCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity');
    } finally {
      setUpdatingProductId(null);
    }
  };

  const deleteCartItem = async (productId) => {
    if (!window.confirm('Remove this item from cart?')) return;
    
    try {
      await axios.delete(`/api/cart-items/${productId}`);
      await loadCart();
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item');
    }
  };
   
  return (
     <div className="order-summary">
             
              { deliveryOptions.length > 0 && cart.map((cartItem) =>{
               const selectDeliveryOption = deliveryOptions
               .find((deliveryOption)=>{
                return deliveryOption._id === cartItem.deliveryOptionId || deliveryOption.id === cartItem.deliveryOptionId;
               });
    
    
                return(
                  <div  key={cartItem.productId} className="cart-item-container">
                <div className="delivery-date">
                  Delivery date:{dayjs().add(selectDeliveryOption.deliveryDays, 'day').format('dddd, MMMM, D')};
                </div>
    
                <div className="cart-item-details-grid">
                  <img className="product-image"
                    src={ cartItem.product.image}/>
    
                  <div className="cart-item-details">
                    <div className="product-name">
                     {cartItem.product.name}
                    </div>
                    <div className="product-price">
                      {formatemoney(cartItem.product.priceCents)}
                    </div>
                    <div className="product-quantity">
                      <span>
                        Quantity: <span className="quantity-label">
                          {cartItem.quantity}
                        </span>
                      </span>
                      <span className="update-quantity-link link-primary"
                        onClick={() => handleUpdateQuantity(cartItem.productId, cartItem.quantity)}
                        style={{ cursor: 'pointer' }}>
                        Update
                      </span>
                      <span className="delete-quantity-link link-primary"
                         onClick={() => deleteCartItem(cartItem.productId)}
                         style={{ cursor: 'pointer' }}>
                        Delete
                      </span>
                    </div>
                  </div>
    
                   <DeliveryOption cartItem={cartItem} deliveryOptions={deliveryOptions}
                    loadCart={loadCart}/>
                </div>
              </div>
                )
              })}
           </div>
  );
}