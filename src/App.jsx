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

// Noms de pages standardisés
const PAGES = {
  HOME: "HomePage",
  SHOP: "ClientShop",
  ORDERS: "orders",
  DASHBOARD: "dashboard",
  STOCK: "stock",
  USERS: "users",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(PAGES.HOME);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authCallback, setAuthCallback] = useState(null);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api.me()
        .then((userData) => {
          setUser(userData);
          setPage(userData.role === "admin" ? PAGES.DASHBOARD : PAGES.HOME);
        })
        .catch(() => api.setToken(null))
        .finally(() => setLoading(false));
    } else {
      api.getProducts().then(setProducts).catch(() => {});
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
    setShowAuthModal(false);
    if (userData.role === "admin") {
      setPage(PAGES.DASHBOARD);
    } else {
      setPage(PAGES.SHOP);
      if (authCallback) {
        authCallback(userData);
        setAuthCallback(null);
      }
    }
  };

  const logout = async () => {
    try { await api.logout(); } catch {}
    api.setToken(null);
    setUser(null);
    setProducts([]);
    setOrders([]);
    setAllUsers([]);
    setPage(PAGES.HOME);
    api.getProducts().then(setProducts).catch(() => {});
  };

  const requireAuth = (callback) => {
    setAuthCallback(() => callback);
    setShowAuthModal(true);
  };

  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"var(--bg)" }}>
        <div style={{ textAlign:"center", color:"var(--text2)" }}>
          <img src={logo} style={{ width:80, marginBottom:16, opacity:0.7 }} alt="logo" />
          <div style={{ fontSize:14 }}>Xaral Touti Saway...</div>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  const pendingCount = orders.filter((o) => o.status === "en attente").length;

  // ===== INTERFACE ADMIN =====
  if (isAdmin) {
    const adminNav = [
      {
        group: "Principal",
        items: [
          { id: PAGES.DASHBOARD, label: "Tableau de bord" },
          { id: PAGES.ORDERS, label: "Commandes", badge: pendingCount > 0 ? pendingCount : null },
          { id: PAGES.STOCK, label: "Stock & Produits" },
        ],
      },
      {
        group: "Administration",
        items: [{ id: PAGES.USERS, label: "Utilisateurs" }],
      },
    ];

    const pageTitle = {
      [PAGES.DASHBOARD]: "Tableau de bord",
      [PAGES.STOCK]: "Stock & Produits",
      [PAGES.ORDERS]: "Commandes",
      [PAGES.USERS]: "Utilisateurs",
    };

    return (
      <>
        <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <img style={{ width:50, height:50 }} src={logo} alt="Logo" />
              <div>
                <div className="logo-text" style={{ fontSize:16 }}>MAJALIS</div>
                <div className="logo-sub">STORE</div>
              </div>
            </div>
          </div>
          <nav className="nav">
            {adminNav.map((group) => (
              <div key={group.group} className="nav-group">
                <div className="nav-label">{group.group}</div>
                {group.items.map((item) => (
                  <button key={item.id}
                    className={`nav-item ${page === item.id ? "active" : ""}`}
                    onClick={() => { setPage(item.id); setSidebarOpen(false); }}>
                    {item.label}
                    {item.badge && <span className="badge">{item.badge}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
          <div className="sidebar-user">
            <div className="user-avatar">{user.name[0]}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="user-name" style={{ fontSize:12 }}>{user.name}</div>
              <div className="user-role">Administrateur</div>
            </div>
            <button onClick={logout} style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", color:"#fff", fontSize:14 }}>⏻</button>
          </div>
        </div>
        {sidebarOpen && <div className="sidebar-backdrop open" onClick={() => setSidebarOpen(false)} />}
        <div className="main">
          <div className="topbar">
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-toggle">☰</button>
              <div className="page-title">{pageTitle[page]}</div>
            </div>
            <div className="topbar-actions">
              <span style={{ fontSize:13, color:"var(--text2)" }}>
                {new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
              </span>
            </div>
          </div>
          <div className="content">
            {page === PAGES.DASHBOARD && <Dashboard products={products} orders={orders} users={allUsers} />}
            {page === PAGES.STOCK && <StockPage products={products} setProducts={setProducts} onRefresh={() => api.getProducts().then(setProducts)} />}
            {page === PAGES.ORDERS && <OrdersPage orders={orders} setOrders={setOrders} products={products} setProducts={setProducts} users={allUsers} onRefresh={() => Promise.all([api.getOrders().then(setOrders), api.getProducts().then(setProducts)])} />}
            {page === PAGES.USERS && <UsersPage users={allUsers} orders={orders} />}
          </div>
        </div>
      </>
    );
  }

  // ===== INTERFACE CLIENT =====
  // Si pas connecté et essaie d'accéder au dashboard admin
  if (!user && page === PAGES.DASHBOARD) {
    return <LoginPage onLogin={handleLogin} adminOnly />;
  }

  return (
    <>
      {/* TOPBAR CLIENT */}
      <div style={{
      background: "linear-gradient(135deg, #1a1207 0%, #3d2c0a 100%)",
        overflow: "hidden",
        marginBottom: 16, padding:"0 20px", height:60,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
    {/* <div style={{
          position: "absolute", top: -30, right: -30,
          width: 150, height: 150,
          background: "rgba(193,153,76,0.15)",
          borderRadius: "50%",
        }} /> */}
        
        <div style={{
          position: "absolute", bottom: -40, left: -20,
          width: 120, height: 120,
          background: "rgba(193,153,76,0.1)",
          borderRadius: "50%",
        }} />

       
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}
          onClick={() => setPage(PAGES.HOME)}>
          <img src={logo} style={{ width:36, height:36 }} alt="logo" />
          <div>
            <div className="logo-text" style={{ fontSize:14 }}>MAJALIS</div>
            <div className="logo-sub" style={{ fontSize:9 }}>STORE</div>
          </div>
        </div>

        <div style={{ display:"flex", gap:4 }}>
          <button onClick={() => setPage(PAGES.HOME)} style={{
            background: page === PAGES.HOME ? "var(--gold)" : "transparent",
            color: page === PAGES.HOME ? "#1a1207" : "#fff",
            border:"none", borderRadius:8, padding:"6px 14px",
            fontWeight:600, fontSize:13, cursor:"pointer",
          }}>🏠 Accueil</button>

          <button onClick={() => setPage(PAGES.SHOP)} style={{
            background: page === PAGES.SHOP ? "var(--gold)" : "transparent",
            color: page === PAGES.SHOP ? "#1a1207" : "#fff",
            border:"none", borderRadius:8, padding:"6px 14px",
            fontWeight:600, fontSize:13, cursor:"pointer",
          }}>🛍️ Boutique</button>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {user ? (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div className="user-avatar" style={{ width:32, height:32, fontSize:13 }}>{user.name[0]}</div>
                <span style={{ color:"#fff", fontSize:13, fontWeight:600 }}>{user.name.split(" ")[0]}</span>
              </div>
              <button onClick={logout} style={{
                background:"rgba(255,255,255,0.1)", border:"none",
                borderRadius:8, padding:"6px 12px", color:"#fff",
                cursor:"pointer", fontSize:12,
              }}>Déconnexion</button>
            </>
          ) : (
            <>
              <button onClick={() => setShowAuthModal(true)} style={{
                background:"transparent", border:"1px solid rgba(255,255,255,0.3)",
                borderRadius:8, padding:"6px 14px", color:"#fff",
                cursor:"pointer", fontSize:13,
              }}>Connexion</button>
              <button onClick={() => setShowAuthModal(true)} style={{
                background:"var(--gold)", border:"none",
                borderRadius:8, padding:"6px 14px", color:"#1a1207",
                cursor:"pointer", fontSize:13, fontWeight:700,
              }}>S'inscrire</button>
            </>
          )}
        </div>
      </div>

      <div style={{ padding:"24px 20px", maxWidth:1200, margin:"0 auto" }}>
        {page === PAGES.HOME && (
          <HomePage
            user={user}
            products={products}
            onStartShopping={() => setPage(PAGES.SHOP)}
          />
        )}
        {page === PAGES.SHOP && (
          <ClientShop
            user={user}
            products={products}
            orders={orders}
            setOrders={setOrders}
            setProducts={setProducts}
            onRequireAuth={requireAuth}
            defaultTab="shop"
            onRefresh={() => Promise.all([api.getOrders().then(setOrders), api.getProducts().then(setProducts)])}
          />
        )}
        {page === PAGES.ORDERS && user && (
          <ClientShop
            user={user}
            products={products}
            orders={orders}
            setOrders={setOrders}
            setProducts={setProducts}
            onRequireAuth={requireAuth}
            defaultTab="orders"
            onRefresh={() => Promise.all([api.getOrders().then(setOrders), api.getProducts().then(setProducts)])}
          />
        )}
      </div>

      {showAuthModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAuthModal(false)}>
          <div style={{
            background:"var(--surface)", borderRadius:20, padding:32,
            maxWidth:420, width:"90%", position:"relative",
          }}>
            <button onClick={() => setShowAuthModal(false)} style={{
              position:"absolute", top:16, right:16,
              background:"none", border:"none", fontSize:18,
              cursor:"pointer", color:"var(--text2)",
            }}>✕</button>
            <LoginPage onLogin={handleLogin} embedded />
          </div>
        </div>
      )}
    </>
  );
}