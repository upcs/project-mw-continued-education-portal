import API from "./api";

export const getAllCourses = () => API.get("/courses");
export const getEnrolledCourses = () => API.get("/courses/enrolled");
export const getCourseById = (id) => API.get(`/courses/${id}`);