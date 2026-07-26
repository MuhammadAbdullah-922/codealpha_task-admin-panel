import axios from 'axios';

// Laravel backend base URL — update if your path differs
const BASE_URL = 'https://bzack-backend.howto.rocks/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Attach admin token automatically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bzack_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout on 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('bzack_admin_token');
      localStorage.removeItem('bzack_admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
// =============================
// Contact Messages API
// =============================

// Get all messages
export const getMessages = (search = "", page = 1) => {
  return api.get(`/admin/messages?search=${search}&page=${page}`);
};


// Get single message
export const getMessage = (id) => {
  return api.get(`/admin/messages/${id}`);
};

// Delete message
export const deleteMessage = (id) => {
  return api.delete(`/admin/messages/${id}`);
};

// Unread messages count
export const getUnreadMessagesCount = () => {
  return api.get("/admin/messages/unread-count");
};

// Mark message as read
export const markMessageAsRead = (id) => {
  return api.put(`/admin/messages/${id}/read`);
};
export const getSubscribers = () =>
  api.get("/admin/newsletter");

export const deleteSubscriber = (id) =>
  api.delete(`/admin/newsletter/${id}`);
export const getFooterGallery = () =>
  api.get("/footer-gallery");

export const deleteFooterGallery = (id) =>
  api.delete(`/admin/footer-gallery/${id}`);

// Create
export const createFooterGallery = (data) =>
  api.post("/admin/footer-gallery", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Update
export const updateFooterGallery = (id, data) => {
  if (data instanceof FormData) {
    data.append("_method", "PUT");

    return api.post(`/admin/footer-gallery/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  return api.put(`/admin/footer-gallery/${id}`, data);
};
export const toggleFooterGalleryStatus = (id) =>
  api.put(`/admin/footer-gallery/${id}/status`);

export const updateAdminProfile = (data) => api.put('/profile', data);
export const uploadAdminAvatar = (formData) =>
  api.post('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const changeAdminPassword = (data) => api.post('/change-password', data);



export default api;
