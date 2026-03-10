import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import VisitStoreButton from "../components/VisitStoreButton";
import "../styles/admin.css";
import { auth, hasEnv } from "../../firebase.js";

const AdminHeroSlider = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [authWarning, setAuthWarning] = useState("");
  const [newSlide, setNewSlide] = useState({
    title: "",
    subtitle: "",
    buttonText: "Shop Now",
    buttonLink: "#products-section",
    image: "",
    order: ""
  });
  const baseUrl = "http://localhost:8080";

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
  const handleUnauthorized = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminPass");
    navigate("/admin/login");
  };
  const headersFor = (token) => {
    const h = {};
    if (token) h.Authorization = `Bearer ${token}`;
    if (!token) {
      const creds = getAdminCreds();
      if (creds) {
        h["x-admin-user"] = creds.u;
        h["x-admin-pass"] = creds.p;
      }
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
        setAuthWarning("Please login to manage slides");
      } else {
        setAuthWarning("");
      }
      const res = await fetch(`${baseUrl}/hero-slides`, { headers: headersFor(token) });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatusMsg(err?.error || "Failed to load slides");
        return;
      }
      const data = await res.json().catch(() => []);
      setSlides(Array.isArray(data) ? data : []);
    };
    load();
  }, [navigate]);

  const handleChange = (e) => {
    setNewSlide({ ...newSlide, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
          setNewSlide({ ...newSlide, image: url });
          setStatusMsg("Image uploaded");
        } else {
          if (res.status === 401) {
            handleUnauthorized();
            return;
          }
          setNewSlide({ ...newSlide, image: dataUrl });
          const err = await res.json().catch(() => ({}));
          setStatusMsg(err?.error || "Stored image locally (dev mode)");
        }
      } catch {
        setNewSlide({ ...newSlide, image: dataUrl });
        setStatusMsg("Stored image locally (network error)");
      }
    };
    reader.readAsDataURL(file);
  };

  const addSlide = () => {
    if (!newSlide.image) {
      setStatusMsg("Please upload an image");
      return;
    }
    (async () => {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/hero-slides`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headersFor(token)
        },
        body: JSON.stringify({
          title: newSlide.title,
          subtitle: newSlide.subtitle,
          buttonText: newSlide.buttonText,
          buttonLink: newSlide.buttonLink,
          image: newSlide.image,
          order: newSlide.order ? Number(newSlide.order) : 0
        })
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatusMsg(err?.error || "Failed to add slide");
        return;
      }
      const created = await res.json();
      setSlides([...slides, created]);
      setNewSlide({
        title: "",
        subtitle: "",
        buttonText: "Shop Now",
        buttonLink: "#products-section",
        image: "",
        order: ""
      });
      setStatusMsg("Slide added");
    })();
  };

  const startEdit = (slide) => {
    setEditingId(slide.id);
    setNewSlide({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      buttonText: slide.buttonText || "Shop Now",
      buttonLink: slide.buttonLink || "#products-section",
      image: slide.image || "",
      order: slide.order ?? ""
    });
  };

  const saveEdit = () => {
    (async () => {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/hero-slides/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...headersFor(token)
        },
        body: JSON.stringify({
          title: newSlide.title,
          subtitle: newSlide.subtitle,
          buttonText: newSlide.buttonText,
          buttonLink: newSlide.buttonLink,
          image: newSlide.image,
          order: newSlide.order ? Number(newSlide.order) : 0
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
      setSlides(slides.map(s => s.id === editingId ? updated : s));
      setEditingId(null);
      setNewSlide({
        title: "",
        subtitle: "",
        buttonText: "Shop Now",
        buttonLink: "#products-section",
        image: "",
        order: ""
      });
      setStatusMsg("Changes saved");
    })();
  };

  const deleteSlide = (id) => {
    (async () => {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/hero-slides/${id}`, {
        method: "DELETE",
        headers: headersFor(token)
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatusMsg(err?.error || "Failed to delete slide");
        return;
      }
      setSlides(slides.filter(s => s.id !== id));
      setStatusMsg("Slide deleted");
    })();
  };

  return (
    <div className="admin-wrapper">
      <Sidebar />
      <div className="admin-main-content">
        <VisitStoreButton />
        <h2 className="page-title">Hero Slider</h2>
        {authWarning && <div className="card" style={{ color: "red" }}>{authWarning}</div>}
        {statusMsg && <div className="card" style={{ color: "green" }}>{statusMsg}</div>}
        <div className="card">
          <h3>{editingId ? "Edit Slide" : "Add Slide"}</h3>
          <input name="title" placeholder="Title" value={newSlide.title} onChange={handleChange} />
          <textarea name="subtitle" placeholder="Subtitle" value={newSlide.subtitle} onChange={handleChange} />
          <input name="buttonText" placeholder="Button text" value={newSlide.buttonText} onChange={handleChange} />
          <input name="buttonLink" placeholder="Button link (#section or /path)" value={newSlide.buttonLink} onChange={handleChange} />
          <input name="order" type="number" placeholder="Order" value={newSlide.order} onChange={handleChange} />
          <div className="upload-group">
            <label className="upload-btn">
              <span>📷 Upload slide image</span>
              <input className="upload-input" type="file" onChange={handleImage} />
            </label>
          </div>
          {newSlide.image && (
            <div className="preview-panel">
              <div className="preview-stage">
                <img src={newSlide.image} className="stage-img" alt="slide" />
                <div className="stage-actions">
                  <span className="stage-badge">Selected</span>
                </div>
              </div>
            </div>
          )}
          {editingId ? (
            <button className="btn-primary" onClick={saveEdit}>Save changes</button>
          ) : (
            <button className="btn-primary" onClick={addSlide}>Add slide</button>
          )}
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {slides.map(slide => (
              <tr key={slide.id}>
                <td>{slide.image ? <img src={slide.image} className="table-img" /> : "—"}</td>
                <td>{slide.title || "—"}</td>
                <td>{slide.order ?? "—"}</td>
                <td>
                  <button className="btn-edit" onClick={() => startEdit(slide)}>Edit</button>
                  <button className="btn-danger" onClick={() => deleteSlide(slide.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHeroSlider;
