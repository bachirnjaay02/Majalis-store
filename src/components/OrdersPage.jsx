import { useState } from "react";
import { fmt, statusBg, statusColor } from "../utils/format.js";

export default function OrdersPage({ orders, setOrders, products, setProducts, users }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tous");
  const [detail, setDetail] = useState(null);
  const statuses = ["Tous", "en attente", "en cours", "livré", "annulé"];

  const filtered = orders.filter(
    (o) =>
      (filter === "Tous" || o.status === filter) &&
      (o.client.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search))
  );

  const updateStatus = (id, status) => {
    const order = orders.find((o) => o.id === id);
    if (status === "livré" && order.status !== "livré") {
      setProducts((prev) =>
        prev.map((p) => {
          const item = order.items.find((i) => i.productId === p.id);
          return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
        })
      );
    }
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    if (detail?.id === id) setDetail({ ...detail, status });
  };

  return (
    <div>
      <div className="card">
        <div className="card-header" style={{ flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, flex: 1, flexWrap: "wrap" }}>
            <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
              <span>🔍</span>
              <input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className="btn btn-sm"
                  style={{
                    background: filter === s ? "var(--gold)" : "var(--surface2)",
                    color: filter === s ? "var(--black)" : "var(--text2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Client</th>
                <th>Articles</th>
                <th>Total</th>
                <th>Paiement</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700, color: "var(--gold-dark)" }}>{o.id}</td>
                  <td style={{ color: "var(--text2)", fontSize: 12 }}>{o.date}</td>
                  <td>{o.client}</td>
                  <td style={{ color: "var(--text2)" }}>{o.items.length} article(s)</td>
                  <td style={{ fontWeight: 700 }}>{fmt(o.total)}</td>
                  <td>
                    <span className="badge" style={{ background: "#f0f8ff", color: "#1566a3" }}>{o.payment}</span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: statusBg[o.status], color: statusColor[o.status] }}>{o.status}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setDetail(o)}>
                        Détails
                      </button>
                      <select
                        className="form-input"
                        style={{ padding: "4px 8px", fontSize: 12, width: "auto" }}
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                      >
                        {["en attente", "en cours", "livré", "annulé"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {detail && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <div className="modal-title">{detail.id}</div>
                <div style={{ fontSize: 12, color: "var(--text2)" }}>{detail.date} — {detail.payment}</div>
              </div>
              <button className="btn-close" onClick={() => setDetail(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{detail.client}</div>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>📞 {detail.phone}</div>
              </div>
              {detail.items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <span>{item.name} × {item.qty}</span>
                  <span style={{ fontWeight: 700 }}>{fmt(item.price * item.qty)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, padding: "12px 0 0", fontWeight: 700, fontSize: 16 }}>
                <span>Total</span>
                <span style={{ color: "var(--gold-dark)" }}>{fmt(detail.total)}</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <label className="form-label">Changer le statut</label>
                <select className="form-input" value={detail.status} onChange={(e) => updateStatus(detail.id, e.target.value)}>
                  {["en attente", "en cours", "livré", "annulé"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
