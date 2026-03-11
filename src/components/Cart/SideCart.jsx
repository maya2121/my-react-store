import "../Navbar/Navbar.css";
import { useNavigate } from "react-router-dom";

function SideCart({ cartItems, setCartItems, isCartOpen, setIsCartOpen }) {

  const navigate = useNavigate();
  const incQty = (id) => {
    setCartItems((prev) => {
      const items = Array.isArray(prev) ? prev : [];
      return items.map((i) => (i?.id === id ? { ...i, qty: (Number(i.qty) || 1) + 1 } : i));
    });
  };

  const decQty = (id) => {
    setCartItems((prev) => {
      const items = Array.isArray(prev) ? prev : [];
      return items.flatMap((i) => {
        if (i?.id !== id) return [i];
        const nextQty = (Number(i.qty) || 1) - 1;
        if (nextQty <= 0) return [];
        return [{ ...i, qty: nextQty }];
      });
    });
  };

  const removeAll = (id) => {
    setCartItems((prev) => {
      const items = Array.isArray(prev) ? prev : [];
      return items.filter((i) => i?.id !== id);
    });
  };

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
                <p>
                  {typeof item.price === "number" ? item.price.toFixed(2) : item.price} ${" "}
                  {Number(item.qty) > 0 ? `x${item.qty}` : ""}
                </p>
              </div>

              <div className="qty-controls">
                <button type="button" className="qty-btn" onClick={() => decQty(item.id)}>
                  −
                </button>
                <span className="qty-value">{Number(item.qty) || 1}</span>
                <button type="button" className="qty-btn" onClick={() => incQty(item.id)}>
                  +
                </button>
              </div>

              <button
                className="delete-btn"
                onClick={() => removeAll(item.id)}
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
