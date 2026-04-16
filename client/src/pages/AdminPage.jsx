import { useEffect, useMemo, useState } from "react";
import "../css/admin-page.css";
import {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  assignUserToOrganization,
  createAdminUser,
  deleteAdminUser,
  getOrganizations,
} from "../api/admin";

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isEditMode, setIsEditMode] = useState(false);

  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "educator",
    organizationId: "",
  });

  const [creatingUser, setCreatingUser] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState("");

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [statsRes, usersRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
      ]);

      setStats(statsRes?.data?.data || null);
      setUsers(usersRes?.data?.data || []);
    } catch (err) {
      console.error("ADMIN PAGE LOAD ERROR:", err);
      setError(err?.response?.data?.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const res = await getOrganizations();
      setOrganizations(res?.data?.data || []);
    } catch (err) {
      console.error("LOAD ORGANIZATIONS ERROR:", err);
    }
  };

  useEffect(() => {
    loadAdminData();
    loadOrganizations();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        (user.fullname || "").toLowerCase().includes(search.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" || (user.role || "").toLowerCase() === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleRoleChange = async (email, role) => {
    try {
      setError("");
      setMessage("");
      await updateUserRole(email, role);
      setMessage(`Role updated for ${email}`);
      await loadAdminData();
    } catch (err) {
      console.error("ROLE UPDATE ERROR:", err);
      setError(err?.response?.data?.message || "Failed to update role.");
    }
  };

  const handleAssignOrganization = async (email, organizationId) => {
    try {
      setError("");
      setMessage("");
      await assignUserToOrganization(email, organizationId || null);
      setMessage(`Organization updated for ${email}`);
      await loadAdminData();
    } catch (err) {
      console.error("ASSIGN ORGANIZATION ERROR:", err);
      setError(err?.response?.data?.message || "Failed to assign organization.");
    }
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!newUser.fullname || !newUser.email || !newUser.password || !newUser.role) {
      setError("Full name, email, password, and role are required.");
      return;
    }

    try {
      setCreatingUser(true);
      setError("");
      setMessage("");

      await createAdminUser({
        fullname: newUser.fullname.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password,
        role: newUser.role,
        organizationId: newUser.organizationId
          ? Number(newUser.organizationId)
          : null,
      });

      setMessage("User created successfully.");
      setNewUser({
        fullname: "",
        email: "",
        password: "",
        role: "educator",
        organizationId: "",
      });

      await loadAdminData();
    } catch (err) {
      console.error("CREATE USER ERROR:", err);
      setError(err?.response?.data?.message || "Failed to create user.");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (email) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${email}? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingEmail(email);
      setError("");
      setMessage("");

      await deleteAdminUser(email);

      setMessage(`Deleted user ${email}`);
      await loadAdminData();
    } catch (err) {
      console.error("DELETE USER ERROR:", err);
      setError(err?.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeletingEmail("");
    }
  };

  if (loading) {
    return <div className="admin-page">Loading admin page...</div>;
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Admin Control Panel</h1>
          <p>Manage users, roles, and organization assignments.</p>
        </div>

        <button
          type="button"
          className="admin-page__edit-btn"
          onClick={() => setIsEditMode((prev) => !prev)}
        >
          {isEditMode ? "Done" : "Edit"}
        </button>
      </header>

      {message && <p className="admin-page__message">{message}</p>}
      {error && <p className="admin-page__error">{error}</p>}

      <div className="admin-stats-grid">
        <AdminStatCard title="Total Users" value={stats?.totalUsers || 0} />
        <AdminStatCard title="Total Courses" value={stats?.totalCourses || 0} />
        <AdminStatCard title="Organizations" value={stats?.totalOrganizations || 0} />
        <AdminStatCard title="Principals" value={stats?.totalPrincipals || 0} />
      </div>

      {isEditMode && (
        <div className="admin-page__grid">
          <section className="admin-card">
            <div className="admin-card__header">
              <h2>Create User Account</h2>
            </div>

            <form className="admin-user-create" onSubmit={handleCreateUser}>
              <input
                type="text"
                name="fullname"
                placeholder="Full name"
                value={newUser.fullname}
                onChange={handleNewUserChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newUser.email}
                onChange={handleNewUserChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Temporary password"
                value={newUser.password}
                onChange={handleNewUserChange}
              />
              <select
                name="role"
                value={newUser.role}
                onChange={handleNewUserChange}
              >
                <option value="educator">Educator</option>
                <option value="trainer">Trainer</option>
                <option value="principal">Principal</option>
                <option value="admin">Admin</option>
              </select>
              <select
                name="organizationId"
                value={newUser.organizationId}
                onChange={handleNewUserChange}
              >
                <option value="">No Organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>

              <button type="submit" disabled={creatingUser}>
                {creatingUser ? "Creating..." : "Create User"}
              </button>
            </form>
          </section>

          <section className="admin-card">
            <div className="admin-card__header">
              <h2>Organization Management</h2>
            </div>

            <p>Organizations are managed on a dedicated page.</p>

            <button
              type="button"
              onClick={() => (window.location.href = "/organizations")}
            >
              Go to Organizations Page
            </button>
          </section>
        </div>
      )}

      <section className="admin-card">
        <div className="admin-card__header">
          <h2>User Management</h2>
        </div>

        <div className="admin-controls">
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="trainer">Trainer</option>
            <option value="educator">Educator</option>
            <option value="principal">Principal</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Organization</th>
                {isEditMode && <th>Delete</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.email}>
                  <td>{user.fullname || "—"}</td>
                  <td>{user.email}</td>

                  <td className="admin-role-cell">
                    {isEditMode ? (
                      <select
                        value={user.role || "educator"}
                        onChange={(e) =>
                          handleRoleChange(user.email, e.target.value)
                        }
                      >
                        <option value="educator">Educator</option>
                        <option value="trainer">Trainer</option>
                        <option value="principal">Principal</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span>{user.role || "educator"}</span>
                    )}
                  </td>

                  <td>
                    {isEditMode ? (
                      <select
                        value={user.organization_id || ""}
                        onChange={(e) =>
                          handleAssignOrganization(
                            user.email,
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      >
                        <option value="">No Organization</option>
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{user.organization || "—"}</span>
                    )}
                  </td>

                  {isEditMode && (
                    <td>
                      <button
                        type="button"
                        className="admin-delete-btn"
                        onClick={() => handleDeleteUser(user.email)}
                        disabled={deletingEmail === user.email}
                      >
                        {deletingEmail === user.email ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <p className="admin-empty">No matching users found.</p>
          )}
        </div>
      </section>
    </section>
  );
}

function AdminStatCard({ title, value }) {
  return (
    <div className="admin-stat-card">
      <p className="admin-stat-card__title">{title}</p>
      <h3 className="admin-stat-card__value">{value}</h3>
    </div>
  );
}