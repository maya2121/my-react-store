import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import SideCart from "../Cart/SideCart";
import "./Navbar.css";

function Navbar({ cartItems, setCartItems }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState([]); // حالة لتخزين الأقسام
  const navigate = useNavigate();

  // جلب الأقسام من السيرفر
  useEffect(() => {
    fetch("https://armanist.com/public/categories")        .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="Logo">
          <img src="/Images/logo4.png" alt="Logo" />
        </div>

        <div className="nav-links">
          <span onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Home
          </span>

          <span onClick={() => {
            const el = document.getElementById("products-section");
            if(el) el.scrollIntoView({ behavior: "smooth" });
          }}>
            Products
          </span>

          <div className="collections">
            <span>Collections ▾</span>
            <div className="dropdown">
              {categories.map((cat) => (
                <p 
                  key={cat.id} 
                  onClick={() => {
                    const section = document.getElementById(cat.slug);
                    if (section) {
                      section.scrollIntoView({ behavior: "smooth" });
                    } else {
                      navigate(`/?category=${cat.slug}`);
                    }
                  }}
                >
                  {cat.name}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="nav-actions" onClick={() => setIsCartOpen(true)}>
  <i className="bi bi-cart"></i>

  {cartItems.length > 0 && (
    <span className="cart-count">
      {cartItems.length}
    </span>
  )}

</div>
      </nav>

      <SideCart
        cartItems={cartItems}
        setCartItems={setCartItems}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
      />
    </>
  );
}

export default Navbar;