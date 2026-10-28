export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

// ISO string -> "yyyy-mm-dd" for <input type="date">
export const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

export const monthLabel = (key) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-GB", { month: "short" });
};

export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const data = error?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length) return data.errors.join(". ");
  if (typeof data?.message === "string" && data.message) return data.message;
  if (error?.code === "ERR_NETWORK") return "Can't reach the server. Check your connection.";
  return fallback;
};
