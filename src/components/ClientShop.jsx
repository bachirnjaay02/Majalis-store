import { useState, useEffect, useRef } from "react";
import { fmt, statusBg, statusColor } from "../utils/format.js";
import { api } from "../utils/api.js";
import LoginPage from "./LoginPage.jsx";

const isImageUrl = (value) => typeof value === "string" && /^https?:\/\//.test(value);

export default function ClientShop({ user, products, orders, setOrders, setProducts, onRequireAuth, defaultTab, onRefresh }) {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Tous");
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(defaultTab === "orders");
  const [payment, setPayment] = useState(null);
  const [payModal, setPayModal] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [success, setSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState(null);
  const [notification, setNotification] = useState("");
  const [orderDetail, setOrderDetail] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const prevOrdersRef = useRef(orders);

  const cats = ["Tous", ...new Set(products.map((p) => p.category).filter(Boolean))];
  const filtered = products.filter(
    (p) => p.stock > 0 &&
      (filterCat === "Tous" || p.category === filterCat) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (p) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === p.id);
      if (ex) return prev.map((i) => (i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, p.stock) } : i));
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const myOrders = user ? orders.filter((o) => o.clientId === user.id) : [];

  useEffect(() => {
    const oldOrders = prevOrdersRef.current;
    const changes = myOrders.map((order) => {
      const previous = oldOrders.find((o) => o.id === order.id);
      return previous && previous.status !== order.status
        ? `La commande ${order.id} est ${order.status}` : null;
    }).filter(Boolean);
    if (changes.length) {
      setNotification(changes.join(" — "));
      setTimeout(() => setNotification(""), 5000);
    }
    prevOrdersRef.current = orders;
  }, [orders, myOrders]);

  // Quand on clique sur "Passer la commande"
  const handleCheckout = () => {
    if (!user) {
      // Pas connecté → afficher modal auth
      setShowCart(false);
      setShowLoginModal(true);
    } else {
      setShowCart(false);
      setPayModal(true);
    }
  };

  // Après connexion depuis le modal
  const handleLoginSuccess = (token, userData) => {
    api.setToken(token);
    setShowLoginModal(false);
    setPayModal(true);
    if (onRequireAuth) onRequireAuth(() => {});
  };

  const placeOrder = async () => {
    if (!payment) return;
    setPlacing(true);
    try {
      const newOrder = await api.createOrder({
        items: cart.map((i) => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price, image: i.image })),
        total,
        payment,
        phone,
      });
      setOrders((prev) => [...prev, newOrder]);
      setCart([]);
      setPayModal(false);
      setSuccessOrderId(newOrder.id);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      alert("Erreur lors de la commande : " + err.message);
    } finally {
      setPlacing(false);
    }
  };

  const payOptions = [
    { name: "Wave", icon: "🌊", color: "#00b8f1", desc: "Payer avec Wave" },
    { name: "Orange Money", icon: "🟠", color: "#ff6600", desc: "Payer avec Orange Money" },
    { name: "Free Money", icon: "💜", color: "#8b1fc5", desc: "Payer avec Free Money" },
  ];

  return (
    <div>
      {success && (
        <div style={{ background: "#e6f9f1", border: "1px solid #0a7c5c", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div><strong>Commande {successOrderId} confirmée !</strong> Nous vous contacterons sur {phone} pour finaliser.</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          {notification && (
            <div style={{ background: "#fff8e6", border: "1px solid #f0c040", borderRadius: 12, padding: "14px 18px", color: "#8d5b00", fontSize: 14 }}>
              🔔 {notification}
            </div>
          )}
        </div>
        {user && (
          <button className={`btn ${showOrders ? "btn-gold" : "btn-outline"}`} onClick={() => setShowOrders(!showOrders)}>
            📋 Mes commandes {myOrders.length > 0 && `(${myOrders.length})`}
          </button>
        )}
        <button className="btn btn-outline" style={{ marginLeft: "auto", position: "relative" }} onClick={() => setShowCart(true)}>
          🛒 Panier
          {cart.length > 0 && (
            <span style={{ background: "var(--gold)", color: "var(--black)", borderRadius: "50%", width: 18, height: 18, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: 6 }}>
              {cart.reduce((s, i) => s + i.qty, 0)}
            </span>
          )}
        </button>
      </div>

      {!showOrders ? (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
              <span>🔍</span>
              <input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {cats.map((c) => (
              <button key={c} onClick={() => setFilterCat(c)} className="btn btn-sm"
                style={{ background: filterCat === c ? "var(--gold)" : "var(--surface)", border: "1px solid var(--border)", color: filterCat === c ? "var(--black)" : "var(--text2)" }}>
                {c}
              </button>
            ))}
          </div>
          <div className="products-grid">
            {filtered.map((p) => (
              <div key={p.id} className="product-card-shop">
                <div style={{ textAlign: "center", marginBottom: 10 }}>
                  {isImageUrl(p.image) ? (
                    <img src={p.image} alt={p.name} style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 18 }} />
                  ) : (
                    <div style={{ width: 120, height: 120, display: "grid", placeItems: "center", background: "var(--surface2)", borderRadius: 18, fontSize: 44 }}>
                      {p.image || "🛍️"}
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 8 }}>{p.category}</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: "var(--gold-dark)", marginBottom: 4 }}>{fmt(p.price)}</div>
                <div style={{ fontSize: 11, color: p.stock < 10 ? "#c0392b" : "var(--text2)", marginBottom: 12 }}>{p.stock} en stock</div>
                <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center", fontSize: 13 }} onClick={() => addToCart(p)}>
                  + Ajouter au panier
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "var(--text2)" }}>
                Aucun produit disponible
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card">
          <div className="card-header"><div className="card-title">Mes commandes</div></div>
          {myOrders.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text2)" }}>Aucune commande pour le moment.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>ID</th><th>Date</th><th>Articles</th><th>Total</th><th>Paiement</th><th>Statut</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {myOrders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 700, color: "var(--gold-dark)" }}>{o.id}</td>
                      <td>{o.date}</td>
                      <td>{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
                      <td style={{ fontWeight: 700 }}>{fmt(o.total)}</td>
                      <td>{o.payment}</td>
                      <td><span className="badge" style={{ background: statusBg[o.status], color: statusColor[o.status] }}>{o.status}</span></td>
                      <td><button className="btn btn-outline btn-sm" onClick={() => setOrderDetail(o)}>Détails</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PANIER */}
      {showCart && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCart(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div className="modal-title">🛒 Mon panier</div>
              <button className="btn-close" onClick={() => setShowCart(false)}>✕</button>
            </div>
            <div className="modal-body">
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text2)" }}>Votre panier est vide</div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item">
                      {isImageUrl(item.image) ? (
                        <img src={item.image} alt={item.name} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 12 }} />
                      ) : (
                        <div style={{ width: 52, height: 52, display: "grid", placeItems: "center", fontSize: 20, borderRadius: 12, background: "var(--surface2)" }}>{item.image || "🛍️"}</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                        <div style={{ fontSize: 13, color: "var(--gold-dark)", fontWeight: 700 }}>{fmt(item.price)}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                        <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                        <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: 16, marginLeft: 4 }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ borderTop: "2px solid var(--border)", marginTop: 16, paddingTop: 14, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 17 }}>
                    <span>Total</span>
                    <span style={{ color: "var(--gold-dark)" }}>{fmt(total)}</span>
                  </div>
                  <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center", marginTop: 16, padding: "13px", fontSize: 15 }}
                    onClick={handleCheckout}>
                    Passer la commande →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL AUTH — si pas connecté */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowLoginModal(false)}>
          <div style={{ background: "var(--surface)", borderRadius: 20, padding: 32, maxWidth: 420, width: "90%", position: "relative" }}>
            <button onClick={() => setShowLoginModal(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text2)" }}>✕</button>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Connectez-vous pour commander</div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>Votre panier sera conservé après connexion</div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>Saaay so connecter woul nouniouy xamei ya commander</div>
            </div>
            {/* affichage du formulaire de connexion */}
            {/* <LoginPage onLogin={handleLoginSuccess} embedded /> */}
          </div>
        </div>
      )}

      {/* PAIEMENT */}
      {payModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setPayModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div className="modal-title">💳 Paiement Mobile Money</div>
              <button className="btn-close" onClick={() => setPayModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text2)" }}>Total à payer</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: "var(--gold-dark)" }}>{fmt(total)}</span>
              </div>
              <label className="form-label">Choisissez votre opérateur</label>
              {payOptions.map((p) => (
                <button key={p.name} className={`payment-btn ${payment === p.name ? "selected" : ""}`} onClick={() => setPayment(p.name)}>
                  <div className="payment-logo" style={{ background: p.color + "20" }}>{p.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>{p.desc}</div>
                  </div>
                  {payment === p.name && <span style={{ marginLeft: "auto", color: "var(--gold-dark)" }}>✓</span>}
                </button>
              ))}
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Numéro de téléphone (Mobile Money)</label>
                <input className="form-input" placeholder="77-000-00-00" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              {payment && (
                <div style={{ background: "#fff8e6", border: "1px solid #f0c040", borderRadius: 10, padding: "12px 16px", marginTop: 8, fontSize: 13 }}>
                  📲 Vous recevrez un message de confirmation sur votre numéro {payment} pour valider le paiement.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setPayModal(false)}>Annuler</button>
              <button className="btn btn-gold" onClick={placeOrder} disabled={!payment || !phone || placing}
                style={{ opacity: !payment || !phone || placing ? 0.5 : 1 }}>
                {placing ? "En cours..." : "✅ Confirmer le paiement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL COMMANDE */}
      {orderDetail && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setOrderDetail(null)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Facture {orderDetail.id}</div>
                <div style={{ fontSize: 12, color: "var(--text2)" }}>{orderDetail.date} • {orderDetail.payment}</div>
              </div>
              <button className="btn-close" onClick={() => setOrderDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{orderDetail.client}</div>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>Téléphone : {orderDetail.phone || "Non renseigné"}</div>
                <div style={{ marginTop: 8 }}><span className="badge" style={{ background: statusBg[orderDetail.status], color: statusColor[orderDetail.status] }}>{orderDetail.status}</span></div>
              </div>
              {orderDetail.items.map((item, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {isImageUrl(item.image) ? (
                      <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 10 }} />
                    ) : (
                      <div style={{ width: 48, height: 48, display: "grid", placeItems: "center", background: "var(--surface2)", borderRadius: 10, fontSize: 18 }}>{item.image || "🛍️"}</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text2)" }}>Quantité : {item.qty}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700 }}>{fmt(item.price * item.qty)}</div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>{fmt(item.price)} / unité</div>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)", fontWeight: 700, fontSize: 16 }}>
                <span>Total TTC</span><span>{fmt(orderDetail.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}