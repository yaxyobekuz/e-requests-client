import http from "@/shared/api/http";

export const usersAPI = {
  getProfile: () => http.get("/api/users/me"),
  updateProfile: (data) => http.put("/api/users/me", data),
  setRegion: (data) => http.put("/api/users/region", data),
};


