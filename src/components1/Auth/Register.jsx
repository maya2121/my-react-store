import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, hasEnv } from "../../firebase.js";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const baseUrl =
    typeof window !== "undefined" && !/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
      ? window.location.origin
      : "https://armanist.com";

const validateEmail = (emailStr) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(emailStr.trim());
};
  const canUseDevLogin = async () => {
    try {
      const res = await fetch(`${baseUrl}/health?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      return !!data?.allowDev;
    } catch {
      return false;
    }
  };
  const handleRegister = async () => {
    setError("");

    // 1. فحص صحة الإيميل
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // 2. فحص طول كلمة المرور (الفايربيس يطلب 6 خانات على الأقل)
    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    try {
      if (!hasEnv || !auth) {
        if (await canUseDevLogin()) {
          localStorage.setItem("devUser", email);
          navigate("/checkout");
          return;
        }
        setError("Please configure Firebase environment");
        return;
      }

      // إنشاء الحساب بفايربيس
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 🚀 الدخول المباشر دغري: جلب التوكن وحفظه والتوجه للكاشير فوراً
      if (userCredential.user) {
        const token = await userCredential.user.getIdToken();
        localStorage.setItem("idToken", token);
        navigate("/checkout");
      }
      
    } catch (e) {
      if (await canUseDevLogin()) {
        localStorage.setItem("devUser", email);
        navigate("/checkout");
        return;
      }
      setError(e?.message || "Registration failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">

        <div className="Logo1">
          <img src="/Images/logo4.png" alt="Logo" />
        </div>

        <h2 style={{color:"white", marginBottom:"20px"}}>Create Account</h2>

        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />

        <button className="login-btn" onClick={handleRegister}>
          Create Account
        </button>
        
        {error && <div style={{ color: "#d61c1c", marginTop: "10px", fontSize: "14px", fontWeight: "500" }}>{error}</div>}

        <p className="register-text">
          Already have an account? <span onClick={() => navigate("/login")}> Login</span>
        </p>

      </div>
    </div>
  );
}

export default Register;
