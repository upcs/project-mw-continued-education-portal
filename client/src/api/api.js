import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://cs341s26mwed.campus.up.edu:3000/api",
});

API.interceptors.request.use((config) => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (storedUser?.token) {
      config.headers.Authorization = `Bearer ${storedUser.token}`;
    }
  } catch (error) {
    localStorage.removeItem("user");
  }

  return config;
});

export default API;
