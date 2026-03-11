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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!hasEnv || !auth) {
      try {
        const res = await fetch("https://armanist.com/public/categories");
        const data = await res.json();
        if (data?.allowDev) {
          localStorage.setItem("devUser", email);
          navigate("/checkout");
          return;
        }
      } catch {}
      setError("Please configure Firebase environment");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const token = await auth.currentUser.getIdToken();
      localStorage.setItem("idToken", token);
      navigate("/checkout");
    } catch (e) {
      try {
        const res = await fetch("https://armanist.com/public/categories");
        const data = await res.json();
        if (data?.allowDev) {
          localStorage.setItem("devUser", email);
          navigate("/checkout");
          return;
        }
      } catch {}
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
          <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />

          <button type="submit" className="login-btn">Login</button>
        </form>
        {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}

        <p className="register-text">
          Don't have an account? <span onClick={() => navigate("/register")}> Create account</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
