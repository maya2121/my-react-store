import { useEffect, useState, useMemo } from "react";
import "./Checkout.css";
import { useNavigate } from "react-router-dom";

function Checkout({ cartItems = [] }) {
  const navigate = useNavigate();

  // إعداد حالات الإدخال والتحكم
  const [country, setCountry] = useState("LB");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  
  // تثبيت الدفع عند الاستلام فقط وإلغاء أي خيارات أخرى
  const paymentMethod = "cod"; 

  const baseUrl = "https://armanist.com/api";

  const countryCodes = {
    LB: "+961",
    SA: "+966",
    AE: "+971",
    EG: "+20",
    JO: "+962",
    SY: "+963"
  };

  // حساب المجموع الإجمالي بذكاء
  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = Number.parseFloat(item?.price);
      const qty = Number(item?.qty) || 1;
      return acc + (Number.isFinite(price) ? price * qty : 0);
    }, 0);
  }, [cartItems]);

  // حماية الصفحة: توجيه المستخدم لوحة تسجيل الدخول إذا لم يكن مسجلاً
  useEffect(() => {
    const hasToken = !!localStorage.getItem("idToken");
    const hasDevUser = !!localStorage.getItem("devUser");
    
    // فحص آمن لـ auth إذا لم تكن مستوردة لمنع انهيار الكود
    const hasFirebaseUser = typeof auth !== "undefined" && !!auth?.currentUser;
    
    if (!hasToken && !hasDevUser && !hasFirebaseUser) {
      navigate("/login");
    }
  }, [navigate]);

  // التحقق من صحة البيانات المدخلة
  const validateForm = () => {
    if (!name.trim()) {
      alert("Please enter your full name");
      return false;
    }
    if (phone.length < 7) {
      alert("Phone number is not valid");
      return false;
    }
    if (!address.trim()) {
      alert("Please enter your detailed address");
      return false;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add products first");
      return false;
    }
    return true;
  };

  // إرسال الطلب إلى السيرفر
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const fullPhoneNumber = `${countryCodes[country] || ""}${phone}`;
      
      const res = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          phone: fullPhoneNumber,
          country,
          address,
          name,
          paymentMethod, // سيرسل دائماً "cod"
          total: totalPrice
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error || "Failed to place order");
        return;
      }

      alert("Order confirmed successfully!");
      
      // هنا يمكنك توجيهه للرئيسية أو تفريغ السلة بدلاً من صفحة التتبع
      navigate("/");

    } catch (error) {
      console.error("Order Error:", error);
      alert("Network error while placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-wrapper">
      <div className="checkout-content">
        
        <div className="back-button-container">
          <button onClick={() => navigate("/")} className="back-btn">
            ← Back to Store
          </button>
        </div>

        <div className="billing-section">
          <h3>Payment and Shipping Data</h3>

          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />

            <label>Phone Number</label>
            <div className="phone-line">
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="LB">🇱🇧 Lebanon</option>
                <option value="SA">🇸🇦 Saudi Arabia</option>
                <option value="AE">🇦🇪 UAE</option>
                <option value="EG">🇪🇬 Egypt</option>
                <option value="JO">🇯🇴 Jordan</option>
                <option value="SY">🇸🇾 Syria</option>
              </select>
              <span className="country-code">{countryCodes[country]}</span>
              <input
                type="tel"
                placeholder="70 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <label>Detailed Address</label>
            <input 
              type="text" 
              placeholder="Building, Street, Floor..." 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
            />
          </div>

          <div className="payment-methods">
            <p className="cod-notice">
              💵 <strong>Payment Method:</strong> Cash on Delivery (COD) only.
            </p>
          </div>
        </div>

        <div className="summary-section">
          <h3>Request Summary</h3>

          <div className="items-list">
            {cartItems.length === 0 ? (
              <p className="empty-cart-text">Your cart is empty</p>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="item-row">
                  <span className="item-name">
                    {item.name} {Number(item.qty) > 1 ? `x${item.qty}` : ""}
                  </span>
                  <span className="item-price">${Number(item.price).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <div className="total-row">
            <span>Total</span>
            <span className="total-price">${totalPrice.toFixed(2)}</span>
          </div>

          <button 
            className="confirm-btn" 
            onClick={handleSubmit} 
            disabled={totalPrice <= 0 || loading}
          >
            {loading ? "Processing..." : "Complete Order Now"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Checkout;