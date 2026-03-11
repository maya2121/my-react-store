import React, { useState } from "react";

const SalesFilter = () => {
  const [, setActiveTab] = useState("monthly");
  const [activeType, setActiveType] = useState("sales");

  return (
    <div className="sales-filter">
      <div>
        <button
          className={activeType === "sales" ? "active" : ""}
          onClick={() => setActiveType("sales")}
        >
          Sales
        </button>

        <button
          className={activeType === "orders" ? "active" : ""}
          onClick={() => setActiveType("orders")}
        >
          Orders
        </button>
      </div>

      <div>
        <button onClick={() => setActiveTab("weekly")}>Weekly</button>
        <button onClick={() => setActiveTab("monthly")}>Monthly</button>
        <button onClick={() => setActiveTab("yearly")}>Yearly</button>
      </div>
    </div>
  );
};

export default SalesFilter;
