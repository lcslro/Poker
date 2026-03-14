import { G } from "../styles";

export const Avatar = ({ letter, size = 36, color }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: color || `linear-gradient(135deg, ${G.green}, ${G.greenLt})`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Playfair Display', serif", fontSize: size * 0.4,
    fontWeight: 700, color: "#fff", flexShrink: 0,
    border: "1px solid rgba(255,255,255,0.1)",
  }}>
    {letter}
  </div>
);

export const MoneyBadge = ({ value }) => (
  <span style={{
    fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
    color: value >= 0 ? G.greenLt : G.redLt,
  }}>
    {value >= 0 ? "+" : ""}R${Number(value).toFixed(2)}
  </span>
);

export const Header = ({ title, subtitle, action }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${G.border}`,
  }}>
    <div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: G.text, lineHeight: 1.1 }}>
        {title}
      </h1>
      {subtitle && <p style={{ color: G.textMuted, fontSize: 13, marginTop: 6 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);
