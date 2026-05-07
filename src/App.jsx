import { useState, useEffect, useCallback, useRef } from "react";
import logo from "../majalis-store.png";
import logoblanc from "../majalis-store-blanc.png";
import LoginPage from "./components/LoginPage.jsx";
import Dashboard from "./components/Dashboard.jsx";
import StockPage from "./components/StockPage.jsx";
import OrdersPage from "./components/OrdersPage.jsx";
import UsersPage from "./components/UsersPage.jsx";
import HomePage from "./components/HomePage.jsx";
import ClientShop from "./components/ClientShop.jsx";
import { api } from "./utils/api.js";

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
  const [dataLoading, setDataLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authCallback, setAuthCallback] = useState(null);
  const [toast, setToast] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Référence pour éviter les appels multiples
  const loadingRef = useRef(false);

  // --- Toast ---
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // --- Init ---
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api
        .me()
        .then((userData) => {
          setUser(userData);
          setPage(userData.role === "admin" ? PAGES.DASHBOARD : PAGES.HOME);
        })
        .catch(() => api.setToken(null))
        .finally(() => setLoading(false));
    } else {
      api
        .getProducts()
        .then(setProducts)
        .catch(() => showToast("Impossible de charger les produits", "error"))
        .finally(() => setLoading(false));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Chargement données ---
  const loadData = useCallback(
    async (currentUser) => {
      if (!currentUser || loadingRef.current) return;
      loadingRef.current = true;
      setDataLoading(true);
      try {
        const [prods, ords] = await Promise.all([
          api.getProducts(),
          api.getOrders(),
        ]);
        setProducts(prods);
        setOrders(ords);
        if (currentUser.role === "admin") {
          const users = await api.getUsers();
          setAllUsers(users);
        }
      } catch (err) {
        console.error("Erreur chargement données:", err);
        showToast("Erreur lors du chargement des données", "error");
      } finally {
        setDataLoading(false);
        loadingRef.current = false;
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (user) loadData(user);
  }, [user, loadData]);

  // --- Refresh manuel ---
  const refreshData = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setDataLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
      ]);
      setProducts(prods);
      setOrders(ords);
      if (user?.role === "admin") {
        const users = await api.getUsers();
        setAllUsers(users);
      }
      showToast("Données actualisées", "success");
    } catch {
      showToast("Erreur lors de l'actualisation", "error");
    } finally {
      setDataLoading(false);
      loadingRef.current = false;
    }
  }, [user, showToast]);

  // --- Auth ---
  const handleLogin = useCallback(
    (token, userData) => {
      api.setToken(token);
      setUser(userData);
      setShowAuthModal(false);

      if (userData.role === "admin") {
        setPage(PAGES.DASHBOARD);
      } else {
        setPage(PAGES.SHOP);
        // Exécuter la callback d'action post-login (ex: ajouter au panier)
        if (authCallback) {
          authCallback(userData);
          setAuthCallback(null);
        }
      }
    },
    [authCallback]
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* token invalide, on continue */
    }
    api.setToken(null);
    setUser(null);
    setProducts([]);
    setOrders([]);
    setAllUsers([]);
    setPage(PAGES.HOME);
    showToast("Déconnecté avec succès", "info");
    // Recharger les produits publics
    api.getProducts().then(setProducts).catch(() => {});
  }, [showToast]);

  const requireAuth = useCallback((callback) => {
    setAuthCallback(() => callback);
    setShowAuthModal(true);
  }, []);

  // Fermer le menu mobile au changement de page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [page]);

  // --- Loading écran ---
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg)",
        }}
      >
        <div style={{ textAlign: "center", color: "var(--text2)" }}>
          <img
            src={logo}
            style={{ width: 80, marginBottom: 16, opacity: 0.7 }}
            alt="logo"
          />
          <div style={{ fontSize: 14 }}>Xaral Touti Saway...</div>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  const pendingCount = orders.filter((o) => o.status === "en attente").length;
  const userOrderCount = user
    ? orders.filter((o) => o.userId === user.id || o.user === user.id).length
    : 0;

  // =========================
  //  INTERFACE ADMIN
  // =========================
  if (isAdmin) {
    const adminNav = [
      {
        group: "Principal",
        items: [
          { id: PAGES.DASHBOARD, label: "Tableau de bord", icon: "📊" },
          {
            id: PAGES.ORDERS,
            label: "Commandes",
            icon: "📋",
            badge: pendingCount > 0 ? pendingCount : null,
          },
          { id: PAGES.STOCK, label: "Stock & Produits", icon: "📦" },
        ],
      },
      {
        group: "Administration",
        items: [{ id: PAGES.USERS, label: "Utilisateurs", icon: "👥" }],
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
        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <img style={{ width: 50, height: 50 }} src={logo} alt="Logo" />
              <div>
                <div className="logo-text" style={{ fontSize: 16 }}>
                  MAJALIS
                </div>
                <div className="logo-sub">STORE</div>
              </div>
            </div>
          </div>

          <nav className="nav">
            {adminNav.map((group) => (
              <div key={group.group} className="nav-group">
                <div className="nav-label">{group.group}</div>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    className={`nav-item ${page === item.id ? "active" : ""}`}
                    onClick={() => {
                      setPage(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <span style={{ marginRight: 10 }}>{item.icon}</span>
                    {item.label}
                    {item.badge && <span className="badge">{item.badge}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>

          <div className="sidebar-user">
            <div className="user-avatar">{user.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ fontSize: 12 }}>
                {user.name}
              </div>
              <div className="user-role">Administrateur</div>
            </div>
            <button
              onClick={logout}
              title="Déconnexion"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "none",
                borderRadius: 8,
                width: 32,
                height: 32,
                cursor: "pointer",
                color: "#fff",
                fontSize: 14,
              }}
            >
              ⏻
            </button>
          </div>
        </div>

        {sidebarOpen && (
          <div
            className="sidebar-backdrop open"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="main">
          <div className="topbar">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="menu-toggle"
              >
                ☰
              </button>
              <div className="page-title">{pageTitle[page]}</div>
              {dataLoading && (
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--accent)",
                    animation: "pulse 1s infinite",
                  }}
                >
                  Actualisation...
                </span>
              )}
            </div>
            <div className="topbar-actions">
              <button
                onClick={refreshData}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "6px 14px",
                  color: "var(--text2)",
                  fontSize: 13,
                  cursor: "pointer",
                  marginRight: 12,
                }}
              >
                🔄 Actualiser
              </button>
              <span style={{ fontSize: 13, color: "var(--text2)" }}>
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>

          <div className="content">
            {page === PAGES.DASHBOARD && (
              <Dashboard products={products} orders={orders} users={allUsers} />
            )}
            {page === PAGES.STOCK && (
              <StockPage
                products={products}
                setProducts={setProducts}
                onRefresh={refreshData}
              />
            )}
            {page === PAGES.ORDERS && (
              <OrdersPage
                orders={orders}
                setOrders={setOrders}
                products={products}
                setProducts={setProducts}
                users={allUsers}
                onRefresh={refreshData}
              />
            )}
            {page === PAGES.USERS && (
              <UsersPage users={allUsers} orders={orders} />
            )}
          </div>
        </div>
      </>
    );
  }

  // =========================
  //  INTERFACE CLIENT
  // =========================
  if (!user && page === PAGES.DASHBOARD) {
    return <LoginPage onLogin={handleLogin} adminOnly />;
  }

  return (
    <>
      {/* --- TOPBAR CLIENT --- */}
        <div className="client-topbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", }}>
                <div className="topbarclient" style={{ display: "flex",gap: 200, alignItems: "center", justifyContent: "space-between", }}>

    <div
          className="client-topbar-logo "
          onClick={() => setPage(PAGES.HOME)}
          style={{ cursor: "pointer" }}
        >
          <img src={logoblanc} alt="logoblanc" style={{ width: "60px", height: "60px" }} />
          <div className="client-topbar-logo-text">
            <div className="logo-text" style={{ fontSize: 14 }}>
              MAJALIS
            </div>
            <div className="logo-sub" style={{ fontSize: 9 }}>
              STORE
            </div>
          </div>
        </div>

 {/* Burger Mobile */}
        <button 
          className="Nav-mobile"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            alignItems: "right",
            justifyContent: "center",
            background: "none",
            border: "none",
            color: "#f0c046",
            fontSize: 22,
            cursor: "pointer",
            padding: 8,
          }}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
        {/* Nav Desktop */}
        <div className="client-topbar-nav Nav-desktop">
          <button
            onClick={() => setPage(PAGES.HOME)}
            className={page === PAGES.HOME ? "active" : ""}
          >
            🏠 Accueil
          </button>
          <button
            onClick={() => setPage(PAGES.SHOP)}
            className={page === PAGES.SHOP ? "active" : ""}
          >
            🛍️ Boutique
          </button>
          {user && (
            <button
              onClick={() => setPage(PAGES.ORDERS)}
              className={page === PAGES.ORDERS ? "active" : ""}
            >
              📋 Mes commandes
              {userOrderCount > 0 && (
                <span
                  style={{
                    background: "var(--accent)",
                    color: "#ffffff",
                    borderRadius: 10,
                    padding: "1px 7px",
                    fontSize: 11,
                    marginLeft: 6,
                  }}
                >
                  {userOrderCount}
                </span>
              )}
            </button>
          )}
        </div>

       
