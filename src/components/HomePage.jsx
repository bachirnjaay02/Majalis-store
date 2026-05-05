import { useState, useEffect } from "react";
import logo from "../../majalis-store.png";

const HERO_SLIDES = [
  {
    image: "https://i.pinimg.com/1200x/70/c4/7e/70c47e4f22dd4980fb23f4e1c9a8ae29.jpg",
    title: "Élégance & Style",
    subtitle: "Découvrez nos collections exclusives",
  },
  {
    image: "https://i.pinimg.com/1200x/ff/b7/b7/ffb7b7a98100b0e5bb84a951335dad52.jpg",
    title: "Mode Authentique",
    subtitle: "Des tenues pour toutes les occasions",
  },
  {
    image: "https://instagram.fdkr9-1.fna.fbcdn.net/v/t1.15752-9/680518724_928711663325851_5134750723630737562_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=107&ccb=7-5&_nc_sid=fc17b8&efg=eyJxZV9ncm91cHMiOlsiaWdkX2Jlc3RfZWZmb3J0X2ltYWdlOnRlc3QiXX0%3D&_nc_ohc=-hY3K-u_yE8Q7kNvwFBj7cT&_nc_oc=AdqBAdX--rGMFqWs0XiEdvBIDA82vQbIu6nIDkNbhcNSR5kqLdeLGIQ8JPVcp36gg1g&_nc_zt=23&_nc_ht=instagram.fdkr9-1.fna&_nc_ss=7b6a8&oh=03_Q7cD5QEXWW25iSFRsJBHSWHqJcehSgexoaNfmlEUDGyyFB-pWA&oe=6A1C28B5",
    title: "Collection Laffa",
    subtitle: "Qualité premium · Prix imbattables",
  },
];

const CATEGORIES = [
  { label: "Djellabas gabardine", image: "https://scontent.fdkr9-1.fna.fbcdn.net/v/t1.15752-9/684283990_2267389627125252_3366546429048271303_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=107&ccb=1-7&_nc_sid=9f807c&_nc_ohc=WiLIJGXH0MQQ7kNvwESIdG3&_nc_oc=Adq1OwxfLxjx2z6G4Glg3Kk4qWfS5iU5FxmMN7ABK24npZHAuDUlN3bA7ruGG5bdZFw&_nc_zt=23&_nc_ht=scontent.fdkr9-1.fna&_nc_ss=7b6a8&oh=03_Q7cD5QHqB9KVMhfkGqZspvcdqW6FtOHB2XkNjtjFOHR39b-erw&oe=6A1C2F28" },
  { label: "Djellabas kashmir", image: "https://scontent.fdkr9-1.fna.fbcdn.net/v/t1.15752-9/687664381_1420319176485677_8959977708470646959_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=109&ccb=1-7&_nc_sid=9f807c&_nc_ohc=8BVINNf8b24Q7kNvwGcCjqI&_nc_oc=AdrQneTTxtF2WphuJdlshmNS6FEnzfMFpUIOLinqdvYNhiDfKPGoIkgsDwxwYGVcAo0&_nc_zt=23&_nc_ht=scontent.fdkr9-1.fna&_nc_ss=7b6a8&oh=03_Q7cD5QELtoQPEzZAJCkbq8ujVRKpfY0jkl82wPe7IvFafMQplg&oe=6A1C37EC" },
  { label: "Kalla segn fallou", image: "https://scontent.xx.fbcdn.net/v/t1.15752-9/688135156_1496816015218446_5814770741695964045_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=104&ccb=1-7&_nc_sid=9f807c&_nc_ohc=UjU2sUpPfq0Q7kNvwFCzgMx&_nc_oc=AdrxUw1uZb__7WQNalRt5K7REb1zgUy-smcDNxxUmLRPiLem7BIZnNUTlRPahIeYsTpophcqCVonUXEZxieb8yYN&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.xx&oh=03_Q7cD5QGPuHpe-sHHS6Q0eGqaE3HIfZQTfQtCyGES4Mh1jMsEag&oe=6A20AA4F" },
  { label: "Laffa Baay Barra", image: "https://scontent.fdkr9-1.fna.fbcdn.net/v/t1.15752-9/678402837_883013724842110_305795757151690421_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=109&ccb=1-7&_nc_sid=9f807c&_nc_ohc=_CQUEOhnwC0Q7kNvwGqbT6t&_nc_oc=Adp0JLhv7WRhnVIFBQi57pG89IhKvt0zEMJzlZgyXdHm6m4SLE61civiADYJ2yi6B3Y&_nc_zt=23&_nc_ht=scontent.fdkr9-1.fna&_nc_ss=7b6a8&oh=03_Q7cD5QGGpjuBiYfaAEe4va-6fA9BinS8Peslt9iylaQDl3NU7A&oe=6A1C2227" },
  { label: "Laffa simple", image: "https://scontent.fdkr9-1.fna.fbcdn.net/v/t1.15752-9/684664739_1395764719022822_6118160249023413851_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=105&ccb=1-7&_nc_sid=9f807c&_nc_ohc=KmvWVZnlT4MQ7kNvwG365fZ&_nc_oc=AdoXm-UXKlcndcv8zblM2myYS9F0xXItQCeZ2B4TDbMA2G_Bp5GzfxdLxfz-4AvntPA&_nc_zt=23&_nc_ht=scontent.fdkr9-1.fna&_nc_ss=7b6a8&oh=03_Q7cD5QFkHU2Cyqrf7cohQ9uYrusYu3_ZfhyQQyzZD-wHG1pLwQ&oe=6A1C241B" },
  { label: "Djellabei simple", image: "https://scontent.fdkr9-1.fna.fbcdn.net/v/t1.15752-9/680464406_1638806667442262_56759431763573822_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_ohc=TFj0H7IIFIQQ7kNvwHRavRC&_nc_oc=AdoOw3FctjT1yqV6YG-ZrCMGjlL7K-j0w1eHtINkGE1eS6pkCHs1WXI0QZ5pY6lk8ek&_nc_zt=23&_nc_ht=scontent.fdkr9-1.fna&_nc_ss=7b6a8&oh=03_Q7cD5QGuPKjyjuaWLSIylK4wmoI_WDZdlPZA0C2pCpmFEwMelw&oe=6A1C4210" },
  { label: "Kalla pashmina", image: "https://i.pinimg.com/1200x/ff/b7/b7/ffb7b7a98100b0e5bb84a951335dad52.jpg" },
  { label: "Kalla fille", image: "https://i.pinimg.com/1200x/70/c4/7e/70c47e4f22dd4980fb23f4e1c9a8ae29.jpg" },
  { label: "Djellabei Murid", image: "https://scontent.xx.fbcdn.net/v/t1.15752-9/684141927_1322187446478564_4851461035806723020_n.jpg?_nc_cat=107&ccb=1-7&_nc_ohc=W8iQh2mvbc4Q7kNvwGIGvRE&_nc_oc=Adqd5lmlA0aTDbrlz9ktkssMYr_uT79TAGjIrOn6wNdYwQXJlSMOMxRPTx8MKBHbulDos1VjuRUaJW1EqU0wUvjp&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.xx&stp=c0.5000x0.5000f_dst-emg0_p640x334_q75_tt6&ur=9f807c&_nc_sid=c24604&oh=03_Q7cD5QHfZG5smiW_HY-2JSsIyIKovKNjudk5EdD4_fDXLVzD-g&oe=6A20C845" },

];

