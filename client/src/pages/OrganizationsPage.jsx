import { useEffect, useMemo, useState } from "react";
import "../css/organizations-page.css";
import {
  getOrganizations,
  createOrganization,
  assignPrincipalToOrganization,
  getAdminUsers,
  assignUserToOrganization,
} from "../api/admin";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [newOrg, setNewOrg] = useState({
    name: "",
    code: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [orgsRes, usersRes] = await Promise.all([
        getOrganizations(),
        getAdminUsers(),
      ]);

      setOrganizations(orgsRes?.data?.data || []);
      setUsers(usersRes?.data?.data || []);
    } catch (err) {
      console.error("ORGANIZATIONS PAGE LOAD ERROR:", err);
      setError(
        err?.response?.data?.message || "Failed to load organizations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const principalUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.role === "principal" &&
        (!user.organization_id || Number(user.organization_id) === 0)
    );
  }, [users]);

  const eligibleOrganizationUsers = useMemo(() => {
    return users.filter((user) =>
      ["educator", "trainer"].includes(user.role)
    );
  }, [users]);

  const filteredOrganizations = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return organizations;

    return organizations.filter((org) => {
      return (
        (org.name || "").toLowerCase().includes(term) ||
        (org.code || "").toLowerCase().includes(term) ||
        (org.principalName || "").toLowerCase().includes(term) ||
        (org.principalEmail || "").toLowerCase().includes(term)
      );
    });
  }, [organizations, search]);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setNewOrg((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();

    if (!newOrg.name.trim()) {
      setError("Organization name is required.");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setMessage("");

      await createOrganization({
        name: newOrg.name.trim(),
        code: newOrg.code.trim() || null,
      });

      setMessage("Organization created successfully.");
      setNewOrg({
        name: "",
        code: "",
      });

      await loadData();
    } catch (err) {
      console.error("CREATE ORGANIZATION ERROR:", err);
      setError(
        err?.response?.data?.message || "Failed to create organization."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleAssignPrincipal = async (organizationId, principalEmail) => {
    try {
      setError("");
      setMessage("");

      await assignPrincipalToOrganization(organizationId, principalEmail || null);

      setMessage(
        principalEmail
          ? "Principal assigned successfully."
          : "Principal removed successfully."
      );

      await loadData();
    } catch (err) {
      console.error("ASSIGN PRINCIPAL ERROR:", err);
      setError(
        err?.response?.data?.message || "Failed to update principal."
      );
    }
  };

  const handleAssignUser = async (email, organizationId) => {
    try {
      setError("");
      setMessage("");

      await assignUserToOrganization(email, organizationId);

      setMessage(
        organizationId
          ? `Assigned ${email} to organization successfully.`
          : `Removed ${email} from organization successfully.`
      );

      await loadData();
    } catch (err) {
      console.error("ASSIGN USER TO ORGANIZATION ERROR:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to update user organization."
      );
    }
  };

  const totalOrganizations = organizations.length;
  const assignedPrincipals = organizations.filter(
    (org) => org.principalEmail
  ).length;
  const unassignedOrganizations = totalOrganizations - assignedPrincipals;

  if (loading) {
    return <section className="organizations-page">Loading organizations...</section>;
  }

  return (
    <section className="organizations-page">
      <header className="organizations-page__header">
        
        <div>
          <p className="organizations-page__eyebrow">Admin Control</p>
          <h1 className="organizations-page__title">Organizations</h1>
        </div>

        <button
          type="button"
          className={`organizations-primary-btn ${
            isEditMode ? "organizations-primary-btn--active" : ""
          }`}
          onClick={() => setIsEditMode((prev) => !prev)}
        >
          {isEditMode ? "Done" : "Edit"}
        </button>
      </header>

      {message && (
        <p className="organizations-page__message">{message}</p>
      )}
      {error && (
        <p className="organizations-page__error">{error}</p>
      )}

      <div className="organizations-stats">
        <StatCard label="Total Organizations" value={totalOrganizations} />
        <StatCard label="Assigned Principals" value={assignedPrincipals} />
        <StatCard label="Unassigned" value={unassignedOrganizations} />
      </div>

    {isEditMode && (
      <div className="organizations-page__grid">
        <section className="organizations-card">
          <div className="organizations-card__header">
            <h2>Create Organization</h2>
            <p>Add a new school, district, or learning group.</p>
          </div>

          <form
            className="organizations-form"
            onSubmit={handleCreateOrganization}
          >
            <label className="organizations-field">
              <span>Name</span>
              <input
                type="text"
                name="name"
                placeholder="Enter organization name"
                value={newOrg.name}
                onChange={handleCreateChange}
              />
            </label>

            <label className="organizations-field">
              <span>Code</span>
              <input
                type="text"
                name="code"
                placeholder="Optional code"
                value={newOrg.code}
                onChange={handleCreateChange}
              />
            </label>

            <button
              type="submit"
              className="organizations-primary-btn"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Organization"}
            </button>
          </form>
        </section>

        <section className="organizations-card">
          <div className="organizations-card__header">
            <h2>Search</h2>
            <p>Find organizations by name, code, or principal.</p>
          </div>

          <div className="organizations-search">
            <input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </section>
      </div>
    )}

      <section className="organizations-card">
        <div className="organizations-card__header">
          <h2>Organization Directory</h2>
          <p>Assign principals and manage organization members.</p>
        </div>

        {filteredOrganizations.length === 0 ? (
          <p className="organizations-empty">
            No organizations found.
          </p>
        ) : (
          <div className="organizations-list">
            {filteredOrganizations.map((organization) => (
              <OrganizationRow
                isEditMode={isEditMode}
                key={organization.id}
                organization={organization}
                principalUsers={principalUsers}
                allUsers={eligibleOrganizationUsers}
                users={users}
                onAssignPrincipal={handleAssignPrincipal}
                onAssignUser={handleAssignUser}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="organizations-stat-card">
      <p className="organizations-stat-card__label">{label}</p>
      <h3 className="organizations-stat-card__value">{value}</h3>
    </div>
  );
}

function OrganizationRow({
  organization,
  principalUsers,
  allUsers,
  users,
  onAssignPrincipal,
  onAssignUser,
  isEditMode,
}) {
  const [principalEmail, setPrincipalEmail] = useState(
    organization.principalEmail || ""
  );
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [assigningPrincipal, setAssigningPrincipal] = useState(false);
  const [updatingUserEmail, setUpdatingUserEmail] = useState("");

  useEffect(() => {
    setPrincipalEmail(organization.principalEmail || "");
  }, [organization.principalEmail]);

  const organizationMembers = allUsers.filter(
    (user) => Number(user.organization_id) === Number(organization.id)
  );

  const availableUsers = allUsers.filter(
    (user) => !user.organization_id
  );

  const principalOptions = useMemo(() => {
    const currentPrincipal = users.find(
      (user) => user.email === organization.principalEmail
    );

    const combined = currentPrincipal
      ? [...principalUsers, currentPrincipal]
      : [...principalUsers];

    const seen = new Set();

    return combined.filter((user) => {
      if (!user?.email || seen.has(user.email)) return false;
      seen.add(user.email);
      return true;
    });
  }, [principalUsers, users, organization.principalEmail]);

  const handlePrincipalAssign = async () => {
    if (!principalEmail) return;

    try {
      setAssigningPrincipal(true);
      await onAssignPrincipal(organization.id, principalEmail);
    } finally {
      setAssigningPrincipal(false);
    }
  };

  const handlePrincipalRemove = async () => {
    const confirmed = window.confirm(
      `Remove the principal from ${organization.name}?`
    );

    if (!confirmed) return;

    try {
      setAssigningPrincipal(true);
      await onAssignPrincipal(organization.id, null);
    } finally {
      setAssigningPrincipal(false);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserEmail) return;

    try {
      setUpdatingUserEmail(selectedUserEmail);
      await onAssignUser(selectedUserEmail, organization.id);
      setSelectedUserEmail("");
    } finally {
      setUpdatingUserEmail("");
    }
  };

  const handleRemoveUser = async (email) => {
    const confirmed = window.confirm(
      `Remove ${email} from this organization?`
    );

    if (!confirmed) return;

    try {
      setUpdatingUserEmail(email);
      await onAssignUser(email, null);
    } finally {
      setUpdatingUserEmail("");
    }
  };

  return (
    <div className="organization-row organization-row--stacked">
      <div className="organization-row__top">
        <div className="organization-row__info">
          <h3>{organization.name}</h3>
          <p>
            <strong>Code:</strong> {organization.code || "—"}
          </p>
          <p>
            <strong>Current Principal:</strong>{" "}
            {organization.principalName || organization.principalEmail || "Unassigned"}
          </p>
        </div>

      {isEditMode && (
        <div className="organization-row__controls">
          <select
            value={principalEmail}
            onChange={(e) => setPrincipalEmail(e.target.value)}
          >
            <option value="">Select principal</option>
            {principalOptions.map((user) => (
              <option key={user.email} value={user.email}>
                {user.fullname || user.email}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="organizations-primary-btn"
            onClick={handlePrincipalAssign}
            disabled={
              !principalEmail ||
              assigningPrincipal ||
              principalEmail === organization.principalEmail
            }
          >
            {assigningPrincipal ? "Saving..." : "Assign"}
          </button>

          {organization.principalEmail && (
            <button
              type="button"
              className="organizations-remove-btn"
              onClick={handlePrincipalRemove}
              disabled={assigningPrincipal}
            >
              Remove
            </button>
          )}
        </div>
      )}
      </div>

      <div className="organization-members">
        <div className="organization-members__section">
          <div className="organization-members__header">
            <h4>Members</h4>
            <p>Users currently assigned to this organization.</p>
          </div>

          {organizationMembers.length === 0 ? (
            <p className="organizations-empty">No users assigned yet.</p>
          ) : (
            <div className="organization-members__list">
              {organizationMembers.map((user) => (
                <div key={user.email} className="organization-member-chip">
                  <div>
                    <strong>{user.fullname || user.email}</strong>
                    <p>
                      {user.email} • {user.role}
                    </p>
                  </div>

                {isEditMode && (
                  <button
                    type="button"
                    className="organizations-remove-btn"
                    onClick={() => handleRemoveUser(user.email)}
                    disabled={updatingUserEmail === user.email}
                  >
                    {updatingUserEmail === user.email ? "Removing..." : "Remove"}
                  </button>
                )}
                </div>
              ))}
            </div>
          )}
        </div>
      {isEditMode && (
        <div className="organization-members__section">
          
          <div className="organization-members__header">
            <h4>Add User</h4>
            <p>Assign an existing user to this organization.</p>
          </div>

          <div className="organization-add-user">
            <select
              value={selectedUserEmail}
              onChange={(e) => setSelectedUserEmail(e.target.value)}
             >
              <option value="">Select user</option>
              {availableUsers.map((user) => (
                <option key={user.email} value={user.email}>
                  {(user.fullname || user.email) + ` • ${user.role}`}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="organizations-primary-btn"
              onClick={handleAddUser}
              disabled={!selectedUserEmail || updatingUserEmail === selectedUserEmail}
              >
              
              {updatingUserEmail === selectedUserEmail ? "Adding..." : "Add User"}
            </button>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}