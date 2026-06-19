import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import VisitStoreButton from "../components/VisitStoreButton";
import "../styles/admin.css";

const Orders = () => {

  const [orders, setOrders] = useState([]);
  const baseUrl =
    typeof window !== "undefined" && !/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
      ? window.location.origin
      : "https://armanist.com";

  const headersFor = () => {
    const h = {};
    const u = localStorage.getItem("adminUser");
    const p = localStorage.getItem("adminPass");
    if (u && p) {
      h["x-admin-user"] = u;
      h["x-admin-pass"] = p;
    }
    return h;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${baseUrl}/orders?t=${Date.now()}`, {
          headers: headersFor(),
          cache: "no-store"
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => []);
        setOrders(Array.isArray(data) ? data : []);
      } catch {}
    };
    const handleNewOrder = (e) => {
      const order = e.detail;
      if (!order?.id) return;
      setOrders((prev) => [order, ...(Array.isArray(prev) ? prev.filter((o) => o.id !== order.id) : [])]);
    };
    const handleOrderUpdated = (e) => {
      const order = e.detail;
      if (!order?.id) return;
      setOrders((prev) => (Array.isArray(prev) ? prev.map((o) => (o.id === order.id ? order : o)) : prev));
    };
    const handleOrderDeleted = (e) => {
      const orderId = e.detail?.id;
      if (!orderId) return;
      setOrders((prev) => (Array.isArray(prev) ? prev.filter((o) => o.id !== orderId) : prev));
    };
    load();
    const t = setInterval(load, 5000);
    window.addEventListener("admin:new-order", handleNewOrder);
    window.addEventListener("admin:order-updated", handleOrderUpdated);
    window.addEventListener("admin:order-deleted", handleOrderDeleted);
    return () => {
      clearInterval(t);
      window.removeEventListener("admin:new-order", handleNewOrder);
      window.removeEventListener("admin:order-updated", handleOrderUpdated);
      window.removeEventListener("admin:order-deleted", handleOrderDeleted);
    };
  }, []);

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`${baseUrl}/orders/${encodeURIComponent(id)}/status`, {
        method: "PUT",
        headers: { ...headersFor(), "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) return;
      const updated = await res.json().catch(() => null);
      if (updated?.id) {
        setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      }
    } catch {}
  };

  const deleteOrder = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/orders/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: headersFor()
      });
      if (!res.ok) return;
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch {}
  };

  const getStatusClass = (status) => {
    const value = String(status || "pending").toLowerCase();
    if (value.includes("deliver")) return "status-delivered";
    if (value.includes("process")) return "status-processing";
    return "status-new";
  };

  const getStatusLabel = (status) => {
    const value = String(status || "pending").toLowerCase();
    if (value.includes("deliver")) return "Delivered";
    if (value.includes("process")) return "Processing";
    return "Pending";
  };

  return (
    <div className="admin-wrapper">
      <Sidebar />

      <div className="admin-main-content">
        <VisitStoreButton />

        <h2 className="page-title">Orders</h2>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.name || "—"}</td>
                <td>{order.phone || "—"}</td>
                <td>{order.total != null ? `$${order.total}` : "—"}</td>
                <td><span className={`status-badge ${getStatusClass(order.status)}`}>{getStatusLabel(order.status)}</span></td>
                <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn-success"
                      onClick={() => updateOrderStatus(order.id, "delivered")}
                      disabled={String(order.status || "").toLowerCase().includes("deliver")}
                    >
                      تم التسليم
                    </button>
                    <button className="btn-danger" onClick={() => deleteOrder(order.id)}>
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
      </div>

  );
};

export default Orders;
