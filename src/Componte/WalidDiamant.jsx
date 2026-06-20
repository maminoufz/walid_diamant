import { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";

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

const S = {
  gold: "#C5A059",
  dark: "#09090b",
  dark2: "#18181b",
  dark3: "#0f0f12",
  text: "#fafafa",
  muted: "#a1a1aa",
  dim: "#71717a",
  border: "rgba(255, 255, 255, 0.08)",
  borderHover: "rgba(197, 160, 89, 0.4)",
};

function Nav({ onHome, cartCount, setIsSidebarOpen }) {
  return (
    <nav className="nav-container" style={{
      position: "sticky", top: 0, zIndex: 200,
      background: "rgba(9, 9, 11, 0.85)", backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${S.border}`,
      padding: "0 2rem", display: "flex", alignItems: "center",
      justifyContent: "space-between", height: "64px",
    }}>
      <button onClick={onHome} style={{
        background: "none", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", gap: "10px", padding: 0,
      }}>
        <span style={{ fontSize: "22px" }}>💎</span>
        <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "0.05em", color: S.gold }}>
          WALID<span style={{ color: S.text, fontWeight: 300 }}> DIAMANT</span>
        </span>
      </button>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <button className="nav-links" onClick={onHome} style={{
          background: "none", border: "none", cursor: "pointer",
          color: S.muted, fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase",
        }}
          onMouseEnter={e => e.target.style.color = S.gold}
          onMouseLeave={e => e.target.style.color = S.muted}
        >Accueil</button>
        <div style={{ position: "relative" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: S.muted, fontSize: "20px" }}>🛍️</button>
          {cartCount > 0 && (
            <span style={{
              position: "absolute", top: "-6px", right: "-6px",
              background: S.gold, color: S.dark, borderRadius: "50%",
              width: "18px", height: "18px", fontSize: "11px", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{cartCount}</span>
          )}
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)} style={{ background: "none", border: "none", color: S.text, fontSize: "24px", cursor: "pointer" }}>
          ☰
        </button>
      </div>
    </nav>
  );
}

function OrderModal({ product, onClose }) {
  const [form, setForm] = useState({ fullname: "", phone: "", wilaya: "", commune: "", address: "", qty: 1 });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.fullname.trim()) e.fullname = "Nom requise";
    if (!/^0[5-7]\d{8}$/.test(form.phone)) e.phone = "Numéro invalide (ex: 0551234567)";
    if (!form.wilaya) e.wilaya = "Wilaya requise";
    if (!form.commune.trim()) e.commune = "Commune requise";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    
    try {
      await addDoc(collection(db, "commonde"), {
        productId: product.id,
        productName: product.name,
        price: product.price,
        imageUrl: product.imageUrl || null,
        quantity: form.qty,
        customerName: form.fullname,
        phone: form.phone,
        wilaya: form.wilaya,
        commune: form.commune,
        address: form.address,
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la commande:", error);
      alert("Une erreur s'est produite lors de l'enregistrement. Veuillez réessayer.");
    }
  };

  const inputStyle = (field) => ({
    width: "100%", background: "#1a1a1a",
    border: `1px solid ${errors[field] ? "#e24b4a" : "rgba(212,175,55,0.25)"}`,
    borderRadius: "3px", padding: "11px 14px",
    color: S.text, fontSize: "14px", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  });

  const labelStyle = { fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: S.muted, display: "block", marginBottom: "6px" };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#111", border: `1px solid ${S.border}`,
        borderRadius: "6px", width: "100%", maxWidth: "520px",
        maxHeight: "92vh", overflowY: "auto",
        animation: "slideUp 0.3s ease",
      }}>
        {/* Modal Header */}
        <div style={{
          padding: "1.5rem 1.75rem 1.25rem",
          borderBottom: `1px solid ${S.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <p style={{ fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: S.gold, margin: "0 0 6px" }}>✦ Formulaire de commande</p>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: S.text }}>{product.name}</h3>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: S.muted }}>{product.subtitle}</p>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: "50%", width: "36px", height: "36px",
            color: S.muted, cursor: "pointer", fontSize: "18px",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>×</button>
        </div>

        {submitted ? (
          <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
            <div style={{ fontSize: "60px", marginBottom: "1rem" }}>✅</div>
            <h3 style={{ color: S.gold, fontSize: "22px", fontWeight: 700, marginBottom: "0.75rem" }}>Commande confirmée !</h3>
            <p style={{ color: S.muted, lineHeight: 1.8, marginBottom: "0.5rem" }}>
              Merci <strong style={{ color: S.text }}>{form.fullname}</strong> pour votre commande.
            </p>
            <p style={{ color: S.muted, lineHeight: 1.8, marginBottom: "1.5rem" }}>
              Nous vous contacterons au <strong style={{ color: S.text }}>{form.phone}</strong> pour confirmer la livraison à <strong style={{ color: S.text }}>{form.wilaya.split(" - ")[1]}</strong>.
            </p>
            <div style={{
              background: "rgba(212,175,55,0.07)", border: `1px solid ${S.border}`,
              borderRadius: "4px", padding: "1rem 1.25rem", marginBottom: "1.5rem",
              textAlign: "left",
            }}>
              <p style={{ margin: "0 0 6px", fontSize: "12px", color: S.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Récapitulatif</p>
              <p style={{ margin: "0 0 4px", fontSize: "14px", color: S.text }}>🛍️ {product.name} × {form.qty}</p>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: S.gold }}>{product.price} × {form.qty}</p>
            </div>
            <button onClick={onClose} style={{
              background: S.gold, color: S.dark, border: "none",
              borderRadius: "2px", padding: "12px 32px",
              fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: "pointer",
            }}>Fermer</button>
          </div>
        ) : (
          <div style={{ padding: "1.75rem" }}>
            {/* Product summary */}
            <div style={{
              display: "flex", alignItems: "center", gap: "14px",
              background: "rgba(212,175,55,0.05)", border: `1px solid ${S.border}`,
              borderRadius: "4px", padding: "12px 16px", marginBottom: "1.75rem",
            }}>
              <div style={{ width: "48px", height: "48px", fontSize: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", overflow: "hidden", background: "#111" }}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  product.icon || "💎"
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: S.text }}>{product.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: S.muted }}>{product.subtitle}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button onClick={() => setForm(f => ({ ...f, qty: Math.max(1, f.qty - 1) }))}
                  style={{ background: "rgba(212,175,55,0.1)", border: `1px solid ${S.border}`, color: S.gold, width: "28px", height: "28px", borderRadius: "2px", cursor: "pointer", fontSize: "16px" }}>−</button>
                <span style={{ color: S.text, fontWeight: 700, minWidth: "20px", textAlign: "center" }}>{form.qty}</span>
                <button onClick={() => setForm(f => ({ ...f, qty: f.qty + 1 }))}
                  style={{ background: "rgba(212,175,55,0.1)", border: `1px solid ${S.border}`, color: S.gold, width: "28px", height: "28px", borderRadius: "2px", cursor: "pointer", fontSize: "16px" }}>+</button>
              </div>
              <span style={{ fontSize: "16px", fontWeight: 700, color: S.gold, minWidth: "90px", textAlign: "right", whiteSpace: "nowrap" }}>{product.price}</span>
            </div>

            {/* Form Fields */}
            <div style={{ display: "grid", gap: "18px" }}>
              {/* Full Name */}
              <div>
                <label style={labelStyle}>Nom & Prénom *</label>
                <input value={form.fullname} onChange={e => { setForm(f => ({ ...f, fullname: e.target.value })); setErrors(er => ({ ...er, fullname: "" })); }}
                  placeholder="Ex: Walid Benali" style={inputStyle("fullname")}
                  onFocus={e => e.target.style.borderColor = S.gold}
                  onBlur={e => e.target.style.borderColor = errors.fullname ? "#e24b4a" : "rgba(212,175,55,0.25)"}
                />
                {errors.fullname && <p style={{ color: "#e24b4a", fontSize: "12px", margin: "4px 0 0" }}>{errors.fullname}</p>}
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>Numéro de téléphone *</label>
                <input value={form.phone} onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: "" })); }}
                  placeholder="0551 23 45 67" style={inputStyle("phone")} type="tel"
                  onFocus={e => e.target.style.borderColor = S.gold}
                  onBlur={e => e.target.style.borderColor = errors.phone ? "#e24b4a" : "rgba(212,175,55,0.25)"}
                />
                {errors.phone && <p style={{ color: "#e24b4a", fontSize: "12px", margin: "4px 0 0" }}>{errors.phone}</p>}
              </div>

              {/* Wilaya */}
              <div>
                <label style={labelStyle}>Wilaya *</label>
                <select value={form.wilaya} onChange={e => { setForm(f => ({ ...f, wilaya: e.target.value })); setErrors(er => ({ ...er, wilaya: "" })); }}
                  style={{ ...inputStyle("wilaya"), appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23D4AF37' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: "36px" }}
                  onFocus={e => e.target.style.borderColor = S.gold}
                  onBlur={e => e.target.style.borderColor = errors.wilaya ? "#e24b4a" : "rgba(212,175,55,0.25)"}
                >
                  <option value="" style={{ background: "#111" }}>— Sélectionnez votre wilaya —</option>
                  {wilayas.map(w => <option key={w} value={w} style={{ background: "#111", color: S.text }}>{w}</option>)}
                </select>
                {errors.wilaya && <p style={{ color: "#e24b4a", fontSize: "12px", margin: "4px 0 0" }}>{errors.wilaya}</p>}
              </div>

              {/* Commune */}
              <div>
                <label style={labelStyle}>Commune / Ville *</label>
                <input value={form.commune} onChange={e => { setForm(f => ({ ...f, commune: e.target.value })); setErrors(er => ({ ...er, commune: "" })); }}
                  placeholder="Ex: Sétif, Bordj Bou Arréridj..." style={inputStyle("commune")}
                  onFocus={e => e.target.style.borderColor = S.gold}
                  onBlur={e => e.target.style.borderColor = errors.commune ? "#e24b4a" : "rgba(212,175,55,0.25)"}
                />
                {errors.commune && <p style={{ color: "#e24b4a", fontSize: "12px", margin: "4px 0 0" }}>{errors.commune}</p>}
              </div>

              {/* Address (optional) */}
              <div>
                <label style={labelStyle}>Adresse détaillée <span style={{ color: S.dim }}>(facultatif)</span></label>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Rue, numéro, quartier..."
                  rows={3}
                  style={{ ...inputStyle("address"), resize: "vertical", lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = S.gold}
                  onBlur={e => e.target.style.borderColor = "rgba(212,175,55,0.25)"}
                />
              </div>
            </div>

            {/* Delivery note */}
            <div style={{
              background: "rgba(212,175,55,0.05)", border: `1px solid ${S.border}`,
              borderRadius: "4px", padding: "12px 16px", marginTop: "1.5rem",
              display: "flex", gap: "10px", alignItems: "flex-start",
            }}>
              <span style={{ fontSize: "18px" }}>🚚</span>
              <p style={{ margin: 0, fontSize: "12px", color: S.muted, lineHeight: 1.7 }}>
                Livraison disponible dans toutes les <strong style={{ color: S.text }}>58 wilayas d'Algérie</strong>. Délai estimé : 2–4 jours ouvrables. Paiement à la livraison.
              </p>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} style={{
              width: "100%", background: S.gold, color: S.dark,
              border: "none", borderRadius: "2px",
              padding: "14px", fontSize: "14px",
              fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
              cursor: "pointer", marginTop: "1.5rem", transition: "opacity 0.2s",
            }}
              onMouseEnter={e => e.target.style.opacity = "0.88"}
              onMouseLeave={e => e.target.style.opacity = "1"}
            >
              ✦ Confirmer la commande
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductDetail({ product, allProducts = [], onBack, onOrder }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  const related = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div style={{ background: S.dark, minHeight: "100vh", color: S.text, opacity: visible ? 1 : 0, transition: "opacity 0.5s ease" }}>
      {/* Breadcrumb */}
      <div style={{ padding: "1.25rem 2rem", borderBottom: `1px solid ${S.border}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: S.dim }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: S.muted, fontSize: "13px", padding: 0 }}
            onMouseEnter={e => e.target.style.color = S.gold}
            onMouseLeave={e => e.target.style.color = S.muted}
          >← Accueil</button>
          <span>/</span>
          <span style={{ color: S.muted }}>{product.category}</span>
          <span>/</span>
          <span style={{ color: S.gold }}>{product.name}</span>
        </div>
      </div>

      {/* Main product section */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 2rem" }}>
        <div className="product-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>

          {/* Left: Visual */}
          <div>
            <div style={{
              background: "radial-gradient(ellipse at center, rgba(197, 160, 89, 0.1) 0%, transparent 65%), #18181b",
              border: `1px solid ${S.border}`, borderRadius: "8px",
              height: "420px", display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", fontSize: "130px", overflow: "hidden",
            }}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                product.icon || "💎"
              )}
              {product.badge && (
                <span style={{
                  position: "absolute", top: "18px", left: "18px",
                  background: S.gold, color: S.dark,
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                  padding: "5px 12px", borderRadius: "2px",
                }}>{product.badge}</span>
              )}
            </div>

            {/* Thumbnails */}
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              {["main", "✨", "🎁"].map((item, i) => (
                <div key={i} style={{
                  flex: 1, height: "80px",
                  background: "#111", border: `1px solid ${i === 0 ? S.gold : S.border}`,
                  borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "28px", cursor: "pointer", overflow: "hidden",
                }}>
                  {i === 0 ? (
                    product.imageUrl ? <img src={product.imageUrl} alt="thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (product.icon || "💎")
                  ) : item}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div>
            <p style={{ fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: S.gold, margin: "0 0 10px" }}>
              ✦ {product.category}
            </p>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 300, margin: "0 0 6px", lineHeight: 1.15 }}>
              {product.name}
            </h1>
            <p style={{ fontSize: "16px", color: S.muted, margin: "0 0 1rem" }}>{product.subtitle}</p>

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
              <span style={{ color: S.gold, fontSize: "18px", letterSpacing: "2px" }}>{"★".repeat(Math.floor(product.rating))}{"☆".repeat(5 - Math.floor(product.rating))}</span>
              <span style={{ fontSize: "14px", color: S.gold, fontWeight: 700 }}>{product.rating}</span>
              <span style={{ fontSize: "13px", color: S.dim }}>({product.reviews} avis)</span>
            </div>

            <p style={{ fontSize: "2rem", fontWeight: 700, color: S.gold, margin: "0 0 1.5rem" }}>{product.price}</p>

            <p style={{ fontSize: "15px", color: "#b8b09a", lineHeight: 1.9, marginBottom: "1.75rem" }}>
              {product.description}
            </p>

            {/* Details */}
            <div style={{ marginBottom: "2rem" }}>
              <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: S.dim, marginBottom: "0.75rem" }}>Caractéristiques</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {product.details.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#c8c0a8" }}>
                    <span style={{ color: S.gold, fontSize: "10px" }}>✦</span>
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => onOrder(product)} style={{
                flex: 2, background: S.gold, color: S.dark,
                border: "none", borderRadius: "2px",
                padding: "15px", fontSize: "13px",
                fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                cursor: "pointer", transition: "opacity 0.2s",
              }}
                onMouseEnter={e => e.target.style.opacity = "0.85"}
                onMouseLeave={e => e.target.style.opacity = "1"}
              >
                Commander maintenant
              </button>
              <button style={{
                flex: 1, background: "transparent",
                border: `1px solid ${S.border}`, color: S.muted,
                borderRadius: "2px", padding: "15px",
                fontSize: "20px", cursor: "pointer", transition: "border-color 0.2s",
              }}
                onMouseEnter={e => e.target.style.borderColor = S.gold}
                onMouseLeave={e => e.target.style.borderColor = S.border}
                title="Ajouter aux favoris"
              >🤍</button>
            </div>

            {/* Guarantees */}
            <div style={{ display: "flex", gap: "12px", marginTop: "1.25rem", flexWrap: "wrap" }}>
              {[["🔒", "Paiement sécurisé"], ["🚚", "Livraison nationale"], ["↩️", "Retour 7 jours"]].map(([ic, txt]) => (
                <div key={txt} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontSize: "12px", color: S.dim,
                }}>
                  <span>{ic}</span><span>{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div style={{ marginTop: "5rem" }}>
            <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: "3rem" }}>
              <p style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: S.gold, marginBottom: "0.5rem" }}>✦ Vous aimerez aussi</p>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 300, margin: "0 0 2rem" }}>
                Pièces <span style={{ fontWeight: 700, color: S.gold }}>similaires</span>
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
                {related.map(rp => (
                  <div key={rp.id} style={{
                    background: S.dark2, border: `1px solid ${S.border}`,
                    borderRadius: "4px", overflow: "hidden", cursor: "pointer", transition: "all 0.25s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = S.borderHover; e.currentTarget.style.transform = "translateY(-3px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = "translateY(0)"; }}
                    onClick={() => { window.scrollTo(0, 0); onBack(); setTimeout(() => {}, 0); }}
                  >
                    <div style={{ height: "150px", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "56px", overflow: "hidden" }}>
                      {rp.imageUrl ? (
                        <img src={rp.imageUrl} alt={rp.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        rp.icon || "💎"
                      )}
                    </div>
                    <div style={{ padding: "1rem" }}>
                      <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 600 }}>{rp.name}</h4>
                      <p style={{ margin: "0 0 0.75rem", fontSize: "13px", color: S.muted }}>{rp.subtitle}</p>
                      <p style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: S.gold }}>{rp.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WalidDiamant() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderProduct, setOrderProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [heroVisible, setHeroVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => { 
    setTimeout(() => setHeroVisible(true), 100); 
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Optional fallback: use dummy products if db is empty
        setProducts(productsList.length > 0 ? productsList : []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const goToProduct = (product) => {
    setSelectedProduct(product);
    setPage("detail");
    window.scrollTo(0, 0);
  };

  const goHome = () => { setPage("home"); setSelectedProduct(null); window.scrollTo(0, 0); };
  const openOrder = (product) => { setOrderProduct(product); };
  const closeOrder = () => setOrderProduct(null);

  const toggleWish = (id) => setWishlist(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);

  const filtered = activeCategory === "Tous" ? products : products.filter(p => p.category === activeCategory);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: S.dark, minHeight: "100vh", color: S.text }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(30px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .product-detail-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .hero-title { font-size: 2.5rem !important; }
          .hero-stats { flex-direction: column; gap: 1.5rem !important; margin-top: 3rem !important; }
          .about-stats { flex-direction: column !important; }
          .related-grid { grid-template-columns: 1fr !important; }
          .footer-content { flex-direction: column; text-align: center; justify-content: center; }
          .nav-container { padding: 0 1rem !important; }
          .hero-container { padding: 3rem 1rem !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-sidebar { display: none !important; }
        }
      `}</style>
      
      <Nav onHome={goHome} cartCount={cartCount} setIsSidebarOpen={setIsSidebarOpen} />

      {isSidebarOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} onClick={() => setIsSidebarOpen(false)} />
          <div className="mobile-sidebar" style={{ width: "250px", background: S.dark, borderLeft: `1px solid ${S.border}`, padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", boxShadow: "-5px 0 15px rgba(0,0,0,0.5)", animation: "slideLeft 0.3s ease forwards" }}>
            <style>{`@keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
            <button onClick={() => setIsSidebarOpen(false)} style={{ alignSelf: "flex-end", background: "none", border: "none", color: S.text, fontSize: "28px", cursor: "pointer" }}>×</button>
            <button onClick={() => { setIsSidebarOpen(false); goHome(); }} style={{ background: "none", border: "none", color: S.gold, fontSize: "18px", textAlign: "left", cursor: "pointer", fontWeight: "600" }}>Accueil</button>
            <button onClick={() => { setIsSidebarOpen(false); document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" }); }} style={{ background: "none", border: "none", color: S.text, fontSize: "18px", textAlign: "left", cursor: "pointer", fontWeight: "600" }}>Collections</button>
          </div>
        </div>
      )}

      {orderProduct && <OrderModal product={orderProduct} onClose={closeOrder} />}

      {page === "detail" && selectedProduct ? (
        <ProductDetail product={selectedProduct} allProducts={products} onBack={goHome} onOrder={openOrder} />
      ) : (
        <>
          {/* COLLECTIONS */}
          <section id="collections" style={{ padding: "6rem 2rem 5rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <p style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: S.gold, marginBottom: "0.75rem" }}>✦ Nos Créations ✦</p>
              <h2 style={{ fontSize: "clamp(2rem, 3vw, 3rem)", fontWeight: 300, margin: 0 }}>
                Collections <span style={{ fontWeight: 700, color: S.gold }}>Signature</span>
              </h2>
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "3rem", flexWrap: "wrap" }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                  background: activeCategory === cat ? S.gold : "transparent",
                  color: activeCategory === cat ? S.dark : S.muted,
                  border: `1px solid ${activeCategory === cat ? S.gold : "rgba(212,175,55,0.25)"}`,
                  borderRadius: "2px", padding: "8px 20px", fontSize: "12px",
                  letterSpacing: "0.12em", textTransform: "capitalize",
                  cursor: "pointer", fontWeight: activeCategory === cat ? 700 : 400, transition: "all 0.2s",
                }}>{cat}</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {filtered.map(product => (
                <div key={product.id} style={{
                  background: S.dark2, border: `1px solid ${S.border}`,
                  borderRadius: "4px", overflow: "hidden", transition: "all 0.3s", cursor: "pointer",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = S.borderHover; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {/* Card image */}
                  <div
                    onClick={() => goToProduct(product)}
                    style={{
                      height: "220px",
                      background: "radial-gradient(ellipse at center, rgba(197, 160, 89, 0.08) 0%, transparent 70%), #0f0f12",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative", fontSize: "72px", overflow: "hidden",
                    }}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      product.icon || "💎"
                    )}
                    {product.badge && (
                      <span style={{ position: "absolute", top: "14px", left: "14px", background: S.gold, color: S.dark, fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: "2px" }}>{product.badge}</span>
                    )}
                    <button onClick={e => { e.stopPropagation(); toggleWish(product.id); }} style={{
                      position: "absolute", top: "12px", right: "12px",
                      background: "rgba(10,10,10,0.7)", border: `1px solid rgba(212,175,55,0.3)`,
                      borderRadius: "50%", width: "36px", height: "36px",
                      cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {wishlist.includes(product.id) ? "❤️" : "🤍"}
                    </button>
                  </div>

                  {/* Card info */}
                  <div style={{ padding: "1.25rem" }}>
                    <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: S.dim, margin: "0 0 6px" }}>{product.category}</p>
                    <h3
                      onClick={() => goToProduct(product)}
                      style={{ fontSize: "17px", fontWeight: 600, margin: "0 0 4px", color: S.text, cursor: "pointer" }}
                      onMouseEnter={e => e.target.style.color = S.gold}
                      onMouseLeave={e => e.target.style.color = S.text}
                    >{product.name}</h3>
                    <p style={{ fontSize: "13px", color: "#7e7a6e", margin: "0 0 0.5rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.subtitle}</p>
                    <div style={{ fontSize: "13px", color: S.gold, marginBottom: "1rem" }}>
                      {"★".repeat(Math.floor(product.rating))} <span style={{ color: S.dim }}>({product.reviews})</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                      <span style={{ fontSize: "18px", fontWeight: 700, color: S.gold }}>{product.price}</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => goToProduct(product)} style={{
                          background: "transparent", border: `1px solid ${S.border}`,
                          color: S.muted, padding: "8px 12px", fontSize: "11px",
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          borderRadius: "2px", cursor: "pointer", transition: "all 0.2s",
                        }}
                          onMouseEnter={e => { e.target.style.borderColor = S.gold; e.target.style.color = S.gold; }}
                          onMouseLeave={e => { e.target.style.borderColor = S.border; e.target.style.color = S.muted; }}
                        >Détails</button>
                        <button onClick={() => openOrder(product)} style={{
                          background: S.gold, color: S.dark,
                          border: "none", padding: "8px 14px", fontSize: "11px",
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          borderRadius: "2px", cursor: "pointer", fontWeight: 700, transition: "opacity 0.2s",
                        }}
                          onMouseEnter={e => e.target.style.opacity = "0.85"}
                          onMouseLeave={e => e.target.style.opacity = "1"}
                        >Commander</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ABOUT */}
          <section style={{ background: "linear-gradient(135deg, #111 0%, #1a1700 50%, #111 100%)", borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}`, padding: "5rem 2rem" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
              <p style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: S.gold, marginBottom: "1.25rem" }}>✦ Notre Promesse ✦</p>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 300, lineHeight: 1.4, marginBottom: "1.5rem" }}>
                Chaque bijou raconte <span style={{ fontWeight: 700, color: S.gold }}>votre histoire</span>
              </h2>
              <p style={{ fontSize: "1.05rem", color: "#7e7a6e", lineHeight: 1.9, maxWidth: "600px", margin: "0 auto 2.5rem" }}>
                Depuis plus de 10 ans, Walid Diamant vous propose des accessoires de joaillerie d'exception. Chaque pièce est sélectionnée avec soin pour refléter l'élégance et la durabilité.
              </p>
              <div className="about-stats" style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                {[["🏅", "Or & Argent Certifiés"], ["🔍", "Authenticité Garantie"], ["🚚", "58 Wilayas Livrées"], ["💬", "Support Personnalisé"]].map(([icon, text]) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(212,175,55,0.06)", border: `1px solid rgba(212,175,55,0.12)`, borderRadius: "4px", padding: "12px 20px" }}>
                    <span style={{ fontSize: "20px" }}>{icon}</span>
                    <span style={{ fontSize: "13px", color: "#b8b09a" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section style={{ padding: "5rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <p style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: S.gold, marginBottom: "0.75rem" }}>✦ Avis Clients ✦</p>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 300, margin: 0 }}>Ils nous font <span style={{ fontWeight: 700, color: S.gold }}>confiance</span></h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {testimonials.map(({ name, text, stars }) => (
                <div key={name} style={{ background: S.dark2, border: `1px solid ${S.border}`, borderRadius: "4px", padding: "1.75rem" }}>
                  <div style={{ color: S.gold, fontSize: "18px", marginBottom: "1rem", letterSpacing: "2px" }}>{"★".repeat(stars)}</div>
                  <p style={{ fontSize: "15px", color: "#c8c0a8", lineHeight: 1.7, fontStyle: "italic", marginBottom: "1.25rem" }}>"{text}"</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: S.gold, margin: 0, letterSpacing: "0.1em" }}>— {name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FOOTER */}
          <footer className="footer-content" style={{ borderTop: `1px solid rgba(212,175,55,0.1)`, padding: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", background: S.dark3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>💎</span>
              <span style={{ fontWeight: 700, color: S.gold, letterSpacing: "0.08em", fontSize: "14px" }}>WALID DIAMANT</span>
            </div>
            <p style={{ fontSize: "12px", color: "#4e4a42", margin: 0 }}>© 2025 Walid Diamant. Tous droits réservés. — Sétif, Algérie</p>
          </footer>
        </>
      )}
    </div>
  );
}