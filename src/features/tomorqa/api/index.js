import http from "@/shared/api/http";

/**
 * Tomorqa (hosil) bo'limi uchun API metodlar.
 */
export const tomorqaAPI = {
  /** Barcha faol mahsulotlarni navlari bilan qaytaradi. */
  getProducts: () => http.get("/api/products"),

  /**
   * Yangi hosil yozuvi yaratadi.
   * @param {{ productId, varietyId, area, amount, year, season }} data
   */
  createHarvest: (data) => http.post("/api/harvest", data),

  /**
   * Fuqaroning o'z hosil tarixini sahifalab qaytaradi.
   * @param {{ page, limit }} params
   */
  getMyHarvest: (params) => http.get("/api/harvest/my", { params }),

  /**
   * Fuqaroning hosil yozuvini o'chiradi.
   * @param {string} id - Harvest ID
   */
  deleteHarvest: (id) => http.delete(`/api/harvest/${id}`),

  /**
   * Kalkulatsiya uchun agregatsiya statistikasini qaytaradi.
   * @param {{ productId, varietyId, regionId, year }} params
   */
  getCalculation: (params) => http.get("/api/harvest/stats/overview", { params }),
};
