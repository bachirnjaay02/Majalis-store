import { useState } from "react";
import { fmt } from "../utils/format.js";

export default function StockPage({ products, setProducts }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Tous");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", category: "", price: "", stock: "", sku: "", image: "" });

  const isImageUrl = (value) => typeof value === "string" && /^https?:\/\//.test(value);
  const cats = ["Tous", ...new Set(products.map((p) => p.category))];
  const filtered = products.filter(
    (p) =>
      (filterCat === "Tous" || p.category === filterCat) && p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({ name: "", category: "", price: "", stock: "", sku: "", image: "" });
    setModal("add");
  };

  const openEdit = (p) => {
    setForm({ ...p });
    setModal(p);
  };

  const save = () => {
    if (!form.name || !form.price || !form.stock) return;
    if (modal === "add") {
      setProducts([...products, { ...form, id: Date.now(), price: +form.price, stock: +form.stock }]);
    } else {
      setProducts(
        products.map((p) => (p.id === modal.id ? { ...form, id: modal.id, price: +form.price, stock: +form.stock } : p))
      );
    }
    setModal(null);
  };

  const del = (id) => {
    if (confirm("Supprimer ce produit ?")) setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div style={{ display: "flex", gap: 10, flex: 1, flexWrap: "wrap" }}>
            <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
              <span>🔍</span>
              <input placeholder="Rechercher un produit…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="form-input" style={{ width: 160 }} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              {cats.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-gold" style={{ marginLeft: 14 }} onClick={openAdd}>
            + Ajouter
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>SKU</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {isImageUrl(p.image) ? (
                        <img src={p.image} alt={p.name} style={{ width: 42, height: 42, objectFit: "cover", borderRadius: 12 }} />
                      ) : (
                        <div style={{ width: 42, height: 42, fontSize: 18, display: "grid", placeItems: "center", background: "var(--surface2)", borderRadius: 12 }}>
                          {p.image || "📦"}
                        </div>
                      )}
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: "monospace", color: "var(--text2)", fontSize: 12 }}>{p.sku}</td>
                  <td>
                    <span className="badge" style={{ background: "var(--surface2)", color: "var(--text2)" }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{fmt(p.price)}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: p.stock < 10 ? "#c0392b" : p.stock < 20 ? "#b37a00" : "#0a7c5c" }}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: p.stock === 0 ? "#fff0f0" : p.stock < 10 ? "#fff8e6" : "#e6f9f1",
                        color: p.stock === 0 ? "#c0392b" : p.stock < 10 ? "#b37a00" : "#0a7c5c",
                      }}
                    >
                      {p.stock === 0 ? "Rupture" : p.stock < 10 ? "Faible" : "En stock"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>
                        ✏️ Modifier
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{modal === "add" ? "Nouveau produit" : "Modifier le produit"}</div>
              <button className="btn-close" onClick={() => setModal(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ gridColumn: "1/-1", marginBottom: 16 }}>
                <label className="form-label">Image du produit (URL)</label>
                <input
                  className="form-input"
                  placeholder="https://..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
                {isImageUrl(form.image) && (
                  <img
                    src={form.image}
                    alt="Aperçu"
                    style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 16, marginTop: 12 }}
                  />
                )}
              </div>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Nom du produit</label>
                  <input className="form-input" placeholder="Ex: Djellaba Marron" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Catégorie</label>
                  <input className="form-input" placeholder="Ex: Djellabas" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input className="form-input" placeholder="Ex: DJL-001" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Prix (FCFA)</label>
                  <input className="form-input" type="number" placeholder="35000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantité en stock</label>
                  <input className="form-input" type="number" placeholder="20" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>
                Annuler
              </button>
              <button className="btn btn-gold" onClick={save}>
                💾 Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
