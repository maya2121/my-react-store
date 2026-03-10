import "../Navbar/Navbar.css";
import { useNavigate } from "react-router-dom";

function SideCart({ cartItems, setCartItems, isCartOpen, setIsCartOpen }) {

  const navigate = useNavigate();

  return (
    <>
      <div className={`side-cart ${isCartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h3>Shopping Cart</h3>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>×</button>
        </div>

        <div className="cart-content">
          {cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={(item.image || (Array.isArray(item.images) ? item.images[0] : null)) || "/Images/logo4.png"} alt={item.name} />

              <div className="item-info">
                <h4>{item.name}</h4>
                <p>{typeof item.price === "number" ? item.price.toFixed(2) : item.price} $</p>
              </div>

              <button
                className="delete-btn"
                onClick={() =>
                  setCartItems(cartItems.filter((cartItem) => cartItem.id !== item.id))
                }
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        <div className="cart-footer">
        <button className="checkout-btn" onClick={() => navigate("/login")}>
  Checkout Now
</button>

        </div>
      </div>

      {isCartOpen && <div className="overlay" onClick={() => setIsCartOpen(false)}></div>}
      
    </>
  );
}

export default SideCart;
