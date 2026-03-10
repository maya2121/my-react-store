import React from "react";
import Sidebar from "../components/Sidebar";
import VisitStoreButton from "../components/VisitStoreButton";
import "../styles/admin.css";

const Analytics = () => {
  return (
    <div className="admin-wrapper">
      <Sidebar />

      <div className="admin-main-content">
        <VisitStoreButton />


        <h2>Sales Analytics</h2>

        <div className="analytics-card">
          <p>Orders Today: 35</p>
          <p>Total Revenue: 1500$</p>
          <p>Top Product: Sneakers</p>
        </div>

      </div>
    </div>
  );
};

export default Analytics;