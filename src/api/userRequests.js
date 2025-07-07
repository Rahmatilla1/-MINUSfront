import axios from "axios";

const serverUrl = process.env.REACT_APP_SERVER_URL;

const API = axios.create({ baseURL: serverUrl });

export const getAllUsers = () => API.get(`/api/user`);

export const getUser = (id) => API.get(`/api/user/${id}`);

export const updateUser = (id, formData) => {
  const token = JSON.parse(localStorage.getItem("token"));
  return API.put(`/api/user/${id}`, formData, { headers: { token } });
};

export const deleteUser = (id) => {
  const token = JSON.parse(localStorage.getItem("token"));
  return API.delete(`/api/user/${id}`, { headers: { token } });
};