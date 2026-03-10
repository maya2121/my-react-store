import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import VisitStoreButton from "../components/VisitStoreButton";
import "../styles/admin.css";

const AdminCategories = () => {
  const navigate = useNavigate();
  const baseUrl = "https://armanist.com";
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ name: "", slug: "" });
  const [editingId, setEditingId] = useState(null);
  const [editCat, setEditCat] = useState({ name: "", slug: "" });
  const [statusMsg, setStatusMsg] = useState("");

  const headersFor = (withContentType = false) => {
    const h = {};
    const u = localStorage.getItem("adminUser");
    const p = localStorage.getItem("adminPass");
    if (u && p) {
      h["x-admin-user"] = u;
      h["x-admin-pass"] = p;
    }
    if (withContentType) h["Content-Type"] = "application/json";
    return h;
  };

  useEffect(() => {
    const load = async () => {
      const u = localStorage.getItem("adminUser");
      const p = localStorage.getItem("adminPass");
      if (!u || !p) {
        navigate("/admin/login");
        return;
      }
      const res = await fetch(`${baseUrl}/categories`, { headers: headersFor() });
      if (!res.ok) {
        localStorage.removeItem("adminUser");
        localStorage.removeItem("adminPass");
        navigate("/admin/login");
        return;
      }
      const data = await res.json().catch(() => []);
      setCategories(Array.isArray(data) ? data : []);
    };
    load();
  }, [navigate]);

  const addCategory = async () => {
    if (!newCat.name.trim()) {
      setStatusMsg("Please enter category name");
      return;
    }
    const body = {
      name: newCat.name.trim(),
      slug: newCat.slug.trim() || undefined
    };
    const res = await fetch(`${baseUrl}/categories`, {
      method: "POST",
      headers: headersFor(true),
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatusMsg(err?.error || "Failed to add category");
      return;
    }
    const created = await res.json();
    setCategories([...categories, created]);
    setNewCat({ name: "", slug: "" });
    setStatusMsg("Category added");
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditCat({ name: cat.name || "", slug: cat.slug || "" });
  };

  const saveEdit = async () => {
    if (!editCat.name.trim()) {
      setStatusMsg("Name is required");
      return;
    }
    const res = await fetch(`${baseUrl}/categories/${editingId}`, {
      method: "PUT",
      headers: headersFor(true),
      body: JSON.stringify({
        name: editCat.name.trim(),
        slug: editCat.slug.trim() || undefined
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatusMsg(err?.error || "Failed to update");
      return;
    }
    const updated = await res.json();
    setCategories(categories.map(c => c.id === editingId ? updated : c));
    setEditingId(null);
    setEditCat({ name: "", slug: "" });
    setStatusMsg("Category updated");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCat({ name: "", slug: "" });
  };

  const deleteCategory = async (id) => {
    const res = await fetch(`${baseUrl}/categories/${id}`, {
      method: "DELETE",
      headers: headersFor()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatusMsg(err?.error || "Failed to delete");
      return;
    }
    setCategories(categories.filter(c => c.id !== id));
    setStatusMsg("Category deleted");
  };

  return (
    <div className="admin-wrapper">
      <Sidebar />
      <div className="admin-main-content">
        <VisitStoreButton />
        <h2 className="page-title">Categories</h2>
        {statusMsg && <div className="card" style={{ color: "green" }}>{statusMsg}</div>}

        <div className="card">
          <h3>{editingId ? "Edit Category" : "Add Category"}</h3>
          <input
            placeholder="Category name"
            value={editingId ? editCat.name : newCat.name}
            onChange={(e) => editingId ? setEditCat({ ...editCat, name: e.target.value }) : setNewCat({ ...newCat, name: e.target.value })}
          />
          <input
            placeholder="Slug (optional)"
            value={editingId ? editCat.slug : newCat.slug}
            onChange={(e) => editingId ? setEditCat({ ...editCat, slug: e.target.value }) : setNewCat({ ...newCat, slug: e.target.value })}
          />
          {editingId ? (
            <div>
              <button className="btn-primary" onClick={saveEdit}>Save changes</button>
              <button className="btn-danger" onClick={cancelEdit}>Cancel</button>
            </div>
          ) : (
            <button className="btn-primary" onClick={addCategory}>Add category</button>
          )}
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id}>
                <td>{cat.name}</td>
                <td>{cat.slug}</td>
                <td>
                  <button className="btn-edit" onClick={() => startEdit(cat)}>Edit</button>
                  <button className="btn-danger" onClick={() => deleteCategory(cat.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;
