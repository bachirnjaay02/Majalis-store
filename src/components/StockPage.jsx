import { useState } from "react";
import { fmt } from "../utils/format.js";
import { api } from "../utils/api.js";

export default function StockPage({ products, setProducts, onRefresh }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Tous");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", category: "", price: "", stock: "", sku: "", image: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isImageUrl = (value) => typeof value === "string" && /^https?:\/\//.test(value);
  const cats = ["Tous", ...new Set(products.map((p) => p.category).filter(Boolean))];
  const filtered = products.filter(
    (p) => (filterCat === "Tous" || p.category === filterCat) && p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({ name: "", category: "", price: "", stock: "", sku: "", image: "" });
    setImageFile(null);
    setImagePreview("");
    setError("");
    setModal("add");
  };

  const openEdit = (p) => {
    setForm({ ...p, price: String(p.price), stock: String(p.stock) });
    setImageFile(null);
    setImagePreview(p.image || "");
    setError("");
    setModal(p);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, image: "" }));
  };

  const save = async () => {
    if (!form.name || !form.price || !form.stock) return setError("Nom, prix et stock sont requis");
    setSaving(true);
    setError("");
    try {
      let payload;

      if (imageFile) {
        payload = new FormData();
        payload.append('name', form.name);
        payload.append('category', form.category || '');
        payload.append('sku', form.sku || '');
        payload.append('price', form.price);
        payload.append('stock', form.stock);
        payload.append('image', imageFile);
      } else {
        payload = { ...form, price: +form.price, stock: +form.stock };
      }

      if (modal === "add") {
        const newProd = await api.createProduct(payload);
        setProducts((prev) => [newProd, ...prev]);
      } else {
        const updated = await api.updateProduct(modal.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === modal.id ? updated : p)));
      }
      setModal(null);
      setImageFile(null);
      setImagePreview("");
    } catch (err) {
      setError(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression : " + err.message);
    }
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
              {cats.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-gold" style={{ marginLeft: 14 }} onClick={openAdd}>+ Ajouter</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Produit</th><th>SKU</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Statut</th><th>Actions</th></tr>
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
                  <td><span className="badge" style={{ background: "var(--surface2)", color: "var(--text2)" }}>{p.category}</span></td>
                  <td style={{ fontWeight: 700 }}>{fmt(p.price)}</td>
                  <td><span style={{ fontWeight: 700, color: p.stock < 10 ? "#c0392b" : p.stock < 20 ? "#b37a00" : "#0a7c5c" }}>{p.stock}</span></td>
                  <td>
                    <span className="badge" style={{ background: p.stock === 0 ? "#fff0f0" : p.stock < 10 ? "#fff8e6" : "#e6f9f1", color: p.stock === 0 ? "#c0392b" : p.stock < 10 ? "#b37a00" : "#0a7c5c" }}>
                      {p.stock === 0 ? "Rupture" : p.stock < 10 ? "Faible" : "En stock"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>✏️ Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text2)" }}>Aucun produit</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{modal === "add" ? "Nouveau produit" : "Modifier le produit"}</div>
              <button className="btn-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">

              {/* Zone image */}
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Image du produit</label>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                  {/* Aperçu */}
                  <div style={{ width: 110, height: 110, borderRadius: 16, overflow: "hidden", background: "var(--surface2)", display: "grid", placeItems: "center", fontSize: 36, border: "2px dashed var(--border)", flexShrink: 0 }}>
                    {imagePreview || isImageUrl(form.image) ? (
                      <img src={imagePreview || form.image} alt="Aperçu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  {/* Options */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    {/* Upload fichier */}
                    <label style={{ display: "block", cursor: "pointer" }}>
                      <div className="btn btn-outline" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}>
                        📁 Choisir une image
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageChange}
                      />
                    </label>
                    {/* OU URL */}
                    <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 6, textAlign: "center" }}>— ou entrer une URL —</div>
                    <input
                      className="form-input"
                      placeholder="https://..."
                      value={form.image}
                      onChange={(e) => {
                        setForm({ ...form, image: e.target.value });
                        setImageFile(null);
                        setImagePreview("");
                      }}
                    />
                    {imageFile && (
                      <div style={{ fontSize: 12, color: "#0a7c5c", marginTop: 6 }}>
                        ✅ {imageFile.name}
                      </div>
                    )}
                  </div>
                </div>
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
              {error && <div style={{ color: "#c0392b", fontSize: 13, background: "#fff0f0", padding: "8px 12px", borderRadius: 8, marginTop: 8 }}>⚠️ {error}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Annuler</button>
              <button className="btn btn-gold" onClick={save} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? "Sauvegarde..." : "💾 Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}