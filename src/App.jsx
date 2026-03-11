import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Products from "./components/Products/Products.jsx";
import ProductDetails from "./components/Products/ProductDetails.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Login from "./components1/Auth/Login.jsx";
import Register from "./components1/Auth/Register.jsx";
import Checkout from "./components1/Checkout/Checkout.jsx";
import Dashboard from "./admin/pages/Dashboard.jsx";
import AdminProducts from "./admin/pages/AdminProducts.jsx";
import AdminHeroSlider from "./admin/pages/AdminHeroSlider.jsx";
import AdminCategories from "./admin/pages/AdminCategories.jsx";
import Orders from "./admin/pages/Orders.jsx";
import Users from "./admin/pages/Users.jsx";
import Analytics from "./admin/pages/Analytics.jsx";
import AdminLogin from "./admin/pages/AdminLogin.jsx";

function AppContent({ cartItems, setCartItems, addToCart }) {
  const location = useLocation();

  // تحديد إذا كنا في صفحات الأدمن
  const isAdminPage = location.pathname.startsWith("/admin");
  
  // تحديد إذا كنا في صفحة تفاصيل المنتج (عشان الفوتر)
  const isProductPage = location.pathname.includes("/product/");

  return (
    <>
      {/* عرض الناف بار فقط إذا لم نكن في صفحات الأدمن */}
      {!isAdminPage && <Navbar cartItems={cartItems} setCartItems={setCartItems} />}

      <Routes>
        {/* الصفحة الرئيسية */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Products addToCart={addToCart} />
            </>
          }
        />

        {/* صفحة تفاصيل المنتج */}
        <Route 
          path="/product/:id" 
          element={<ProductDetails addToCart={addToCart} />} 
        />

        {/* باقي الصفحات */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout cartItems={cartItems} />} />

        {/* صفحات الأدمن */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/AdminProducts" element={<AdminProducts />} />
        <Route path="/admin/hero" element={<AdminHeroSlider />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/analytics" element={<Analytics />} />
      </Routes>

      {/* عرض الفوتر فقط إذا لم نكن في صفحة المنتج أو الأدمن */}
      {(!isAdminPage && !isProductPage) && <Footer />}
    </>
  );
}

function App() {
  const [cartItems, setCartItems] = useState([]);

  return (
    <BrowserRouter>
      <AppContent cartItems={cartItems} setCartItems={setCartItems} addToCart={addToCart} />
    </BrowserRouter>
  );
}

export default App;
