import API from "./api";

export const getPrincipalDashboard = () => API.get("/principal/dashboard");
export const getPrincipalEducators = () => API.get("/principal/educators");
export const getPrincipalCourses = () => API.get("/principal/courses");
export const getPrincipalAssignments = () => API.get("/principal/assignments");
export const assignCourseToEducator = (payload) =>
  API.post("/principal/assign-course", payload);