import { useEffect, useState } from "react";
import "./Checkout.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase.js";
import { onAuthStateChanged } from "firebase/auth";

function Checkout({ cartItems, setCartItems }) {
  const navigate = useNavigate();

  const [country, setCountry] = useState("LB");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const baseUrl =
    typeof window !== "undefined" && !/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
      ? window.location.origin
      : "https://armanist.com";

  const countryCodes = {
    LB: "+961",
    SA: "+966",
    AE: "+971",
    EG: "+20",
    JO: "+962",
    SY: "+963"
  };

  const totalPrice = (Array.isArray(cartItems) ? cartItems : []).reduce((acc, item) => {
    const price = Number.parseFloat(item?.price);
    const qty = Number(item?.qty) || 1;
    return acc + (Number.isFinite(price) ? price * qty : 0);
  }, 0);
  useEffect(() => {
    const hasToken = !!localStorage.getItem("idToken");
    const hasDevUser = !!localStorage.getItem("devUser");
    if (hasToken || hasDevUser) {
      setAuthChecked(true);
      return;
    }
    if (!auth) {
      setAuthChecked(true);
      navigate("/login");
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthChecked(true);
      if (!user) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (!authChecked) return null;

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitError("");
    setSubmitSuccess("");
    if (!name.trim()) {
      setSubmitError("يرجى إدخال الاسم الكامل");
      return;
    }
    if (phone.length < 7) {
      setSubmitError("يرجى إدخال رقم هاتف صحيح");
      return;
    }
    if (!address.trim()) {
      setSubmitError("يرجى إدخال العنوان بالتفصيل");
      return;
    }
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      setSubmitError("السلة فارغة، أضف منتجات أولاً");
      return;
    }
    setSubmitting(true);
    try {
      const total = (Array.isArray(cartItems) ? cartItems : []).reduce((acc, item) => {
        const price = Number.parseFloat(item?.price);
        const qty = Number(item?.qty) || 1;
        return acc + (Number.isFinite(price) ? price * qty : 0);
      }, 0);
      const res = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          phone,
          country,
          address,
          name,
          total
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSubmitError(err?.error || "فشل إرسال الطلب");
        return;
      }
      setSubmitSuccess("تم إرسال الطلب بنجاح");
      if (typeof setCartItems === "function") {
        setCartItems([]);
      }
      setTimeout(() => navigate("/"), 1200);
    } catch {
      setSubmitError("حدث خطأ بالشبكة أثناء إرسال الطلب");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-wrapper">
      <div className="checkout-content">
        <div style={{ gridColumn: "1 / -1", marginBottom: "12px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => navigate("/")}
            style={{ padding: "10px 14px", borderRadius: "10px", background: "#222", color: "#fff", border: "1px solid #333" }}
          >
            ← Back to Store
          </button>
        </div>

        {/* بيانات العميل */}
        <div className="billing-section">
          <h3> Payment and shipping data </h3>

          <div className="input-group">
            <input type="text" placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} />

            {/* الهاتف مع الدولة */}
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
                placeholder="The phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <input type="text" placeholder="Address in detail" value={address} onChange={(e)=>setAddress(e.target.value)} />
          </div>

          <div className="payment-methods">
            <h4> Soft payment</h4>

            <label>
              <input type="radio" name="pay" checked readOnly /> Cash on delivery
            </label>
          </div>
        </div>

        {/* يسار: ملخص السلة */}
        <div className="summary-section">
          <h3>Request summary</h3>

          <div className="items-list">
            {cartItems.map(item => (
              <div key={item.id} className="item-row">
                <span>{item.name}{Number(item.qty) > 1 ? ` x${item.qty}` : ""}</span>
                <span>{item.price}</span>
              </div>
            ))}
          </div>

          <div className="total-row">
            <span>Total</span>
            <span>{totalPrice.toFixed(2)} $</span>
          </div>

          {submitError && <div className="checkout-message checkout-error">{submitError}</div>}
          {submitSuccess && <div className="checkout-message checkout-success">{submitSuccess}</div>}

          <button className="confirm-btn" onClick={handleSubmit} disabled={totalPrice <= 0 || submitting}>
            {submitting ? "جارٍ إرسال الطلب..." : "Complete the order now"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
