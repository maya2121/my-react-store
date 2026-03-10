import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/admin.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");
  const baseUrl = "http://localhost:8080";
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const notifRef = useRef(null);
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.value = 0.05;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => { o.stop(); ctx.close(); }, 180);
    } catch {}
  };

  useEffect(() => {
    const username = localStorage.getItem("adminUser");
    const password = localStorage.getItem("adminPass");
    if (!username || !password) {
      navigate("/admin/login");
      return;
    }
    setAdminName(username);
    fetch(`${baseUrl}/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem("adminUser");
          localStorage.removeItem("adminPass");
          navigate("/admin/login");
        }
          const es = new EventSource(`${baseUrl}/admin/notifications/stream?u=${encodeURIComponent(username)}&p=${encodeURIComponent(password)}`, {
            withCredentials: false
          });
          es.onmessage = (e) => {
            try {
              const data = JSON.parse(e.data);
              if (data?.type === "order") {
                setNotifCount((c) => c + 1);
                setNotifList((list) => {
                  const item = {
                    id: data.order?.id,
                    name: data.order?.name || "New order",
                    total: data.order?.total,
                    time: data.order?.createdAt || new Date().toISOString()
                  };
                  const next = [item, ...list].slice(0, 5);
                  return next;
                });
                setNotifOpen(true);
                playBeep();
              }
            } catch {}
          };
          es.onerror = () => {
            es.close();
          };
      })
      .catch(() => {
        localStorage.removeItem("adminUser");
        localStorage.removeItem("adminPass");
        navigate("/admin/login");
      });
  }, [navigate]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (!notifOpen) return;
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside, true);
    };
  }, [notifOpen]);


  return (
    <header className="admin-navbar">
      <div className="navbar-left">
<div className="header-actions">
  <div className="header-user">
    <img src="https://via.placeholder.com/30" alt="admin" />
    {adminName}
  </div>
  <div className="notif-wrap" ref={notifRef}>
    <button  className="Notifications" title="Notifications" onClick={() => { setNotifOpen((o) => !o); setNotifCount(0); }}>
      🔔 {notifCount > 0 ? `(${notifCount})` : ""}
    </button>
    {notifOpen && (
      <div className="notif-panel">
        <div className="notif-header">
          <span>Notifications</span>
          <button className="btn-edit" onClick={() => setNotifOpen(false)}>Close</button>
        </div>
        {notifList.length === 0 ? (
          <div className="notif-empty">No notifications</div>
        ) : (
          notifList.map((n) => (
            <div key={n.id} className="notif-item" onClick={() => navigate("/admin/orders")}>
              <div className="notif-title">Order {n.id}</div>
              <div className="notif-sub">{n.name} • {n.total != null ? `$${n.total}` : ""}</div>
            </div>
          ))
        )}
        <div className="notif-footer">
          <button className="btn-primary" onClick={() => navigate("/admin/orders")}>Open Orders</button>
          <button className="btn-danger" onClick={() => { setNotifList([]); setNotifCount(0); }}>Clear</button>
        </div>
      </div>
    )}
  </div>

  
</div>
</div>


      <nav className="navbar-links">
        <Link to="/admin" className="nav-item">Dashboard</Link>
        <Link to="/admin/AdminProducts" className="nav-item">Products</Link>
        <Link to="/admin/hero" className="nav-item">Hero Slider</Link>
        <Link to="/admin/categories" className="nav-item">Categories</Link>
        <Link to="/admin/orders" className="nav-item">Orders</Link>
        <Link to="/admin/users" className="nav-item">Users</Link>
      </nav>

      <div className="navbar-right">
        <button 
          onClick={() => {
            localStorage.removeItem("adminUser");
            localStorage.removeItem("adminPass");
            navigate("/admin/login");
          }}
          className="logout-btn"
        >
          Logout
        </button>
      </div>

    </header>
  );
};

export default Sidebar;
