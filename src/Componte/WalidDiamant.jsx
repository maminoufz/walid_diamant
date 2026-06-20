import { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";

/* ═══════════════════════════════════════════════════════════════════
   WALID DIAMANT — Design System v3
   Palette: Obsidian noir + or fumé + ivoire chaud
   Signature: ligne dorée animée sous chaque titre-section
═══════════════════════════════════════════════════════════════════ */

const wilayas = [
  "01 - Adrar","02 - Chlef","03 - Laghouat","04 - Oum El Bouaghi","05 - Batna",
  "06 - Béjaïa","07 - Biskra","08 - Béchar","09 - Blida","10 - Bouira",
  "11 - Tamanrasset","12 - Tébessa","13 - Tlemcen","14 - Tiaret","15 - Tizi Ouzou",
  "16 - Alger","17 - Djelfa","18 - Jijel","19 - Sétif","20 - Saïda",
  "21 - Skikda","22 - Sidi Bel Abbès","23 - Annaba","24 - Guelma","25 - Constantine",
  "26 - Médéa","27 - Mostaganem","28 - M'Sila","29 - Mascara","30 - Ouargla",
  "31 - Oran","32 - El Bayadh","33 - Illizi","34 - Bordj Bou Arréridj","35 - Boumerdès",
  "36 - El Tarf","37 - Tindouf","38 - Tissemsilt","39 - El Oued","40 - Khenchela",
  "41 - Souk Ahras","42 - Tipaza","43 - Mila","44 - Aïn Defla","45 - Naâma",
  "46 - Aïn Témouchent","47 - Ghardaïa","48 - Relizane","49 - El M'Ghair","50 - El Menia",
  "51 - Ouled Djellal","52 - Bordj Badji Mokhtar","53 - Béni Abbès","54 - Timimoun",
  "55 - Touggourt","56 - Djanet","57 - In Salah","58 - In Guezzam",
];

const categories = ["Tous", "colliers", "bracelets", "bagues", "boucles", "montres"];

const testimonials = [
  { name: "Amira B.", text: "Une qualité exceptionnelle, j'adore mon bracelet !", stars: 5 },
  { name: "Karim M.", text: "Service impeccable, livraison rapide à Sétif.", stars: 5 },
  { name: "Sara L.", text: "La bague de fiançailles est magnifique, merci Walid !", stars: 5 },
];

/* ─── TOKENS ─────────────────────────────────────────────────────────
   Or fumé : entre or blanc et or jaune, matte, sophistiqué
   Obsidian : noir profond avec légère teinte bleue-froide
   Ivoire   : blanc cassé chaud, jamais pur blanc
────────────────────────────────────────────────────────────────────── */
const T = {
  /* Or */
  gold:       "#C8A84B",   /* or fumé principal             */
  goldLight:  "#E2C97E",   /* lueur au hover                */
  goldDim:    "#8A6F2A",   /* or ombré / texte secondaire   */
  goldGlow:   "rgba(200,168,75,0.18)",

  /* Noirs */
  ink:        "#080810",   /* fond principal obsidian       */
  inkSurface: "#0D0D18",   /* cartes                        */
  inkRaised:  "#121224",   /* modal, sidebar                */
  inkLine:    "rgba(200,168,75,0.12)",   /* bordure repos    */
  inkLineHov: "rgba(200,168,75,0.42)",   /* bordure hover    */

  /* Textes */
  ivory:      "#EDE7D9",   /* texte principal ivoire        */
  stone:      "#9B947F",   /* texte secondaire              */
  pebble:     "#5E5A4E",   /* texte tertiaire / label       */

  /* Sémantique */
  danger:     "#E05252",
  warn:       "#E09020",
  ok:         "#4AAF7C",
};

/* ─── UTILS ────────────────────────────────────────────────────────── */
const parsePrice = (s) => {
  if (!s) return 0;
  return parseFloat(String(s).replace(/\s/g,"").replace(",",".").replace(/[^\d.]/g,"")) || 0;
};
const getCurrency = (s) => String(s||"").replace(/[\d\s.,]/g,"").trim() || "DA";
const fmtTotal = (price, qty) => {
  const t = parsePrice(price) * qty;
  return `${t.toLocaleString("fr-FR")} ${getCurrency(price)}`;
};
const getStock = (p) => {
  const raw = p.stock !== undefined ? p.stock : p.quantity;
  const n = parseInt(raw, 10);
  return !isNaN(n) ? n : Infinity;
};

/* ─── GLOBAL CSS ────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root {
    width: 100%; min-height: 100vh; overflow-x: hidden;
    background: ${T.ink}; color: ${T.ivory};
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${T.ink}; }
  ::-webkit-scrollbar-thumb { background: ${T.goldDim}; border-radius: 2px; }

  /* Animations globales */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes shimmer  { 0%,100%{ background-position:0% 50%; } 50%{ background-position:100% 50%; } }
  @keyframes popScale { 0%{ transform:scale(0.6); opacity:0; } 70%{ transform:scale(1.1); } 100%{ transform:scale(1); opacity:1; } }
  @keyframes slideUpModal   { from{ transform:translateY(100%); } to{ transform:translateY(0); } }
  @keyframes slideLeftPanel { from{ transform:translateX(100%); } to{ transform:translateX(0); } }
  @keyframes lineGrow { from{ width:0; } to{ width:2.5rem; } }

  /* Titre avec trait doré animé */
  .wd-section-label {
    font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
    color: ${T.gold}; margin-bottom: 0.6rem; display: block;
  }
  .wd-section-title {
    font-size: clamp(1.8rem, 3vw, 2.5rem); font-weight: 300; color: ${T.ivory};
    position: relative; display: inline-block;
  }
  .wd-section-title::after {
    content: ''; position: absolute; bottom: -10px; left: 0;
    height: 1.5px; width: 0;
    background: linear-gradient(90deg, ${T.gold}, ${T.goldLight});
    border-radius: 1px;
    animation: lineGrow 0.7s 0.3s ease forwards;
  }

  /* Bouton or gradient avec shimmer */
  .wd-btn-gold {
    background: linear-gradient(130deg, ${T.goldDim} 0%, ${T.gold} 40%, ${T.goldLight} 60%, ${T.gold} 100%);
    background-size: 300% 300%;
    color: ${T.ink}; border: none; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer;
    border-radius: 3px; transition: background-position 0.5s ease, transform 0.2s ease, box-shadow 0.2s ease;
  }
  .wd-btn-gold:hover {
    background-position: 100% 100%;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(200,168,75,0.28);
  }
  .wd-btn-gold:active { transform: translateY(0); }

  /* Bouton ghost */
  .wd-btn-ghost {
    background: transparent; border: 1px solid ${T.inkLine}; color: ${T.stone};
    font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer; border-radius: 3px; transition: all 0.22s ease;
  }
  .wd-btn-ghost:hover { border-color: ${T.gold}; color: ${T.gold}; }

  /* Input */
  .wd-input {
    width: 100%; background: #0A0A16;
    border: 1px solid rgba(200,168,75,0.2); border-radius: 4px;
    padding: 13px 16px; color: ${T.ivory}; font-size: 14px;
    font-family: inherit; outline: none;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
  }
  .wd-input:focus {
    border-color: ${T.gold};
    box-shadow: 0 0 0 3px rgba(200,168,75,0.1);
  }
  .wd-input.error { border-color: ${T.danger}; }
  .wd-input.error:focus { box-shadow: 0 0 0 3px rgba(224,82,82,0.12); }

  /* Card produit */
  .wd-card {
    background: ${T.inkSurface};
    border: 1px solid ${T.inkLine};
    border-radius: 8px; overflow: hidden;
    transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  }
  .wd-card:hover {
    border-color: ${T.inkLineHov};
    transform: translateY(-5px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${T.inkLineHov};
  }
  .wd-card.out-of-stock { opacity: 0.5; pointer-events: none; }

  /* Badge */
  .wd-badge {
    display: inline-flex; align-items: center;
    background: rgba(200,168,75,0.14); color: ${T.gold};
    border: 1px solid rgba(200,168,75,0.35);
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    padding: 3px 9px; border-radius: 3px;
  }
  .wd-badge.sold { background: rgba(80,80,80,0.18); color: #888; border-color: #444; }

  /* Modal overlay */
  .wd-modal-overlay {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(0,0,0,0.9); backdrop-filter: blur(10px);
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .wd-modal-box {
    background: ${T.inkRaised};
    border: 1px solid ${T.inkLine};
    border-radius: 10px; width: 100%; max-width: 500px;
    max-height: 92vh; overflow-y: auto;
    animation: fadeUp 0.35s cubic-bezier(0.34,1.3,0.64,1);
    box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px ${T.inkLine};
  }

  /* Stock pill */
  .wd-stock-low  { color: ${T.warn}; font-size: 11px; }
  .wd-stock-zero { color: ${T.danger}; font-size: 11px; }

  /* Section divider */
  .wd-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, ${T.inkLine} 30%, ${T.inkLine} 70%, transparent);
    margin: 0;
  }

  /* Quantity control */
  .wd-qty-btn {
    width: 36px; height: 36px; border-radius: 4px;
    background: rgba(200,168,75,0.1); border: 1px solid ${T.inkLine};
    color: ${T.gold}; font-size: 20px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.18s ease;
  }
  .wd-qty-btn:hover:not(:disabled) { background: rgba(200,168,75,0.2); border-color: ${T.gold}; }
  .wd-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* Nav link */
  .wd-nav-link {
    background: none; border: none; cursor: pointer;
    color: ${T.stone}; font-size: 12px; letter-spacing: 0.1em;
    text-transform: uppercase; padding: 4px 0;
    position: relative; transition: color 0.2s;
  }
  .wd-nav-link::after {
    content: ''; position: absolute; bottom: 0; left: 0;
    height: 1px; width: 0; background: ${T.gold};
    transition: width 0.25s ease;
  }
  .wd-nav-link:hover { color: ${T.gold}; }
  .wd-nav-link:hover::after { width: 100%; }

  /* Testimonial */
  .wd-testi { background: ${T.inkSurface}; border: 1px solid ${T.inkLine}; border-radius: 8px; padding: 1.75rem; }
  .wd-testi:hover { border-color: rgba(200,168,75,0.25); }

  /* Social icon */
  .wd-social { color: ${T.pebble}; transition: color 0.2s, transform 0.2s; }
  .wd-social:hover { color: ${T.gold}; transform: translateY(-3px); }

  /* Category filter pill */
  .wd-filter-btn {
    padding: 7px 18px; font-size: 11px; letter-spacing: 0.12em;
    text-transform: capitalize; border-radius: 20px; cursor: pointer;
    transition: all 0.2s ease; border: 1px solid rgba(200,168,75,0.22);
    background: transparent; color: ${T.stone};
  }
  .wd-filter-btn.active {
    background: ${T.gold}; color: ${T.ink}; font-weight: 700;
    border-color: ${T.gold};
    box-shadow: 0 4px 16px rgba(200,168,75,0.3);
  }
  .wd-filter-btn:not(.active):hover { border-color: ${T.gold}; color: ${T.gold}; }

  /* Guarantee pill */
  .wd-guarantee {
    display: flex; align-items: center; gap: 8px;
    background: rgba(200,168,75,0.05); border: 1px solid ${T.inkLine};
    border-radius: 20px; padding: 9px 16px; font-size: 12px; color: #B0A898;
  }

  /* About card */
  .wd-about-card {
    display: flex; align-items: center; gap: 12px;
    background: rgba(200,168,75,0.05); border: 1px solid ${T.inkLine};
    border-radius: 8px; padding: 14px 20px; transition: border-color 0.2s;
  }
  .wd-about-card:hover { border-color: rgba(200,168,75,0.3); }

  /* Breadcrumb */
  .wd-breadcrumb-btn {
    background: none; border: none; cursor: pointer;
    color: ${T.stone}; font-size: 13px; padding: 0; transition: color 0.2s;
  }
  .wd-breadcrumb-btn:hover { color: ${T.gold}; }

  /* Product detail thumbnail */
  .wd-thumb {
    flex: 1; height: 76px; background: #0A0A16;
    border: 1px solid ${T.inkLine}; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; cursor: pointer; overflow: hidden; transition: border-color 0.2s;
  }
  .wd-thumb.active { border-color: ${T.gold}; }
  .wd-thumb:hover { border-color: rgba(200,168,75,0.4); }

  /* Loading pulse */
  @keyframes pulse { 0%,100%{ opacity:0.4; } 50%{ opacity:0.9; } }
  .wd-loading-icon { animation: pulse 1.8s ease-in-out infinite; }

  /* Sidebar mobile */
  .wd-sidebar {
    width: 260px; background: ${T.inkRaised};
    border-left: 1px solid ${T.inkLine}; padding: 2rem;
    display: flex; flex-direction: column; gap: 1.5rem;
    box-shadow: -8px 0 32px rgba(0,0,0,0.7);
    animation: slideLeftPanel 0.28s ease forwards;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .wd-nav-links-desktop { display: none !important; }
    .wd-mobile-btn { display: flex !important; }
    .wd-product-detail-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
    .wd-footer-inner { flex-direction: column; text-align: center; }
    .wd-modal-overlay { padding: 0 !important; align-items: flex-end !important; }
    .wd-modal-box {
      max-height: 90vh; border-radius: 12px 12px 0 0;
      border-bottom: none !important;
      animation: slideUpModal 0.3s ease !important;
    }
  }
  @media (min-width: 769px) {
    .wd-mobile-btn  { display: none !important; }
    .wd-sidebar-wrap { display: none !important; }
  }
`;

/* ─── SECTION HEADER ─────────────────────────────────────────────────── */
function SectionHeader({ label, title, accent, center = true }) {
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: "3rem" }}>
      <span className="wd-section-label">✦ {label} ✦</span>
      <br />
      <h2 className="wd-section-title">
        {title} <span style={{ fontWeight: 700, color: T.gold }}>{accent}</span>
      </h2>
    </div>
  );
}

/* ─── NAV ─────────────────────────────────────────────────────────────── */
function Nav({ onHome, cartCount, onMenuOpen }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 200,
      background: "rgba(8,8,16,0.92)", backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${T.inkLine}`,
      padding: "0 5%", display: "flex", alignItems: "center",
      justifyContent: "space-between", height: "62px",
    }}>
      <button onClick={onHome} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", padding: 0 }}>
        <span style={{ fontSize: "20px" }}>💎</span>
        <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "0.06em", color: T.gold }}>
          WALID<span style={{ color: T.ivory, fontWeight: 300 }}> DIAMANT</span>
        </span>
      </button>

      {/* Desktop links */}
      <div className="wd-nav-links-desktop" style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
        {["Accueil", "Collections", "Contact"].map(l => (
          <button key={l} className="wd-nav-link" onClick={l === "Accueil" ? onHome : undefined}>{l}</button>
        ))}
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: T.stone, fontSize: "20px", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = T.gold}
            onMouseLeave={e => e.currentTarget.style.color = T.stone}
          >🛍️</button>
          {cartCount > 0 && (
            <span style={{
              position: "absolute", top: "-5px", right: "-5px",
              background: T.gold, color: T.ink, borderRadius: "50%",
              width: "17px", height: "17px", fontSize: "10px", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{cartCount}</span>
          )}
        </div>
        {/* Mobile hamburger */}
        <button className="wd-mobile-btn" onClick={onMenuOpen}
          style={{ display: "none", background: "none", border: `1px solid ${T.inkLine}`, borderRadius: "4px", color: T.stone, fontSize: "18px", cursor: "pointer", padding: "4px 8px" }}>
          ☰
        </button>
      </div>
    </nav>
  );
}

