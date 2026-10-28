import api from "./api";

export const getStats = () => api.get("/dashboard/stats").then((r) => r.data.stats);
