import { useState, useEffect } from "react";
import logo from "../majalis-store.png";
import LoginPage from "./components/LoginPage.jsx";
import Dashboard from "./components/Dashboard.jsx";
import StockPage from "./components/StockPage.jsx";
import OrdersPage from "./components/OrdersPage.jsx";
import UsersPage from "./components/UsersPage.jsx";
import HomePage from "./components/HomePage.jsx";
import ClientShop from "./components/ClientShop.jsx";
import { INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_USERS } from "./data/mockData.js";

export default function App() {
  const [user, setUser] = useState(() => {
    const stored = window.localStorage.getItem("majalis_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [allUsers, setAllUsers] = useState(INITIAL_USERS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [page, setPage] = useState(() => {
    const storedPage = window.localStorage.getItem("majalis_page");
    return storedPage || "dashboard";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem("majalis_user", JSON.stringify(user));
    } else {
      window.localStorage.removeItem("majalis_user");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem("majalis_page", page);
    }
  }, [page, user]);

  const handleLogin = (userData) => {
    setAllUsers((prev) => {
      const existing = prev.find((u) => u.email === userData.email);
      const nextUser = existing ? existing : userData;
      setUser(nextUser);
      setPage(userData.role === "admin" ? "dashboard" : "home");
      if (existing) return prev;
      return [...prev, userData];
    });
  };

  const logout = () => {
    setUser(null);
    setPage("dashboard");
    window.localStorage.removeItem("majalis_user");
    window.localStorage.removeItem("majalis_page");
  };

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
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: "var(--surface)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 900,
                fontSize: 18,
                color: "var(--black)",
              }}
            >
              <img style={{ width:50, height:50 }} src={logo} alt="Logo Majalis Store" />
            </div>
            <div>
              <div className="logo-text" style={{ fontSize: 16 }}>MAJALIS</div>
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
                    <button
                      key={item.id}
                      className={`nav-item ${page === item.id ? "active" : ""}`}
                      onClick={() => {
                        setPage(item.id);
                        setSidebarOpen(false);
                      }}
                    >
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
                <button
                  className={`nav-item ${page === "home" ? "active" : ""}`}
                  onClick={() => {
                    setPage("home");
                    setSidebarOpen(false);
                  }}
                >
                  <span className="icon">🏠</span>Accueil
                </button>
                <button
                  className={`nav-item ${page === "shop" ? "active" : ""}`}
                  onClick={() => {
                    setPage("shop");
                    setSidebarOpen(false);
                  }}
                >
                  <span className="icon">🛍️</span>Boutique
                </button>
              </div>
            )}
        </nav>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu">
          ✕
        </button>
        <div className="sidebar-user">
          <div className="user-avatar">{user.name[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name}
            </div>
            <div className="user-role">{isAdmin ? "Administrateur" : "Client"}</div>
          </div>
          <button
            onClick={logout}
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
      {sidebarOpen && <div className="sidebar-backdrop open" onClick={() => setSidebarOpen(false)} />}

      <div className="main">
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="menu-toggle"
              aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              ☰
            </button>
            <div className="page-title">{isAdmin ? pageTitle[page] : pageTitle[page] || `Bienvenue, ${user.name.split(" ")[0]} 👋`}</div>
          </div>
          <div className="topbar-actions">
            <span style={{ fontSize: 13, color: "var(--text2)" }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
        </div>
        <div className="content">
          {isAdmin ? (
            <>
              {page === "dashboard" && <Dashboard products={products} orders={orders} users={allUsers} />}
              {page === "stock" && <StockPage products={products} setProducts={setProducts} />}
              {page === "orders" && <OrdersPage orders={orders} setOrders={setOrders} products={products} setProducts={setProducts} users={allUsers} />}
              {page === "users" && <UsersPage users={allUsers} orders={orders} />}
            </>
          ) : (
            <>
              {page === "home" && <HomePage user={user} products={products} onStartShopping={() => setPage("shop")} />}
              {page === "shop" && <ClientShop user={user} products={products} orders={orders} setOrders={setOrders} setProducts={setProducts} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}
