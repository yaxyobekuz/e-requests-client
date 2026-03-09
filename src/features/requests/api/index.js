import http from "@/shared/api/http";

export const requestsAPI = {
  create: (data) => http.post("/api/requests", data),
  getMyRequests: () => http.get("/api/requests/my"),
  update: (id, data) => http.put(`/api/requests/${id}`, data),
  cancel: (id, data) => http.put(`/api/requests/${id}/cancel`, data),
};


