import api from "./api";

export const login = (data) => api.post("/login", data).then((r) => r.data);
export const logout = () => api.post("/logout").then((r) => r.data);
export const getMe = () => api.get("/me").then((r) => r.data);
