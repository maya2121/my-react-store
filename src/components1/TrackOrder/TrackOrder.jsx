import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './TrackOrder.css';
import LiveMap from "./LiveMap";

function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // حالات الطلب والسائق
  const [timeLeft, setTimeLeft] = useState(12); 
  const [orderStatus, setOrderStatus] = useState("Driver is picking up your order");
  const [progress, setProgress] = useState(10); 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false); // تم إضافة الـ loading هنا ليشتغل الكود بدون خطأ

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // محاكاة حية لتحرك السائق والوقت المتبقي
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(interval);
          setOrderStatus("🎁 Order Arrived! Enjoy your product.");
          setTimeLeft(0);
          return 100;
        }
        
        if (oldProgress > 40 && oldProgress < 80) {
          setOrderStatus("🚴‍♂️ Driver is on the way to your address");
        } else if (oldProgress >= 80) {
          setOrderStatus("📍 Driver is very close to your location!");
        }

        return oldProgress + 15; 
      });

      setTimeLeft((oldTime) => (oldTime > 2 ? oldTime - 2 : 0));
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <h2 style={{ textAlign: "center", padding: "50px" }}>Loading...</h2>;
  }
  
  // إذا لم يكن هناك orderId (زيارة الرابط العام) أو لم يجد الطلب بعد الفحص
  if (!orderId) {
    // سنعرض محاكاة افتراضية إذا دخل المستخدم بدون ID محدد حتى لا تظهر الصفحة فارغة
  } else if (!order && !loading) {
    return <h2 style={{ textAlign: "center", padding: "50px" }}>Order not found</h2>;
  }

  return (
    <div className="track-wrapper">
      <div className="track-container">
        
        {/* قسم تفاصيل الطلب */}
        <div className="track-card">
          <h2 className="track-title">Live Order Tracking</h2>
          <p className="track-order-id">Order ID: <span className="track-highlight">#{orderId || "74920"}</span></p>
          
          <hr className="track-divider" />

          <div className="track-status-box">
            <p className="track-status-label">Current Status:</p>
            <h3 className="track-status-value">{orderStatus}</h3>
          </div>

          {timeLeft > 0 && (
            <div className="track-time-box">
              <span className="track-time-icon">⏳</span>
              <p className="track-time-text">Estimated Delivery: <strong>{timeLeft} Minutes</strong></p>
            </div>
          )}

          {/* تفاصيل كابتن التوصيل */}
          <div className="track-driver-card">
            <div className="track-driver-avatar">🚴‍♂️</div>
            <div>
              <h4 className="track-driver-name">Ahmad Al-Mohammad</h4>
              <p className="track-driver-sub">Armanist Delivery Captain</p>
            </div>
          </div>

          <button onClick={() => navigate("/")} className="track-back-btn">
            Back to Store
          </button>
        </div>

        {/* قسم الخريطة التفاعلية والمسار الذكي */}
        <div className="track-map-box">
          <LiveMap />
          </div>
          
          {/* شريط تتبع المسار التفاعلي المطور */}
          <div className="track-road">
            <div className="track-progress-bar" style={{ width: `${progress}%` }}>
              <div className="track-driver-marker">🚴‍♂️</div>
            </div>
          </div>

          <div className="track-map-footer">
          <p>The map updates instantly as the driver moves towards your delivery address.</p>
          </div>
        </div>

      </div>
  );
}

export default TrackOrder;