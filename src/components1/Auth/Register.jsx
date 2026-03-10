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
  return (
    <div className="login-page">
      <div className="login-box">

        <div className="Logo1">
          <img src="/Images/logo4.png" alt="Logo" />
        </div>

        <h2 style={{color:"white", marginBottom:"20px"}}>Create Account</h2>

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button
          className="login-btn"
          onClick={async () => {
            try {
              if (!hasEnv || !auth) {
                const res = await fetch("http://localhost:8080/health");
                const data = await res.json();
                if (data?.allowDev) {
                  localStorage.setItem("devUser", email);
                  navigate("/checkout");
                  return;
                }
                setError("Please configure Firebase environment");
                return;
              }
              await createUserWithEmailAndPassword(auth, email, password);
              navigate("/login");
            } catch (e) {
              try {
                const res = await fetch("http://localhost:8080/health");
                const data = await res.json();
                if (data?.allowDev) {
                  localStorage.setItem("devUser", email);
                  navigate("/checkout");
                  return;
                }
              } catch {}
              setError(e?.message || "Registration failed");
            }
          }}
        >
          Create Account
        </button>
        {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}

        <p className="register-text">
          Already have an account? <span onClick={() => navigate("/login")}> Login</span>
        </p>

      </div>
    </div>
  );
}

export default Register;
