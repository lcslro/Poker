import { G } from "../styles";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "session",   label: "Partida",   icon: "♠" },
  { id: "settle",    label: "Acerto",    icon: "⇄" },
  { id: "ranking",   label: "Ranking",   icon: "★" },
  { id: "players",   label: "Jogadores", icon: "◈" },
];

export default function Sidebar({ page, setPage }) {
  return (
    <aside style={{
      width: 220, background: G.surface, borderRight: `1px solid ${G.border}`,
      display: "flex", flexDirection: "column", padding: "0 0 20px 0",
      position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100,
    }}>
      <div style={{ padding: "28px 24px 20px", borderBottom: `1px solid ${G.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${G.green}, ${G.greenLt})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>♣</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: G.gold, lineHeight: 1 }}>
              PokerNight
            </div>
            <div style={{ fontSize: 10, color: G.textMuted, letterSpacing: "0.08em", marginTop: 2 }}>GERENCIADOR</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "10px 12px", borderRadius: 8, border: "none",
            background: page === n.id ? "rgba(45,106,45,0.2)" : "transparent",
            color: page === n.id ? G.greenLt : G.textMuted,
            cursor: "pointer", textAlign: "left",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14,
            fontWeight: page === n.id ? 500 : 400,
            transition: "all 0.15s", marginBottom: 4,
            borderLeft: page === n.id ? `2px solid ${G.greenLt}` : "2px solid transparent",
          }}>
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: "0 24px", display: "flex", gap: 8, opacity: 0.3 }}>
        {["♠","♥","♦","♣"].map(s => (
          <span key={s} style={{ color: s === "♥" || s === "♦" ? "#e05050" : "#8888aa", fontSize: 13 }}>{s}</span>
        ))}
      </div>
    </aside>
  );
}
