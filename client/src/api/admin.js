import API from "./api";

export const getAdminStats = () => API.get("/admin/stats");
export const getAdminUsers = () => API.get("/admin/users");
export const updateUserRole = (email, role) =>
  API.put(`/admin/users/${email}/role`, { role });

export const getOrganizations = () => API.get("/admin/organizations");
export const createOrganization = (payload) =>
  API.post("/admin/organizations", payload);

export const assignPrincipalToOrganization = (id, principalEmail) =>
  API.put(`/admin/organizations/${id}/principal`, { principalEmail });

export const assignUserToOrganization = (email, organizationId) =>
  API.put(`/admin/users/${email}/organization`, { organizationId });