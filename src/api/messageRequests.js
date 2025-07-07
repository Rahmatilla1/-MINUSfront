import axios from "axios";

const serverUrl = process.env.REACT_APP_SERVER_URL || "https://minus-77tf.onrender.com"; // fallback

const API = axios.create({ baseURL: serverUrl });

const getAuthHeader = () => {
  const token = JSON.parse(localStorage.getItem("token")); // ⚠️ tokenni JSONdan chiqaramiz
  return { headers: { token } };
};

// 📨 Xabarlar ro'yxatini olish
export const getMessages = (id) => {
  return API.get(`/api/message/${id}`, getAuthHeader());
};

// ➕ Yangi xabar qo‘shish (text, rasm yoki audio)
export const addMessage = (formData) => {
  return API.post(`/api/message`, formData, getAuthHeader());
};

// ❌ Xabarni o‘chirish
export const deleteMessage = (messageId) => {
  return API.delete(`/api/message/${messageId}`, getAuthHeader());
};

// 📝 Xabarni tahrirlash
export const updateMessage = (messageId, data) => {
  return API.put(`/api/message/${messageId}`, data, getAuthHeader());
};