</div>
        {/* User Desktop */}
        <div className="client-topbar-user Nav-desktop">
          {user ? (
            <>
              <div className="client-topbar-user-info">
                <div
                  className="user-avatar"
                  style={{ width: 32, height: 32, fontSize: 13 }}
                >
                  {user.name[0]}
                </div>
                <span
                  style={{
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <button onClick={logout} className="logout">
                ⏻
              </button>
            </>
          ) : (
            <button style={{ background: "var(--gold)", color: "#1a1207" }}
              onClick={() => setShowAuthModal(true)}
              className="login"
            >
             Connexion
            </button>
          )}
        </div>
      </div>

      {/* --- Menu Mobile --- */}
      {mobileMenuOpen && (
        <div
          className="modal-overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface)",
              borderRadius: "0 0 16px 16px",
              padding: "20px 24px",
              maxWidth: 320,
              width: "90%",
              margin: "60px auto 0",
            }}
          >
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {[
                { id: PAGES.HOME, label: "🏠 Accueil" },
                { id: PAGES.SHOP, label: "🛍️ Boutique" },
                ...(user
                  ? [
                      {
                        id: PAGES.ORDERS,
                        label: `📋 Mes commandes (${userOrderCount})`,
                      },
                    ]
                  : []),
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  style={{
                    background:
                      page === item.id ? "var(--accent)" : "transparent",
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 16px",
                    color: "#0e0d0d",
                    fontSize: 15,
                    cursor: "pointer",
                    textAlign: "left",
                    fontWeight: page === item.id ? 600 : 400,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.1)",
                marginTop: 12,
                paddingTop: 12,
              }}
            >
              {user ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      className="user-avatar"
                      style={{ width: 32, height: 32, fontSize: 13 }}
                    >
                      {user.name[0]}
                    </div>
                    <span style={{ color: "#060606", fontSize: 14 }}>
                      {user.name}
                    </span>
                  </div>
                  <button onClick={logout} className="logout">
                    ⏻
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="login"
                  style={{ background: "var(--gold)", color: "#1a1207", fontSize: 16,fontWeight: "bold",borderRadius: 8, width: "100%" }}
                >
                  Connexion
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Contenu --- */}
      <div
        style={{
          padding: "24px 20px",
          maxWidth: 1200,
          margin: "0 auto",
          opacity: dataLoading ? 0.6 : 1,
          transition: "opacity 0.2s",
          pointerEvents: dataLoading ? "none" : "auto",
        }}
      >
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
            onRefresh={refreshData}
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
            onRefresh={refreshData}
          />
        )}
      </div>

      {/* --- Modal Auth --- */}
      {showAuthModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAuthModal(false);
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 20,
              padding: 32,
              maxWidth: 420,
              width: "90%",
              position: "relative",
            }}
          >
            <button
              onClick={() => {
                setShowAuthModal(false);
                setAuthCallback(null);
              }}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                fontSize: 18,
                cursor: "pointer",
                color: "var(--text2)",
              }}
            >
              ✕
            </button>
            <LoginPage onLogin={handleLogin} embedded />
          </div>
        </div>
      )}

      {/* --- Toast --- */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              toast.type === "error"
                ? "#e74c3c"
                : toast.type === "success"
                ? "#2ecc71"
                : "var(--surface)",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            zIndex: 9999,
            animation: "slideUp 0.3s ease-out",
            border:
              toast.type === "info" ? "1px solid rgba(255,255,255,0.1)" : "none",
          }}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}