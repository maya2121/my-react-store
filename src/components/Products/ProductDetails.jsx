import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams} from "react-router-dom";
import "./ProductDetails.css";

function ProductDetails({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [active, setActive] = useState(0);
  const [lang, setLang] = useState("en");
  const baseUrl = "https://armanist.com";

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/public/products`);
        const data = await res.json();
        const found = Array.isArray(data) ? data.find((p) => String(p.id) === String(id)) : null;
        setProduct(found || null);
      } catch {
        setProduct(null);
      }
    })();
  }, [id]);

  

  const images = useMemo(() => {
    if (!product) return [];
    const arr = [];
    if (product.image) arr.push(product.image);
    if (Array.isArray(product.images)) {
      for (const u of product.images) if (u && !arr.includes(u)) arr.push(u);
    }
    return arr.length ? arr : ["/Images/logo4.png"];
  }, [product]);

  const finalPrice = useMemo(() => {
    if (!product) return null;
    const base = Number(product.price);
    const hasBase = !isNaN(base);
    const dp = Number(product.discountPercent);
    const hasDp = !isNaN(dp) && dp > 0;
    const sp = product.salePrice != null && product.salePrice !== "" ? Number(product.salePrice) : null;
    if (sp != null && !isNaN(sp) && sp < base) return sp;
    if (hasBase && hasDp) return Number((base * (1 - dp / 100)).toFixed(2));
    return hasBase ? base : null;
  }, [product]);

  const handleAdd = () => {
    if (!product) return;
    const price = finalPrice != null ? finalPrice : product.price;
    addToCart({ ...product, price });
    navigate("/checkout");
  };

  if (!product) {
    return (
      <div className="detail-wrapper">
        <div className="detail-content">
          <button className="back-btn" onClick={() => navigate("/")}>← Back to Store</button>
          <div className="not-found">Product not found</div>
        </div>
      </div>
    );
  } 
  
  return (
    <div className="detail-wrapper">
      <div className="detail-content">
        <div className="detail-topbar">
          <button className="back-btn" onClick={() => navigate("/")}>← Back to Store</button>
        </div>
        <div className="detail-grid">
          <div className="detail-gallery">
            <div className="detail-main">
              <img src={images[active]} alt={product.name} />
            </div>
            <div className="detail-thumbs">
              {images.map((u, i) => (
                <img
                  key={i}
                  src={u}
                  className={`thumb ${active === i ? "active" : ""}`}
                  onClick={() => setActive(i)}
                  alt={"thumb"}
                />
              ))}
            </div>
          </div>
          <div className="detail-info">
            <h2>{product.name}</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button className="btn-edit" onClick={() => setLang("en")}>EN</button>
              <button className="btn-edit" onClick={() => setLang("ar")}>AR</button>
            </div>
            <p className="detail-desc">
              {lang === "ar"
                ? (product.descriptionAr || product.description || "")
                : (product.descriptionEn || product.description || "")}
            </p>
            <div className="detail-price">
  {product.salePrice || product.discountPercent ? (
    <>
      <span className="price-old">{Number(product.price).toFixed(2)} $</span>
      <span className="price-new">{finalPrice.toFixed(2)} $</span>
    </>
  ) : (
    <span className="price-new">{Number(product.price).toFixed(2)} $</span>
  )}
</div>
            <button className="detail-buy" onClick={handleAdd}>Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
