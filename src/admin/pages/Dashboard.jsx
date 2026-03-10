import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import VisitStoreButton from "../components/VisitStoreButton";
import "../styles/admin.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const baseUrl = "http://localhost:8080";
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");

  const headersFor = (withContentType = false) => {
    const h = {};
    const u = localStorage.getItem("adminUser");
    const p = localStorage.getItem("adminPass");
    if (u && p) {
      h["x-admin-user"] = u;
      h["x-admin-pass"] = p;
    }
    if (withContentType) h["Content-Type"] = "application/json";
    return h;
  };

  useEffect(() => {
    const credsUser = localStorage.getItem("adminUser");
    const credsPass = localStorage.getItem("adminPass");
    if (!credsUser || !credsPass) {
      navigate("/admin/login");
      return;
    }
    const load = async () => {
      setLoading(true);
      setStatusMsg("");
      try {
        const [ordersRes, productsRes, adminsRes] = await Promise.all([
          fetch(`${baseUrl}/orders`, { headers: headersFor() }),
          fetch(`${baseUrl}/products`, { headers: headersFor() }),
          fetch(`${baseUrl}/admin-users`, { headers: headersFor() })
        ]);
        if ([ordersRes, productsRes, adminsRes].some(r => r.status === 401)) {
          localStorage.removeItem("adminUser");
          localStorage.removeItem("adminPass");
          navigate("/admin/login");
          return;
        }
        if (!ordersRes.ok || !productsRes.ok || !adminsRes.ok) {
          const err = await ordersRes.json().catch(() => ({}));
          setStatusMsg(err?.error || "Failed to load dashboard data");
          setLoading(false);
          return;
        }
        const ordersData = await ordersRes.json().catch(() => []);
        const productsData = await productsRes.json().catch(() => []);
        const adminsData = await adminsRes.json().catch(() => []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setAdmins(Array.isArray(adminsData) ? adminsData : []);
      } catch {
        setStatusMsg("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const getOrderTotal = (order) => {
    if (typeof order.total === "number") return order.total;
    if (typeof order.total === "string") {
      const n = Number(String(order.total).replace(/[^0-9.]/g, ""));
      if (!isNaN(n)) return n;
    }
    if (Array.isArray(order.items)) {
      return order.items.reduce((sum, item) => {
        const price = Number(String(item.price || item.salePrice || 0).replace(/[^0-9.]/g, ""));
        const qty = Number(item.qty || 1);
        return sum + (isNaN(price) ? 0 : price) * (isNaN(qty) ? 1 : qty);
      }, 0);
    }
    return 0;
  };

  const revenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + getOrderTotal(o), 0);
  }, [orders]);

  const latestOrders = useMemo(() => {
    return orders
      .slice()
      .sort((a, b) => {
        const da = Date.parse(a.createdAt || a.id || 0);
        const db = Date.parse(b.createdAt || b.id || 0);
        return db - da;
      })
      .slice(0, 6);
  }, [orders]);

  const stats = useMemo(() => ([
    { title: "Total Orders", value: orders.length },
    { title: "Admins", value: admins.length },
    { title: "Revenue", value: `$${revenue.toFixed(2)}` },
    { title: "Products", value: products.length }
  ]), [orders.length, admins.length, revenue, products.length]);

  return (
    <div className="admin-wrapper">
      <Sidebar />

      <div className="admin-main-content">
        <VisitStoreButton />

        <h2 className="page-title">Dashboard</h2>

        {statusMsg && <div className="card" style={{ color: "red" }}>{statusMsg}</div>}

        <div className="dashboard-hero">
          <div>
            <h2>Welcome back, {localStorage.getItem("adminUser") || "Admin"}</h2>
            <p>Here is a live overview of your store performance.</p>
          </div>
          <div className="dashboard-actions">
            <button className="btn-primary" onClick={() => navigate("/admin/AdminProducts")}>Manage Products</button>
            <button className="btn-edit" onClick={() => navigate("/admin/orders")}>View Orders</button>
            <button className="btn-edit" onClick={() => navigate("/admin/hero")}>Hero Slider</button>
          </div>
        </div>

        <div className="dashboard-grid">
          {stats.map((item, index) => (
            <div key={index} className="stat-card">
              <span className="stat-label">{item.title}</span>
              <span className="stat-value">{loading ? "..." : item.value}</span>
              <span className="stat-sub">{loading ? "" : "Updated now"}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Latest Orders</h3>
            <button className="btn-edit" onClick={() => navigate("/admin/orders")}>Open Orders</button>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading...</td>
                </tr>
              ) : latestOrders.length === 0 ? (
                <tr>
                  <td colSpan="5">No orders yet</td>
                </tr>
              ) : (
                latestOrders.map(order => {
                  const total = getOrderTotal(order);
                  const status = order.status || "New";
                  const date = order.createdAt ? new Date(order.createdAt).toLocaleString() : "—";
                  const statusClass = status.toLowerCase().includes("deliver")
                    ? "status-delivered"
                    : status.toLowerCase().includes("process")
                      ? "status-processing"
                      : "status-new";
                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.name || "—"}</td>
                      <td>${total.toFixed(2)}</td>
                      <td>{date}</td>
                      <td><span className={`status-badge ${statusClass}`}>{status}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
      </div>
  );
};

export default Dashboard;
