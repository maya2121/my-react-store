import { useEffect, useRef, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import SideCart from "../Cart/SideCart";
import "./Navbar.css";

function Navbar({ cartItems, setCartItems }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState([]); // حالة لتخزين الأقسام
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((acc, item) => acc + (Number(item?.qty) || 0), 0)
    : 0;
  const collectionsRef = useRef(null);
  const navRef = useRef(null);

  // جلب الأقسام من السيرفر
  useEffect(() => {
    const apiBase = import.meta.env.DEV ? "https://armanist.com" : window.location.origin;
    fetch(`${apiBase}/public/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (isCollectionsOpen && collectionsRef.current && !collectionsRef.current.contains(e.target)) {
        setIsCollectionsOpen(false);
      }
      if (isMenuOpen && navRef.current && !navRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside, true);
    return () => document.removeEventListener("mousedown", handleOutside, true);
  }, [isCollectionsOpen, isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) setIsCollectionsOpen(false);
  }, [isMenuOpen]);

  const goHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMenuOpen(false);
    setIsCollectionsOpen(false);
  };

  const goProducts = () => {
    const el = document.getElementById("products-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
    setIsCollectionsOpen(false);
  };

  return (
    <>
      <nav className="navbar" ref={navRef}>
        <div className="Logo">
          <img src="/Images/logo4.png" alt="Logo" />
        </div>

        <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <span onClick={goHome}>
            Home
          </span>

          <span onClick={goProducts}>
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
                    setIsMenuOpen(false);
                  }}
                >
                  {cat.name}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="nav-right">
          <button
            type="button"
            className="menu-btn"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <i className={`bi ${isMenuOpen ? "bi-x" : "bi-list"}`}></i>
          </button>

          <button type="button" className="nav-actions" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
            <i className="bi bi-cart"></i>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
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
