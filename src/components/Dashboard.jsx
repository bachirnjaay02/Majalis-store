import { statusBg, statusColor, fmt } from "../utils/format.js";

export default function Dashboard({ products, orders, users }) {
  const revenue = orders.filter((o) => o.status === "livré").reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "en attente").length;
  const lowStock = products.filter((p) => p.stock < 10).length;
  const recentOrders = [...orders].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);

  const stats = [
    { label: "Chiffre d'affaires", value: fmt(revenue), icon: "💰", color: "#fff4d6", iconBg: "#f0c040", trend: "+12% ce mois", up: true },
    { label: "Commandes actives", value: orders.filter((o) => o.status !== "livré").length, icon: "📦", color: "#e8f5ff", iconBg: "#4a90e2", trend: `${pending} en attente`, up: false },
    { label: "Produits en stock", value: products.reduce((s, p) => s + p.stock, 0), icon: "🏪", color: "#e6f9f1", iconBg: "#0a7c5c", trend: `${lowStock} alertes stock`, up: false },
    { label: "Clients", value: users.filter((u) => u.role === "client").length, icon: "👥", color: "#f5f0ff", iconBg: "#7c5cbf", trend: "+2 ce mois", up: true },
  ];

  return (
    <div>
      {lowStock > 0 && (
        <div className="alert-bar">
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span>
            <strong>{lowStock} produit(s)</strong> en stock faible (moins de 10 unités). <span style={{ color: "var(--gold-dark)", fontWeight: 600, cursor: "pointer" }}>Voir les alertes →</span>
          </span>
        </div>
      )}
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label} style={{ background: s.color }}>
            <div className="stat-icon" style={{ background: s.iconBg + "30" }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-trend ${s.up ? "trend-up" : ""}`}>{s.trend}</div>
          </div>
        ))}
      </div>
      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Commandes récentes</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, color: "var(--gold-dark)" }}>{o.id}</td>
                    <td>{o.client}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(o.total)}</td>
                    <td>
                      <span className="badge" style={{ background: statusBg[o.status], color: statusColor[o.status] }}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Stock critique</div>
          </div>
          <div style={{ padding: "8px 22px 16px" }}>
            {products.filter((p) => p.stock < 15).sort((a, b) => a.stock - b.stock).map((p) => (
              <div key={p.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: p.stock < 10 ? "#c0392b" : "var(--text2)" }}>{p.stock} unités</span>
                </div>
                <div className="stock-bar">
                  <div className="stock-fill" style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%`, background: p.stock < 10 ? "#e74c3c" : "var(--gold)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
