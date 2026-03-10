import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import VisitStoreButton from "../components/VisitStoreButton";
import "../styles/admin.css";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [editingId, setEditingId] = useState(null);
  const [editUser, setEditUser] = useState({ username: "", password: "" });
  const [statusMsg, setStatusMsg] = useState("");
  const baseUrl = "http://localhost:8080";

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

  const loadUsers = async () => {
    const res = await fetch(`${baseUrl}/admin-users`, { headers: headersFor() });
    if (!res.ok) {
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminPass");
      navigate("/admin/login");
      return;
    }
    const data = await res.json().catch(() => []);
    setUsers(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadUsers();
  }, [navigate]);

  const addUser = async () => {
    if (!newUser.username.trim() || !newUser.password) {
      setStatusMsg("Please enter username and password");
      return;
    }
    const res = await fetch(`${baseUrl}/admin-users`, {
      method: "POST",
      headers: headersFor(true),
      body: JSON.stringify({ username: newUser.username.trim(), password: newUser.password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatusMsg(err?.error || "Failed to add user");
      return;
    }
    const created = await res.json();
    setUsers([...users, created]);
    setNewUser({ username: "", password: "" });
    setStatusMsg("User added");
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditUser({ username: user.username, password: "" });
  };

  const saveEdit = async () => {
    if (!editUser.username.trim()) {
      setStatusMsg("Username is required");
      return;
    }
    const body = { username: editUser.username.trim() };
    if (editUser.password) body.password = editUser.password;
    const res = await fetch(`${baseUrl}/admin-users/${editingId}`, {
      method: "PUT",
      headers: headersFor(true),
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatusMsg(err?.error || "Failed to update user");
      return;
    }
    const updated = await res.json();
    setUsers(users.map(u => u.id === editingId ? updated : u));
    setEditingId(null);
    setEditUser({ username: "", password: "" });
    setStatusMsg("User updated");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditUser({ username: "", password: "" });
  };

  const deleteUser = async (id) => {
    const res = await fetch(`${baseUrl}/admin-users/${id}`, {
      method: "DELETE",
      headers: headersFor()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatusMsg(err?.error || "Failed to delete user");
      return;
    }
    setUsers(users.filter(u => u.id !== id));
    setStatusMsg("User deleted");
  };

  return (
    <div className="admin-wrapper">
      <Sidebar />

      <div className="admin-main-content">
      <VisitStoreButton />

        <h2 className="page-title">Users Management</h2>

        {statusMsg && <div className="card" style={{ color: "green" }}>{statusMsg}</div>}

        <div className="card">
          <h3>{editingId ? "Edit Admin User" : "Add Admin User"}</h3>
          <input
            placeholder="Username"
            value={editingId ? editUser.username : newUser.username}
            onChange={(e) => editingId ? setEditUser({ ...editUser, username: e.target.value }) : setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            type="password"
            placeholder={editingId ? "New Password (optional)" : "Password"}
            value={editingId ? editUser.password : newUser.password}
            onChange={(e) => editingId ? setEditUser({ ...editUser, password: e.target.value }) : setNewUser({ ...newUser, password: e.target.value })}
          />
          {editingId ? (
            <div>
              <button className="btn-primary" onClick={saveEdit}>Save changes</button>
              <button className="btn-danger" onClick={cancelEdit}>Cancel</button>
            </div>
          ) : (
            <button className="btn-primary" onClick={addUser}>Add user</button>
          )}
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>
                  <button className="btn-edit" onClick={() => startEdit(user)}>Edit</button>
                  <button className="btn-danger" onClick={() => deleteUser(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
    </div>

  );
};

export default Users;
