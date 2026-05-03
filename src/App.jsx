import { useState, useEffect, useCallback } from "react";
import logo from "../majalis-store.png";
import LoginPage from "./components/LoginPage.jsx";
import Dashboard from "./components/Dashboard.jsx";
import StockPage from "./components/StockPage.jsx";
import OrdersPage from "./components/OrdersPage.jsx";
import UsersPage from "./components/UsersPage.jsx";
import HomePage from "./components/HomePage.jsx";
import ClientShop from "./components/ClientShop.jsx";
import { api } from "./utils/api.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api.me()
        .then((userData) => {
          setUser(userData);
          setPage(userData.role === "admin" ? "dashboard" : "home");
        })
        .catch(() => api.setToken(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loadData = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
      const [prods, ords] = await Promise.all([api.getProducts(), api.getOrders()]);
      setProducts(prods);
      setOrders(ords);
      if (currentUser.role === "admin") {
        const users = await api.getUsers();
        setAllUsers(users);
      }
    } catch (err) {
      console.error("Erreur chargement données:", err);
    }
  }, []);

  useEffect(() => {
    if (user) loadData(user);
  }, [user, loadData]);

  const handleLogin = (token, userData) => {
    api.setToken(token);
    setUser(userData);
    setPage(userData.role === "admin" ? "dashboard" : "home");
  };

  const logout = async () => {
    try { await api.logout(); } catch {}
    api.setToken(null);
    setUser(null);
    setProducts([]);
    setOrders([]);
    setAllUsers([]);
    setPage("dashboard");
  };

  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"var(--bg)" }}>
        <div style={{ textAlign:"center", color:"var(--text2)" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>⏳</div>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const isAdmin = user.role === "admin";
  const pendingCount = orders.filter((o) => o.status === "en attente").length;

  const adminNav = [
    {
      group: "Principal",
      items: [
        { id: "dashboard", icon: "", label: "Tableau de bord" },
        { id: "orders", icon: "", label: "Commandes", badge: pendingCount > 0 ? pendingCount : null },
        { id: "stock", icon: "", label: "Stock & Produits" },
      ],
    },
    {
      group: "Administration",
      items: [{ id: "users", icon: "", label: "Utilisateurs" }],
    },
  ];

  const pageTitle = {
    home: "Accueil Majalis",
    shop: "Boutique",
    dashboard: "Tableau de bord",
    stock: "Stock & Produits",
    orders: "Commandes",
    users: "Utilisateurs",
  };

  return (
    <>
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <div style={{ width:36, height:36, background:"var(--surface)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cairo', sans-serif", fontWeight:900, fontSize:18, color:"var(--black)" }}>
              <img style={{ width:50, height:50 }} src={logo} alt="Logo Majalis Store" />
            </div>
            <div>
              <div className="logo-text" style={{ fontSize:16 }}>MAJALIS</div>
              <div className="logo-sub">STORE</div>
            </div>
          </div>
        </div>
        <nav className="nav">
          {isAdmin
            ? adminNav.map((group) => (
                <div key={group.group} className="nav-group">
                  <div className="nav-label">{group.group}</div>
                  {group.items.map((item) => (
                    <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`}
                      onClick={() => { setPage(item.id); setSidebarOpen(false); }}>
                      <span className="icon">{item.icon}</span>
                      {item.label}
                      {item.badge && <span className="badge">{item.badge}</span>}
                    </button>
                  ))}
                </div>
              ))
            : (
              <div className="nav-group">
                <div className="nav-label">Menu</div>
                <button className={`nav-item ${page === "home" ? "active" : ""}`} onClick={() => { setPage("home"); setSidebarOpen(false); }}>
                  <span className="icon">🏠</span>Accueil
                </button>
                <button className={`nav-item ${page === "shop" ? "active" : ""}`} onClick={() => { setPage("shop"); setSidebarOpen(false); }}>
                  <span className="icon">🛍️</span>Boutique
                </button>
              </div>
            )}
        </nav>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu">✕</button>
        <div className="sidebar-user">
          <div className="user-avatar">{user.name[0]}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="user-name" style={{ fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</div>
            <div className="user-role">{isAdmin ? "Administrateur" : "Client"}</div>
          </div>
          <button onClick={logout} style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", color:"#fff", fontSize:14 }}>⏻</button>
        </div>
      </div>
      {sidebarOpen && <div className="sidebar-backdrop open" onClick={() => setSidebarOpen(false)} />}
      <div className="main">
        <div className="topbar">
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-toggle" aria-label="Menu">☰</button>
            <div className="page-title">{pageTitle[page] || `Bienvenue, ${user.name.split(" ")[0]} 👋`}</div>
          </div>
          <div className="topbar-actions">
            <span style={{ fontSize:13, color:"var(--text2)" }}>
              {new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
            </span>
          </div>
        </div>
        <div className="content">
          {isAdmin ? (
            <>
              {page === "dashboard" && <Dashboard products={products} orders={orders} users={allUsers} />}
              {page === "stock" && <StockPage products={products} setProducts={setProducts} onRefresh={() => api.getProducts().then(setProducts)} />}
              {page === "orders" && <OrdersPage orders={orders} setOrders={setOrders} products={products} setProducts={setProducts} users={allUsers} onRefresh={() => Promise.all([api.getOrders().then(setOrders), api.getProducts().then(setProducts)])} />}
              {page === "users" && <UsersPage users={allUsers} orders={orders} />}
            </>
          ) : (
            <>
              {page === "home" && <HomePage user={user} products={products} onStartShopping={() => setPage("shop")} />}
              {page === "shop" && <ClientShop user={user} products={products} orders={orders} setOrders={setOrders} setProducts={setProducts} onRefresh={() => Promise.all([api.getOrders().then(setOrders), api.getProducts().then(setProducts)])} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}