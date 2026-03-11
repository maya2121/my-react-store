import { useEffect, useRef, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import SideCart from "../Cart/SideCart";
import "./Navbar.css";

function Navbar({ cartItems, setCartItems }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]); // حالة لتخزين الأقسام
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const navigate = useNavigate();
  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((acc, item) => acc + (Number(item?.qty) || 0), 0)
    : 0;
  const collectionsRef = useRef(null);

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

  useEffect(() => {
    const handleOutside = (e) => {
      if (!isCollectionsOpen) return;
      if (collectionsRef.current && !collectionsRef.current.contains(e.target)) {
        setIsCollectionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside, true);
    return () => document.removeEventListener("mousedown", handleOutside, true);
  }, [isCollectionsOpen]);

  return (
    <>
      <nav className="navbar">
      <div className="Logo">
  <img src="/Images/logo4.png" alt="Logo" />
</div>

<div className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
  ☰
</div>

<div className={`nav-links ${menuOpen ? "active" : ""}`}>     
      <span onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Home
          </span>

          <span onClick={() => {
            const el = document.getElementById("products-section");
            if(el) el.scrollIntoView({ behavior: "smooth" });
          }}>
            Products
          </span>

          <div className={`collections ${isCollectionsOpen ? "open" : ""}`} ref={collectionsRef}>
            <span onClick={() => setIsCollectionsOpen((v) => !v)}>Collections ▾</span>
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
                    setIsCollectionsOpen(false);
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

  {cartCount > 0 && (
    <span className="cart-count">{cartCount}</span>
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
