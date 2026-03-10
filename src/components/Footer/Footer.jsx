import "./Footer.css";

function Footer() {
  return (
    <footer className="store-footer">
      <div className="footer-top">
        <div className="footer-top-inner">
          <img src="/Images/logo4.png" alt="Armanist" />
          <span>Armanist Luxury Essentials</span>
        </div>
      </div>
      <div className="footer-content">
        <div className="footer-col">
          <h4>Contact & Info</h4>
          <a href="#">Support & Contact</a>
          <a href="#">FAQs</a>
          <a href="#">Returns Policy</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Shipping & Delivery</a>
        </div>
        <div className="footer-col">
          <h4>Store Services</h4>
          <a href="#">Order & Tracking</a>
          <a href="#">Payment Methods</a>
          <a href="#">Exclusive Offers</a>
          <a href="#">Gift Cards</a>
          <a href="#">Warranty</a>
        </div>
        <div className="footer-col">
          <h4>Categories</h4>
          <a href="#watches">Watches</a>
          <a href="#wallets">Wallets</a>
          <a href="#perfumes">Perfumes</a>
          <a href="#products-section">All Products</a>
        </div>
        <div className="footer-col">
          <h4>Our Picks</h4>
          <a href="#">Best Sellers</a>
          <a href="#">New Arrivals</a>
          <a href="#">Featured Products</a>
          <a href="#">Limited Editions</a>
        </div>
        <div className="footer-col">
          <h4>Join Our List</h4>
          <p>Subscribe to receive the latest offers and discounts</p>
          <div className="footer-subscribe">
            <input type="email" placeholder="example@email.com" />
            <button>Subscribe</button>
          </div>
          <div className="footer-social">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>WhatsApp</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Armanist. All rights reserved</span>
        <span>Crafted with Luxury</span>
      </div>
    </footer>
  );
}

export default Footer;