/* ─── ORDER MODAL ─────────────────────────────────────────────────────── */
function OrderModal({ product, onClose }) {
  const maxQty = getStock(product);
  const [qty, setQty]     = useState(1);
  const [form, setForm]   = useState({ fullname: "", phone: "", wilaya: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const unitPrice = parsePrice(product.price);
  const totalFmt  = fmtTotal(product.price, qty);

  const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.fullname.trim()) e.fullname = "Nom requis";
    if (!/^0[5-7]\d{8}$/.test(form.phone)) e.phone = "Numéro invalide (ex: 0551234567)";
    if (!form.wilaya) e.wilaya = "Wilaya requise";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, "commonde"), {
        productId: product.id, productName: product.name,
        unitPrice: product.price, totalPrice: totalFmt,
        imageUrl: product.imageUrl || null,
        quantity: qty, customerName: form.fullname,
        phone: form.phone, wilaya: form.wilaya,
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Erreur d'enregistrement. Réessayez.");
    } finally { setLoading(false); }
  };

  const stockLeft = maxQty === Infinity ? null : maxQty - qty;
  const atMax = qty >= maxQty;

  return (
    <div className="wd-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wd-modal-box">

        {/* Header */}
        <div style={{ padding: "1.4rem 1.6rem 1.2rem", borderBottom: `1px solid ${T.inkLine}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span style={{ fontSize: "9px", letterSpacing: "0.28em", textTransform: "uppercase", color: T.gold, display: "block", marginBottom: "6px" }}>✦ Commande</span>
            <h3 style={{ fontSize: "17px", fontWeight: 600, color: T.ivory, margin: 0 }}>{product.name}</h3>
            {product.subtitle && <p style={{ fontSize: "12px", color: T.stone, margin: "3px 0 0" }}>{product.subtitle}</p>}
          </div>
          <button onClick={onClose} style={{
            background: "none", border: `1px solid ${T.inkLine}`, borderRadius: "50%",
            width: "34px", height: "34px", color: T.stone, cursor: "pointer",
            fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.inkLine; e.currentTarget.style.color = T.stone; }}
          >×</button>
        </div>

        {submitted ? (
          /* ── Succès ── */
          <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
            <div style={{ fontSize: "52px", marginBottom: "1rem", animation: "popScale 0.5s cubic-bezier(0.34,1.3,0.64,1)" }}>✅</div>
            <h3 style={{ color: T.gold, fontSize: "20px", fontWeight: 700, marginBottom: "0.75rem" }}>Commande enregistrée !</h3>
            <p style={{ color: T.stone, lineHeight: 1.8, marginBottom: "1.5rem" }}>
              Merci <strong style={{ color: T.ivory }}>{form.fullname}</strong>. Nous vous appellerons au <strong style={{ color: T.ivory }}>{form.phone}</strong> pour confirmer la livraison.
            </p>
            {/* Récap */}
            <div style={{ background: T.goldGlow, border: `1px solid ${T.inkLine}`, borderRadius: "8px", padding: "1rem 1.2rem", marginBottom: "1.5rem", textAlign: "left" }}>
              <p style={{ fontSize: "10px", color: T.pebble, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>Récapitulatif</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "14px", color: T.ivory, margin: 0 }}>{product.name} × {qty}</p>
                  <p style={{ fontSize: "12px", color: T.stone, margin: "2px 0 0" }}>Wilaya : {form.wilaya.split(" - ")[1]}</p>
                </div>
                <p style={{ fontSize: "20px", fontWeight: 700, color: T.gold, margin: 0 }}>{totalFmt}</p>
              </div>
            </div>
            <button className="wd-btn-gold" onClick={onClose} style={{ padding: "11px 36px", fontSize: "12px" }}>Fermer</button>
          </div>

        ) : (
          <div style={{ padding: "1.5rem 1.6rem" }}>

            {/* Produit + quantité + prix */}
            <div style={{ background: T.goldGlow, border: `1px solid ${T.inkLine}`, borderRadius: "8px", padding: "14px", marginBottom: "1.5rem" }}>

              {/* Image + nom */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "50px", height: "50px", borderRadius: "6px", overflow: "hidden", background: "#0A0A16", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                  {product.imageUrl
                    ? <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (product.icon || "💎")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: T.ivory, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</p>
                  <p style={{ fontSize: "11px", color: T.stone, margin: "2px 0 0" }}>{product.subtitle}</p>
                </div>
              </div>

              <div style={{ height: "1px", background: T.inkLine, margin: "0 0 12px" }} />

              {/* Qty + prix */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                {/* Quantité */}
                <div>
                  <p style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: T.pebble, marginBottom: "6px" }}>Quantité</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button className="wd-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                    <span style={{ color: T.ivory, fontWeight: 700, fontSize: "17px", minWidth: "26px", textAlign: "center" }}>{qty}</span>
                    <button className="wd-qty-btn" onClick={() => !atMax && setQty(q => q + 1)} disabled={atMax}>+</button>
                  </div>
                  {maxQty !== Infinity && (
                    <p className={atMax ? "wd-stock-zero" : "wd-stock-low"} style={{ marginTop: "4px" }}>
                      {atMax ? "⚠ Stock maximum atteint" : `${stockLeft} restant${stockLeft > 1 ? "s" : ""} en stock`}
                    </p>
                  )}
                </div>

                {/* Prix */}
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: T.pebble, marginBottom: "4px" }}>
                    Total · {qty} pièce{qty > 1 ? "s" : ""}
                  </p>
                  <p style={{ fontSize: "24px", fontWeight: 700, color: T.gold, margin: 0, lineHeight: 1 }}>{totalFmt}</p>
                  <p style={{ fontSize: "11px", color: T.stone, marginTop: "2px" }}>{product.price} / pièce</p>
                </div>
              </div>
            </div>

            {/* Champs */}
            <div style={{ display: "grid", gap: "14px" }}>

              <div>
                <label style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: T.stone, display: "block", marginBottom: "6px" }}>Nom & Prénom *</label>
                <input
                  className={`wd-input${errors.fullname ? " error" : ""}`}
                  value={form.fullname}
                  onChange={e => setField("fullname", e.target.value)}
                  placeholder="Ex: Walid Benali"
                />
                {errors.fullname && <p style={{ color: T.danger, fontSize: "11px", marginTop: "4px" }}>{errors.fullname}</p>}
              </div>

              <div>
                <label style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: T.stone, display: "block", marginBottom: "6px" }}>Téléphone *</label>
                <input
                  className={`wd-input${errors.phone ? " error" : ""}`}
                  value={form.phone}
                  onChange={e => setField("phone", e.target.value)}
                  placeholder="0551 23 45 67" type="tel"
                />
                {errors.phone && <p style={{ color: T.danger, fontSize: "11px", marginTop: "4px" }}>{errors.phone}</p>}
              </div>

              <div>
                <label style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: T.stone, display: "block", marginBottom: "6px" }}>Wilaya *</label>
                <select
                  className={`wd-input${errors.wilaya ? " error" : ""}`}
                  value={form.wilaya}
                  onChange={e => setField("wilaya", e.target.value)}
                  style={{ appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23C8A84B' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: "36px" }}
                >
                  <option value="" style={{ background: T.inkRaised }}>— Sélectionnez votre wilaya —</option>
                  {wilayas.map(w => <option key={w} value={w} style={{ background: T.inkRaised, color: T.ivory }}>{w}</option>)}
                </select>
                {errors.wilaya && <p style={{ color: T.danger, fontSize: "11px", marginTop: "4px" }}>{errors.wilaya}</p>}
              </div>
            </div>

            {/* Note livraison */}
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", background: "rgba(200,168,75,0.04)", border: `1px solid ${T.inkLine}`, borderRadius: "6px", padding: "10px 14px", marginTop: "1.25rem" }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>🚚</span>
              <p style={{ margin: 0, fontSize: "11px", color: T.stone, lineHeight: 1.7 }}>
                Livraison dans les <strong style={{ color: T.ivory }}>58 wilayas</strong>. Délai 2–4 jours. Paiement à la livraison.
              </p>
            </div>

            {/* CTA */}
            <button
              className="wd-btn-gold"
              onClick={submit}
              disabled={loading}
              style={{
                width: "100%", padding: "15px 20px", fontSize: "13px",
                marginTop: "1.25rem", display: "flex",
                justifyContent: "space-between", alignItems: "center",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <span>{loading ? "Envoi en cours…" : "✦ Confirmer la commande"}</span>
              <span style={{ fontSize: "15px", fontWeight: 800 }}>{totalFmt}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── PRODUCT DETAIL ──────────────────────────────────────────────────── */
function ProductDetail({ product, allProducts = [], onBack, onOrder }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 60); }, []);

  const related = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div style={{ background: T.ink, minHeight: "100vh", color: T.ivory, opacity: vis ? 1 : 0, transition: "opacity 0.45s ease" }}>
      {/* Breadcrumb */}
      <div style={{ padding: "1rem 5%", borderBottom: `1px solid ${T.inkLine}`, display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: T.pebble }}>
        <button className="wd-breadcrumb-btn" onClick={onBack}>← Accueil</button>
        <span style={{ color: T.inkLine }}>›</span>
        <span style={{ color: T.stone }}>{product.category}</span>
        <span style={{ color: T.inkLine }}>›</span>
        <span style={{ color: T.gold }}>{product.name}</span>
      </div>

      <div style={{ padding: "3rem 5%" }}>
        <div className="wd-product-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>

          {/* Visual */}
          <div>
            <div style={{
              background: `radial-gradient(ellipse at 40% 35%, ${T.goldGlow} 0%, transparent 65%), ${T.inkSurface}`,
              border: `1px solid ${T.inkLine}`, borderRadius: "12px",
              height: "400px", display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden", fontSize: "120px",
            }}>
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (product.icon || "💎")}
              {product.badge && <span className="wd-badge" style={{ position: "absolute", top: "16px", left: "16px" }}>{product.badge}</span>}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              {["main", "✨", "🎁"].map((item, i) => (
                <div key={i} className={`wd-thumb ${i === 0 ? "active" : ""}`}>
                  {i === 0
                    ? (product.imageUrl ? <img src={product.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (product.icon || "💎"))
                    : item}
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <span style={{ fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", color: T.gold, display: "block", marginBottom: "10px" }}>✦ {product.category}</span>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 300, lineHeight: 1.15, margin: "0 0 8px" }}>{product.name}</h1>
            <p style={{ fontSize: "15px", color: T.stone, margin: "0 0 1rem" }}>{product.subtitle}</p>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem" }}>
              <span style={{ color: T.gold, letterSpacing: "3px" }}>{"★".repeat(Math.floor(product.rating || 0))}{"☆".repeat(5 - Math.floor(product.rating || 0))}</span>
              <span style={{ fontSize: "13px", color: T.gold, fontWeight: 700 }}>{product.rating}</span>
              <span style={{ fontSize: "12px", color: T.pebble }}>({product.reviews} avis)</span>
            </div>

            <p style={{ fontSize: "2rem", fontWeight: 700, color: T.gold, margin: "0 0 1.5rem" }}>{product.price}</p>
            <p style={{ fontSize: "14px", color: "#B0A898", lineHeight: 1.9, marginBottom: "1.75rem" }}>{product.description}</p>

            {product.details?.length > 0 && (
              <div style={{ marginBottom: "1.75rem" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: T.pebble, marginBottom: "10px" }}>Caractéristiques</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {product.details.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#C8C2B8" }}>
                      <span style={{ color: T.gold, fontSize: "8px" }}>◆</span>{d}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginBottom: "1.25rem" }}>
              <button className="wd-btn-gold" onClick={() => onOrder(product)} style={{ flex: 2, padding: "14px", fontSize: "12px" }}>
                Commander maintenant
              </button>
              <button className="wd-btn-ghost" style={{ flex: 0, padding: "14px 18px", fontSize: "18px" }}
                title="Ajouter aux favoris"
              >🤍</button>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[["🔒", "Paiement sécurisé"], ["🚚", "Livraison nationale"], ["↩️", "Retour 7 jours"]].map(([ic, txt]) => (
                <div key={txt} className="wd-guarantee"><span>{ic}</span><span>{txt}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: "5rem" }}>
            <div className="wd-divider" style={{ marginBottom: "3rem" }} />
            <SectionHeader label="Vous aimerez aussi" title="Pièces" accent="similaires" center={false} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "18px" }}>
              {related.map(rp => (
                <div key={rp.id} className="wd-card" style={{ cursor: "pointer" }} onClick={onBack}>
                  <div style={{ height: "140px", background: "#0A0A16", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "52px", overflow: "hidden" }}>
                    {rp.imageUrl ? <img src={rp.imageUrl} alt={rp.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (rp.icon || "💎")}
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, color: T.ivory, margin: "0 0 3px" }}>{rp.name}</h4>
                    <p style={{ fontSize: "12px", color: T.stone, margin: "0 0 0.75rem" }}>{rp.subtitle}</p>
                    <p style={{ fontSize: "16px", fontWeight: 700, color: T.gold, margin: 0 }}>{rp.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── APP ─────────────────────────────────────────────────────────────── */
export default function WalidDiamant() {
  const [products, setProducts]           = useState([]);
  const [page, setPage]                   = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderProduct, setOrderProduct]   = useState(null);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [cartCount]                       = useState(0);
  const [wishlist, setWishlist]           = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setLoadingProducts(false); }
    };
    fetch_();
  }, []);

  const goTo  = (p) => { setSelectedProduct(p); setPage("detail"); window.scrollTo(0,0); };
  const goHome = ()  => { setPage("home"); setSelectedProduct(null); window.scrollTo(0,0); };
  const openOrder  = (p) => setOrderProduct(p);
  const closeOrder = ()  => setOrderProduct(null);
  const toggleWish = (id) => setWishlist(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);

  const filtered = activeCategory === "Tous" ? products : products.filter(p => p.category === activeCategory);

  return (
    <div style={{ background: T.ink, minHeight: "100vh", color: T.ivory }}>
      <style>{GLOBAL_CSS}</style>

      <Nav onHome={goHome} cartCount={cartCount} onMenuOpen={() => setIsSidebarOpen(true)} />

      {/* Mobile sidebar */}
      {isSidebarOpen && (
        <div className="wd-sidebar-wrap" style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.65)" }} onClick={() => setIsSidebarOpen(false)} />
          <div className="wd-sidebar">
            <button onClick={() => setIsSidebarOpen(false)} style={{ alignSelf: "flex-end", background: "none", border: "none", color: T.stone, fontSize: "24px", cursor: "pointer" }}>×</button>
            {["Accueil", "Collections"].map(l => (
              <button key={l} onClick={() => { setIsSidebarOpen(false); if (l === "Accueil") goHome(); }} style={{ background: "none", border: "none", color: l === "Accueil" ? T.gold : T.ivory, fontSize: "16px", textAlign: "left", cursor: "pointer", fontWeight: 600, padding: 0 }}>{l}</button>
            ))}
          </div>
        </div>
      )}

      {orderProduct && <OrderModal product={orderProduct} onClose={closeOrder} />}

      {page === "detail" && selectedProduct ? (
        <ProductDetail product={selectedProduct} allProducts={products} onBack={goHome} onOrder={openOrder} />
      ) : (
        <>
          {/* ══ COLLECTIONS ══ */}
          <section id="collections" style={{ padding: "5rem 5%" }}>
            <SectionHeader label="Nos Créations" title="Collections" accent="Signature" />

            {/* Filtres — pills arrondis */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "3rem", flexWrap: "wrap" }}>
              {categories.map(cat => (
                <button key={cat} className={`wd-filter-btn${activeCategory === cat ? " active" : ""}`}
                  onClick={() => setActiveCategory(cat)}>{cat}</button>
              ))}
            </div>

            {/* Grid */}
            {loadingProducts ? (
              <div style={{ textAlign: "center", padding: "5rem" }}>
                <p className="wd-loading-icon" style={{ color: T.gold, fontSize: "40px", marginBottom: "1rem" }}>💎</p>
                <p style={{ color: T.stone }}>Chargement des produits…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "5rem", color: T.stone }}>
                <p style={{ fontSize: "36px", marginBottom: "1rem" }}>🔍</p>
                Aucun produit dans cette catégorie.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                {filtered.map(product => {
                  const stock = getStock(product);
                  const outOfStock = stock <= 0;
                  const lowStock = !outOfStock && stock !== Infinity && stock <= 5;

                  return (
                    <div key={product.id} className={`wd-card${outOfStock ? " out-of-stock" : ""}`}>
                      {/* Image */}
                      <div onClick={() => !outOfStock && goTo(product)} style={{
                        height: "210px",
                        background: `radial-gradient(ellipse at center, ${T.goldGlow} 0%, transparent 65%), ${T.inkSurface}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        position: "relative", fontSize: "68px", overflow: "hidden",
                        cursor: outOfStock ? "default" : "pointer",
                      }}>
                        {product.imageUrl
                          ? <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : (product.icon || "💎")}

                        <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px" }}>
                          {outOfStock
                            ? <span className="wd-badge sold">Épuisé</span>
                            : product.badge && <span className="wd-badge">{product.badge}</span>}
                          {lowStock && !outOfStock && <span className="wd-badge" style={{ background: "rgba(224,144,32,0.15)", color: T.warn, borderColor: "rgba(224,144,32,0.35)" }}>Derniers</span>}
                        </div>

                        <button
                          onClick={e => { e.stopPropagation(); toggleWish(product.id); }}
                          style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(8,8,16,0.75)", border: `1px solid ${T.inkLine}`, borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = T.gold}
                          onMouseLeave={e => e.currentTarget.style.borderColor = T.inkLine}
                        >
                          {wishlist.includes(product.id) ? "❤️" : "🤍"}
                        </button>
                      </div>

                      {/* Infos */}
                      <div style={{ padding: "1.2rem" }}>
                        <p style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: T.pebble, margin: "0 0 5px" }}>{product.category}</p>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, color: T.ivory, margin: "0 0 3px", cursor: "pointer", transition: "color 0.2s" }}
                          onClick={() => !outOfStock && goTo(product)}
                          onMouseEnter={e => e.target.style.color = T.gold}
                          onMouseLeave={e => e.target.style.color = T.ivory}
                        >{product.name}</h3>
                        <p style={{ fontSize: "12px", color: T.stone, margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.subtitle}</p>

                        {lowStock && <p className="wd-stock-low" style={{ marginBottom: "6px" }}>⚠ Plus que {stock} en stock</p>}

                        <div style={{ fontSize: "12px", color: T.gold, marginBottom: "10px" }}>
                          {"★".repeat(Math.floor(product.rating || 0))}
                          <span style={{ color: T.pebble, marginLeft: "4px" }}>({product.reviews || 0})</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "17px", fontWeight: 700, color: T.gold }}>{product.price}</span>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button className="wd-btn-ghost" onClick={() => goTo(product)} style={{ padding: "7px 11px", fontSize: "10px" }}>Détails</button>
                            <button className="wd-btn-gold" onClick={() => !outOfStock && openOrder(product)} disabled={outOfStock}
                              style={{ padding: "7px 13px", fontSize: "10px", opacity: outOfStock ? 0.4 : 1, cursor: outOfStock ? "not-allowed" : "pointer" }}>
                              {outOfStock ? "Épuisé" : "Commander"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="wd-divider" />

          {/* ══ RÉSEAUX SOCIAUX ══ */}
          <section style={{ padding: "3rem 5%", background: `linear-gradient(135deg, ${T.inkSurface} 0%, #12100A 50%, ${T.inkSurface} 100%)`, textAlign: "center" }}>
            <span className="wd-section-label">✦ Suivez-nous ✦</span>
            <div style={{ display: "flex", gap: "2rem", justifyContent: "center", alignItems: "center", marginTop: "1rem" }}>
              <a href="https://www.instagram.com/walid.daimant_34" target="_blank" rel="noreferrer" className="wd-social" style={{ textDecoration: "none" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.181a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/></svg>
              </a>
              <a href="#" className="wd-social" style={{ textDecoration: "none" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              <a href="#" className="wd-social" style={{ textDecoration: "none" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.5 3.96-1.82 5.39-1.24 1.34-3 2.11-4.88 2.25-1.99.15-4.08-.24-5.6-1.52-1.47-1.24-2.32-3.12-2.36-5.06-.05-2.22.84-4.47 2.47-5.99 1.56-1.46 3.73-2.16 5.86-1.92v4.06c-1.18-.21-2.42.06-3.37.81-.88.7-1.32 1.83-1.29 2.96.04 1.25.75 2.43 1.83 3.03 1.05.58 2.37.66 3.48.2 1.18-.5 1.97-1.67 2.08-2.95v-16.7h4.08z"/></svg>
              </a>
            </div>
          </section>

          <div className="wd-divider" />

          {/* ══ TÉMOIGNAGES ══ */}
          <section style={{ padding: "5rem 5%" }}>
            <SectionHeader label="Avis Clients" title="Ils nous font" accent="confiance" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {testimonials.map(({ name, text, stars }) => (
                <div key={name} className="wd-testi">
                  <div style={{ color: T.gold, fontSize: "18px", marginBottom: "1rem", letterSpacing: "2px" }}>{"★".repeat(stars)}</div>
                  <p style={{ fontSize: "15px", color: T.stone, lineHeight: 1.7, fontStyle: "italic", marginBottom: "1.25rem" }}>"{text}"</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: T.gold, margin: 0, letterSpacing: "0.1em" }}>— {name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══ FOOTER ══ */}
          <footer className="wd-footer-inner" style={{ borderTop: `1px solid ${T.inkLine}`, padding: "2rem 5%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", background: T.inkSurface }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>💎</span>
              <span style={{ fontWeight: 700, color: T.gold, letterSpacing: "0.08em", fontSize: "14px" }}>WALID DIAMANT</span>
            </div>
            <p style={{ fontSize: "12px", color: T.pebble, margin: 0 }}>© 2025 Walid Diamant. Tous droits réservés. — Sétif, Algérie</p>
          </footer>
        </>
      )}
    </div>
  );
}