export default function HomePage({ user, products, onStartShopping }) {
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setSlide((s) => (s + 1) % HERO_SLIDES.length);
        setAnimating(false);
      }, 500);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const current = HERO_SLIDES[slide];

  return (
    <div style={{ overflow: "hidden" }}>

      {/* ===== HERO SLIDESHOW ===== */}
      <div style={{
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        height: 420,
        marginBottom: 32,
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
      }}>
        {/* Image de fond */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url('${current.image}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "opacity 0.5s ease",
          opacity: animating ? 0 : 1,
          filter: "brightness(0.45)",
        }} />

        {/* Dégradé doré */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(193,153,76,0.55) 0%, rgba(0,0,0,0.3) 100%)",
        }} />

        {/* Contenu */}
        <div style={{
          position: "relative", zIndex: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 48px",
          transition: "opacity 0.5s ease",
          opacity: animating ? 0 : 1,
        }}>
          <div style={{
            display: "inline-block",
            background: "var(--gold)",
            color: "#1a1207",
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: 3,
            padding: "5px 14px",
            borderRadius: 20,
            marginBottom: 16,
            width: "fit-content",
          }}>
            MAJALIS STORE
          </div>
          <h1 style={{
            color: "#fff",
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 900,
            margin: "0 0 12px",
            textShadow: "0 2px 12px rgba(0,0,0,0.4)",
            fontFamily: "'Cairo', sans-serif",
          }}>
            {current.title}
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 16,
            marginBottom: 28,
            maxWidth: 480,
          }}>
            {current.subtitle}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={onStartShopping} style={{
              background: "var(--gold)",
              color: "#1a1207",
              border: "none",
              borderRadius: 12,
              padding: "13px 28px",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(193,153,76,0.5)",
              transition: "transform 0.2s",
            }}
              onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
            >
              🛍️ Voir la boutique
            </button>
            <button onClick={onStartShopping} style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "2px solid rgba(255,255,255,0.5)",
              borderRadius: 12,
              padding: "13px 28px",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              backdropFilter: "blur(8px)",
            }}>
              Découvrir ✨
            </button>
          </div>
        </div>

        {/* Indicateurs */}
        <div style={{
          position: "absolute", bottom: 20, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", gap: 8, zIndex: 3,
        }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{
              width: i === slide ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === slide ? "var(--gold)" : "rgba(255,255,255,0.4)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: 0,
            }} />
          ))}
        </div>

        {/* Logo watermark */}
        <img src={logo} alt="" style={{
          position: "absolute", right: 40, top: "50%",
          transform: "translateY(-50%)",
          width: 120, opacity: 0.15,
          zIndex: 1,
        }} />
      </div>

      {/* ===== BANNIÈRE DÉFILANTE ===== */}
      <div style={{
        background: "var(--gold)",
        padding: "10px 0",
        marginBottom: 32,
        overflow: "hidden",
        borderRadius: 12,
      }}>
        <div style={{
          display: "flex",
          animation: "marquee 20s linear infinite",
          whiteSpace: "nowrap",
          gap: 0,
        }}>
          {[...Array(3)].map((_, i) => (
            <span key={i} style={{ color: "#1a1207", fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
              &nbsp;&nbsp;✨ DJELLABAS &nbsp;•&nbsp; KALLA &nbsp;•&nbsp; LAFFA &nbsp;•&nbsp; PASHMINA &nbsp;•&nbsp; LIVRAISON RAPIDE &nbsp;•&nbsp; QUALITÉ PREMIUM &nbsp;•&nbsp; MODE AFRICAINE &nbsp;•&nbsp; MAJALIS STORE &nbsp;•&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 16,
        marginBottom: 32,
      }}>
        {[
          { icon: "🛍️", value: `${products.length}+`, label: "Produits" },
          { icon: "⭐", value: "100%", label: "Satisfaction" },
          { icon: "🚚", value: "24h", label: "Livraison" },
          { icon: "💬", value: "24/7", label: "Support" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "var(--surface)",
            borderRadius: 16,
            padding: "20px 16px",
            textAlign: "center",
            border: "1px solid var(--border)",
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "default",
          }}
            onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
            onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--gold-dark)" }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ===== CATÉGORIES ===== */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Nos Collections</div>
            <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 2 }}>Explorez nos catégories phares</div>
          </div>
          <button onClick={onStartShopping} style={{
            background: "none", border: "1px solid var(--gold)",
            color: "var(--gold-dark)", borderRadius: 10,
            padding: "7px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>
            Tout voir →
          </button>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 16,
        }}>
          {CATEGORIES.map((cat, i) => (
            <div key={cat.label} onClick={onStartShopping} style={{
              borderRadius: 16,
              overflow: "hidden",
              cursor: "pointer",
              position: "relative",
              height: 200,
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              transition: "transform 0.3s, box-shadow 0.3s",
              animationDelay: `${i * 0.1}s`,
            }}
              onMouseOver={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.2)"; }}
              onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; }}
            >
              <img src={cat.image} alt={cat.label} style={{
                width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 0.4s",
              }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)",
              }} />
              <div style={{
                position: "absolute", bottom: 12, left: 12, right: 12,
                color: "#fff", fontWeight: 700, fontSize: 13,
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              }}>
                {cat.label}
              </div>
              <div style={{
                position: "absolute", top: 10, right: 10,
                background: "var(--gold)",
                borderRadius: "50%",
                width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14,
              }}>
                →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== POURQUOI NOUS ===== */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Pourquoi choisir Majalis Store ?</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}>
          {[
            { icon: "✨", title: "Produits sélectionnés", desc: "Une collection pensée pour le quotidien et les occasions spéciales.", color: "#fff8e6" },
            { icon: "🚚", title: "Livraison simplifiée", desc: "Commande rapide et préparation soignée pour chaque client.", color: "#e6f9f1" },
            { icon: "💬", title: "Support local", desc: "Un service à l'écoute centré sur vos besoins.", color: "#f0f4ff" },
            { icon: "🔒", title: "Paiement sécurisé", desc: "Wave, Orange Money et autres moyens locaux acceptés.", color: "#fff0f0" },
          ].map((f) => (
            <div key={f.title} style={{
              background: f.color,
              borderRadius: 16,
              padding: "20px 18px",
              border: "1px solid var(--border)",
              transition: "transform 0.2s",
            }}
              onMouseOver={e => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ fontSize: 30, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CTA FINAL ===== */}
      <div style={{
        background: "linear-gradient(135deg, #1a1207 0%, #3d2c0a 100%)",
        borderRadius: 20,
        padding: "36px 32px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        marginBottom: 16,
      }}>
        <div style={{
          position: "absolute", top: -30, right: -30,
          width: 150, height: 150,
          background: "rgba(193,153,76,0.15)",
          borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: -20,
          width: 120, height: 120,
          background: "rgba(193,153,76,0.1)",
          borderRadius: "50%",
        }} />
        <img src={logo} alt="" style={{ width: 60, marginBottom: 12, opacity: 0.9 }} />
        <div style={{ color: "#fff", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
          Prêt à commander ?
        </div>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 20 }}>
          Bienvenue, <strong style={{ color: "var(--gold)" }}>{user.name.split(" ")[0]}</strong> ! Des tenues exclusives vous attendent.
        </div>
        <button onClick={onStartShopping} style={{
          background: "var(--gold)",
          color: "#1a1207",
          border: "none",
          borderRadius: 12,
          padding: "14px 32px",
          fontWeight: 800,
          fontSize: 16,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(193,153,76,0.4)",
          transition: "transform 0.2s",
        }}
          onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
        >
          🛍️ Commencer mes achats
        </button>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}