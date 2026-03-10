import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import VisitStoreButton from "../components/VisitStoreButton";
import "../styles/admin.css";
import { auth, hasEnv } from "../../firebase.js";

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    descriptionAr: "",
    descriptionEn: "",
    category: "Watches",
    discountPercent: "",
    salePrice: "",
    images: []
  });
  const [editingId, setEditingId] = useState(null);
  const baseUrl = "http://localhost:8080";
  const [discountAll, setDiscountAll] = useState("");
  const [categories, setCategories] = useState([]);
  const getToken = async () => {
    if (!hasEnv || !auth) return null;
    const u = auth.currentUser;
    return u ? await u.getIdToken() : null;
  };
  const getAdminCreds = () => {
    const u = localStorage.getItem("adminUser");
    const p = localStorage.getItem("adminPass");
    return u && p ? { u, p } : null;
  };
  const [authWarning, setAuthWarning] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const handleUnauthorized = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminPass");
    navigate("/admin/login");
  };
  const headersFor = (token) => {
    const h = {};
    if (token) h.Authorization = `Bearer ${token}`;
    const creds = getAdminCreds();
    if (creds) {
      h["x-admin-user"] = creds.u;
      h["x-admin-pass"] = creds.p;
    }
    return h;
  };

  useEffect(() => {
    const load = async () => {
      const creds = getAdminCreds();
      if (creds) {
        try {
          const res = await fetch(`${baseUrl}/admin-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: creds.u, password: creds.p })
          });
          if (!res.ok) {
            handleUnauthorized();
            return;
          }
        } catch {
          handleUnauthorized();
          return;
        }
      } else {
        handleUnauthorized();
        return;
      }
      const token = await getToken();
      if (!token && !creds) {
        setAuthWarning("Please login to manage products");
      } else {
        setAuthWarning("");
      }
      const [resProducts, resCategories] = await Promise.all([
        fetch(`${baseUrl}/products`, { headers: headersFor(token) }),
        fetch(`${baseUrl}/categories`, { headers: headersFor(token) })
      ]);
      if (resProducts.status === 401 || resCategories.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!resProducts.ok) {
        const err = await resProducts.json().catch(() => ({}));
        setStatusMsg(err?.error || "Failed to load products");
        return;
      }
      const dataP = await resProducts.json().catch(() => []);
      setProducts(Array.isArray(dataP) ? dataP : []);
      const dataC = await resCategories.json().catch(() => []);
      setCategories(Array.isArray(dataC) ? dataC : []);
    };
    load();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...newProduct, [name]: value };
    if (name === "discountPercent") {
      const dp = Number(value);
      const base = Number(next.price);
      if (!isNaN(dp) && !isNaN(base) && base > 0 && dp >= 0 && dp <= 100) {
        next.salePrice = (base * (1 - dp / 100)).toFixed(2);
      }
    }
    setNewProduct(next);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        try {
          const token = await getToken();
          const res = await fetch(`${baseUrl}/upload-image`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...headersFor(token)
            },
            body: JSON.stringify({ dataUrl })
          });
          if (res.ok) {
            const { url } = await res.json();
            setNewProduct({ ...newProduct, image: url });
            setStatusMsg("Image uploaded");
          } else {
            if (res.status === 401) {
              handleUnauthorized();
              return;
            }
            setNewProduct({ ...newProduct, image: dataUrl });
            const err = await res.json().catch(() => ({}));
            setStatusMsg(err?.error || "Stored image locally (dev mode)");
          }
        } catch {
          setNewProduct({ ...newProduct, image: dataUrl });
          setStatusMsg("Stored image locally (network error)");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMoreImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        try {
          const token = await getToken();
          const res = await fetch(`${baseUrl}/upload-image`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...headersFor(token)
            },
            body: JSON.stringify({ dataUrl })
          });
          if (res.ok) {
            const { url } = await res.json();
            setNewProduct(prev => ({ ...prev, images: [...prev.images, url] }));
          } else {
            if (res.status === 401) {
              handleUnauthorized();
              return;
            }
            setNewProduct(prev => ({ ...prev, images: [...prev.images, dataUrl] }));
          }
        } catch {
          setNewProduct(prev => ({ ...prev, images: [...prev.images, dataUrl] }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImageAt = (idx) => {
    setNewProduct(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const setPrimaryImage = (idx) => {
    setNewProduct(prev => {
      const arr = [...prev.images];
      const primary = arr[idx];
      const rest = arr.filter((_, i) => i !== idx);
      return { ...prev, image: primary, images: rest };
    });
  };

  const addProduct = () => {
    if (!newProduct.name || newProduct.price === "" || isNaN(Number(newProduct.price))) {
      setStatusMsg("Please fill name and a valid price");
      return;
    }

    (async () => {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headersFor(token)
        },
        body: JSON.stringify({
          name: newProduct.name,
          price: Number(newProduct.price),
          image: newProduct.image,
          description: newProduct.description,
          descriptionAr: newProduct.descriptionAr,
          descriptionEn: newProduct.descriptionEn,
          category: newProduct.category,
          discountPercent: newProduct.discountPercent ? Number(newProduct.discountPercent) : undefined,
          salePrice: newProduct.salePrice ? Number(newProduct.salePrice) : undefined,
          images: Array.isArray(newProduct.images) ? newProduct.images : []
        })
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatusMsg(err?.error || "Failed to add product");
        return;
      }
      const created = await res.json();
      if (created && created.id) {
        setProducts([...products, created]);
        setNewProduct({ name: "", price: "", image: "", description: "", category: "Watches", discountPercent: "", salePrice: "", images: [] });
        setStatusMsg("Product added");
      }
    })();
  };

  const deleteProduct = (id) => {
    (async () => {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/products/${id}`, {
        method: "DELETE",
        headers: headersFor(token)
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      setProducts(products.filter(p => p.id !== id));
      setStatusMsg("Product deleted");
    })();
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setNewProduct({
      ...product,
      description: product.description ?? "",
      descriptionAr: product.descriptionAr ?? "",
      descriptionEn: product.descriptionEn ?? "",
      discountPercent: product.discountPercent ?? "",
      salePrice: product.salePrice ?? "",
      images: Array.isArray(product.images)
        ? product.images
        : product.image
          ? [product.image]
          : []
    });
  };

  const applyDiscountAll = () => {
    const dp = Number(discountAll);
    if (isNaN(dp) || dp < 0 || dp > 100) {
      setStatusMsg("Please enter discount between 0 and 100");
      return;
    }
    (async () => {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/products/discount-all`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...headersFor(token)
        },
        body: JSON.stringify({ discountPercent: dp })
      });
      if (!res.ok) {
        if (res.status === 401) {
          handleUnauthorized();
          return;
        }
        const err = await res.json().catch(() => ({}));
        setStatusMsg(err?.error || "Failed to apply discount");
        return;
      }
      const next = products.map(p => ({
        ...p,
        discountPercent: dp,
        salePrice: p.price ? Number((Number(p.price) * (1 - dp / 100)).toFixed(2)) : p.salePrice
      }));
      setProducts(next);
      setStatusMsg("Discount applied to all products");
    })();
  };

  const saveEdit = async () => {
    const token = await getToken();
    const res = await fetch(`${baseUrl}/products/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...headersFor(token)
      },
      body: JSON.stringify({
        name: newProduct.name,
        price: Number(newProduct.price),
        image: newProduct.image,
        description: newProduct.description,
        descriptionAr: newProduct.descriptionAr,
        descriptionEn: newProduct.descriptionEn,
        category: newProduct.category,
        discountPercent: newProduct.discountPercent ? Number(newProduct.discountPercent) : undefined,
        salePrice: newProduct.salePrice ? Number(newProduct.salePrice) : undefined,
        images: Array.isArray(newProduct.images) ? newProduct.images : undefined
      })
    });
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatusMsg(err?.error || "Failed to save changes");
      return;
    }
    const updated = await res.json();
    setProducts(products.map(p => p.id === editingId ? updated : p));
    setEditingId(null);
    setNewProduct({ name: "", price: "", image: "", description: "", descriptionAr: "", descriptionEn: "", category: "Watches", discountPercent: "", salePrice: "", images: [] });
    setStatusMsg("Changes saved");
  };

  return (
    <div className="admin-wrapper">
      <Sidebar />

      <div className="admin-main-content">
        <VisitStoreButton />

        <h2 className="page-title">Products Management</h2>
        {authWarning && <div className="card" style={{ color: "red" }}>{authWarning}</div>}
        {statusMsg && <div className="card" style={{ color: "green" }}>{statusMsg}</div>}

        <div className="card">
          <h3>{editingId ? "Edit Product" : "Add Product"}</h3>

          <input name="name" placeholder="Product name" value={newProduct.name} onChange={handleChange}/>
          <input name="price" type="number" placeholder="Price" value={newProduct.price} onChange={handleChange}/>
          <input name="discountPercent" type="number" placeholder="Discount % (0-100)" value={newProduct.discountPercent} onChange={handleChange}/>
          <input name="salePrice" type="number" placeholder="Sale price (optional)" value={newProduct.salePrice} onChange={handleChange}/>
          <textarea name="description" placeholder="Description" value={newProduct.description} onChange={handleChange}/>
          <textarea name="descriptionAr" placeholder="الوصف بالعربية" value={newProduct.descriptionAr} onChange={handleChange}/>
          <textarea name="descriptionEn" placeholder="Description in English" value={newProduct.descriptionEn} onChange={handleChange}/>
          <select name="category" value={newProduct.category} onChange={handleChange}>
            {(categories.length ? categories : [
              { name: "Watches" },
              { name: "Wallets" },
              { name: "Perfumes" }
            ]).map((c, i) => (
              <option key={i} value={c.name}>{c.name}</option>
            ))}
          </select>

          <div className="upload-group">
            <label className="upload-btn">
              <span>📷 Upload main image</span>
              <input className="upload-input" type="file" onChange={handleImage} />
            </label>
            <label className="upload-btn secondary">
              <span>🖼️ Upload more images</span>
              <input className="upload-input" type="file" multiple onChange={handleMoreImages} />
            </label>
          </div>
          {(newProduct.image || (newProduct.images?.length > 0)) && (
            <div className="preview-panel">
              <div className="preview-stage">
                <img
                  src={newProduct.image || (Array.isArray(newProduct.images) && newProduct.images[0]) || "/Images/logo4.png"}
                  className="stage-img"
                  alt="main"
                />
                <div className="stage-actions">
                  {newProduct.image && <span className="stage-badge">Primary</span>}
                </div>
              </div>
              <div className="preview-thumbs">
                {Array.isArray(newProduct.images) && newProduct.images.map((url, idx) => (
                  <div key={idx} className="thumb-item">
                    <img
                      src={url}
                      className="thumb-img"
                      alt="thumb"
                      onClick={() => setPrimaryImage(idx)}
                    />
                    <div className="thumb-actions">
                      <button className="btn-edit" onClick={() => setPrimaryImage(idx)}>Set primary</button>
                      <button className="btn-danger" onClick={() => removeImageAt(idx)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {editingId ? (
            <button className="btn-primary" onClick={saveEdit}>Save changes</button>
          ) : (
            <button className="btn-primary" onClick={addProduct}>Add product</button>
          )}
        </div>

        <div className="card">
          <h3>Apply discount to all products</h3>
          <input type="number" placeholder="Discount % (0-100)" value={discountAll} onChange={(e) => setDiscountAll(e.target.value)} />
          <button className="btn-primary" onClick={applyDiscountAll}>Apply to all</button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Discount</th>
              <th>Sale Price</th>
              <th>Images</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  {product.image ? <img src={product.image} className="table-img" /> : "—"}
                </td>
                <td>{product.name}</td>
                <td>${product.price}</td>
                <td>{product.category || "—"}</td>
                <td>{product.discountPercent != null ? `${product.discountPercent}%` : "—"}</td>
                <td>{product.salePrice != null ? `$${product.salePrice}` : "—"}</td>
                <td>{Array.isArray(product.images) ? product.images.length : 0}</td>
                <td>
                  <button className="btn-edit" onClick={() => startEdit(product)}>Edit</button>
                  <button className="btn-danger" onClick={() => deleteProduct(product.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
      </div>
  );
};

export default AdminProducts;
