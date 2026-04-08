import API from "./api";

export const getEducatorStats = () => API.get("/dashboard/educator-stats");
export const getTrainerStats = () => API.get("/dashboard/trainer-stats");