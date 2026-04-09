import API from "./api";

export const getAllCourses = () => API.get("/courses");
export const getEnrolledCourses = () => API.get("/courses/enrolled");
export const getCourseById = (id) => API.get(`/courses/${id}`);

export const enrollInCourse = (courseId) =>
  API.post(`/courses/${courseId}/enroll`);

export const markCourseStarted = (courseId) =>
  API.post(`/courses/${courseId}/start`);

export const checkCourseCompletion = (courseId) =>
  API.post(`/courses/${courseId}/check-completion`);
