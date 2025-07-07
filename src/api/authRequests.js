import axios from "axios";

const serverUrl = process.env.REACT_APP_SERVER_URL;

console.log(serverUrl);

const API = axios.create({ baseURL: serverUrl });

export const register = (formData) => API.post(`/api/auth/signup`, formData);
export const login = (formData) => API.post(`/api/auth/login`, formData);