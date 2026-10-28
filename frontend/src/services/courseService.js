
import api from "./api";

// All API paths are relative to http://localhost:5000/api
export const ENDPOINTS = {
  courses: "/course",
  categories: "/catogery",
  checkout: "/payments/checkout",
  reviews: "/reviews",
};

export const idOf = (item) => item?.id ?? item?._id;

export const money = (value) =>
  `${Number(value || 0).toLocaleString("en-US")} EGP`;

const pickList = (data, key) => {
  if (Array.isArray(data)) return data;

  const found = data?.[key] ?? data?.data;
  return Array.isArray(found) ? found : [];
};

// Public course list: published courses only
export const getCourses = () =>
  api.get(ENDPOINTS.courses).then((response) =>
    pickList(response.data, "courses")
  );

// Admin course list: all courses, including unpublished ones
export const getAdminCourses = () =>
  api.get(`${ENDPOINTS.courses}/admin/all`).then((response) =>
    pickList(response.data, "courses")
  );

export const createCourse = (data) =>
  api.post(ENDPOINTS.courses, data).then((response) => response.data);

export const updateCourse = (id, data) =>
  api.patch(`${ENDPOINTS.courses}/${id}`, data).then(
    (response) => response.data
  );

export const deleteCourse = (id) =>
  api.delete(`${ENDPOINTS.courses}/${id}`).then(
    (response) => response.data
  );

// Payment
export const checkout = (payload) =>
  api.post(ENDPOINTS.checkout, payload).then((response) => response.data);

export const guestCheckout = (payload) =>
  api.post("/payments/guest-checkout", payload).then((response) => response.data);

export const paymentUrl = (response) =>
  response?.url ??
  response?.checkoutUrl ??
  response?.session?.url ??
  null;

export const getGuestCourseAccess = (token) =>
  api.get(`/payments/guest-access/${encodeURIComponent(token)}`).then(
    (response) => response.data.course
  );

export const getGuestOrders = () =>
  api.get("/payments/guest-orders").then((response) =>
    pickList(response.data, "orders")
  );

export const confirmCashOrder = (id) =>
  api.patch(`/payments/guest-orders/${id}/confirm`).then(
    (response) => response.data
  );

export const resendGuestOrderAccess = (id) =>
  api.patch(`/payments/guest-orders/${id}/resend-access`).then(
    (response) => response.data
  );

// Reviews — the backend route still needs to be created
export const getReviews = () =>
  api.get(ENDPOINTS.reviews).then((response) =>
    pickList(response.data, "reviews")
  );

export const createReview = (data) =>
  api.post(ENDPOINTS.reviews, data).then((response) => response.data);

export const deleteReview = (id) =>
  api.delete(`${ENDPOINTS.reviews}/${id}`).then(
    (response) => response.data
  );
