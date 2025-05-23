import axios from "axios";
import { rememberToken, getValidToken } from "./token";

// const baseURL = process.env.REACT_APP_API_URL;
const baseURL = "http://localhost:8000";

// Create an axios instance with CORS credentials
const api = axios.create({
  baseURL,
  withCredentials: true,
});

export function setToken(token) {
  // saves token to local storage
  rememberToken(token);
  if (token) {
    // Setting the Authorisation header for all future GET requests
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// Validates token, and removes it if it's invalid
setToken(getValidToken());

export default api;
