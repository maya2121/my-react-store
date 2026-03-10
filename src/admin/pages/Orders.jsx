import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import VisitStoreButton from "../components/VisitStoreButton";
import "../styles/admin.css";

const Orders = () => {

  const [orders, setOrders] = useState([]);
  const baseUrl = "https://armanist.com";

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
        const res = await fetch(`${baseUrl}/orders`, { headers: headersFor() });
        if (!res.ok) return;
        const data = await res.json().catch(() => []);
        setOrders(Array.isArray(data) ? data : []);
      } catch {}
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const deleteOrder = (id) => {
    setOrders(orders.filter(o => o.id !== id));
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
                <td>{order.createdAt || "—"}</td>
                <td>
                  <button className="btn-danger" onClick={() => deleteOrder(order.id)}>
                    Cancel
                  </button>
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
