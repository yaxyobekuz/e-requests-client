/** Mavsum tanlash opsiyalari */
export const SEASON_OPTIONS = [
  { value: "", label: "Mavsum ko'rsatilmasin" },
  { value: "bahor", label: "Bahor" },
  { value: "yoz", label: "Yoz" },
  { value: "kuz", label: "Kuz" },
  { value: "qish", label: "Qish" },
];

/** Yil tanlash opsiyalari — joriy yildan 5 yil orqaga */
export const YEAR_OPTIONS = (() => {
  const current = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => ({
    value: String(current - i),
    label: String(current - i),
  }));
})();

/** Sahifa tablari */
export const TOMORQA_TABS = [
  { key: "enter", label: "Hosilni kiritish" },
  { key: "calc", label: "Kalkulatsiya" },
];
