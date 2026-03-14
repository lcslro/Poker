import { useState, useEffect } from "react";
import { G } from "../styles";
import { Avatar, MoneyBadge, Header } from "../components/UI";
import { getRankings } from "../api/index";

export default function Ranking() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    getRankings().then(data => setPlayers(data.map(p => ({ ...p, avatar: p.name[0].toUpperCase(), totalProfit: p.total_profit }))));
  }, []);

  const sorted = [...players].sort((a, b) => b.totalProfit - a.totalProfit);

  if (sorted.length === 0) return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <Header title="Ranking" subtitle="Histórico geral de todos os jogadores" />
      <p style={{ color: G.textMuted }}>Nenhuma partida registrada ainda.</p>
    </div>
  );

  const podium = sorted.length >= 3 ? [sorted[1], sorted[0], sorted[2]] : null;
  const heights = [100, 130, 80];
  const medals = ["🥈", "🥇", "🥉"];

  const medalColors = [
    `linear-gradient(135deg,${G.gold},${G.goldLt})`,
    "linear-gradient(135deg,#888,#bbb)",
    "linear-gradient(135deg,#8b5e3c,#c87941)",
  ];

  return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <Header title="Ranking" subtitle="Histórico geral de todos os jogadores" />

      {podium && (
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 32, alignItems: "flex-end" }}>
          {podium.map((p, i) => (
            <div key={p.player_id} style={{ textAlign: "center", width: 120 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <Avatar letter={p.avatar} size={i === 1 ? 52 : 40}
                  color={i === 1 ? `linear-gradient(135deg,${G.gold},${G.goldLt})` : undefined} />
              </div>
              <div style={{ fontSize: i === 1 ? 16 : 13, fontWeight: i === 1 ? 600 : 400, marginBottom: 4 }}>{p.name}</div>
              <MoneyBadge value={p.totalProfit} />
              <div style={{
                height: heights[i], marginTop: 12, borderRadius: "8px 8px 0 0",
                background: i === 1 ? `linear-gradient(180deg,${G.gold}44,${G.gold}22)` : `linear-gradient(180deg,${G.green}33,${G.green}11)`,
                border: `1px solid ${i === 1 ? G.gold + "44" : G.green + "44"}`,
                display: "flex", alignItems: "flex-start", justifyContent: "center",
                paddingTop: 10, fontSize: 20,
              }}>{medals[i]}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${G.border}` }}>
              {["#", "Jogador", "Vitórias", "Derrotas", "Taxa", "Saldo total"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: G.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => {
              const total = p.wins + p.losses;
              const rate = total > 0 ? Math.round(p.wins / total * 100) : 0;
              return (
                <tr key={p.player_id} style={{ borderBottom: i < sorted.length - 1 ? `1px solid ${G.border}` : "none" }}>
                  <td style={{ padding: "12px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: G.textMuted }}>{i + 1}</td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar letter={p.avatar} size={30} color={i < 3 ? medalColors[i] : undefined} />
                      {p.name}
                    </div>
                  </td>
                  <td style={{ padding: "12px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: G.greenLt }}>{p.wins}</td>
                  <td style={{ padding: "12px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: G.redLt }}>{p.losses}</td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: G.chip }}>
                        <div style={{ width: `${rate}%`, height: "100%", borderRadius: 2, background: G.greenLt }} />
                      </div>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: G.textMuted }}>{rate}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}><MoneyBadge value={p.totalProfit} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
