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
    <aside className="sidebar" style={{ background: G.surface, borderRight: `1px solid ${G.border}` }}>
      <div className="sidebar-logo" style={{ borderBottom: `1px solid ${G.border}` }}>
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

      <nav className="sidebar-nav">
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setPage(n.id)}
            className={`sidebar-btn${page === n.id ? " active" : ""}`}
            style={{
              background: page === n.id ? "rgba(45,106,45,0.2)" : "transparent",
              color: page === n.id ? G.greenLt : G.textMuted,
              borderLeftColor: page === n.id ? G.greenLt : "transparent",
            }}
          >
            <span className="sidebar-icon">{n.icon}</span>
            <span className="sidebar-label">{n.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-suits">
        {["♠","♥","♦","♣"].map(s => (
          <span key={s} style={{ color: s === "♥" || s === "♦" ? "#e05050" : "#8888aa", fontSize: 13 }}>{s}</span>
        ))}
      </div>
    </aside>
  );
}
