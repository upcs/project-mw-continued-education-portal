import API from "../api/api";
import {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  getOrganizations,
  createOrganization,
  assignPrincipalToOrganization,
  assignUserToOrganization,
  createAdminUser,
  deleteAdminUser,
  getMemberRequests,
  acceptMemberRequest,
  rejectMemberRequest,
} from "../api/admin";

jest.mock("../api/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe("adminApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls admin endpoints", () => {
    getAdminStats();
    expect(API.get).toHaveBeenCalledWith("/admin/stats");

    getAdminUsers();
    expect(API.get).toHaveBeenCalledWith("/admin/users");

    getOrganizations();
    expect(API.get).toHaveBeenCalledWith("/admin/organizations");

    getMemberRequests();
    expect(API.get).toHaveBeenCalledWith("/admin/member-requests");
  });

  test("creates organization and admin user", () => {
    const payload = { name: "Test Org" };

    createOrganization(payload);
    expect(API.post).toHaveBeenCalledWith("/admin/organizations", payload);

    createAdminUser(payload);
    expect(API.post).toHaveBeenCalledWith("/admin/users", payload);
  });

  test("updates user role with encoded email", () => {
    updateUserRole("test+user@example.com", "admin");

    expect(API.put).toHaveBeenCalledWith(
      "/admin/users/test%2Buser%40example.com/role",
      { role: "admin" }
    );
  });

  test("assigns principal to organization", () => {
    assignPrincipalToOrganization("org123", "principal@example.com");

    expect(API.put).toHaveBeenCalledWith(
      "/admin/organizations/org123/principal",
      { principalEmail: "principal@example.com" }
    );
  });

  test("assigns user to organization with encoded email", () => {
    assignUserToOrganization("test+user@example.com", "org123");

    expect(API.put).toHaveBeenCalledWith(
      "/admin/users/test%2Buser%40example.com/organization",
      { organizationId: "org123" }
    );
  });

  test("deletes admin user with encoded email", () => {
    deleteAdminUser("test+user@example.com");

    expect(API.delete).toHaveBeenCalledWith(
      "/admin/users/test%2Buser%40example.com"
    );
  });

  test("accepts and rejects member requests with encoded email", () => {
    acceptMemberRequest("test+user@example.com");
    expect(API.put).toHaveBeenCalledWith(
      "/admin/member-requests/test%2Buser%40example.com/accept"
    );

    rejectMemberRequest("test+user@example.com");
    expect(API.put).toHaveBeenCalledWith(
      "/admin/member-requests/test%2Buser%40example.com/reject"
    );
  });
});