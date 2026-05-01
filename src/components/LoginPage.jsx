import { useState } from "react";
import logo from "../../majalis store.png";

const ADMIN_EMAIL = "admin@majalis.sn";
const ADMIN_PASSWORD = "Majalis2003@";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showReg, setShowReg] = useState(false);
  const [reg, setReg] = useState({ name: "", email: "", password: "", phone: "" });





  const handleLogin = () => {
    if (!email || !password) return setError("Remplissez tous les champs");

    if (email === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD) return setError("Mot de passe incorrect");
      const adminUser = {
        id: 1,
        name: "Admin Majalis",
        email: ADMIN_EMAIL,
        role: "admin",
        phone: "+221-77-840-19-04",
        joined: new Date().toISOString().split("T")[0],
      };
      setError("");
      return onLogin(adminUser);
    }

    const clientUser = {
      id: Date.now(),
      name: email.split("@")[0],
      email,
      role: "client",
      phone: "",
      joined: new Date().toISOString().split("T")[0],
    };
    setError("");
    onLogin(clientUser);
  };

  const handleReg = () => {
    if (!reg.name || !reg.email || !reg.password) return setError("Remplissez tous les champs");
    if (reg.email === ADMIN_EMAIL) return setError("Adresse administrateur réservée");
    const newUser = {
      id: Date.now(),
      name: reg.name,
      email: reg.email,
      role: "client",
      phone: reg.phone,
      joined: new Date().toISOString().split("T")[0],
    };
    setError("");
    onLogin(newUser);
  };

  return (
    <div className="login-screen">
      <div className="login-deco" style={{ top: -80, left: -80 }} />
      <div className="login-deco" style={{ bottom: -80, right: -80 }} />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-image-wrapper" aria-hidden="true">
            <img src={logo} alt="Majalis Store" className="login-logo-image" />
          </div>
          <div className="logo-text">MAJALIS STORE</div>
          <div className="logo-sub" style={{ textAlign: "center", marginTop: 4 }}>
            Espace {showReg ? "Inscription" : "Connexion"}
          </div>
          <div className="logo-tagline">Mode dynamique & élégance instantanée</div>
        </div>
        {!showReg ? (
          <>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            {error && (
              <div style={{ color: "#c0392b", fontSize: 13, marginBottom: 12, background: "#fff0f0", padding: "8px 12px", borderRadius: 8 }}>
                ⚠️ {error}
              </div>
            )}
            <button className="btn btn-gold" style={{ width: "100%", padding: "13px", fontSize: 15, justifyContent: "center" }} onClick={handleLogin}>
              Connexion
            </button>
            <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "var(--text2)" }}>
              Pas de compte ?{" "}
              <span style={{ color: "var(--gold)", fontWeight: 600, cursor: "pointer" }} onClick={() => { setShowReg(true); setError(""); }}>
                S'inscrire
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nom complet</label>
                <input className="form-input" placeholder="Votre nom" value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="form-input" placeholder="77-000-00-00" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="votre@email.com" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input className="form-input" type="password" placeholder="••••••••" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} />
            </div>
            {error && (
              <div style={{ color: "#c0392b", fontSize: 13, marginBottom: 12, background: "#fff0f0", padding: "8px 12px", borderRadius: 8 }}>
                ⚠️ {error}
              </div>
            )}
            <button className="btn btn-gold" style={{ width: "100%", padding: "13px", fontSize: 15, justifyContent: "center" }} onClick={handleReg}>
              Créer mon compte
            </button>
            <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "var(--text2)" }}>
              Déjà un compte ?{" "}
              <span style={{ color: "var(--gold)", fontWeight: 600, cursor: "pointer" }} onClick={() => { setShowReg(false); setError(""); }}>
                Se connecter
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
