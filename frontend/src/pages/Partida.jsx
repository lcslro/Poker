import { useState, useEffect } from "react";
import { G } from "../styles";
import { Avatar, MoneyBadge, Header } from "../components/UI";
import { getSessions, createSession, getPlayers, getEntries, createEntry, updateEntry, CHIP_VALUE } from "../api/index";

export default function Partida({ setPage, activeSessionId, setActiveSessionId }) {
  const [session, setSession] = useState(null);
  const [entries, setEntries] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Criação de nova sessão
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newBuyIn, setNewBuyIn] = useState(10);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  // Edição de valor final
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");

  useEffect(() => {
    async function load() {
      const [allSessions, allPlayers] = await Promise.all([getSessions(), getPlayers()]);
      setPlayers(allPlayers);

      let active = allSessions.find(s => s.status === "active");
      if (!active && activeSessionId) {
        active = allSessions.find(s => s.id === activeSessionId);
      }

      if (active) {
        setSession(active);
        setActiveSessionId(active.id);
        const e = await getEntries(active.id);
        setEntries(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  const togglePlayer = (id) =>
    setSelectedPlayers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleCreateSession = async () => {
    if (selectedPlayers.length === 0) return;
    const sess = await createSession(newDate, parseFloat(newBuyIn));
    const chipsStart = parseFloat(newBuyIn) / CHIP_VALUE;
    const newEntries = await Promise.all(
      selectedPlayers.map(pid => createEntry(sess.id, pid, chipsStart))
    );
    setSession(sess);
    setActiveSessionId(sess.id);
    setEntries(newEntries);
  };

  const handleSaveFinal = async (entryId) => {
    const val = parseFloat(editVal);
    if (isNaN(val) || val < 0) return;
    const chipsEnd = val / CHIP_VALUE;
    const updated = await updateEntry(entryId, chipsEnd);
    setEntries(prev => prev.map(e => e.id === entryId ? updated : e));
    setEditId(null);
  };

  const getPlayerName = (playerId) => players.find(p => p.id === playerId)?.name ?? "?";

  if (loading) return <div style={{ color: G.textMuted, padding: 32 }}>Carregando...</div>;

  if (!session) return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <Header title="Nova Partida" subtitle="Configure a sessão antes de começar" />
      <div className="card" style={{ maxWidth: 560 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div>
            <label className="label">Data</label>
            <input className="input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Buy-in (R$)</label>
            <input className="input" type="number" min="1" value={newBuyIn} onChange={e => setNewBuyIn(e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label className="label" style={{ marginBottom: 10, display: "block" }}>Jogadores</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {players.map(p => {
              const sel = selectedPlayers.includes(p.id);
              return (
                <div key={p.id} onClick={() => togglePlayer(p.id)} style={{
                  padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13,
                  background: sel ? `${G.green}33` : G.chip,
                  border: `1px solid ${sel ? G.green : G.border}`,
                  display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
                }}>
                  <Avatar letter={p.name[0]} size={24} />
                  {p.name}
                </div>
              );
            })}
          </div>
        </div>

        <button className="btn btn-gold" style={{ width: "100%" }}
          onClick={handleCreateSession} disabled={selectedPlayers.length === 0}>
          ♠ Iniciar Partida ({selectedPlayers.length} jogadores)
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <Header
        title="Partida Atual"
        subtitle={new Date(session.date + "T12:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        action={<button className="btn btn-gold" onClick={() => setPage("settle")}>Fechar & Acertar →</button>}
      />

      <div className="card" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12, padding: "12px 20px" }}>
        <span style={{ fontSize: 12, color: G.textMuted }}>Buy-in:</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 500, color: G.gold }}>R${session.buy_in}</span>
        <span style={{ fontSize: 12, color: G.textMuted, marginLeft: 16 }}>{entries.length} jogadores</span>
      </div>

      <div className="card">
        <div className="table-scroll">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${G.border}` }}>
              {["Jogador", "Valor final", "Resultado", ""].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: G.textMuted, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => {
              const finalAmount = e.chips_end != null ? Math.round(e.chips_end * CHIP_VALUE * 100) / 100 : 0;
              const profit = finalAmount - session.buy_in;
              return (
                <tr key={e.id} style={{ borderBottom: i < entries.length - 1 ? `1px solid ${G.border}` : "none" }}>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar letter={getPlayerName(e.player_id)[0]} size={30} />
                      <span style={{ fontSize: 14 }}>{getPlayerName(e.player_id)}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    {editId === e.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <input className="input" style={{ width: 100 }} value={editVal}
                          onChange={ev => setEditVal(ev.target.value)}
                          onKeyDown={ev => ev.key === "Enter" && handleSaveFinal(e.id)} autoFocus />
                        <button className="btn btn-primary btn-sm" onClick={() => handleSaveFinal(e.id)}>✓</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>✕</button>
                      </div>
                    ) : (
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>R${finalAmount.toFixed(2)}</span>
                    )}
                  </td>
                  <td style={{ padding: "12px" }}><MoneyBadge value={e.chips_end != null ? profit : null} /></td>
                  <td style={{ padding: "12px" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditId(e.id); setEditVal(String(finalAmount)); }}>
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
