import api from "./api";

const clean = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null));

export const createLead = (data) => api.post("/leads", data).then((r) => r.data);
export const getLeads = (params, signal) =>
  api.get("/leads", { params: clean(params), signal }).then((r) => r.data);
export const getLead = (id, signal) => api.get(`/leads/${id}`, { signal }).then((r) => r.data);
export const updateLead = (id, data) => api.put(`/leads/${id}`, data).then((r) => r.data);
export const deleteLead = (id) => api.delete(`/leads/${id}`).then((r) => r.data);

// downloads the CSV with the same filters the table is using
export const exportLeadsCsv = async (params) => {
  const response = await api.get("/leads/export", { params: clean(params), responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = "leads.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
