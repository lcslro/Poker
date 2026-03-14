import { useState, useEffect } from "react";
import { G } from "../styles";
import { Avatar, MoneyBadge, Header } from "../components/UI";
import { getSessions, getRankings } from "../api/index";

export default function Dashboard({ setPage }) {
  const [sessions, setSessions] = useState([]);
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    Promise.all([getSessions(), getRankings()]).then(([s, r]) => {
      setSessions(s);
      setRankings(r.map(p => ({ ...p, avatar: p.name[0].toUpperCase(), totalProfit: p.total_profit })));
    });
  }, []);

  const top = [...rankings].sort((a, b) => b.totalProfit - a.totalProfit);
  const lastBuyIn = sessions.length > 0 ? sessions[0].buy_in : 10;

  return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <Header
        title="Dashboard"
        subtitle={`Hoje: ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}`}
        action={<button className="btn btn-gold" onClick={() => setPage("session")}>♠ Nova Partida</button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Partidas Realizadas", value: sessions.length,                              icon: "♣" },
          { label: "Jogadores Ativos",    value: rankings.length,                              icon: "◈" },
          { label: "Maior Ganhador",      value: top[0]?.totalProfit > 0 ? top[0].name : "-", icon: "★" },
          { label: "Último Buy-in",       value: `R$${lastBuyIn}`,                             icon: "◇" },
        ].map((s, i) => (
          <div key={i} className="card anim-fade" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 8, opacity: 0.6 }}>{s.icon}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 500, color: G.gold }}>{s.value}</div>
            <div style={{ fontSize: 11, color: G.textMuted, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card anim-fade">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600 }}>Líderes</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage("ranking")}>Ver tudo</button>
          </div>
          {top.slice(0, 4).map((p, i) => (
            <div key={p.player_id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 0", borderBottom: i < 3 ? `1px solid ${G.border}` : "none",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: [G.gold, "#aaa", "#c87941", G.chip][i],
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: G.bg, flexShrink: 0,
              }}>{i + 1}</div>
              <Avatar letter={p.avatar} size={30} />
              <span style={{ flex: 1, fontSize: 14 }}>{p.name}</span>
              <MoneyBadge value={p.totalProfit} />
            </div>
          ))}
          {top.length === 0 && <p style={{ color: G.textMuted, fontSize: 13 }}>Nenhuma partida ainda.</p>}
        </div>

        <div className="card anim-fade">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600 }}>Histórico</span>
            <span className="tag tag-gray">{sessions.length} partidas</span>
          </div>
          {sessions.map((s, i) => (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 0", borderBottom: i < sessions.length - 1 ? `1px solid ${G.border}` : "none",
            }}>
              <div style={{ width: 38, textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 11, color: G.textMuted, lineHeight: 1.3 }}>
                {new Date(s.date + "T12:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>Buy-in R${s.buy_in}</div>
              </div>
              <span className={`tag ${s.status === "closed" ? "tag-green" : "tag-gray"}`}>
                {s.status === "closed" ? "encerrada" : "ativa"}
              </span>
            </div>
          ))}
          {sessions.length === 0 && <p style={{ color: G.textMuted, fontSize: 13 }}>Nenhuma partida ainda.</p>}
        </div>
      </div>
    </div>
  );
}
