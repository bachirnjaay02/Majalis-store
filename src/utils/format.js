export const fmt = (n) => new Intl.NumberFormat("fr-SN", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);

export const statusColor = {
  livré: "#0a7c5c",
  "en cours": "#b37a00",
  "en attente": "#c0392b",
  annulé: "#666",
};

export const statusBg = {
  livré: "#e6f9f1",
  "en cours": "#fff8e6",
  "en attente": "#fff0f0",
  annulé: "#f5f5f5",
};
