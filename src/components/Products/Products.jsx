import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Products.css";

function Products({ addToCart }) {

  const navigate = useNavigate();
  const [addedProduct, setAddedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const baseUrl = "https://armanist.com";
    useEffect(() => {
    (async () => {
      try {
        const [resP, resC] = await Promise.all([
          fetch(`${baseUrl}/public/products`),
          fetch(`${baseUrl}/public/categories`)
        ]);
        const dataP = await resP.json().catch(() => []);
        const dataC = await resC.json().catch(() => []);
        if (Array.isArray(dataP)) setProducts(dataP);
        if (Array.isArray(dataC)) setCategories(dataC);
      } catch {}
    })();
  }, []);
  const getCat = (p) => {
    const c = ((p.category || "") + "").toLowerCase();
    const walletsKeys = ["wallets","wallet","جزدان","محفظة","محفظ"];
    const perfumesKeys = ["perfumes","perfume","عطر","عطور"];
    if (walletsKeys.some(k => c.includes(k))) return "wallets";
    if (perfumesKeys.some(k => c.includes(k))) return "perfumes";
    return "watches";
  };
  const watches = products.filter(p => getCat(p) === "watches");
  const wallests = products.filter(p => getCat(p) === "wallets");
  const perfumes = products.filter(p => getCat(p) === "perfumes");
  const hasDynamic = Array.isArray(categories) && categories.length > 0;
  const grouped = hasDynamic
    ? categories.map(c => ({
        name: c.name,
        slug: (c.slug || c.name || "").toLowerCase(),
        items: products.filter(p => {
          const catP = ((p.category || "") + "").toLowerCase();
          const catC = ((c.name || "") + "").toLowerCase();
          return catP.includes(catC);
        })
      }))
    : [
        { name: "Watches", slug: "watches", items: watches },
        { name: "Wallets", slug: "wallets", items: wallests },
        { name: "Perfumes", slug: "perfumes", items: perfumes }
      ];

  const handleAddToCart = (product) => {
    const base = Number(product.price);
    const hasBase = !isNaN(base);
    const dp = Number(product.discountPercent);
    const hasDp = !isNaN(dp) && dp > 0;
    const sp = product.salePrice != null && product.salePrice !== "" ? Number(product.salePrice) : null;
    const finalPrice = sp != null && !isNaN(sp)
      ? sp
      : hasBase && hasDp
        ? Number((base * (1 - dp / 100)).toFixed(2))
        : product.price;
    addToCart({ ...product, price: finalPrice });
    setAddedProduct(product.id);

    setTimeout(() => {
      setAddedProduct(null);
    }, 800);
  };

  return (
    <div className="products-container" id="products-section">
        <h1>Products</h1>
      {grouped.map(group => (
        <div key={group.slug}>
          <h2 id={group.slug} className="products-address">{group.name}</h2>
          <div className="products-grid">
  {group.items.map(product => (
    <div
      key={product.id}
      className={`product-card ${addedProduct === product.id ? "added" : ""}`}
    >
      <img src={(() => {
        const primary = product.image;
        const extra = Array.isArray(product.images) ? product.images[0] : null;
        const chosen = primary || extra;
        return (chosen && !String(chosen).startsWith("blob:")) ? chosen : "/Images/logo4.png";
      })()} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <span className="price">
        {(() => {
          const base = Number(product.price);
          const hasBase = !isNaN(base);
          const dp = Number(product.discountPercent);
          const hasDp = !isNaN(dp) && dp > 0;
          const sp = product.salePrice != null && product.salePrice !== "" ? Number(product.salePrice) : null;
          const finalPrice = sp != null && !isNaN(sp)
            ? sp
            : hasBase && hasDp
              ? Number((base * (1 - dp / 100)).toFixed(2))
              : null;
          if (finalPrice != null && hasBase) {
            return (
          <>
            <span style={{ textDecoration: "line-through", color: "#888", marginRight: "8px" }}>
              {(typeof product.price === "number" ? product.price.toFixed(2) : product.price) + " $"}
            </span>
            <span style={{ color: "red", fontWeight: "bold" }}>
              {finalPrice.toFixed(2) + " $"}
            </span>
          </>
            );
          }
          return (typeof product.price === "number" ? product.price.toFixed(2) : product.price) + " $";
        })()}
      </span>

      <button className="By-now" onClick={() => handleAddToCart(product)}>
        Buy
      </button>
      <button className="details-btn" onClick={() => navigate(`/product/${product.id}`)}>
        Details
      </button>
    </div>
  ))}
</div>
        </div>
      ))}
</div>

  );
}

export default Products;
