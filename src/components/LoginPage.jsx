import { useState } from "react";
import logo from "../../majalis-store.png";
import { api } from "../utils/api.js";

export default function LoginPage({ onLogin, embedded = false, adminOnly = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReg, setShowReg] = useState(false);
  const [reg, setReg] = useState({ name: "", email: "", password: "", phone: "" });

  const handleLogin = async () => {
    if (!email || !password) return setError("Remplissez tous les champs");
    setLoading(true);
    setError("");
    try {
      const data = await api.login(email, password);
      if (adminOnly && data.user.role !== "admin") {
        return setError("Accès réservé à l'administrateur");
      }
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  const handleReg = async () => {
    if (!reg.name || !reg.email || !reg.password) return setError("Remplissez tous les champs");
    setLoading(true);
    setError("");
    try {
      const data = await api.register(reg.name, reg.email, reg.password, reg.phone);
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Mode embedded (dans modal)
  if (embedded) {
    return (
      <div>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <img src={logo} alt="Majalis Store" style={{ width:60, marginBottom:8 }} />
          <div style={{ fontSize:18, fontWeight:800, color:"var(--text)" }}>
            {showReg ? "Créer un compte" : "Connexion"}
          </div>
          <div style={{ fontSize:13, color:"var(--text2)", marginTop:4 }}>
            {showReg ? "Inscrivez-vous pour finaliser votre commande" : "Connectez-vous pour valider votre panier"}
          </div>
        </div>

        {!showReg ? (
          <>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            </div>
            {error && <div style={{ color:"#c0392b", fontSize:13, marginBottom:12, background:"#fff0f0", padding:"8px 12px", borderRadius:8 }}>⚠️ {error}</div>}
            <button className="btn btn-gold" style={{ width:"100%", padding:"13px", fontSize:15, justifyContent:"center", opacity: loading ? 0.7 : 1 }} onClick={handleLogin} disabled={loading}>
              {loading ? "Connexion..." : "✅ Connexion & Valider le panier"}
            </button>
            <div style={{ textAlign:"center", marginTop:14, fontSize:13, color:"var(--text2)" }}>
              Pas de compte ?{" "}
              <span style={{ color:"var(--gold)", fontWeight:600, cursor:"pointer" }} onClick={() => { setShowReg(true); setError(""); }}>
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
            {error && <div style={{ color:"#c0392b", fontSize:13, marginBottom:12, background:"#fff0f0", padding:"8px 12px", borderRadius:8 }}>⚠️ {error}</div>}
            <button className="btn btn-gold" style={{ width:"100%", padding:"13px", fontSize:15, justifyContent:"center", opacity: loading ? 0.7 : 1 }} onClick={handleReg} disabled={loading}>
              {loading ? "Création..." : "🚀 Créer mon compte & Commander"}
            </button>
            <div style={{ textAlign:"center", marginTop:14, fontSize:13, color:"var(--text2)" }}>
              Déjà un compte ?{" "}
              <span style={{ color:"var(--gold)", fontWeight:600, cursor:"pointer" }} onClick={() => { setShowReg(false); setError(""); }}>
                Se connecter
              </span>
            </div>
          </>
        )}
      </div>
    );
  }

  // Mode pleine page (admin ou connexion normale)
  return (
    <div className="login-screen">
      <div className="login-deco" style={{ top:-80, left:-80 }} />
      <div className="login-deco" style={{ bottom:-80, right:-80 }} />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-image-wrapper" aria-hidden="true">
            <img src={logo} alt="Majalis Store" className="login-logo-image" />
          </div>
          <div className="logo-text">MAJALIS STORE</div>
          <div className="logo-sub" style={{ textAlign:"center", marginTop:4 }}>
            {adminOnly ? "Espace Administrateur" : showReg ? "Inscription" : "Connexion"}
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
              <input className="form-input" type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            </div>
            {error && <div style={{ color:"#c0392b", fontSize:13, marginBottom:12, background:"#fff0f0", padding:"8px 12px", borderRadius:8 }}>⚠️ {error}</div>}
            <button className="btn btn-gold" style={{ width:"100%", padding:"13px", fontSize:15, justifyContent:"center", opacity: loading ? 0.7 : 1 }} onClick={handleLogin} disabled={loading}>
              {loading ? "Connexion..." : "Connexion"}
            </button>
            {!adminOnly && (
              <div style={{ textAlign:"center", marginTop:18, fontSize:13, color:"var(--text2)" }}>
                Pas de compte ?{" "}
                <span style={{ color:"var(--gold)", fontWeight:600, cursor:"pointer" }} onClick={() => { setShowReg(true); setError(""); }}>
                  S'inscrire
                </span>
              </div>
            )}
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
            {error && <div style={{ color:"#c0392b", fontSize:13, marginBottom:12, background:"#fff0f0", padding:"8px 12px", borderRadius:8 }}>⚠️ {error}</div>}
            <button className="btn btn-gold" style={{ width:"100%", padding:"13px", fontSize:15, justifyContent:"center", opacity: loading ? 0.7 : 1 }} onClick={handleReg} disabled={loading}>
              {loading ? "Création..." : "Créer mon compte"}
            </button>
            <div style={{ textAlign:"center", marginTop:14, fontSize:13, color:"var(--text2)" }}>
              Déjà un compte ?{" "}
              <span style={{ color:"var(--gold)", fontWeight:600, cursor:"pointer" }} onClick={() => { setShowReg(false); setError(""); }}>
                Se connecter
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}