import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TrackOrder.css";
import LiveMap from "./LiveMap";

function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(12);
  const [orderStatus, setOrderStatus] = useState(
    "🚴 Driver is picking up your order"
  );

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      setLoading(true);

      try {
        const res = await fetch(`/api/orders/${orderId}`);

        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((oldTime) => {
        if (oldTime <= 0) {
          setOrderStatus("🎁 Order Delivered");
          return 0;
        }

        if (oldTime <= 3) {
          setOrderStatus("📍 Driver is very close!");
        } else if (oldTime <= 8) {
          setOrderStatus("🚴 Driver is on the way");
        }

        return oldTime - 1;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <h2
        style={{
          textAlign: "center",
          padding: "50px",
        }}
      >
        Loading...
      </h2>
    );
  }

  return (
    <div className="track-wrapper">
      <div className="track-container">

        <div className="track-card">

          <h2 className="track-title">
            Live Order Tracking
          </h2>

          <p className="track-order-id">
            Order ID:
            <span className="track-highlight">
              #{orderId || "74920"}
            </span>
          </p>

          <hr className="track-divider" />

          <div className="track-status-box">
            <p className="track-status-label">
              Current Status
            </p>

            <h3 className="track-status-value">
              {orderStatus}
            </h3>
          </div>

          {timeLeft > 0 && (
            <div className="track-time-box">
              <span className="track-time-icon">
                ⏳
              </span>

              <p className="track-time-text">
                Estimated Delivery:
                <strong>
                  {" "}
                  {timeLeft} Minutes
                </strong>
              </p>
            </div>
          )}

          <div className="track-driver-card">

            <div className="track-driver-avatar">
              🚴
            </div>

            <div>
              <h4 className="track-driver-name">
                Ahmad Al-Mohammad
              </h4>

              <p className="track-driver-sub">
                Delivery Captain
              </p>

              <p className="track-driver-stats">
                📍 Live Tracking Enabled
              </p>
            </div>

          </div>

          <div className="track-timeline">

            <div className="step active">
              ✅ Order Confirmed
            </div>

            <div className="step active">
              ✅ Preparing Order
            </div>

            <div className="step active">
              🚴 Picked Up
            </div>

            <div className="step current">
              📍 On The Way
            </div>

            <div className="step">
              🎁 Delivered
            </div>

          </div>

          <button
            onClick={() => navigate("/")}
            className="track-back-btn"
          >
            Back to Store
          </button>

        </div>

        <div className="track-map-box">
          <LiveMap />
        </div>

      </div>
    </div>
  );
}

export default TrackOrder;