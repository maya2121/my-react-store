import { useNavigate } from "react-router-dom";
import "../../components1/Auth/Login.css";
import { useState } from "react";
function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const baseUrl = "https://armanist.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (password.length < 1) {
      setError("Password is required");
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err?.error || "Login failed");
        return;
      }
      localStorage.setItem("adminUser", username.trim());
      localStorage.setItem("adminPass", password);
      navigate("/admin/AdminProducts");
    } catch (e) {
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
          <input type="text" placeholder="Admin Username" required value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />

          <button type="submit" className="login-btn">Admin Login</button>
        </form>
        {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      </div>
    </div>
  );
}

export default AdminLogin;
