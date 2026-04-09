import API from "./api";

export const getDiscussions = () => API.get("/discussions");

export const createDiscussion = (payload) =>
  API.post("/discussions", payload);

export const getDiscussionById = (id) =>
  API.get(`/discussions/${id}`);

export const createDiscussionReply = (id, payload) =>
  API.post(`/discussions/${id}/replies`, payload);