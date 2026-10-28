import axios from "axios";
import { API_URL, TOKEN_KEY } from "../utils/constants";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

const api = axios.create({ baseURL: API_URL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.includes("/login");
    if (error.response?.status === 401 && getToken() && !isLogin) {
      setToken(null);
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(error);
  }
);

export default api;
