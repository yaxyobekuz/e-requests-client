import http from "@/shared/api/http";

export const servicesAPI = {
  getAll: () => http.get("/api/services"),
};

export const serviceReportsAPI = {
  create: (data) => http.post("/api/service-reports", data),
  getMyReports: () => http.get("/api/service-reports/my"),
  confirm: (id, data) => http.put(`/api/service-reports/${id}/confirm`, data),
  cancel: (id, data) => http.put(`/api/service-reports/${id}/cancel`, data),
};


