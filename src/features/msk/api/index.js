import http from "@/shared/api/http";

export const mskAPI = {
  getCategories: () => http.get("/api/msk/categories"),
  createOrder: (data) => http.post("/api/msk/orders", data),
  getMyOrders: () => http.get("/api/msk/orders/my"),
  updateOrder: (id, data) => http.put(`/api/msk/orders/${id}`, data),
  confirmOrder: (id, data) => http.put(`/api/msk/orders/${id}/confirm`, data),
  cancelOrder: (id, data) => http.put(`/api/msk/orders/${id}/cancel`, data),
};


