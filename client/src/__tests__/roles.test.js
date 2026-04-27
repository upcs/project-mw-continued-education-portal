import { ROLES, PERMISSIONS, hasPermission } from "../utils/roles";

describe("roles and permissions", () => {
  test("ROLES contains expected values", () => {
    expect(ROLES.ADMIN).toBe("admin");
    expect(ROLES.TRAINER).toBe("trainer");
    expect(ROLES.EDUCATOR).toBe("educator");
    expect(ROLES.PRINCIPAL).toBe("principal");
  });

  test("PERMISSIONS maps correctly", () => {
    expect(PERMISSIONS.MANAGE_USERS).toContain(ROLES.ADMIN);
    expect(PERMISSIONS.CREATE_COURSE).toEqual(
      expect.arrayContaining([ROLES.ADMIN, ROLES.TRAINER])
    );
  });

  test("returns true when role has permission", () => {
    expect(hasPermission(ROLES.ADMIN, "MANAGE_USERS")).toBe(true);
    expect(hasPermission(ROLES.TRAINER, "CREATE_COURSE")).toBe(true);
    expect(hasPermission(ROLES.EDUCATOR, "SUBMIT_WORK")).toBe(true);
  });

  test("returns false when role does not have permission", () => {
    expect(hasPermission(ROLES.EDUCATOR, "MANAGE_USERS")).toBe(false);
    expect(hasPermission(ROLES.TRAINER, "SUBMIT_WORK")).toBe(false);
  });

  test("returns false for invalid permission", () => {
    expect(hasPermission(ROLES.ADMIN, "INVALID_PERMISSION")).toBe(false);
  });

  test("returns false when role is missing", () => {
    expect(hasPermission(null, "MANAGE_USERS")).toBe(false);
    expect(hasPermission(undefined, "MANAGE_USERS")).toBe(false);
  });

  test("returns false when permission is missing", () => {
    expect(hasPermission(ROLES.ADMIN, null)).toBe(false);
    expect(hasPermission(ROLES.ADMIN, undefined)).toBe(false);
  });
});