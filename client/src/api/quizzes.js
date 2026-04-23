import API from "./api";

export const createOrLoadQuizBuilder = (moduleId) =>
  API.post(`/modules/${moduleId}/quiz-builder`);

export const getQuizBuilder = (moduleId) =>
  API.get(`/modules/${moduleId}/quiz-builder`);

export const updateQuizDefinition = (quizId, payload) =>
  API.put(`/quizzes/${quizId}`, payload);

export const addQuizQuestion = (quizId, payload) =>
  API.post(`/quizzes/${quizId}/questions`, payload);

export const deleteQuizQuestion = (questionId) =>
  API.delete(`/questions/${questionId}`);

export const getTakeQuiz = (moduleId) =>
  API.get(`/modules/${moduleId}/take-quiz`);

export const startQuizAttempt = (moduleId) =>
  API.post(`/modules/${moduleId}/attempts/start`);

export const submitQuizAttempt = (attemptId, payload) =>
  API.post(`/attempts/${attemptId}/submit`, payload);

export const reportQuizViolation = (attemptId) =>
  API.post(`/attempts/${attemptId}/violation`);

export const getQuizAttemptsForReview = (moduleId) =>
  API.get(`/modules/${moduleId}/attempts`);