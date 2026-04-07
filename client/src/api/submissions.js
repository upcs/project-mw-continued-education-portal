import API from "./api";

export const submitQuiz = (moduleId, formData) =>
  API.post(`/modules/${moduleId}/submissions`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getMySubmissions = () => API.get("/my-submissions");

export const getCourseSubmissions = (courseId) =>
  API.get(`/courses/${courseId}/submissions`);

export const getModuleSubmissions = (moduleId) =>
  API.get(`/modules/${moduleId}/submissions`);

export const gradeSubmission = (submissionId, payload) =>
  API.put(`/submissions/${submissionId}/grade`, payload);