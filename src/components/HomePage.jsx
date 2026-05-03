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


      {/* ajout les produits que nous proposons sous forme de card d'images url*/}

        <div className="section" >
        <div className="section-title">Nos catégories phares</div>
        <div className="section-subtitle">Explorez nos catégories les plus populaires et trouvez l'inspiration pour votre prochain achat.</div>
       {/* forme carrée pour chaque catégorie card */}
        
        <div className="section-card" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { label: "Djellabas gabardine", image: "https://instagram.fdkr9-1.fna.fbcdn.net/v/t1.15752-9/687834949_2417592368724969_3598898778983929155_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=100&ccb=7-5&_nc_sid=fc17b8&efg=eyJxZV9ncm91cHMiOlsiaWdkX2Jlc3RfZWZmb3J0X2ltYWdlOnRlc3QiXX0%3D&_nc_ohc=UvmeAeltk-YQ7kNvwG2_J4q&_nc_oc=AdoTo4Dwvn9b9_7whCDA-xf32Uhz1bMlgJr6C03MMrwz5jAMxmbo7yLCoi5fQUtcSXM&_nc_zt=23&_nc_ht=instagram.fdkr9-1.fna&_nc_ss=7b6a8&oh=03_Q7cD5QFrrbN7rQ7Tu5D5DPIQSyc0wxpyQdXhD498Omk07idJZw&oe=6A1C3A21" },
            { label: "Djellabas kashmir", image: "https://instagram.fdkr9-1.fna.fbcdn.net/v/t1.15752-9/687664381_1420319176485677_8959977708470646959_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=109&ccb=7-5&_nc_sid=fc17b8&efg=eyJxZV9ncm91cHMiOlsiaWdkX2Jlc3RfZWZmb3J0X2ltYWdlOnRlc3QiXX0%3D&_nc_ohc=8BVINNf8b24Q7kNvwGcCjqI&_nc_oc=AdrQneTTxtF2WphuJdlshmNS6FEnzfMFpUIOLinqdvYNhiDfKPGoIkgsDwxwYGVcAo0&_nc_zt=23&_nc_ht=instagram.fdkr9-1.fna&_nc_ss=7b6a8&oh=03_Q7cD5QH_5m9b9bpKgH_IcuZsvruOCZydfQizlVmF2XGryJ6elA&oe=6A1C37EC" },
            { label: "kalla segn fallou", image: "https://scontent.cdninstagram.com/v/t1.15752-9/681114842_981496927903525_5734082683138948914_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=110&ccb=7-5&_nc_sid=fc17b8&efg=eyJxZV9ncm91cHMiOlsiaWdkX2Jlc3RfZWZmb3J0X2ltYWdlOnRlc3QiXX0%3D&_nc_ohc=GlvOpcFWhcAQ7kNvwHtAgQ-&_nc_oc=AdrNCanRCvilcZtMHFZWB1jk0sby1crD4LpxfHOsFiynakPrV-YSr9MiXqu2S5PpCtGVWz0UT6lLE_-VV69364q7&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&oh=03_Q7cD5QFzF0fbE5lhmdkUVfz3qjBKqK02gnK3ZU6uhW8vjZ76pA&oe=6A1C4271" },
            { label: "Kalla segn Hamza", image: "https://scontent.xx.fbcdn.net/v/t1.15752-9/686345958_1192750152838310_1730741025269468743_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=104&ccb=1-7&_nc_sid=9f807c&_nc_ohc=MoUhMR68YDIQ7kNvwF9-Pfx&_nc_oc=AdpvSwjFH7hJcKeJA3heMH6qKKhc9KysL-lRpna3wmfkj4VIjXO8SFg54NHSUvMFpyAaNT9QoWL_v7ADo2zp7osx&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.xx&oh=03_Q7cD5QEBFfbgw0Wu1d0-DXD_NROyBJJlA21NhlvT4q2LKjYjxA&oe=6A1E150E" },
            { label: "kalla pashimina fille", image: "https://i.pinimg.com/1200x/70/c4/7e/70c47e4f22dd4980fb23f4e1c9a8ae29.jpg" },
            { label: "Kalla pashmina unisex", image: "https://i.pinimg.com/1200x/ff/b7/b7/ffb7b7a98100b0e5bb84a951335dad52.jpg" },
            { label: "laffa Baay Barra", image: "https://instagram.fdkr9-1.fna.fbcdn.net/v/t1.15752-9/677909921_1939768919991320_8207507416904135231_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=101&ccb=7-5&_nc_sid=fc17b8&efg=eyJxZV9ncm91cHMiOlsiaWdkX2Jlc3RfZWZmb3J0X2ltYWdlOnRlc3QiXX0%3D&_nc_ohc=Sx3zoWNDD40Q7kNvwHzNnpe&_nc_oc=AdqS6RmnZXrdJBsiFi88Bhr6oY6ovMQphx6woOLFGs3-mXMvA0Q7lhQfmxZq83wA37o&_nc_zt=23&_nc_ht=instagram.fdkr9-1.fna&_nc_ss=7b6a8&oh=03_Q7cD5QFAhTlUQ2ZsAGKhahGi23PY3dTSniTlesRlzDyTkBq3Eg&oe=6A1C3BD6" },
            { label: "Laffa simple", image: "https://instagram.fdkr9-1.fna.fbcdn.net/v/t1.15752-9/680518724_928711663325851_5134750723630737562_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=107&ccb=7-5&_nc_sid=fc17b8&efg=eyJxZV9ncm91cHMiOlsiaWdkX2Jlc3RfZWZmb3J0X2ltYWdlOnRlc3QiXX0%3D&_nc_ohc=-hY3K-u_yE8Q7kNvwFBj7cT&_nc_oc=AdqBAdX--rGMFqWs0XiEdvBIDA82vQbIu6nIDkNbhcNSR5kqLdeLGIQ8JPVcp36gg1g&_nc_zt=23&_nc_ht=instagram.fdkr9-1.fna&_nc_ss=7b6a8&oh=03_Q7cD5QEXWW25iSFRsJBHSWHqJcehSgexoaNfmlEUDGyyFB-pWA&oe=6A1C28B5" },
            { label: "djallabei simple", image: "https://instagram.fdkr9-1.fna.fbcdn.net/v/t1.15752-9/680464406_1638806667442262_56759431763573822_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=102&ccb=7-5&_nc_sid=fc17b8&efg=eyJxZV9ncm91cHMiOlsiaWdkX2Jlc3RfZWZmb3J0X2ltYWdlOnRlc3QiXX0%3D&_nc_ohc=TFj0H7IIFIQQ7kNvwHRavRC&_nc_oc=AdoOw3FctjT1yqV6YG-ZrCMGjlL7K-j0w1eHtINkGE1eS6pkCHs1WXI0QZ5pY6lk8ek&_nc_zt=23&_nc_ht=instagram.fdkr9-1.fna&_nc_ss=7b6a8&oh=03_Q7cD5QFoH4gORLG1K6WHTZnt-e0ZYcE-RDuJbTaWuRn8uxNb9Q&oe=6A1C4210" },
          ].map((category) => (
            <div key={category.label} className="category-card">
              <div className="category-image" style={{ backgroundImage: `url('${category.image}')` }} />
              <div className="category-label">{category.label}</div>
            </div>
          ))}
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
