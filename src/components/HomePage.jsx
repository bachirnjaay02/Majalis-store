import logo from "../../majalis-store.png";

export default function HomePage({ user, products, onStartShopping }) {
  const categories = [...new Set(products.map((p) => p.category))].slice(0, 4);

  return (
    <div className="home-page">
      <div className="hero-card">
        <div>
          <div className="hero-overline">Bienvenue chez Majalis Store</div>
          <h1>Tout pour votre maison, votre style et vos cadeaux.</h1>
          <p>
            Découvrez des produits de qualité choisis avec soin, une expérience d’achat simple et un service
            client réactif. Explorez notre sélection et commandez en quelques clics.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <button className="btn btn-gold" onClick={onStartShopping}>Voir la boutique</button>
            <button className="btn btn-outline" onClick={onStartShopping}>Découvrir les produits</button>
          </div>
        </div>
        <div className="hero-image" aria-hidden="true">
          <img src={logo} alt="Majalis Store" />
        </div>
      </div>

      <div className="section">
        <div className="section-title">Pourquoi choisir Majalis Store ?</div>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <div className="feature-label">Produits sélectionnés</div>
            <div className="feature-copy">Une collection pensée pour le quotidien et les occasions spéciales.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <div className="feature-label">Livraison simplifiée</div>
            <div className="feature-copy">Commande rapide et préparation soignée pour chaque client.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <div className="feature-label">Support local</div>
            <div className="feature-copy">Un service à l’écoute et une boutique centrée sur vos besoins.</div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Catégories populaires</div>
        <div className="categories-list">
          {categories.map((cat) => (
            <div key={cat} className="category-pill">{cat}</div>
          ))}
        </div>
      </div>

      <div className="section card">
        <div style={{ marginLeft: 20 }} className="card-title">   Ce que vous trouverez</div>
        <div style={{ marginTop: 10,marginLeft: 20, color: "var(--text2)", lineHeight: 1.7  }}>
                    Chez Majalis Store, nous proposons des articles pour la maison, des accessoires et des trouvailles
                 tendance. Cliquez sur « Voir la boutique » pour commencer à explorer les produits disponibles.
        </div>
      </div>
    </div>
  );
}
