import React from "react";
import "../styles/admin.css";

const payments = [
  { method: "Paypal", amount: "0.00", count: 1 },
  { method: "Master Card", amount: "0.00", count: 2 },
  { method: "Visa Card", amount: "0.00", count: 3 },
];

const PaymentPerformance = () => {
  return (
    <div className="payment-card">

      {payments.map((item) => (
        <div key={item.count} className="payment-row">
          <span>{item.amount}</span>
          <span>{item.method}</span>
          <span className="payment-count">{item.count}</span>
        </div>
      ))}
    </div>
  );
};

export default PaymentPerformance;