import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, hasEnv } from "../../firebase.js";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const baseUrl =
    typeof window !== "undefined" && !/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
      ? window.location.origin
      : "https://armanist.com";

  // دالة للتحقق من صحة صيغة الإيميل لمنع العشوائية
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // شرط التحقق من صحة الإيميل قبل أي عملية
    if (!validateEmail(email)) {
      setError("Please enter a valid email address (e.g., example@domain.com)");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!hasEnv || !auth) {
      if (await canUseDevLogin()) {
        localStorage.setItem("devUser", email);
        navigate("/checkout");
        return;
      }
      setError("Please configure Firebase environment");
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const token = await auth.currentUser.getIdToken();
      localStorage.setItem("idToken", token);
      localStorage.removeItem("devUser");
      navigate("/checkout");
    } catch (e) {
      if (await canUseDevLogin()) {
        localStorage.setItem("devUser", email);
        navigate("/checkout");
        return;
      }
      setError(e?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="Logo1">
          <img src="/Images/logo4.png" alt="Logo" />
        </div>

        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />

          <button type="submit" className="login-btn">Login</button>
        </form>
        {error && <div style={{ color: "#d61c1c", marginTop: "10px", fontSize: "14px", fontWeight: "500" }}>{error}</div>}

        <p className="register-text">
          Don't have an account? <span onClick={() => navigate("/register")}> Create account</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
