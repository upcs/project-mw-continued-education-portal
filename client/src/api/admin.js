import API from "./api";

export const getAdminStats = () => API.get("/admin/stats");
export const getAdminUsers = () => API.get("/admin/users");

export const updateUserRole = (email, role) =>
  API.put(`/admin/users/${encodeURIComponent(email)}/role`, { role });

export const getOrganizations = () => API.get("/admin/organizations");

export const createOrganization = (payload) =>
  API.post("/admin/organizations", payload);

export const assignPrincipalToOrganization = (organizationId, principalEmail) =>
  API.put(`/admin/organizations/${organizationId}/principal`, {
    principalEmail,
  });

export const assignUserToOrganization = (email, organizationId) =>
  API.put(`/admin/users/${encodeURIComponent(email)}/organization`, {
    organizationId,
  });

export const createAdminUser = (payload) =>
  API.post("/admin/users", payload);

export const deleteAdminUser = (email) =>
  API.delete(`/admin/users/${encodeURIComponent(email)}`);