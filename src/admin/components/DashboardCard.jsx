import React from "react";
import "../styles/admin.css";
import { useNavigate } from "react-router-dom";

const DashboardCard = ({ managerName = "Ousama" }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-card">
      <h2>Welcome back, {managerName}</h2>

      <p className="dashboard-text">
        Here is a quick overview of your store performance.
      </p>

      <button 
        className="visit-store-btn"
        onClick={() => navigate('/')}
      >
        Visit Store
      </button>
    </div>
  );
};

export default DashboardCard;